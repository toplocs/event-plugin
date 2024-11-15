<template>
  <div v-for="event of events">
    <router-link :to="`/event/${event.id}`">
      <EventListItem
        :key="event.id"
        :event="event"
        :profile="profile"
      />
    </router-link>
  </div>
  <span v-if="!events.length" class="px-4">
    There are currently no events happening
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EventListItem from './EventListItem.vue';

const props = defineProps({
  events: {
    type: Array,
    default: [],
  },
  profile: {
    type: Object,
    required: true,
  }
});
</script>
