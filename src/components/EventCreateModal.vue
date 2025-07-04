<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Create New Event</h2>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleCreateEvent" class="modal-body">
        <div class="form-group">
          <label for="title">Event Title</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            placeholder="Enter event title"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            required
            placeholder="Describe your event"
            rows="4"
            class="form-input"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="date">Date</label>
            <input
              id="date"
              v-model="formData.date"
              type="date"
              required
              :min="minDate"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="time">Time</label>
            <input
              id="time"
              v-model="formData.time"
              type="time"
              required
              class="form-input"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="recurring">Recurrence</label>
            <select
              id="recurring"
              v-model.number="formData.recurring"
              class="form-input"
            >
              <option :value="1">One-time event</option>
              <option :value="2">Weekly</option>
              <option :value="3">Bi-weekly</option>
              <option :value="4">Monthly</option>
            </select>
          </div>

          <div class="form-group">
            <label for="limit">Attendee Limit</label>
            <input
              id="limit"
              v-model.number="formData.limit"
              type="number"
              min="0"
              placeholder="0 = no limit"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="interests">Interests (comma-separated)</label>
          <input
            id="interests"
            v-model="formData.interests"
            type="text"
            placeholder="e.g., technology, music, sports"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="locations">Locations (comma-separated)</label>
          <input
            id="locations"
            v-model="formData.locations"
            type="text"
            placeholder="e.g., berlin, munich"
            class="form-input"
          />
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="creating">
            {{ creating ? 'Creating...' : 'Create Event' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEventProvider } from '../composables/eventProvider'
import type { User } from '../types/event'

const props = defineProps<{
  gun: any
  space: string
  currentUser: User
}>()

const emit = defineEmits<{
  close: []
  created: [eventId: string]
}>()

const { createEvent } = useEventProvider(props.gun, props.space)

const creating = ref(false)

const formData = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  recurring: 1,
  limit: 0,
  interests: '',
  locations: ''
})

// Set minimum date to today
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const handleCreateEvent = async () => {
  if (creating.value) return
  
  creating.value = true
  
  try {
    // Combine date and time
    const eventDate = new Date(`${formData.value.date}T${formData.value.time}`)
    
    // Parse comma-separated values
    const interests = formData.value.interests
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0)
    
    const locations = formData.value.locations
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0)
    
    const eventId = await createEvent({
      title: formData.value.title,
      description: formData.value.description,
      date: eventDate.toISOString(),
      time: formData.value.time,
      recurring: formData.value.recurring,
      limit: formData.value.limit,
      interests,
      locations,
      creator: props.currentUser.pub
    })
    
    emit('created', eventId)
  } catch (error) {
    console.error('Failed to create event:', error)
  } finally {
    creating.value = false
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
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
</style>