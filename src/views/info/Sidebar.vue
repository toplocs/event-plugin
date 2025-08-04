<template>
  <Sidebar />
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
import { eventProvider } from '@/composables/eventProvider';

const props = defineProps({
  parentId: String,
});

console.log("Event Sidebar instance: ", props.parentId);

// Call eventProvider immediately to set up the provide/inject context
eventProvider(props.parentId ?? 'test');
</script>