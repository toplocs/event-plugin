import { ref, inject, provide, onMounted, nextTick, watch } from 'vue'
import type { Ref, InjectionKey } from 'vue'
import type { Group, User, EventCategory } from '../types/event'
import gun from '../gun'

interface GroupContext {
  groups: Ref<Group[]>
  categories: Ref<EventCategory[]>
  loading: Ref<boolean>
  createGroup: (groupData: Partial<Group>) => Promise<string>
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
  joinGroup: (groupId: string, user: User) => Promise<void>
  leaveGroup: (groupId: string, userPub: string) => Promise<void>
  getGroup: (groupId: string) => Group | null
  getGroupsByLocation: (lat: number, lng: number, radius: number) => Group[]
  getGroupsByCategory: (category: string) => Group[]
}

const groupKey: InjectionKey<GroupContext> = Symbol('group')

// Global shared state
const globalGroups = ref<Group[]>([])
const globalCategories = ref<EventCategory[]>([])
const globalLoading = ref(false)
const loadedSpaces = new Set<string>()

// Default categories based on Meetup.com popular categories
const defaultCategories: EventCategory[] = [
  { id: 'tech', name: 'Technology', description: 'Programming, AI, Web Development', icon: '💻', color: '#3B82F6' },
  { id: 'business', name: 'Business', description: 'Networking, Entrepreneurship, Startups', icon: '💼', color: '#10B981' },
  { id: 'health', name: 'Health & Wellness', description: 'Fitness, Yoga, Mental Health', icon: '🏃‍♂️', color: '#F59E0B' },
  { id: 'arts', name: 'Arts & Culture', description: 'Photography, Music, Theater', icon: '🎨', color: '#EF4444' },
  { id: 'social', name: 'Social', description: 'Meetups, Parties, Networking', icon: '👥', color: '#8B5CF6' },
  { id: 'learning', name: 'Learning', description: 'Language, Skills, Education', icon: '📚', color: '#06B6D4' },
  { id: 'sports', name: 'Sports & Recreation', description: 'Running, Hiking, Games', icon: '⚽', color: '#84CC16' },
  { id: 'food', name: 'Food & Drink', description: 'Cooking, Wine Tasting, Restaurants', icon: '🍽️', color: '#F97316' }
]

// Initialize categories
globalCategories.value = defaultCategories

// Gun.js helper functions for groups
const saveGroupToGun = (group: Group): Promise<void> => {
  console.log('💾 Saving group to Gun:', group.id, 'in space:', group.space)
  
  return new Promise(async (resolve, reject) => {
    try {
      const groupRef = gun.get('groups').get(group.space).get(group.id)
      
      // Save basic group data
      const basicGroupData = {
        id: group.id,
        name: group.name,
        description: group.description,
        category: group.category,
        organizer: group.organizer,
        memberCount: group.memberCount || 0,
        avatar: group.avatar,
        privacy: group.privacy,
        createdAt: group.createdAt,
        space: group.space,
        deleted: group.deleted || false,
        gunPath: `groups.${group.space}.${group.id}`,
        // Store location as nested object
        locationLat: group.location.lat,
        locationLng: group.location.lng,
        locationCity: group.location.city,
        locationRadius: group.location.radius
      }
      
      // Save basic data
      groupRef.put(basicGroupData, (ack) => {
        if (ack.err) {
          console.error('❌ Failed to save basic group data:', ack.err)
          reject(new Error(ack.err))
          return
        }
      })
      
      // Save tags as Gun set
      if (group.tags && group.tags.length > 0) {
        const tagsSet = groupRef.get('tags')
        group.tags.forEach(tag => {
          tagsSet.set(tag)
        })
      }
      
      // Save members as Gun set
      if (group.members && group.members.length > 0) {
        const membersSet = groupRef.get('members')
        group.members.forEach(memberPub => {
          membersSet.set(memberPub)
        })
      }
      
      // Save settings if provided
      if (group.settings) {
        groupRef.get('settings').put(group.settings)
      }
      
      console.log('✅ Group saved to Gun successfully:', group.id)
      resolve()
      
    } catch (error) {
      console.error('❌ Error saving group to Gun:', error)
      reject(error)
    }
  })
}

