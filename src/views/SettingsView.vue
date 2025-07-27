<template>
  <Settings/>
</template>

<script setup lang="ts">
import Settings from '@/components/Settings.vue';
import { eventProvider } from '@/composables/eventProvider';

const props = defineProps({
  parentId: String,
});

console.log("Event Settings instance: ", props.parentId);
eventProvider(props.parentId ?? 'test');
</script>