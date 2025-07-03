<template>
  <EventListView />

  <EventDetailView />

  <EventCreateView />
</template>

<script setup lang="ts">
import './assets/main.css';
import { ref, inject, provide } from 'vue';
import { useRoute } from 'vue-router';
import EventListView from './views/EventListView.vue';
import EventDetailView from './views/EventDetailView.vue';
import EventCreateView from './views/EventCreateView.vue';

// Test data for standalone development
const tab = ref('Events');
const interest = ref({ title: 'Programmieren' });
const location = ref(null);
const profile = ref({
  id: 'test',
  username: 'Yannik',
  image: '/images/default.jpeg',
});
const sphereId = ref('test-sphere');

provide('tab', tab);
provide('interest', interest);
provide('location', location);
provide('profile', profile);
provide('sphereId', sphereId);
</script>
