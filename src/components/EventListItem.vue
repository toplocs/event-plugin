<template>
  <div
    class="flex items-center p-4 w-full border-t border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-150 ease-in-out cursor-pointer"
  >
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
      <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {{ event.title }}
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{ event.description }}
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <StatusBadge :title="getRecursion(event?.recurring)" />
        <span v-for="interest in event.interests">
          <InterestBadge
            v-if="interest != ''"
            :key="interest"
            :title="interest"
          />
        </span>
        <span v-for="location in event.locations">
          <LocationBadge
            v-if="location != ''"
            :key="location"
            :title="location"
          />
        </span>
      </div>

      <span class="mt-2 flex flex-wrap gap-1">
        <ProfileImage
          v-for="profile in event.profiles"
          :src="profile.image"
          :tooltipText="profile.username"
          size="small"
        />
      </span>
    </div>

    <div class="flex-2">
      <button
        v-if="!joined"
        class="p-4 rounded font-semibold transition-colors duration-200 bg-green-500 hover:bg-green-600 text-white"
        @click="joinEvent"
      > Join
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getRecursion } from '../assets/recursion';
import { ref, computed } from 'vue';
import LocationBadge from '@/components/badges/LocationBadge.vue';
import InterestBadge from '@/components/badges/InterestBadge.vue';
import StatusBadge from '@/components/badges/StatusBadge.vue';
import ProfileImage from '@/components/common/ProfileImage.vue';

const props = defineProps({
  event: {
    type: Object as () => any,
    required: true,
  },
  profile: {
    type: Object as () => any,
    required: true,
  }
});
const eventDate = computed(() => new Date(props.event.date));
const eventDay = computed(() => eventDate.value?.getDate());
const eventMonth = computed(() => 
  eventDate.value?.toLocaleString('default', { month: 'short' })
);
const eventTime = computed(() => 
  eventDate.value?.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })
);
const joined = computed(() => 
  props.event.profiles?.some(x => x.id === props.profile?.id)
);

const joinEvent = async (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
  // Join functionality will be handled by parent component
  console.log('Join event:', props.event.id);
}
</script>
