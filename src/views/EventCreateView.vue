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
          <Callout v-if="error" color="red">
            {{ error }}
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
              v-model="title"
              required
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
              v-model="description"
              required
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
              v-model="limit"
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
              class="px-4 py-2 rounded font-semibold transition-colors duration-200 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
              :disabled="loading"
            > 
              {{ loading ? 'Creating...' : 'Create' }}
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
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import Datepicker from 'vue3-datepicker';
import Card from '../components/common/Card.vue';
import Container from '../components/common/Container.vue';
import Title from '../components/common/Title.vue';
import Callout from '../components/common/Callout.vue';
import TextInput from '../components/common/TextInput.vue';
import NumberInput from '../components/common/NumberInput.vue';
import SelectInput from '../components/common/SelectInput.vue';
import TextArea from '../components/common/TextArea.vue';
import AddInterests from '../components/AddInterests.vue';
import AddLocations from '../components/AddLocations.vue';
import { useEventGun } from '../composables/useEventGun';
import { getGunInstance } from '../services/gun';

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

// Router
const router = useRouter();

// Injected from main app
const profile = inject('profile', ref(null));
const sphereId = inject('sphereId', ref('default'));

// Initialize Gun
const gun = getGunInstance();
const { createEvent, loading, error } = useEventGun(gun, sphereId.value);

// Form state
const form = ref<HTMLFormElement | null>(null);
const title = ref('');
const description = ref('');
const interests = ref(props.interest ? [props.interest] : []);
const locations = ref(props.location ? [props.location] : []);
const picked = ref(new Date());
const recurring = ref(1);
const limit = ref(0);
const successMessage = ref('');

// Form submission
const onSubmit = async () => {
  if (!profile.value) {
    error.value = 'Please login to create events';
    return;
  }
  
  if (!title.value || !description.value) {
    error.value = 'Please fill in all required fields';
    return;
  }
  
  try {
    const eventData = {
      title: title.value,
      description: description.value,
      date: picked.value.toISOString(),
      recurring: recurring.value,
      limit: limit.value,
      interests: interests.value.filter(Boolean),
      locations: locations.value.filter(Boolean)
    };
    
    const eventId = await createEvent(eventData);
    successMessage.value = 'Event created successfully!';
    
    // Redirect to event detail page after 1 second
    setTimeout(() => {
      router.push(`/event/${eventId}`);
    }, 1000);
    
  } catch (err) {
    console.error('Failed to create event:', err);
    // Error is already set by composable
  }
}
</script>