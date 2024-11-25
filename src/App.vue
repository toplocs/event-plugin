<template>
  <ChatView />

  <ChatCreateView />
</template>

<script setup lang="ts">
import './assets/main.css';
import axios from 'axios';
import { ref, inject, provide } from 'vue';
import { useRoute } from 'vue-router';
import ChatView from './views/ChatView.vue';
import ChatCreateView from './views/ChatCreateView.vue';

const apiURL = import.meta.env.VITE_API_URL;
const tab = ref('Chat');
const interest = ref({
  id: '9138e908-b6e3-4bfa-b34f-960a0e703500',
  title: 'Test'
});
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
