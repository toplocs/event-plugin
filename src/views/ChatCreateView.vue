<template>
  <Container>
    <div class="w-full">
      <Card className="space-y-4">
        <Title>
          Creating a new chat room:
        </Title>
        <form
          ref="form"
          @submit.prevent="onSubmit"
        >
          <Callout v-if="successMessage" color="green">
            {{ successMessage }}
          </Callout>
          <Callout v-if="errorMessage" color="red">
            {{ errorMessage }}
          </Callout>

          <div className="mb-2">
            <label
              for="title"
              class="block text-gray-900 dark:text-gray-100 font-medium text-sm mb-2"
            > Chat room title
            </label>

            <TextInput
              type="text"
              id="title"
              name="title"
              autoComplete="title"
              placeholder="The chat room title"
            />
          </div>

          <div class="mb-2">
            <label
              for="interests"
              class="block text-gray-900 dark:text-gray-100 font-medium text-sm mb-2"
            > Interests
            </label>
            <AddInterests v-model="interests" />
          </div>

          <div class="mb-2">
            <label
              for="locations"
              class="block text-gray-900 dark:text-gray-100 font-medium text-sm mb-2"
            > Locations
            </label>
            <AddLocations v-model="locations" />
          </div>
    
          <div class="mt-2 space-x-2">
            <button
              type="submit"
              class="px-4 py-2 rounded font-semibold transition-colors duration-200 bg-green-500 hover:bg-green-600 text-white"
            > Create
            </button>
          </div>
        </form>
      </Card>
    </div>
  </Container>
</template>

<script setup lang="ts">
import '../assets/main.css';
import axios from 'axios';
import { ref, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Card from '../components/common/Card.vue';
import Container from '../components/common/Container.vue';
import Title from '../components/common/Title.vue';
import Callout from '../components/common/Callout.vue';
import TextInput from '../components/common/TextInput.vue';
import AddInterests from '../components/AddInterests.vue';
import AddLocations from '../components/AddLocations.vue';

const props = defineProps({
  interest: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  }
});
const apiURL = import.meta.env.VITE_API_URL;
const shellURL = import.meta.env.VITE_SHELL_API_URL;
const form = ref<HTMLFormElement | null>(null);
const interests = ref([]);
const locations = ref([]);
const successMessage = ref('');
const errorMessage = ref('');

const fetchInterest = async (id: string) => {
  try {
    const response = await axios.get(`${shellURL}/api/interest/byId/${id}`);

    return response.data
  } catch (error) {
    console.error(error);
  }
}

const fetchLocation = async (id: string) => {
  try {
    const response = await axios.get(`${shellURL}/api/location/byId/${id}`);

    return response.data
  } catch (error) {
    console.error(error);
  }
}

const onSubmit = async () => {
  try {
    if (successMessage.value.length) return;
    const formData = new FormData(form.value ?? undefined);
    formData.append('interests', JSON.stringify(interests.value));
    formData.append('locations', JSON.stringify(locations.value));
    const response = await axios.post(`/api/chat`, formData);
    successMessage.value = 'The chat room was created successfully!';
    
    return response.data;
  } catch (error) {
    console.error(error);
    errorMessage.value = error.response.data;
  }
}

onMounted(async () => {
  if (props.interest.length) {
    interests.value.push(await fetchInterest(props.interest));
  }
  if (props.location.length) {
    locations.value.push(await fetchLocation(props.location));
  }
});

axios.defaults.baseURL = apiURL;
</script>
