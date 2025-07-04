<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ event.title }}</h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="event-details">
          <div class="detail-row">
            <i class="fas fa-calendar"></i>
            <span>{{ formatDate(event.date) }} at {{ formatTime(event.date) }}</span>
          </div>
          
          <div v-if="event.recurring > 1" class="detail-row">
            <i class="fas fa-repeat"></i>
            <span>{{ getRecurringLabel(event.recurring) }}</span>
          </div>

          <div class="detail-row">
            <i class="fas fa-users"></i>
            <span>
              {{ attendeeCount }} attending
              <span v-if="event.limit"> ({{ event.limit }} max)</span>
            </span>
          </div>

          <div v-if="event.interests.length" class="detail-row">
            <i class="fas fa-tags"></i>
            <span>{{ event.interests.join(', ') }}</span>
          </div>

          <div v-if="event.locations.length" class="detail-row">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ event.locations.join(', ') }}</span>
          </div>
        </div>

        <div class="description-section">
          <h3>Description</h3>
          <p>{{ event.description }}</p>
        </div>

        <div class="attendees-section">
          <h3>Attendees ({{ attendeeCount }})</h3>
          <div class="attendees-list">
            <div 
              v-for="(attendee, key) in event.attendees" 
              :key="key"
              class="attendee-item"
            >
              <div class="attendee-avatar">
                {{ attendee.alias.charAt(0).toUpperCase() }}
              </div>
              <span>{{ attendee.alias }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div v-if="isCreator" class="creator-actions">
          <button @click="$emit('delete', event)" class="btn-danger">
            Delete Event
          </button>
        </div>
        
        <div class="attendee-actions">
          <button
            v-if="!isAttending"
            @click="$emit('join', event)"
            class="btn-primary"
            :disabled="isFull"
          >
            {{ isFull ? 'Event Full' : 'Join Event' }}
          </button>
          <button
            v-else
            @click="$emit('leave', event)"
            class="btn-secondary"
          >
            Leave Event
          </button>
        </div>
      </div>
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
  close: []
  update: [event: Event]
  delete: [event: Event]
  join: [event: Event]
  leave: [event: Event]
}>()

const attendeeCount = computed(() => 
  Object.keys(props.event.attendees || {}).length
)

const isAttending = computed(() => 
  props.event.attendees && 
  Object.keys(props.event.attendees).includes(props.currentUser.pub)
)

const isCreator = computed(() => 
  props.event.creator === props.currentUser.pub
)

const isFull = computed(() => 
  props.event.limit > 0 && attendeeCount.value >= props.event.limit
)

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('en', { 
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRecurringLabel = (recurring: number) => {
  switch (recurring) {
    case 2: return 'Repeats weekly'
    case 3: return 'Repeats bi-weekly'
    case 4: return 'Repeats monthly'
    default: return 'One-time event'
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-background);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.5rem;
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-secondary);
}

.detail-row i {
  width: 20px;
  text-align: center;
}

.description-section,
.attendees-section {
  margin-bottom: 2rem;
}

.description-section h3,
.attendees-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.attendees-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.attendee-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.attendee-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.creator-actions,
.attendee-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.btn-secondary:hover {
  background: var(--color-background-mute);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background: var(--color-danger-hover);
}
</style>