const loadGroupsFromGun = (space: string) => {
  if (loadedSpaces.has(space)) {
    console.log('Groups already loaded for space:', space)
    return
  }
  
  loadedSpaces.add(space)
  globalLoading.value = true
  console.log('🔄 Loading groups from Gun for space:', space)
  
  gun.get('groups').get(space).map().once((groupData, groupId) => {
    console.log('📦 Found group data:', groupId, groupData)
    
    // Skip Gun metadata and only process actual groups
    if (!groupData || typeof groupData !== 'object' || groupData._ || !groupId || !groupId.startsWith('group_')) {
      return
    }
    
    // Check if already loaded
    const existingIndex = globalGroups.value.findIndex(g => g.id === groupId)
    if (existingIndex !== -1) {
      console.log('Group already loaded:', groupId)
      return
    }
    
    // Create group object with basic data
    const group: Group = {
      id: groupId,
      name: groupData.name || '',
      description: groupData.description || '',
      category: groupData.category || 'social',
      location: {
        lat: groupData.locationLat || 0,
        lng: groupData.locationLng || 0,
        city: groupData.locationCity || '',
        radius: groupData.locationRadius || 10
      },
      organizer: groupData.organizer || 'anonymous',
      members: [],
      memberCount: groupData.memberCount || 0,
      avatar: groupData.avatar,
      tags: [],
      privacy: groupData.privacy || 'public',
      gunPath: groupData.gunPath || `groups.${space}.${groupId}`,
      createdAt: groupData.createdAt || Date.now(),
      space: space,
      deleted: groupData.deleted || false,
      settings: groupData.settings
    }
    
    console.log('🔄 Loading group details for:', groupId)
    
    // Load tags from Gun set
    const tagsPromise = new Promise<void>((resolve) => {
      gun.get('groups').get(space).get(groupId).get('tags').map().once((tagData, tagKey) => {
        if (tagData && typeof tagData === 'string') {
          group.tags.push(tagData)
          console.log('🏷️ Loaded tag:', tagData)
        }
      })
      setTimeout(() => resolve(), 200)
    })
    
    // Load members from Gun set
    const membersPromise = new Promise<void>((resolve) => {
      gun.get('groups').get(space).get(groupId).get('members').map().once((memberData, memberPub) => {
        if (memberData && typeof memberData === 'string') {
          group.members.push(memberData)
          console.log('👤 Loaded member:', memberData)
        }
      })
      setTimeout(() => resolve(), 200)
    })
    
    // Wait for all data to load, then add to global array
    Promise.all([tagsPromise, membersPromise]).then(() => {
      if (!group.deleted) {
        globalGroups.value.unshift(group)
        console.log('✅ Fully loaded group:', groupId, group.name, {
          tags: group.tags,
          members: group.members.length
        })
        
        nextTick(() => {
          console.log('🔄 Group DOM should update now')
        })
      }
    })
  })
  
  setTimeout(() => {
    globalLoading.value = false
    console.log('✅ Finished loading groups. Total:', globalGroups.value.length)
  }, 2000)
}

