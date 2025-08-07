<template>
  <div class="w-full max-w-2xl mx-auto">
    <!-- Collapsed State -->
    <div v-if="!expanded" class="my-8">
      <button 
        @click="expand" 
        class="w-full p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-white transition-all duration-300 flex items-center gap-4 text-left group hover:shadow-md hover:-translate-y-0.5"
      >
        <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
          <i class="fas fa-plus text-white text-lg"></i>
        </div>
        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-1">Create New Event</h3>
          <p class="text-gray-600">Share something happening in your community</p>
        </div>
      </button>
    </div>

    <!-- Expanded Form -->
    <Card v-if="expanded">
      <div class="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <Title>Create New Event</Title>
        <button @click="collapse" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>

      <form @submit.prevent="handleCreateEvent" class="space-y-6">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
          <TextInput
            id="title"
            v-model="formData.title"
            placeholder="What's happening?"
            name="title"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <TextArea
            id="description"
            v-model="formData.description"
            placeholder="Tell people what to expect..."
            name="description"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <TextInput
              id="date"
              v-model="formData.date"
              type="date"
              :min="minDate"
              name="date"
            />
          </div>

          <div>
            <label for="time" class="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <TextInput
              id="time"
              v-model="formData.time"
              type="time"
              name="time"
            />
          </div>
        </div>

        <div>
          <label for="locations" class="block text-sm font-medium text-gray-700 mb-2">Locations</label>
          <TextInput
            id="locations"
            v-model="formData.locations"
            placeholder="e.g., Berlin, Munich, Online"
            name="locations"
          />
          <p class="text-sm text-gray-500 mt-1">Where can people join?</p>
        </div>

        <div>
          <label for="interests" class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <TextInput
            id="interests"
            v-model="formData.interests"
            placeholder="e.g., music, tech, sports (comma-separated)"
            name="interests"
          />
          <p class="text-sm text-gray-500 mt-1">Help people find your event</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="recurring" class="block text-sm font-medium text-gray-700 mb-2">Repeat</label>
            <SelectInput
              name="recurring"
              v-model="recurringString"
              :options="recurringOptions"
              placeholder="Select frequency"
            />
          </div>

          <div>
            <label for="limit" class="block text-sm font-medium text-gray-700 mb-2">Max Attendees</label>
            <TextInput
              id="limit"
              v-model="limitString"
              type="number"
              placeholder="0 = unlimited"
              name="limit"
            />
          </div>
        </div>

        <Divider />
        
        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <button 
            type="button" 
            @click="collapse" 
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
          >
            Cancel
          </button>
          
          <div class="flex gap-3 items-center justify-center order-1 sm:order-2">
            <button 
              v-if="hasContent"
              type="button" 
              @click="saveDraft" 
              class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Save Draft
            </button>
            
            <SubmitButton :disabled="creating || !canCreate">
              {{ creating ? 'Creating...' : 'Create Event' }}
            </SubmitButton>
          </div>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEvent } from '../composables/eventProvider'
import type { User } from '../types/event'

// Tremor Components
import Card from './common/Card.vue'
import Title from './common/Title.vue'
import TextInput from './common/TextInput.vue'
import TextArea from './common/TextArea.vue'
import SelectInput from './common/SelectInput.vue'
import SubmitButton from './common/SubmitButton.vue'
import Divider from './common/Divider.vue'

const props = defineProps<{
  currentUser: User
  autoExpand?: boolean
}>()

const emit = defineEmits<{
  created: [eventId: string]
  cancelled: []
}>()

const { createEvent } = useEvent()

const expanded = ref(props.autoExpand || false)
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

// Select options for recurring field
const recurringOptions = [
  { id: '1', value: '1', label: 'One-time event' },
  { id: '2', value: '2', label: 'Weekly' },
  { id: '3', value: '3', label: 'Bi-weekly' },
  { id: '4', value: '4', label: 'Monthly' }
]

// Convert between string and number for SelectInput
const recurringString = computed({
  get: () => formData.value.recurring.toString(),
  set: (value: string) => {
    formData.value.recurring = parseInt(value, 10)
  }
})

// Convert between string and number for limit input
const limitString = computed({
  get: () => formData.value.limit.toString(),
  set: (value: string) => {
    formData.value.limit = parseInt(value, 10) || 0
  }
})

// Set minimum date to today
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const hasContent = computed(() => {
  return formData.value.title.trim() || formData.value.description.trim()
})

const canCreate = computed(() => {
  return formData.value.title.trim() && 
         formData.value.description.trim() && 
         formData.value.date
})

const expand = () => {
  expanded.value = true
  // Set default date to today
  if (!formData.value.date) {
    formData.value.date = minDate.value
  }
}

const collapse = () => {
  if (hasContent.value) {
    if (confirm('You have unsaved changes. Are you sure you want to close?')) {
      reset()
    }
  } else {
    reset()
  }
}

const reset = () => {
  expanded.value = false
  formData.value = {
    title: '',
    description: '',
    date: '',
    time: '',
    recurring: 1,
    limit: 0,
    interests: '',
    locations: ''
  }
  emit('cancelled')
}

const resetForm = () => {
  expanded.value = false
  formData.value = {
    title: '',
    description: '',
    date: '',
    time: '',
    recurring: 1,
    limit: 0,
    interests: '',
    locations: ''
  }
  // Don't emit cancelled when successfully created
}

const saveDraft = () => {
  // TODO: Implement draft saving
  console.log('Draft saved:', formData.value)
}

const handleCreateEvent = async () => {
  if (creating.value || !canCreate.value) return
  
  creating.value = true
  
  try {
    // Combine date and time
    let eventDate: string
    if (formData.value.time) {
      const dateTime = new Date(`${formData.value.date}T${formData.value.time}`)
      eventDate = dateTime.toISOString()
    } else {
      eventDate = new Date(formData.value.date).toISOString()
    }
    
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
      date: eventDate,
      time: formData.value.time,
      recurring: formData.value.recurring,
      limit: formData.value.limit,
      interests,
      locations,
      creator: props.currentUser.pub
    })
    
    emit('created', eventId)
    resetForm()
  } catch (error) {
    console.error('Failed to create event:', error)
  } finally {
    creating.value = false
  }
}

// Auto-expand if prop changes
watch(() => props.autoExpand, (newValue) => {
  if (newValue && !expanded.value) {
    expand()
  }
})
</script>

