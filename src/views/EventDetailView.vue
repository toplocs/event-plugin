<template>
  <Container>
    <div class="w-full">
      <Card className="space-y-4">
        <div class="flex">
          <div class="space-y-1">
            <div class="w-16 h-16 flex-shrink-0 flex flex-col justify-center items-center border-2 rounded-md mr-4 dark:text-gray-300">
              <span class="text-2xl font-bold">{{ eventDay }}</span>
              <span class="text-sm font-medium">{{ eventMonth }}</span>
            </div>

            <div class="w-16 flex-shrink-0 flex justify-center border-2 rounded-md">
              <span class="text-sm font-medium">{{ eventTime }}</span>
            </div>
          </div>

          <div class="flex-1">
            <div class="flex flrex-row justify-between items-center">
              <h1 class="text-4xl font-bold text-gray-900 mb-4">
                {{ event?.title }}
              </h1>

              <div class="space-x-2">
                <IconButton
                  :icon="UsersIcon"
                  :tooltipText="tooltiptext"
                />
                <IconButton
                  v-if="joined"
                  :icon="MinusIcon"
                  tooltipText="Leave the event"
                  className="text-red-500 dark:text-red-400"
                  @click="leaveEvent"
                />
              </div>

            </div>

            <p class="text-gray-700 mb-6">
              {{ event?.description }}
            </p>

            <div class="mb-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-2">
                This event is happening:
              </h2>
              <StatusBadge :title="getRecursion(event?.recurring)" />
            </div>

            <div v-if="event?.interests.length" class="mb-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-2">
                Relevant interests:
              </h2>
              <div class="flex flex-wrap gap-2">
                <InterestBadge
                  v-for="interest in event?.interests"
                  :title="interest"
                />
              </div>
            </div>

            <div v-if="event?.locations.length" class="mb-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-2">
                Included locations:
              </h2>
              <div class="flex flex-wrap gap-2">
                <LocationBadge
                  v-for="location in event?.locations"
                  :title="location"
                />
              </div>
            </div>

            <div class="mb-8">
              <h2 class="text-lg font-semibold text-gray-900 mb-2">
                People who already joined:
              </h2>
              <div class="flex flex-wrap gap-2">
                <router-link
                  v-for="profile of event?.profiles"
                  :to="`/profile/${profile.id}`"
                  class="cursor-pointer"
                >
                  <ProfileImage
                    size="medium"
                    :src="profile.image"
                    :tooltipText="profile.username"
                  />
                </router-link>
              </div>
            </div>

            <div class="mt-6">
              <button
                v-if="!joined"
                class="p-4 rounded font-semibold transition-colors duration-200 bg-green-500 hover:bg-green-600 text-white"
                @click="joinEvent"
              > Join the event
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </Container>
</template>

<script setup lang="ts">
import '../assets/main.css';
import { getRecursion } from '../assets/recursion';
import axios from 'axios';
import { ref, inject, computed, onMounted } from 'vue';
import { UsersIcon, MinusIcon } from '@heroicons/vue/24/outline';
import { useRoute } from 'vue-router';
import Container from '@/components/common/Container.vue';
import Card from '@/components/common/Card.vue';
import Title from '@/components/common/Title.vue';
import ProfileImage from '@/components/common/ProfileImage.vue';
import IconButton from '@/components/common/IconButton.vue';
import LocationBadge from '@/components/badges/LocationBadge.vue';
import InterestBadge from '@/components/badges/InterestBadge.vue';
import StatusBadge from '@/components/badges/StatusBadge.vue';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})
const apiURL = import.meta.env.VITE_API_URL;
const route = useRoute();
const event = ref(null);
const profile = inject('profile');
const eventDate = computed(() => new Date(event.value?.date));
const eventDay = computed(() => eventDate.value?.getDate());
const eventMonth = computed(() => 
  eventDate.value?.toLocaleString('default', { month: 'short' })
);
const eventTime = computed(() => 
  eventDate.value?.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })
);
const joined = computed(() => 
  event.value?.profiles.some(x => x.id === profile.value?.id)
);
const tooltiptext = computed(() => {
  if (!event?.limit) return `${event.value?.profiles.length}`;
  return `${event.value?.profiles.length} / ${event?.limit}`;
})

const joinEvent = async () => {
  try {
    const formData = new FormData();
    formData.append('profile', JSON.stringify(profile.value));
    const response = await axios.post(`/api/event/join/${event.value?.id}`, formData);
    event.value?.profiles.push(profile.value);
    
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

const leaveEvent = async () => {
  try {
    const formData = new FormData();
    formData.append('profile', JSON.stringify(profile.value));
    const response = await axios.post(`/api/event/leave/${event.value?.id}`, formData);
    event.value.profiles = event.value.profiles.filter(
      x => x.id != profile.value?.id
    );
    
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

const fetchEventById = async (id: string) => {
  try {
    const response = await axios.get(`/api/event/byId/${id}`);

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  event.value = await fetchEventById(props.id);
});

axios.defaults.baseURL = apiURL;
</script>
