<template>
  <div class="event-plugin">
    <div class="event-header">
      <h2>📅 Events</h2>
      <button @click="showCreateModal = true" class="btn-primary">
        <i class="fas fa-plus"></i> Create Event
      </button>
    </div>

    <div class="event-filters">
      <select v-model="filter" class="filter-select">
        <option value="upcoming">Upcoming Events</option>
        <option value="past">Past Events</option>
        <option value="my-events">My Events</option>
        <option value="attending">Attending</option>
      </select>
    </div>

    <div v-if="loading" class="loading">
      Loading events...
    </div>

    <div v-else-if="events.length === 0" class="no-events">
      <EventCreateInline 
        :currentUser="currentUser"
        @created="onEventCreated"
        @cancelled="onEventCancelled"
      />
    </div>

    <div v-else class="event-list">
      <EventListItem
        v-for="event in sortedEvents"
        :key="event.id"
        :event="event"
        :currentUser="currentUser"
        @click="selectEvent(event)"
        @join="joinEvent(event)"
        @leave="leaveEvent(event)"
        @rsvp="handleRSVP"
      />
    </div>

    <!-- Event Detail Modal -->
    <EventDetailModal
      v-if="selectedEvent"
      :event="selectedEvent"
      :currentUser="currentUser"
      @close="selectedEvent = null"
      @update="handleUpdateEvent"
      @delete="handleDeleteEvent"
      @join="joinEvent"
      @leave="leaveEvent"
    />

    <!-- Create Event Modal -->
    <EventCreateModal
      v-if="showCreateModal"
      :currentUser="currentUser"
      @close="showCreateModal = false"
      @created="onEventCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEvent } from '../composables/eventProvider'
import { useRSVP } from '../composables/rsvpService'
import EventListItem from './EventListItem.vue'
import EventDetailModal from './EventDetailModal.vue'
import EventCreateModal from './EventCreateModal.vue'
import EventCreateInline from './EventCreateInline.vue'
import type { Event, User } from '../types/event'

const props = defineProps<{
  user?: any
  sphere?: any
  filter?: string
}>()

const {
  events,
  loading,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent: joinEventFn,
  leaveEvent: leaveEventFn
} = useEvent()

const { rsvp } = useRSVP()

const showCreateModal = ref(false)
const selectedEvent = ref<Event | null>(null)
const filter = ref(props.filter || 'upcoming')

const currentUser = computed<User>(() => ({
  pub: props.user?.is?.pub || 'anonymous',
  alias: props.user?.is?.alias || 'Anonymous',
  avatar: props.user?.profile?.avatar
}))

const sortedEvents = computed(() => {
  console.log('🔍 Main.vue sortedEvents computed:', {
    totalEvents: events.value.length,
    events: events.value.map(e => ({ id: e.id, title: e.title, date: e.date, dateObj: new Date(e.date) })),
    filter: filter.value
  })

  const now = Date.now()
  let filtered = events.value
  
  console.log('🔍 Current time:', new Date(now).toISOString());

  switch (filter.value) {
    case 'upcoming':
      filtered = events.value.filter(e => {
        const eventTime = new Date(e.date).getTime()
        const isUpcoming = eventTime > now
        console.log(`🔍 Event "${e.title}" (${e.date}) is upcoming:`, isUpcoming, 'Event time:', eventTime, 'Now:', now)
        return isUpcoming
      })
      break
    case 'past':
      filtered = events.value.filter(e => new Date(e.date).getTime() <= now)
      break
    case 'my-events':
      filtered = events.value.filter(e => e.creator === currentUser.value.pub)
      break
    case 'attending':
      filtered = events.value.filter(e => 
        e.attendees && Object.keys(e.attendees).includes(currentUser.value.pub)
      )
      break
  }
  
  console.log('🔍 After filtering:', filtered.length, 'events remain')

  return filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return filter.value === 'past' ? dateB - dateA : dateA - dateB
  })
})

const selectEvent = (event: Event) => {
  selectedEvent.value = event
}

const joinEvent = async (event: Event) => {
  await joinEventFn(event.id, currentUser.value)
}

const leaveEvent = async (event: Event) => {
  await leaveEventFn(event.id, currentUser.value.pub)
}

const handleUpdateEvent = (event: Event) => {
  // For now, just close the modal since we don't have an update implementation
  selectedEvent.value = null
}

const handleDeleteEvent = async (event: Event) => {
  await deleteEvent(event.id)
  selectedEvent.value = null
}

const onEventCreated = (eventId: string) => {
  showCreateModal.value = false
  // Event will appear automatically via Gun subscription
}

const onEventCancelled = () => {
  console.log('Event creation cancelled')
}

const handleRSVP = async (event: Event, status: 'attending' | 'maybe' | 'not_attending') => {
  try {
    await rsvp(event.id, status, event)
    console.log('RSVP successful:', event.id, status)
  } catch (error) {
    console.error('RSVP failed:', error)
  }
}
</script>

<style scoped>
.event-plugin {
  padding: 1rem;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.event-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.event-filters {
  margin-bottom: 1rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-soft);
  color: var(--color-text);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.no-events {
  padding: 2rem;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>