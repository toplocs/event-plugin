<template>
  <div class="event-create-widget" :class="{ 'compact': compact }">
    <!-- Quick Create Button -->
    <div v-if="!showForm" class="quick-create">
      <button @click="toggleForm" class="create-btn">
        <i class="fas fa-plus"></i>
        <span>{{ buttonText }}</span>
      </button>
    </div>

    <!-- Quick Form -->
    <div v-if="showForm" class="quick-form">
      <form @submit.prevent="handleQuickCreate" class="form">
        <div class="form-header">
          <h4>Quick Event</h4>
          <button type="button" @click="toggleForm" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="form-body">
          <input
            v-model="quickData.title"
            type="text"
            placeholder="Event title"
            required
            class="input title-input"
          />

          <textarea
            v-model="quickData.description"
            placeholder="What's happening?"
            rows="3"
            required
            class="input"
          ></textarea>

          <div class="input-row">
            <input
              v-model="quickData.date"
              type="date"
              required
              :min="minDate"
              class="input"
            />
            <input
              v-model="quickData.time"
              type="time"
              class="input"
            />
          </div>

          <input
            v-model="quickData.location"
            type="text"
            placeholder="Location (optional)"
            class="input"
          />
        </div>

        <div class="form-footer">
          <button type="button" @click="openFullForm" class="btn-link">
            More options
          </button>
          <button type="submit" :disabled="creating" class="btn-create">
            {{ creating ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Full Form Modal -->
    <div v-if="showFullForm" class="full-form-overlay" @click.self="closeFullForm">
      <div class="full-form-container">
        <EventCreateInline
          :currentUser="currentUser"
          :autoExpand="true"
          @created="handleEventCreated"
          @cancelled="closeFullForm"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEvent } from '../composables/eventProvider'
import EventCreateInline from './EventCreateInline.vue'
import type { User } from '../types/event'

const props = defineProps<{
  currentUser: User
  buttonText?: string
  compact?: boolean
}>()

const emit = defineEmits<{
  created: [eventId: string]
}>()

const { createEvent } = useEvent()

const showForm = ref(false)
const showFullForm = ref(false)
const creating = ref(false)

const quickData = ref({
  title: '',
  description: '',
  date: '',
  time: '',
  location: ''
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const toggleForm = () => {
  if (showForm.value) {
    resetQuickData()
  } else {
    // Set default date
    quickData.value.date = minDate.value
  }
  showForm.value = !showForm.value
}

const openFullForm = () => {
  showForm.value = false
  showFullForm.value = true
}

const closeFullForm = () => {
  showFullForm.value = false
  resetQuickData()
}

const resetQuickData = () => {
  quickData.value = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  }
}

const handleQuickCreate = async () => {
  if (creating.value) return
  
  creating.value = true
  
  try {
    // Combine date and time
    let eventDate: string
    if (quickData.value.time) {
      const dateTime = new Date(`${quickData.value.date}T${quickData.value.time}`)
      eventDate = dateTime.toISOString()
    } else {
      eventDate = new Date(quickData.value.date).toISOString()
    }
    
    const eventId = await createEvent({
      title: quickData.value.title,
      description: quickData.value.description,
      date: eventDate,
      time: quickData.value.time,
      recurring: 1,
      limit: 0,
      interests: [],
      locations: quickData.value.location ? [quickData.value.location] : [],
      creator: props.currentUser.pub
    })
    
    emit('created', eventId)
    showForm.value = false
    resetQuickData()
  } catch (error) {
    console.error('Failed to create event:', error)
  } finally {
    creating.value = false
  }
}

const handleEventCreated = (eventId: string) => {
  emit('created', eventId)
  showFullForm.value = false
  resetQuickData()
}
</script>

<style scoped>
.event-create-widget {
  position: relative;
  width: 100%;
}

/* Quick Create Button */
.quick-create {
  display: flex;
  justify-content: center;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.compact .create-btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

/* Quick Form */
.quick-form {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
}

.form-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text);
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text);
}

.form-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background-soft);
  color: var(--color-text);
  font-size: 0.95rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-background);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.title-input {
  font-weight: 500;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

textarea.input {
  resize: vertical;
  font-family: inherit;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  padding: 0.25rem;
}

.btn-link:hover {
  color: var(--color-primary-hover);
}

.btn-create {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Full Form Overlay */
.full-form-overlay {
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
  padding: 1rem;
  overflow-y: auto;
}

.full-form-container {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

/* Compact mode adjustments */
.compact .quick-form {
  max-width: 320px;
}

.compact .form-body {
  padding: 1rem;
  gap: 0.75rem;
}

.compact .input {
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
}

.compact .form-header,
.compact .form-footer {
  padding: 0.75rem 1rem;
}

/* Mobile responsive */
@media (max-width: 480px) {
  .quick-form {
    max-width: none;
    margin: 0;
    border-radius: 8px;
  }
  
  .input-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .form-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .btn-create {
    width: 100%;
  }
}
</style>