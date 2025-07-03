import type { IGunInstance } from 'gun'
import { ref, computed } from 'vue'

export interface Event {
  id?: string
  title: string
  description: string
  date: string | Date
  recurring: number
  limit: number
  interests: string[]
  locations: string[]
  creator?: string
  created?: number
  attendees?: Record<string, any>
}

export interface Attendee {
  userId: string
  profile: any
  joinedAt: number
  status: 'attending' | 'maybe' | 'not_attending'
}

export function useEventGun(gun: IGunInstance, sphereId: string) {
  const events = ref<Record<string, Event>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Create new event
  const createEvent = async (eventData: Omit<Event, 'id' | 'creator' | 'created'>) => {
    try {
      loading.value = true
      const eventId = (Gun as any).text.random()
      const userPub = await gun.user().get('pub').once()
      
      const event: Event = {
        ...eventData,
        id: eventId,
        created: (Gun as any).state(),
        creator: userPub,
        attendees: {}
      }
      
      // Store event in Gun
      await gun.get('plugins').get('events').get(sphereId)
        .get('list').get(eventId).put(event)
      
      // Add to creator's events
      await gun.user().get('plugins').get('events')
        .get('created').set(eventId)
      
      return eventId
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create event'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Join/RSVP to event
  const joinEvent = async (eventId: string, profile: any) => {
    try {
      loading.value = true
      const userId = await gun.user().get('pub').once() as string
      
      const attendee: Attendee = {
        userId,
        profile,
        joinedAt: (Gun as any).state(),
        status: 'attending'
      }
      
      // Add to event attendees
      await (gun.get('plugins').get('events').get(sphereId)
        .get('list').get(eventId).get('attendees') as any)
        .get(userId).put(attendee)
      
      // Add to user's joined events
      await gun.user().get('plugins').get('events')
        .get('joined').set(eventId)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to join event'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Leave event
  const leaveEvent = async (eventId: string) => {
    try {
      loading.value = true
      const userId = await gun.user().get('pub').once() as string
      
      // Remove from event attendees
      await (gun.get('plugins').get('events').get(sphereId)
        .get('list').get(eventId).get('attendees') as any)
        .get(userId).put(null)
      
      // Remove from user's joined events
      await gun.user().get('plugins').get('events')
        .get('joined').get(eventId).put(null)
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to leave event'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get single event
  const getEvent = async (eventId: string) => {
    return new Promise<Event>((resolve, reject) => {
      gun.get('plugins').get('events').get(sphereId)
        .get('list').get(eventId).once((data, key) => {
          if (data) {
            resolve({ ...data, id: key } as Event)
          } else {
            reject(new Error('Event not found'))
          }
        })
    })
  }

  // Subscribe to events list with real-time updates
  const subscribeToEvents = (filter?: { interest?: string, location?: string }) => {
    const off = gun.get('plugins').get('events').get(sphereId)
      .get('list').map().on((event, id) => {
        if (event) {
          // Apply filters if provided
          if (filter?.interest && !event.interests?.includes(filter.interest)) return
          if (filter?.location && !event.locations?.includes(filter.location)) return
          
          // Get attendee count
          gun.get('plugins').get('events').get(sphereId)
            .get('list').get(id).get('attendees').once(attendees => {
              const attendeeCount = Object.keys(attendees || {}).filter(k => k !== '_').length
              events.value[id] = { ...event, id, attendeeCount }
            })
        } else {
          // Event was deleted
          delete events.value[id]
        }
      })
    
    return off // Return unsubscribe function
  }

  // Subscribe to event attendees
  const subscribeToAttendees = (eventId: string, callback: (attendees: Attendee[]) => void) => {
    const attendeeMap: Record<string, Attendee> = {}
    
    const off = gun.get('plugins').get('events').get(sphereId)
      .get('list').get(eventId).get('attendees')
      .map().on((attendee, userId) => {
        if (attendee && userId !== '_') {
          attendeeMap[userId] = attendee
        } else {
          delete attendeeMap[userId]
        }
        
        // Return array of attendees
        const attendeeList = Object.values(attendeeMap)
        callback(attendeeList)
      })
    
    return off
  }

  // Check if user is attending
  const isAttending = async (eventId: string): Promise<boolean> => {
    const userId = await gun.user().get('pub').once()
    return new Promise(resolve => {
      (gun.get('plugins').get('events').get(sphereId)
        .get('list').get(eventId).get('attendees') as any)
        .get(userId).once((data: any) => {
          resolve(!!data)
        })
    })
  }

  // Computed values
  const upcomingEvents = computed(() => {
    const now = new Date().getTime()
    return Object.values(events.value)
      .filter(event => new Date(event.date).getTime() > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  const pastEvents = computed(() => {
    const now = new Date().getTime()
    return Object.values(events.value)
      .filter(event => new Date(event.date).getTime() <= now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  return {
    // State
    events,
    loading,
    error,
    upcomingEvents,
    pastEvents,
    
    // Methods
    createEvent,
    joinEvent,
    leaveEvent,
    getEvent,
    subscribeToEvents,
    subscribeToAttendees,
    isAttending
  }
}