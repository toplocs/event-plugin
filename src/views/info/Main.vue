<template>
  <Main/>
</template>

<script setup lang="ts">
import Main from '@/components/Main.vue';
import { eventProvider } from '@/composables/eventProvider';

const props = defineProps({
  parentId: String,
});

console.log("Event Main instance: ", props.parentId);
eventProvider(props.parentId ?? 'test');
</script>