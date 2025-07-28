<template>
  <PluginInfoPage
    :plugin-config="pluginConfig"
    icon="📅"
    :about="about"
    :features="features"
    :endpoints="endpoints"
    :development="development"
    :slot-descriptions="slotDescriptions"
  />
</template>

<script setup lang="ts">
import { PluginInfoPage } from '@toplocs/plugin-sdk'
import pluginConfig from './index'

// Update the URL to the deployed version
const deployedConfig = {
  ...pluginConfig,
  url: 'https://toplocs.github.io/event-plugin/assets/plugin.js'
}

const about = "The Event Plugin is a module federation plugin for the TopLocs platform that enables communities to create, manage, and participate in events. It integrates seamlessly with TopLocs' decentralized P2P architecture."

const features = [
  {
    icon: '🎯',
    title: 'Event Creation',
    description: 'Create events with detailed information including date, time, location, and participant limits'
  },
  {
    icon: '🔄',
    title: 'Recurring Events',
    description: 'Set up recurring events for regular community activities'
  },
  {
    icon: '👥',
    title: 'Attendee Management',
    description: 'Track RSVPs and manage event participants'
  },
  {
    icon: '🏷️',
    title: 'Interest Tags',
    description: 'Tag events with interests for better discoverability'
  }
]

const endpoints = {
  plugin: 'https://toplocs.github.io/event-plugin/assets/plugin.js',
  landing: 'https://toplocs.github.io/event-plugin/'
}

const development = {
  stack: [
    'Vue 3 + TypeScript',
    'Vite + Module Federation',
    'Gun.js for P2P data synchronization',
    'Tailwind CSS for styling'
  ],
  setup: `# Clone the repository
git clone https://github.com/toplocs/event-plugin.git
cd event-plugin

# Install dependencies
pnpm install

# Run development server
pnpm dev`
}

const slotDescriptions = {
  'Info/Sidebar': 'Event list sidebar widget',
  'Info/Content': 'Main event management interface',
  'Settings/Content': 'Event plugin settings'
}
</script>