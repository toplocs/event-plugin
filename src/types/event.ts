export interface User {
  pub: string
  alias: string
  avatar?: string
}

export interface Attendee extends User {
  joinedAt: number
  status: 'attending' | 'maybe' | 'not_attending'
}

export interface Event {
  id: string
  title: string
  description: string
  date: string // ISO date string
  time?: string
  recurring: number // 1=once, 2=weekly, 3=bi-weekly, 4=monthly
  limit: number // 0 = no limit
  interests: string[]
  locations: string[]
  creator: string // user pub key
  created: number
  attendees: Record<string, Attendee>
  attendeeCount?: number
  space: string
  deleted?: boolean
}

export interface EventFilters {
  interest?: string
  location?: string
  dateFrom?: Date
  dateTo?: Date
  showPast?: boolean
}