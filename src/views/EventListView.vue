<template>
  <Container>
    <Card className="px-0">
      <div class="px-4 mb-2 flex flex-row justify-between">
        <Title>Upcoming events:</Title>

        <router-link :to="href">
          <IconButton
            :icon="PlusIcon"
            tooltipText="Create a new event"
          />
        </router-link>
      </div>
      <EventPlugin
        :events="upcomingEvents"
        :profile="profile"
      />
    </Card>
  </Container>
</template>

<script setup lang="ts">
import '../assets/main.css';
import { ref, inject, computed, onMounted, onUnmounted } from 'vue';
import { PlusIcon } from '@heroicons/vue/24/outline';
import Container from '../components/common/Container.vue';
import Card from '../components/common/Card.vue';
import Title from '../components/common/Title.vue';
import IconButton from '../components/common/IconButton.vue';
import EventPlugin from '../components/Main.vue';
import { useEventGun } from '../composables/useEventGun';
import { getGunInstance } from '../services/gun';

// Injected from main app
const interest = inject('interest', ref(null));
const location = inject('location', ref(null));
const profile = inject('profile', ref(null));
const tab = inject('tab', ref('Events'));
const sphereId = inject('sphereId', ref('default'));

// Initialize Gun
const gun = getGunInstance();
const { 
  upcomingEvents, 
  subscribeToEvents, 
  loading, 
  error 
} = useEventGun(gun, sphereId.value);

// Create href for new event
const href = computed(() => {
  const params = new URLSearchParams();
  if (interest.value) params.append('interest', interest.value?.title);
  if (location.value) params.append('location', location.value?.title);

  return `/event/create${params.toString() ? '?' + params.toString() : ''}`;
});

// Subscribe to events
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  tab.value = 'Events';
  
  // Subscribe with filters if available
  const filter: any = {};
  if (interest.value?.title) filter.interest = interest.value.title;
  if (location.value?.title) filter.location = location.value.title;
  
  unsubscribe = subscribeToEvents(filter);
});

onUnmounted(() => {
  // Clean up subscription
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>