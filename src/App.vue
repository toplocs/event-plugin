<template>
  <div id="app">
    <main class="min-h-screen bg-gray-50">
      <div class="max-w-4xl mx-auto py-6 px-4">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Event Plugin Demo</h1>
          <p class="text-gray-600">Development mode - showcasing event creation components</p>
        </div>

        <!-- Component Demos -->
        <div class="space-y-8">
          <!-- Widget Demo -->
          <section class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Event Creation Widget</h2>
            <p class="text-gray-600 mb-4">Quick and compact event creation - perfect for embedding anywhere</p>
            <EventCreateWidget 
              :currentUser="mockUser" 
              buttonText="Create Event"
              @created="onEventCreated"
            />
          </section>

          <!-- Compact Widget Demo -->
          <section class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Compact Widget</h2>
            <p class="text-gray-600 mb-4">Even smaller version for tight spaces</p>
            <EventCreateWidget 
              :currentUser="mockUser" 
              buttonText="+ Event"
              compact
              @created="onEventCreated"
            />
          </section>

          <!-- Inline Demo -->
          <section class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Inline Event Creation</h2>
            <p class="text-gray-600 mb-4">Full-featured multi-step form that expands inline</p>
            <EventCreateInline 
              :currentUser="mockUser"
              @created="onEventCreated"
              @cancelled="onEventCancelled"
            />
          </section>

          <!-- Event Log -->
          <section v-if="createdEvents.length > 0" class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Created Events</h2>
            <div class="space-y-2">
              <div 
                v-for="event in createdEvents" 
                :key="event.id"
                class="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <p class="font-medium text-green-900">Event created: {{ event.id }}</p>
                <p class="text-sm text-green-700">Timestamp: {{ event.timestamp }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EventCreateWidget from './components/EventCreateWidget.vue'
import EventCreateInline from './components/EventCreateInline.vue'
import { eventProvider } from './composables/eventProvider'
import type { User } from './types/event'

// Initialize event provider for demo
eventProvider('demo-space')

// Mock user for demo
const mockUser: User = {
  pub: 'demo-user-pub-key',
  alias: 'Demo User',
  avatar: undefined
}

// Track created events for demo
const createdEvents = ref<Array<{ id: string; timestamp: string }>>([])

const onEventCreated = (eventId: string) => {
  createdEvents.value.unshift({
    id: eventId,
    timestamp: new Date().toLocaleString()
  })
  console.log('Event created:', eventId)
}

const onEventCancelled = () => {
  console.log('Event creation cancelled')
}
</script>