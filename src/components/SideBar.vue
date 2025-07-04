<template>
  <div class="event-sidebar-widget">
    <h4>📅 Upcoming Events</h4>
    
    <div v-if="loading" class="loading">
      Loading...
    </div>
    
    <div v-else-if="upcomingEvents.length === 0" class="no-events">
      <p>No upcoming events</p>
      <button @click="$emit('createEvent')" class="btn-create-event">
        Create Event
      </button>
    </div>
    
    <div v-else class="event-list">
      <div 
        v-for="event in upcomingEvents" 
        :key="event.id"
        @click="$emit('viewEvent', event.id)"
        class="event-item"
      >
        <div class="event-date">
          {{ formatDate(event.date) }}
        </div>
        <div class="event-info">
          <div class="event-title">{{ event.title }}</div>
          <div class="event-meta">
            <span v-if="event.attendeeCount" class="attendee-count">
              <i class="fas fa-users"></i> {{ event.attendeeCount }}
            </span>
            <span v-if="isAttending(event)" class="attending-badge">
              ✓ Attending
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="view-all">
      <button @click="$emit('viewAll')" class="btn-view-all">
        View All Events →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Event } from '../types/event'

const props = defineProps<{
  gun: any
  user: any
  space: string
}>()

const emit = defineEmits<{
  viewEvent: [eventId: string]
  createEvent: []
  viewAll: []
}>()

const events = ref<Event[]>([])
const loading = ref(true)

const upcomingEvents = computed(() => {
  const now = Date.now()
  return events.value
    .filter(e => new Date(e.date).getTime() > now && !e.deleted)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5) // Show only next 5 events
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return date.toLocaleDateString('en', { weekday: 'short' })
  
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

const isAttending = (event: Event) => {
  return event.attendees && props.user?.is?.pub && 
    Object.keys(event.attendees).includes(props.user.is.pub)
}

const loadEvents = () => {
  const eventsRef = props.gun.get('events').get(props.space)
  
  eventsRef.map().on((event: any, id: string) => {
    if (!event || event === null) return
    
    const existingIndex = events.value.findIndex(e => e.id === id)
    const eventData: Event = {
      id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      recurring: event.recurring || 1,
      limit: event.limit || 0,
      interests: event.interests || [],
      locations: event.locations || [],
      creator: event.creator,
      created: event.created || Date.now(),
      attendees: event.attendees || {},
      attendeeCount: event.attendeeCount || Object.keys(event.attendees || {}).length,
      space: event.space || props.space
    }
    
    if (existingIndex >= 0) {
      events.value[existingIndex] = eventData
    } else {
      events.value.push(eventData)
    }
  })
  
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.event-sidebar-widget {
  padding: 1rem;
}

.event-sidebar-widget h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.loading {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-secondary);
}

.no-events {
  text-align: center;
  padding: 1rem;
  color: var(--color-text-secondary);
}

.no-events p {
  margin-bottom: 1rem;
}

.btn-create-event {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-create-event:hover {
  background: var(--color-primary-hover);
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.event-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.event-item:hover {
  background: var(--color-background-mute);
}

.event-date {
  font-weight: 500;
  font-size: 0.9rem;
  min-width: 60px;
}

.event-info {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.attendee-count i {
  font-size: 0.7rem;
  margin-right: 0.25rem;
}

.attending-badge {
  color: var(--color-success);
  font-weight: 500;
}

.view-all {
  text-align: center;
}

.btn-view-all {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.btn-view-all:hover {
  text-decoration: underline;
}
</style>