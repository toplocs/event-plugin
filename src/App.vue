<template>
  <EventListView />

  <EventDetailView />

  <EventCreateView />
</template>

<script setup lang="ts">
import './assets/main.css';
import axios from 'axios';
import { ref, inject, provide } from 'vue';
import { useRoute } from 'vue-router';
import EventListView from './views/EventListView.vue';
import EventDetailView from './views/EventDetailView.vue';
import EventCreateView from './views/EventCreateView.vue';

const apiURL = import.meta.env.VITE_API_URL;
const tab = ref('Events');
const interest = ref({ title: 'Programmieren' });
const location = ref(null);
const profile = ref({
  id: 'test',
  username: 'Yannik',
  image: '/images/default.jpeg',
});

provide('tab', tab);
provide('interest', interest);
provide('location', location);
provide('profile', profile);

axios.defaults.baseURL = apiURL;
</script>
