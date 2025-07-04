<template>
  <div
    @click="$emit('click', event)"
    class="event-list-item"
  >
    <div class="event-date-box">
      <div class="date-main">
        <span class="day">{{ eventDay }}</span>
        <span class="month">{{ eventMonth }}</span>
      </div>
      <div class="time">
        {{ eventTime }}
      </div>
    </div>

    <div class="event-content">
      <div class="event-title">
        {{ event.title }}
      </div>
      <div class="event-description">
        {{ event.description }}
      </div>
      
      <div class="event-meta">
        <span v-if="event.recurring > 1" class="recurring-badge">
          {{ getRecurringLabel(event.recurring) }}
        </span>
        <span v-if="event.attendeeCount" class="attendee-count">
          <i class="fas fa-users"></i> {{ event.attendeeCount }}
          <span v-if="event.limit"> / {{ event.limit }}</span>
        </span>
        <span v-if="event.interests.length" class="interests">
          <i class="fas fa-tags"></i> {{ event.interests.join(', ') }}
        </span>
      </div>
    </div>

    <div class="event-actions">
      <button
        v-if="!isAttending"
        @click.stop="$emit('join', event)"
        class="btn-join"
        :disabled="isFull"
      >
        {{ isFull ? 'Full' : 'Join' }}
      </button>
      <button
        v-else
        @click.stop="$emit('leave', event)"
        class="btn-leave"
      >
        Leave
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Event, User } from '../types/event'

const props = defineProps<{
  event: Event
  currentUser: User
}>()

const emit = defineEmits<{
  click: [event: Event]
  join: [event: Event]
  leave: [event: Event]
}>()

const eventDate = computed(() => new Date(props.event.date))
const eventDay = computed(() => eventDate.value.getDate())
const eventMonth = computed(() => 
  eventDate.value.toLocaleString('default', { month: 'short' })
)
const eventTime = computed(() => 
  eventDate.value.toLocaleTimeString('default', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
)

const isAttending = computed(() => 
  props.event.attendees && 
  Object.keys(props.event.attendees).includes(props.currentUser.pub)
)

const isFull = computed(() => 
  props.event.limit > 0 && 
  Object.keys(props.event.attendees || {}).length >= props.event.limit
)

const getRecurringLabel = (recurring: number) => {
  switch (recurring) {
    case 2: return 'Weekly'
    case 3: return 'Bi-weekly'
    case 4: return 'Monthly'
    default: return ''
  }
}
</script>

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