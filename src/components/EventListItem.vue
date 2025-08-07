<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700" 
       @click="$emit('click', event)">
    
    <div class="flex p-4 gap-4">
      <!-- Date Block -->
      <div class="flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-3 min-w-[60px]">
        <div class="text-xl font-bold leading-none">{{ eventDay }}</div>
        <div class="text-xs uppercase opacity-90 mt-1">{{ eventMonth }}</div>
        <div class="text-xs opacity-75 mt-2 text-center border-t border-white border-opacity-30 pt-2">
          {{ eventTime }}
        </div>
      </div>
      
      <!-- Event Content -->
      <div class="flex-1 min-w-0">
        <!-- Header with Group -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {{ event.title }}
            </h3>
            <div v-if="groupInfo" class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <span>{{ groupInfo.name }}</span>
              <span>•</span>
              <span>{{ categoryIcon }} {{ categoryName }}</span>
            </div>
          </div>
          
          <!-- Event Status Badge -->
          <div v-if="event.status && event.status !== 'published'" 
               :class="[
                 'px-2 py-1 text-xs rounded-full',
                 getStatusColor(event.status)
               ]">
            {{ getStatusLabel(event.status) }}
          </div>
        </div>

        <!-- Description -->
        <p class="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {{ event.description }}
        </p>

        <!-- Event Details -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span v-if="event.duration" class="flex items-center gap-1">
            ⏱️ {{ formatDuration(event.duration) }}
          </span>
          
          <span class="flex items-center gap-1">
            👥 {{ eventStats.attending }} attending
            <span v-if="eventStats.maybe > 0" class="text-yellow-600">
              • {{ eventStats.maybe }} maybe
            </span>
          </span>
          
          <span v-if="event.location" class="flex items-center gap-1">
            📍 {{ event.location.venue || event.location.address }}
          </span>
          <span v-else-if="event.locations && event.locations.length" class="flex items-center gap-1">
            📍 {{ event.locations[0] }}
          </span>
        </div>

        <!-- RSVP Status & Waitlist -->
        <div v-if="userRSVPStatus" class="mb-3">
          <div v-if="userRSVPStatus === 'waitlisted'" 
               class="text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded-md">
            ⏳ You're on the waitlist (position #{{ waitlistPosition }})
          </div>
          <div v-else-if="userRSVPStatus === 'attending'" 
               class="text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded-md">
            ✅ You're attending this event
          </div>
          <div v-else-if="userRSVPStatus === 'maybe'" 
               class="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-md">
            🤔 You might attend this event
          </div>
        </div>

        <!-- Event Full Warning -->
        <div v-if="eventStats.isFull && !userRSVPStatus" 
             class="text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 rounded-md mb-3">
          🚫 Event is full ({{ event.limit }} spots) - You'll be added to the waitlist
        </div>

        <!-- Tags -->
        <div v-if="(event.tags && event.tags.length) || (event.interests && event.interests.length)" class="flex flex-wrap gap-1 mb-3">
          <span v-for="tag in [...(event.tags || []), ...(event.interests || [])].slice(0, 4)" 
                :key="tag"
                class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
            {{ tag }}
          </span>
          <span v-if="[...(event.tags || []), ...(event.interests || [])].length > 4" 
                class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-full">
            +{{ [...(event.tags || []), ...(event.interests || [])].length - 4 }}
          </span>
        </div>
      </div>
      
      <!-- RSVP Actions -->
      <div class="flex flex-col gap-2 min-w-[100px]">
        <!-- Primary RSVP Button -->
        <button @click.stop="handleRSVP('attending')"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  userRSVPStatus === 'attending'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                ]">
          {{ getRSVPButtonText() }}
        </button>
        
        <!-- Maybe Button -->
        <button @click.stop="handleRSVP('maybe')"
                :class="[
                  'px-3 py-2 text-sm rounded-md transition-colors',
                  userRSVPStatus === 'maybe'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                ]">
          {{ userRSVPStatus === 'maybe' ? 'Maybe ✓' : 'Maybe' }}
        </button>
        
        <!-- Can't Go Button (if user has RSVP'd) -->
        <button v-if="userRSVPStatus && userRSVPStatus !== 'not_attending'"
                @click.stop="handleRSVP('not_attending')"
                class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
          Can't go
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRSVP } from '@/composables/rsvpService'
import { useGroup } from '@/composables/groupProvider'
import type { Event, User } from '../types/event'

const props = defineProps<{
  event: Event
  currentUser: User
}>()

const emit = defineEmits<{
  click: [event: Event]
  join: [event: Event]
  leave: [event: Event]
  rsvp: [event: Event, status: 'attending' | 'maybe' | 'not_attending']
}>()

const { getRSVPStatus, getEventStats, getWaitlistPosition } = useRSVP(props.currentUser)
const { getGroup, categories } = useGroup()

const eventDate = computed(() => new Date(props.event.date))
const eventDay = computed(() => eventDate.value.getDate().toString())
const eventMonth = computed(() => eventDate.value.toLocaleDateString('en-US', { month: 'short' }))
const eventTime = computed(() => {
  if (props.event.time) {
    return props.event.time
  }
  return eventDate.value.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
})

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const userRSVPStatus = computed(() => getRSVPStatus(props.event))
const eventStats = computed(() => getEventStats(props.event))
const waitlistPosition = computed(() => getWaitlistPosition(props.event))

const groupInfo = computed(() => {
  return props.event.groupId ? getGroup(props.event.groupId) : null
})

const categoryIcon = computed(() => {
  if (groupInfo.value) {
    const category = categories.value.find(c => c.id === groupInfo.value!.category)
    return category?.icon || '👥'
  }
  return '📅'
})

const categoryName = computed(() => {
  if (groupInfo.value) {
    const category = categories.value.find(c => c.id === groupInfo.value!.category)
    return category?.name || 'Event'
  }
  return 'Event'
})

const getRSVPButtonText = () => {
  if (userRSVPStatus.value === 'attending') return 'Attending ✓'
  if (userRSVPStatus.value === 'waitlisted') return 'On Waitlist'
  if (eventStats.value.isFull) return 'Join Waitlist'
  return 'Attend'
}

const getStatusColor = (status: string) => {
  const colors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    ongoing: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

const getStatusLabel = (status: string) => {
  const labels = {
    draft: 'Draft',
    ongoing: 'Live',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return labels[status as keyof typeof labels] || status
}

const handleRSVP = (status: 'attending' | 'maybe' | 'not_attending') => {
  emit('rsvp', props.event, status)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<style scoped>
.event-list-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.event-list-item:hover {
  background: var(--color-background-mute);
  transform: translateY(-1px);
}

.event-date-box {
  flex-shrink: 0;
  text-align: center;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  padding: 0.5rem;
  width: 80px;
}

.date-main {
  display: flex;
  flex-direction: column;
}

.day {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
}

.month {
  font-size: 0.875rem;
  text-transform: uppercase;
  opacity: 0.8;
}

.time {
  margin-top: 0.25rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.75rem;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.event-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.event-meta i {
  margin-right: 0.25rem;
  font-size: 0.75rem;
}

.recurring-badge {
  background: var(--color-background-mute);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.event-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.btn-join, .btn-leave {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-join {
  background: var(--color-success);
  color: white;
}

.btn-join:hover:not(:disabled) {
  background: var(--color-success-hover);
}

.btn-join:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-leave {
  background: var(--color-background-mute);
  color: var(--color-text);
}

.btn-leave:hover {
  background: var(--color-danger);
  color: white;
}
</style>