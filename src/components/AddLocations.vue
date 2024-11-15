<template>
  <TextInput
    type="text"
    name="location"
    autoComplete="location"
    placeholder="Add some locations"
    @keydown.enter.prevent="addLocation"
    v-model="input"
  />
  <div class="mt-2 space-x-1 space-y-1">
    <span v-for="title of locations" >
      <LocationBadge
        :key="title"
        :title="title"
        :remove="() => removeLocation(title)"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TextInput from './common/TextInput.vue';
import LocationBadge from './badges/LocationBadge.vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  }
});
const emit = defineEmits(['update:modelValue'])
const locations = ref(props.modelValue.filter(x => x != ''));
const input = ref('');

function addLocation() {
  if (locations.value.includes(input.value)) return;
  locations.value.push(input.value);
  input.value = '';
  emit('update:modelValue', locations.value);
}

function removeLocation(title: String) {
  locations.value = locations.value.filter(x => x != title);
  emit('update:modelValue', locations.value);
}
</script>
