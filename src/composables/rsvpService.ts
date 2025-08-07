import { ref, computed } from 'vue'
import type { Event, User, Attendee } from '../types/event'
import gun from '../gun'

/**
 * Real-time RSVP Service for Events
 * Handles RSVP management with Gun.js real-time synchronization
 */
export class RSVPService {
  private gun: any
  private user: User | null = null

  constructor(gunInstance: any, currentUser?: User) {
    this.gun = gunInstance
    this.user = currentUser || null
  }

  setUser(user: User) {
    this.user = user
  }

  /**
   * RSVP to an event with real-time updates
   */
  async rsvp(eventId: string, status: 'attending' | 'maybe' | 'not_attending', event: Event): Promise<void> {
    if (!this.user) {
      throw new Error('User must be logged in to RSVP')
    }

    console.log('🎟️ RSVPing to event:', eventId, 'status:', status)

    const attendeeData: Attendee = {
      pub: this.user.pub,
      alias: this.user.alias,
      avatar: this.user.avatar,
      joinedAt: Date.now(),
      status
    }

    try {
      // Update event attendees in Gun
      const eventRef = this.gun.get('events').get(event.space).get(eventId)
      
      if (status === 'not_attending') {
        // Remove from attendees
        eventRef.get('attendees').get(this.user.pub).put(null)
        
        // Remove from waitlist if present
        eventRef.get('waitlist').get(this.user.pub).put(null)
      } else {
        // Check if event is full and user should be waitlisted
        const currentAttendeeCount = Object.keys(event.attendees).filter(
          pub => event.attendees[pub].status === 'attending'
        ).length

        if (event.limit > 0 && currentAttendeeCount >= event.limit && status === 'attending') {
          // Add to waitlist
          attendeeData.status = 'attending' // Keep original status intent
          eventRef.get('waitlist').get(this.user.pub).put({
            ...attendeeData,
            waitlistedAt: Date.now()
          })
          
          console.log('➕ Added to waitlist for event:', eventId)
        } else {
          // Add to attendees
          eventRef.get('attendees').get(this.user.pub).put(attendeeData)
          
          // Remove from waitlist if they were there
          eventRef.get('waitlist').get(this.user.pub).put(null)
        }
      }

      // Update user's event history
      const userRef = this.gun.get('users').get(this.user.pub)
      userRef.get('eventHistory').get('rsvpHistory').set({
        eventId,
        status,
        timestamp: Date.now()
      })

      // Update attendee count in event
      this.updateAttendeeCount(eventId, event)

      console.log('✅ RSVP successful for event:', eventId)

    } catch (error) {
      console.error('❌ Failed to RSVP:', error)
      throw error
    }
  }

  /**
   * Get RSVP status for current user
   */
  getRSVPStatus(event: Event): 'attending' | 'maybe' | 'not_attending' | 'waitlisted' | null {
    if (!this.user) return null

    // Check if on waitlist
    if (event.waitlist && event.waitlist.includes(this.user.pub)) {
      return 'waitlisted'
    }

    // Check attendee status
    const attendee = event.attendees[this.user.pub]
    return attendee ? attendee.status : null
  }

  /**
   * Check if event is full
   */
  isEventFull(event: Event): boolean {
    if (event.limit <= 0) return false // No limit
    
    const attendingCount = Object.values(event.attendees).filter(
      attendee => attendee.status === 'attending'
    ).length

    return attendingCount >= event.limit
  }

  /**
   * Get waitlist position for user
   */
  getWaitlistPosition(event: Event): number | null {
    if (!this.user || !event.waitlist) return null
    
    const waitlistIndex = event.waitlist.indexOf(this.user.pub)
    return waitlistIndex >= 0 ? waitlistIndex + 1 : null
  }

