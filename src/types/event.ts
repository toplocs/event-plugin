export interface User {
  pub: string
  alias: string
  avatar?: string
  eventPreferences?: {
    interests: string[]
    radius: number
    notifications: boolean
  }
  eventHistory?: {
    organized: string[]
    attended: string[]
    rsvpHistory: Array<{eventId: string, status: string, timestamp: number}>
  }
}

export interface Attendee extends User {
  joinedAt: number
  status: 'attending' | 'maybe' | 'not_attending'
}

export interface Group {
  id: string
  name: string
  description: string
  category: string
  location: {
    lat: number
    lng: number
    city: string
    radius: number
  }
  organizer: string
  members: string[]
  memberCount: number
  avatar?: string
  tags: string[]
  privacy: 'public' | 'private'
  gunPath: string
  createdAt: number
  space: string
  deleted: boolean
  settings?: {
    allowMemberEvents: boolean
    requireApproval: boolean
    maxMembers?: number
  }
}

export interface Event {
  id: string
  groupId?: string // Link to group
  title: string
  description: string
  date: string // ISO date string
  time?: string
  duration?: number // Duration in minutes
  recurring: number // 1=once, 2=weekly, 3=bi-weekly, 4=monthly
  limit: number // 0 = no limit
  interests: string[]
  locations: string[]
  location?: { // Structured location data
    address: string
    lat: number
    lng: number
    venue?: string
  }
  creator: string // user pub key
  created: number
  attendees: Record<string, Attendee>
  attendeeCount?: number
  waitlist?: string[] // Waitlist when event is full
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
  tags: string[]
  space: string
  deleted?: boolean
  photos?: string[] // Event photos
  discussions?: Discussion[] // Event discussions
}

export interface Discussion {
  id: string
  eventId: string
  author: string
  authorAlias: string
  message: string
  timestamp: number
  replies?: Discussion[]
  likes?: string[] // user pubs who liked
}

export interface EventCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export interface EventFilters {
  interest?: string
  location?: string
  dateFrom?: Date
  dateTo?: Date
  showPast?: boolean
  groupId?: string
  category?: string
}