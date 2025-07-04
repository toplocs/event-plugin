<template>
  <div class="event-settings">
    <h3>📅 Event Settings</h3>
    
    <div class="settings-section">
      <h4>Notifications</h4>
      <label class="setting-item">
        <input type="checkbox" v-model="settings.eventReminders" @change="saveSettings">
        <span>Event reminders (24h before)</span>
      </label>
      
      <label class="setting-item">
        <input type="checkbox" v-model="settings.newEventNotifications" @change="saveSettings">
        <span>New events in my interests</span>
      </label>
      
      <label class="setting-item">
        <input type="checkbox" v-model="settings.attendeeUpdates" @change="saveSettings">
        <span>Attendee updates for my events</span>
      </label>
    </div>

    <div class="settings-section">
      <h4>Display</h4>
      <label class="setting-item">
        <input type="checkbox" v-model="settings.showPastEvents" @change="saveSettings">
        <span>Show past events</span>
      </label>
      
      <label class="setting-item">
        <input type="checkbox" v-model="settings.compactView" @change="saveSettings">
        <span>Compact event list</span>
      </label>
      
      <label class="setting-item">
        <span>Default view:</span>
        <select v-model="settings.defaultView" @change="saveSettings" class="setting-select">
          <option value="upcoming">Upcoming Events</option>
          <option value="my-events">My Events</option>
          <option value="attending">Attending</option>
        </select>
      </label>
    </div>

    <div class="settings-section">
      <h4>Privacy</h4>
      <label class="setting-item">
        <input type="checkbox" v-model="settings.publicProfile" @change="saveSettings">
        <span>Show me in attendee lists</span>
      </label>
      
      <label class="setting-item">
        <input type="checkbox" v-model="settings.shareLocation" @change="saveSettings">
        <span>Include location in my events</span>
      </label>
    </div>

    <div class="settings-info">
      <p>Events are stored on the Gun.js P2P network</p>
      <p>No central server - your events stay decentralized</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  gun: any
  user: any
  space: string
}>()

interface EventSettings {
  eventReminders: boolean
  newEventNotifications: boolean
  attendeeUpdates: boolean
  showPastEvents: boolean
  compactView: boolean
  defaultView: string
  publicProfile: boolean
  shareLocation: boolean
}

const settings = ref<EventSettings>({
  eventReminders: true,
  newEventNotifications: true,
  attendeeUpdates: true,
  showPastEvents: false,
  compactView: false,
  defaultView: 'upcoming',
  publicProfile: true,
  shareLocation: true
})

const userSettingsRef = props.gun.user().get('event-settings')

const loadSettings = () => {
  userSettingsRef.once((data: any) => {
    if (data) {
      settings.value = { ...settings.value, ...data }
    }
  })
}

const saveSettings = () => {
  userSettingsRef.put(settings.value)
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.event-settings {
  padding: 1.5rem;
  max-width: 600px;
}

.event-settings h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: var(--color-heading);
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  cursor: pointer;
}

.setting-item input[type="checkbox"] {
  margin-right: 0.75rem;
  cursor: pointer;
}

.setting-item span {
  user-select: none;
}

.setting-select {
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-soft);
  color: var(--color-text);
}

.settings-info {
  margin-top: 2rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.settings-info p {
  margin: 0.5rem 0;
}
</style>