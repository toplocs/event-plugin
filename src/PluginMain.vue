<template>
  <router-view />
</template>

<script setup lang="ts">
import { inject, provide, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createMemoryHistory, createRouter } from 'vue-router'

// Import views
import EventListView from './views/EventListView.vue'
import EventDetailView from './views/EventDetailView.vue'
import EventCreateView from './views/EventCreateView.vue'

// Get base path from main app or use default
const basePath = inject('pluginBasePath', '/event')

// Plugin routes
const routes = [
  {
    path: basePath,
    name: 'EventList',
    component: EventListView
  },
  {
    path: `${basePath}/create`,
    name: 'EventCreate',
    component: EventCreateView,
    props: route => ({
      interest: route.query.interest,
      location: route.query.location
    })
  },
  {
    path: `${basePath}/:id`,
    name: 'EventDetail',
    component: EventDetailView,
    props: true
  }
]

// Create router for plugin
const router = createRouter({
  history: createMemoryHistory(),
  routes
})

// Use main app router if available
const mainRouter = inject('router', null)
const mainRoute = inject('route', null)

if (mainRouter && mainRoute) {
  // Sync with main app router
  router.beforeEach((to, from, next) => {
    if (mainRoute.path !== to.path) {
      mainRouter.push(to.path)
    }
    next()
  })
  
  // Set initial route
  onMounted(() => {
    if (mainRoute.path.startsWith(basePath)) {
      router.push(mainRoute.path)
    }
  })
}

// Provide router to child components
provide('router', router)
provide('route', router.currentRoute)
</script>

<style>
/* Import Tailwind styles if not already available */
@import './assets/main.css';
</style>