  /**
   * Process waitlist when someone leaves an event
   */
  async processWaitlist(eventId: string, event: Event): Promise<void> {
    if (!event.waitlist || event.waitlist.length === 0) return
    if (!this.isEventFull(event)) {
      // Move first person from waitlist to attendees
      const nextPersonPub = event.waitlist[0]
      
      if (nextPersonPub) {
        const eventRef = this.gun.get('events').get(event.space).get(eventId)
        
        // Get waitlist data
        const waitlistData = await new Promise((resolve) => {
          this.gun.get('events').get(event.space).get(eventId).get('waitlist').get(nextPersonPub).once(resolve)
        })

        if (waitlistData) {
          // Move to attendees
          const attendeeData: Attendee = {
            pub: nextPersonPub,
            alias: (waitlistData as any).alias,
            avatar: (waitlistData as any).avatar,
            joinedAt: Date.now(),
            status: 'attending'
          }

          eventRef.get('attendees').get(nextPersonPub).put(attendeeData)
          eventRef.get('waitlist').get(nextPersonPub).put(null)

          console.log('🎉 Moved user from waitlist to attendees:', nextPersonPub)
          
          // TODO: Send notification to user about being moved off waitlist
        }
      }
    }
  }

  /**
   * Update attendee count in Gun
   */
  private async updateAttendeeCount(eventId: string, event: Event): Promise<void> {
    const attendingCount = Object.values(event.attendees).filter(
      attendee => attendee.status === 'attending'
    ).length

    this.gun.get('events').get(event.space).get(eventId).put({
      attendeeCount: attendingCount
    })
  }

  /**
   * Get event statistics
   */
  getEventStats(event: Event) {
    const attending = Object.values(event.attendees).filter(a => a.status === 'attending').length
    const maybe = Object.values(event.attendees).filter(a => a.status === 'maybe').length
    const waitlisted = event.waitlist ? event.waitlist.length : 0

    return {
      attending,
      maybe,
      waitlisted,
      total: attending + maybe,
      spotsLeft: event.limit > 0 ? Math.max(0, event.limit - attending) : Infinity,
      isFull: this.isEventFull(event)
    }
  }

  /**
   * Subscribe to real-time RSVP changes
   */
  subscribeToRSVPChanges(eventId: string, eventSpace: string, callback: (data: any) => void) {
    console.log('🔄 Subscribing to RSVP changes for event:', eventId)
    
    // Subscribe to attendee changes
    this.gun.get('events').get(eventSpace).get(eventId).get('attendees').map().on((attendeeData: any, attendeePub: string) => {
      if (attendeeData && !attendeeData._) {
        callback({
          type: 'attendee_updated',
          eventId,
          attendeePub,
          data: attendeeData
        })
      } else if (attendeeData === null) {
        callback({
          type: 'attendee_removed',
          eventId,
          attendeePub
        })
      }
    })

    // Subscribe to waitlist changes
    this.gun.get('events').get(eventSpace).get(eventId).get('waitlist').map().on((waitlistData: any, userPub: string) => {
      if (waitlistData && !waitlistData._) {
        callback({
          type: 'waitlist_added',
          eventId,
          userPub,
          data: waitlistData
        })
      } else if (waitlistData === null) {
        callback({
          type: 'waitlist_removed',
          eventId,
          userPub
        })
      }
    })
  }
}

/**
 * Composable for RSVP functionality
 */
export function useRSVP(currentUser?: User) {
  const rsvpService = new RSVPService(gun, currentUser)

  const rsvp = async (eventId: string, status: 'attending' | 'maybe' | 'not_attending', event: Event) => {
    return await rsvpService.rsvp(eventId, status, event)
  }

  const getRSVPStatus = (event: Event) => {
    return rsvpService.getRSVPStatus(event)
  }

  const isEventFull = (event: Event) => {
    return rsvpService.isEventFull(event)
  }

  const getWaitlistPosition = (event: Event) => {
    return rsvpService.getWaitlistPosition(event)
  }

  const getEventStats = (event: Event) => {
    return rsvpService.getEventStats(event)
  }

  const subscribeToRSVPChanges = (eventId: string, eventSpace: string, callback: (data: any) => void) => {
    return rsvpService.subscribeToRSVPChanges(eventId, eventSpace, callback)
  }

  return {
    rsvp,
    getRSVPStatus,
    isEventFull,
    getWaitlistPosition,
    getEventStats,
    subscribeToRSVPChanges,
    setUser: (user: User) => rsvpService.setUser(user)
  }
}