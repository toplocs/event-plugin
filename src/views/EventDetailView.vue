<template>
  <Container>
    <div class="w-full">
      <Card className="space-y-4" v-if="event">
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
                  @click="handleLeaveEvent"
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
                  :key="interest"
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
                  :key="location"
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
                  v-for="attendee of attendees"
                  :key="attendee.userId"
                  :to="`/profile/${attendee.profile.id}`"
                  class="cursor-pointer"
                >
                  <ProfileImage
                    size="medium"
                    :src="attendee.profile.image"
                    :tooltipText="attendee.profile.username"
                  />
                </router-link>
              </div>
            </div>

            <div class="mt-6">
              <button
                v-if="!joined"
                class="p-4 rounded font-semibold transition-colors duration-200 bg-green-500 hover:bg-green-600 text-white"
                @click="handleJoinEvent"
                :disabled="loading"
              > 
                {{ loading ? 'Joining...' : 'Join the event' }}
              </button>
            </div>
          </div>
        </div>
      </Card>
      
      <Card v-else-if="loading" className="text-center">
        <p>Loading event...</p>
      </Card>
      
      <Card v-else-if="error" className="text-center text-red-500">
        <p>{{ error }}</p>
      </Card>
    </div>
  </Container>
</template>

<script setup lang="ts">
import '../assets/main.css';
import { getRecursion } from '../assets/recursion';
import { ref, inject, computed, onMounted, onUnmounted, watch } from 'vue';
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
import { useEventGun } from '../composables/useEventGun';
import { getGunInstance } from '../services/gun';

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})

// Injected from main app
const profile = inject('profile', ref(null));
const sphereId = inject('sphereId', ref('default'));

// Initialize Gun
const gun = getGunInstance();
const { 
  getEvent,
  joinEvent,
  leaveEvent,
  subscribeToAttendees,
  isAttending,
  loading,
  error 
} = useEventGun(gun, sphereId.value);

// Component state
const event = ref(null);
const attendees = ref<any[]>([]);
const joined = ref(false);

// Computed properties
const eventDate = computed(() => event.value ? new Date(event.value.date) : null);
const eventDay = computed(() => eventDate.value?.getDate());
const eventMonth = computed(() => 
  eventDate.value?.toLocaleString('default', { month: 'short' })
);
const eventTime = computed(() => 
  eventDate.value?.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })
);
const tooltiptext = computed(() => {
  if (!event.value?.limit) return `${attendees.value.length}`;
  return `${attendees.value.length} / ${event.value.limit}`;
})

// Event handlers
const handleJoinEvent = async () => {
  if (!profile.value) {
    error.value = 'Please login to join events';
    return;
  }
  
  try {
    await joinEvent(props.id, profile.value);
    joined.value = true;
  } catch (err) {
    console.error('Failed to join event:', err);
  }
}

const handleLeaveEvent = async () => {
  try {
    await leaveEvent(props.id);
    joined.value = false;
  } catch (err) {
    console.error('Failed to leave event:', err);
  }
}

// Subscriptions
let unsubscribeAttendees: (() => void) | null = null;

const loadEvent = async () => {
  try {
    event.value = await getEvent(props.id);
    
    // Check if current user is attending
    if (profile.value) {
      joined.value = await isAttending(props.id);
    }
    
    // Subscribe to attendees
    if (unsubscribeAttendees) unsubscribeAttendees();
    unsubscribeAttendees = subscribeToAttendees(props.id, (newAttendees) => {
      attendees.value = newAttendees;
      
      // Update joined status
      if (profile.value) {
        joined.value = newAttendees.some(a => a.userId === profile.value.id);
      }
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load event';
  }
}

// Lifecycle
onMounted(() => {
  loadEvent();
});

onUnmounted(() => {
  if (unsubscribeAttendees) {
    unsubscribeAttendees();
  }
});

// Watch for id changes
watch(() => props.id, () => {
  loadEvent();
});
</script>