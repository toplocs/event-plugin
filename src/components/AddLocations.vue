<template>
  <Search
    placeholder="Add some locations ..."
    name="selectedItem"
    :findOptions="findLocations"
    @selected="addLocation"
  />
  <div class="mt-2 space-x-1 space-y-1">
    <span v-for="location of locations">
      <LocationBadge
        :key="location.id"
        :title="location.title"
        :remove="() => removeLocation(location)"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { ref } from 'vue';
import TextInput from './common/TextInput.vue';
import Search from './Search.vue';
import LocationBadge from './badges/LocationBadge.vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  }
});
const emit = defineEmits(['update:modelValue']);
const shellURL = import.meta.env.VITE_SHELL_API_URL;
const locations = ref(props.modelValue);

const findLocations = async (title: string) => {
  try {
    const response = await axios.get(`${shellURL}/api/location?title=${title}`);

    return response.data
  } catch (error) {
    console.error(error);
  }
}

const addLocation = (selected: Object) => {
  if (locations.value.includes(selected)) return;
  locations.value.push(selected);
  emit('update:modelValue', locations.value);
}

const removeLocation = (location: Object) => {
  locations.value = locations.value.filter(x => x != location);
  emit('update:modelValue', locations.value);
}
</script>
