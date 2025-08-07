<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Groups</h1>
        <p class="text-gray-600 dark:text-gray-400">Find and join communities near you</p>
      </div>
      <button @click="showCreateModal = true" 
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
        <span>➕</span>
        Create Group
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Category Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select v-model="filters.category" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.icon }} {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Location Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input v-model="filters.location" 
                 type="text" 
                 placeholder="City or location"
                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
        </div>

        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input v-model="filters.search" 
                 type="text" 
                 placeholder="Search groups..."
                 class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="flex items-center gap-3 mt-4">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Quick filters:</span>
        <button v-for="filter in quickFilters" :key="filter.key"
                @click="applyQuickFilter(filter.key)"
                :class="[
                  'px-3 py-1 text-sm rounded-full transition-colors',
                  activeQuickFilter === filter.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]">
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Categories Grid (when no filters applied) -->
    <div v-if="!hasFilters" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Browse by Category</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button v-for="category in categories" :key="category.id"
                @click="filters.category = category.id"
                class="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <span class="text-3xl mb-2">{{ category.icon }}</span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
            {{ category.name }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ getGroupCountByCategory(category.id) }} groups
          </span>
        </button>
      </div>
    </div>

    <!-- Results -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ hasFilters ? 'Search Results' : 'All Groups' }}
          <span class="text-gray-500 dark:text-gray-400 font-normal">
            ({{ filteredGroups.length }})
          </span>
        </h2>
        
        <!-- View Toggle -->
        <div class="flex items-center gap-2">
          <button @click="viewMode = 'grid'" 
                  :class="[
                    'p-2 rounded-md',
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  ]">
            <span>⊞</span>
          </button>
          <button @click="viewMode = 'list'" 
                  :class="[
                    'p-2 rounded-md',
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  ]">
            <span>☰</span>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-8">
        <div class="text-gray-600 dark:text-gray-400">Loading groups...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredGroups.length === 0" class="text-center py-12">
        <div class="text-4xl mb-4">👥</div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ hasFilters ? 'No groups found' : 'No groups yet' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ hasFilters 
            ? 'Try adjusting your filters or search terms' 
            : 'Be the first to create a group in this community' 
          }}
        </p>
        <button @click="hasFilters ? clearFilters() : (showCreateModal = true)"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          {{ hasFilters ? 'Clear Filters' : 'Create First Group' }}
        </button>
      </div>

      <!-- Groups Grid/List -->
      <div v-else :class="[
             viewMode === 'grid' 
               ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
               : 'space-y-4'
           ]">
        <GroupCard
          v-for="group in filteredGroups"
          :key="group.id"
          :group="group"
          :current-user="currentUser"
          :categories="categories"
          @click="handleGroupClick"
          @join="handleJoinGroup"
          @leave="handleLeaveGroup"
        />
      </div>
    </div>

    <!-- Create Group Modal -->
    <GroupCreateModal
      v-if="showCreateModal"
      :categories="categories"
      :current-user="currentUser"
      @close="showCreateModal = false"
      @created="handleGroupCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useGroup } from '@/composables/groupProvider'
import { router } from '@/composables/useRouter'
import GroupCard from './GroupCard.vue'
import GroupCreateModal from './GroupCreateModal.vue'
import type { Group } from '@/types/event'

const props = defineProps<{
  currentUser?: any
}>()

const { groups, categories, loading, joinGroup, leaveGroup } = useGroup()

const showCreateModal = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const activeQuickFilter = ref('')

const filters = reactive({
  category: '',
  location: '',
  search: ''
})

const quickFilters = [
  { key: 'my-groups', label: 'My Groups' },
  { key: 'nearby', label: 'Nearby' },
  { key: 'new', label: 'New Groups' },
  { key: 'active', label: 'Most Active' }
]

const hasFilters = computed(() => {
  return filters.category || filters.location || filters.search || activeQuickFilter.value
})

const filteredGroups = computed(() => {
  let result = groups.value

  // Apply category filter
  if (filters.category) {
    result = result.filter(group => group.category === filters.category)
  }

  // Apply location filter
  if (filters.location) {
    result = result.filter(group => 
      group.location.city.toLowerCase().includes(filters.location.toLowerCase())
    )
  }

  // Apply search filter
  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(group => 
      group.name.toLowerCase().includes(search) ||
      group.description.toLowerCase().includes(search) ||
      group.tags.some(tag => tag.toLowerCase().includes(search))
    )
  }

  // Apply quick filters
  if (activeQuickFilter.value === 'my-groups' && props.currentUser) {
    result = result.filter(group => 
      group.members.includes(props.currentUser.pub) || 
      group.organizer === props.currentUser.pub
    )
  } else if (activeQuickFilter.value === 'new') {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    result = result.filter(group => group.createdAt > weekAgo)
  } else if (activeQuickFilter.value === 'active') {
    result = result.sort((a, b) => b.memberCount - a.memberCount)
  }

  return result
})

const getGroupCountByCategory = (categoryId: string): number => {
  return groups.value.filter(group => group.category === categoryId).length
}

const applyQuickFilter = (filterKey: string) => {
  if (activeQuickFilter.value === filterKey) {
    activeQuickFilter.value = ''
  } else {
    activeQuickFilter.value = filterKey
  }
}

const clearFilters = () => {
  filters.category = ''
  filters.location = ''
  filters.search = ''
  activeQuickFilter.value = ''
}

const handleGroupClick = (group: Group) => {
  // Navigate to group detail page
  router.navigate('/group', { id: group.id })
}

const handleJoinGroup = async (group: Group) => {
  if (props.currentUser) {
    await joinGroup(group.id, {
      pub: props.currentUser.pub,
      alias: props.currentUser.alias,
      avatar: props.currentUser.avatar
    })
  }
}

const handleLeaveGroup = async (group: Group) => {
  if (props.currentUser) {
    await leaveGroup(group.id, props.currentUser.pub)
  }
}

const handleGroupCreated = (groupId: string) => {
  showCreateModal.value = false
  // Navigate to the new group
  router.navigate('/group', { id: groupId })
}

// Watch for URL changes to set filters
watch(() => router.currentQuery.value, (query) => {
  if (query.category) {
    filters.category = query.category
  }
}, { immediate: true })
</script>