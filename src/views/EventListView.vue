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
        :events="events"
        :profile="profile"
      />
    </Card>
  </Container>
</template>

<script setup lang="ts">
import '../assets/main.css';
import axios from 'axios';
import { ref, inject, computed, onMounted } from 'vue';
import { PlusIcon } from '@heroicons/vue/24/outline';
import Container from '../components/common/Container.vue';
import Card from '../components/common/Card.vue';
import Title from '../components/common/Title.vue';
import IconButton from '../components/common/IconButton.vue';
import EventPlugin from '../components/Main.vue';

const apiURL = import.meta.env.VITE_API_URL;
const interest = inject('interest');
const location = inject('location')
const profile = inject('profile');
const tab = inject('tab');
const events = ref([]);
const href = computed(() => {
  const params = new URLSearchParams();
  if (interest.value) params.append('interest', interest.value?.title);
  if (location.value) params.append('location', location.value?.title);

  return `/event/create${params.toString() ? '?' + params.toString() : ''}`;
});

const fetchEvents = async (prop: String) => {
  try {
    const response = await axios.get(`/api/event/pages/${prop}`);

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  events.value = await fetchEvents(
    interest.value?.title || location.value?.title
  );
  tab.value = 'Events';
});

axios.defaults.baseURL = apiURL;
</script>