export function groupProvider(instance: string) {
  const groups = globalGroups
  const categories = globalCategories
  const loading = globalLoading
  
  console.log("🔧 Group provider initialized for space:", instance)
  console.log("🔧 Current global groups:", globalGroups.value.length)
  
  // Create a test group if none exist
  if (globalGroups.value.length === 0) {
    console.log("🧪 Creating test group since none exist")
    const testGroup = {
      id: 'group_test_' + Date.now(),
      name: 'Vue.js Developers',
      description: 'A group for Vue.js developers and enthusiasts',
      category: 'tech',
      location: { lat: 47.6062, lng: -122.3321, city: 'Seattle, WA', radius: 25 },
      organizer: 'anonymous',
      members: ['anonymous'],
      memberCount: 1,
      avatar: undefined,
      tags: ['vue', 'javascript', 'frontend'],
      privacy: 'public' as const,
      gunPath: `groups.${instance}.group_test_${Date.now()}`,
      createdAt: Date.now(),
      space: instance,
      deleted: false,
      settings: {
        allowMemberEvents: true,
        requireApproval: false
      }
    }
    globalGroups.value.push(testGroup)
    console.log("✅ Test group created:", testGroup.name)
  }
  
  // Load groups for this space
  loadGroupsFromGun(instance)
  
  const createGroup = async (groupData: Partial<Group>) => {
    console.log('Create group:', groupData)
    
    const groupId = 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    const newGroup: Group = {
      id: groupId,
      name: groupData.name || '',
      description: groupData.description || '',
      category: groupData.category || 'social',
      location: groupData.location || { lat: 0, lng: 0, city: '', radius: 10 },
      organizer: groupData.organizer || 'anonymous',
      members: [groupData.organizer || 'anonymous'], // Organizer is first member
      memberCount: 1,
      avatar: groupData.avatar,
      tags: groupData.tags || [],
      privacy: groupData.privacy || 'public',
      gunPath: `groups.${instance}.${groupId}`,
      createdAt: Date.now(),
      space: instance,
      deleted: false,
      settings: groupData.settings || {
        allowMemberEvents: true,
        requireApproval: false
      }
    }
    
    try {
      await saveGroupToGun(newGroup)
      console.log('Group saved to Gun:', groupId)
    } catch (error) {
      console.error('Failed to save group to Gun:', error)
    }
    
    groups.value.unshift(newGroup)
    console.log('➕ Added new group to local array. Total groups now:', groups.value.length)
    
    return groupId
  }

  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    console.log('Update group:', groupId, updates)
    const groupIndex = groups.value.findIndex(g => g.id === groupId)
    if (groupIndex !== -1) {
      const updatedGroup = { ...groups.value[groupIndex], ...updates }
      
      try {
        await saveGroupToGun(updatedGroup)
        console.log('Group updated in Gun:', groupId)
      } catch (error) {
        console.error('Failed to update group in Gun:', error)
      }
      
      groups.value[groupIndex] = updatedGroup
    }
  }

  const deleteGroup = async (groupId: string) => {
    console.log('Delete group:', groupId)
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      try {
        gun.get('groups').get(group.space).get(groupId).put(null)
        console.log('Group deleted from Gun:', groupId)
      } catch (error) {
        console.error('Failed to delete group from Gun:', error)
      }
      
      groups.value = groups.value.filter(g => g.id !== groupId)
    }
  }

  const joinGroup = async (groupId: string, user: User) => {
    console.log('Join group:', groupId, user)
    const group = groups.value.find(g => g.id === groupId)
    if (group && !group.members.includes(user.pub)) {
      // Save to Gun set
      gun.get('groups').get(group.space).get(groupId).get('members').set(user.pub)
      
      // Update local state
      group.members.push(user.pub)
      group.memberCount = group.members.length
      
      // Update member count in Gun
      gun.get('groups').get(group.space).get(groupId).get('memberCount').put(group.memberCount)
    }
  }

  const leaveGroup = async (groupId: string, userPub: string) => {
    console.log('Leave group:', groupId, userPub)
    const group = groups.value.find(g => g.id === groupId)
    if (group && group.members.includes(userPub)) {
      // Remove from Gun set
      gun.get('groups').get(group.space).get(groupId).get('members').get(userPub).put(null)
      
      // Update local state
      group.members = group.members.filter(m => m !== userPub)
      group.memberCount = group.members.length
      
      // Update member count in Gun
      gun.get('groups').get(group.space).get(groupId).get('memberCount').put(group.memberCount)
    }
  }

  const getGroup = (groupId: string): Group | null => {
    return groups.value.find(g => g.id === groupId) || null
  }

  const getGroupsByLocation = (lat: number, lng: number, radius: number): Group[] => {
    return groups.value.filter(group => {
      const distance = calculateDistance(lat, lng, group.location.lat, group.location.lng)
      return distance <= radius
    })
  }

  const getGroupsByCategory = (category: string): Group[] => {
    return groups.value.filter(group => group.category === category)
  }

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  provide(groupKey, {
    groups,
    categories,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    getGroup,
    getGroupsByLocation,
    getGroupsByCategory
  })
}

export function useGroup() {
  const data = inject(groupKey)

  if (!data) {
    console.warn('🚨 No group provider found, returning default values')
    return {
      groups: ref([]),
      categories: ref(defaultCategories),
      loading: ref(false),
      createGroup: async () => 'default-id',
      updateGroup: async () => {},
      deleteGroup: async () => {},
      joinGroup: async () => {},
      leaveGroup: async () => {},
      getGroup: () => null,
      getGroupsByLocation: () => [],
      getGroupsByCategory: () => []
    }
  }

  return data
}