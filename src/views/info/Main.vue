<template>
  <div class="w-full">
    <nav class="flex gap-2 mb-4 border-b border-gray-200 pb-2 overflow-x-auto" v-if="showTabs">
      <button
        v-for="route in availableRoutes"
        :key="route.path"
        @click="navigate(route.path)"
        :class="[
          'px-4 py-2 rounded transition-all duration-200',
          currentPath === route.path
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        ]"
      >
        <span v-if="route.meta?.icon" class="mr-2">{{ route.meta.icon }}</span>
        {{ route.meta?.title || route.name }}
      </button>
    </nav>
    
    <!-- Route Components -->
    <Main v-if="shouldShowMain" :filter="currentFilter" :user="user" :sphere="sphere" />
    <GroupsView v-if="currentPath === '/groups'" :current-user="currentUser" />
    <EventCreateModal v-if="currentPath === '/create'" :currentUser="currentUser" @close="navigate('/')" @created="handleEventCreated" />
    <Settings v-if="currentPath === '/settings'" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { eventProvider } from '@/composables/eventProvider';
import { groupProvider } from '@/composables/groupProvider';
import { router } from '@/composables/useRouter';
import Main from '@/components/Main.vue';
import Settings from '@/components/Settings.vue';
import EventCreateModal from '@/components/EventCreateModal.vue';
import GroupsView from '@/components/GroupsView.vue';

const props = defineProps({
  parentId: String,
  showTabs: {
    type: Boolean,
    default: true
  },
  user: Object,
  sphere: Object
});

console.log("Event Main instance: ", props.parentId);

// Set up providers
eventProvider(props.parentId ?? 'test');
groupProvider(props.parentId ?? 'test');

// Router state
const { currentPath, navigate, routes: availableRoutes, initFromQuery } = router;

// Initialize router from URL on mount
onMounted(() => {
  initFromQuery();
});

// Determine which component to show and with what filter
const shouldShowMain = computed(() => {
  const mainPaths = ['/', '/upcoming', '/past', '/my-events', '/attending'];
  return mainPaths.includes(currentPath.value);
});

const currentFilter = computed(() => {
  switch (currentPath.value) {
    case '/upcoming': return 'upcoming';
    case '/past': return 'past';
    case '/my-events': return 'my-events';
    case '/attending': return 'attending';
    default: return 'upcoming';
  }
});

const currentUser = computed(() => ({
  pub: props.user?.is?.pub || 'anonymous',
  alias: props.user?.is?.alias || 'Anonymous',
  avatar: props.user?.profile?.avatar
}));

const handleEventCreated = () => {
  navigate('/');
};
</script>