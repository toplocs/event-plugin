<template>
  <Container>
    <div class="w-full">
      <Card className="space-y-4">
        <Title>
          Creating a new event:
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
              for="date"
              class="block text-gray-900 dark:text-gray-100 font-medium text-sm mb-2"
            > Event Date
            </label>

            <div
              class="relative p-2 w-full flex items-center min-w-[100px] outline-none rounded-md transition duration-100 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
            >
              <Datepicker
                name="date"
                v-model="picked"
                minimumView="time"
                inputFormat="dd-MM-yyyy' at 'HH:mm"
                :lowerLimit="new Date(Date.now())"
              />
            </div>
          </div>

          <div className="mb-2">
            <label
              for="recurring"
              class="block text-gray-900 dark:text-gray-100 font-medium text-sm mb-2"
            > Happening
            </label>

            <SelectInput
              name="recurring"
              placeholder="When is this happening?"
              :options="options"
              v-model="recurring"
            />
          </div>

          <div className="mb-2">
            <label
              for="title"
              class="block text-gray-900 dark:text-gray-100 font-medium text-sm mb-2"
            > Event Title
            </label>

            <TextInput
              type="text"
              id="title"
              name="title"
              autoComplete="title"
              placeholder="The event title"
            />
          </div>

          <div className="mb-2">
            <label
              for="description"
              class="block text-gray-900 dark:text-gray-100 font-medium text-sm mb-2"
            > Event Description
            </label>

            <TextArea
              type="text"
              id="description"
              name="description"
              autoComplete="description"
              placeholder="The event description"
            />
          </div>

          <div class="mb-2  max-w-[50%]">
            <label
              for="limit"
              class="block text-gray-900 dark:text-gray-100 font-medium text-sm mb-2"
            > Max Participants
            </label>

            <NumberInput
              id="limit"
              name="limit"
              autoComplete="limit"
              :min="0"
            />
          </div>

          <div class="mb-2 max-w-[50%]">
            <label
              for="interests"
              class="block text-gray-900 dark:text-gray-100 font-medium text-sm mb-2"
            > Interests
            </label>
            <AddInterests v-model="interests" />
          </div>

          <div class="mb-2  max-w-[50%]">
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
import { options } from '../assets/recursion';
import axios from 'axios';
import { ref, inject } from 'vue';
import { useRoute } from 'vue-router';
import Datepicker from 'vue3-datepicker';
import Card from '../components/common/Card.vue';
import Container from '../components/common/Container.vue';
import Sidebar from '../components/SideBar.vue';
import Title from '../components/common/Title.vue';
import Callout from '../components/common/Callout.vue';
import TextInput from '../components/common/TextInput.vue';
import NumberInput from '../components/common/NumberInput.vue';
import SelectInput from '../components/common/SelectInput.vue';
import TextArea from '../components/common/TextArea.vue';
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
const form = ref<HTMLFormElement | null>(null);
const interests = ref([props.interest]);
const locations = ref([props.location]);
const picked = ref(new Date());
const recurring = ref(1);
const successMessage = ref('');
const errorMessage = ref('');

const onSubmit = async () => {
  try {
    const formData = new FormData(form.value ?? undefined);
    formData.set('date', picked.value);
    formData.append('interests', JSON.stringify(interests.value));
    formData.append('locations', JSON.stringify(locations.value));
    const response = await axios.post(`/api/event`, formData);
    successMessage.value = 'The event was created successfully!';
    
    return response.data;
  } catch (error) {
    console.error(error);
    errorMessage.value = error.response.data;
  }
}

axios.defaults.baseURL = apiURL;
</script>
