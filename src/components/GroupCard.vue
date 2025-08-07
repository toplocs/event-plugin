<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
       @click="$emit('click', group)">
    <div class="relative">
      <!-- Group Avatar/Cover -->
      <div class="h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
        <img v-if="group.avatar" :src="group.avatar" :alt="group.name" 
             class="w-full h-full object-cover rounded-t-lg">
        <span v-else class="text-4xl">{{ categoryIcon }}</span>
      </div>
      
      <!-- Privacy Badge -->
      <div class="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
        {{ group.privacy === 'private' ? '🔒 Private' : '🌍 Public' }}
      </div>
    </div>

    <div class="p-4">
      <!-- Group Name and Category -->
      <div class="mb-2">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {{ group.name }}
        </h3>
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{{ categoryName }}</span>
          <span>•</span>
          <span>{{ group.location.city }}</span>
        </div>
      </div>

      <!-- Description -->
      <p class="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
        {{ group.description }}
      </p>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1 mb-3" v-if="group.tags.length > 0">
        <span v-for="tag in group.tags.slice(0, 3)" :key="tag"
              class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
          {{ tag }}
        </span>
        <span v-if="group.tags.length > 3" 
              class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-full">
          +{{ group.tags.length - 3 }}
        </span>
      </div>

      <!-- Stats -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span class="flex items-center gap-1">
            <span>👥</span>
            {{ group.memberCount }} {{ group.memberCount === 1 ? 'member' : 'members' }}
          </span>
        </div>
        
        <!-- Action Button -->
        <button @click.stop="handleAction" 
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  isMember 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                ]">
          {{ isMember ? 'Joined' : 'Join' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Group, EventCategory } from '@/types/event'

const props = defineProps<{
  group: Group
  currentUser?: any
  categories?: EventCategory[]
}>()

const emit = defineEmits<{
  click: [group: Group]
  join: [group: Group]
  leave: [group: Group]
}>()

const isMember = computed(() => {
  return props.currentUser && props.group.members.includes(props.currentUser.pub)
})

const categoryIcon = computed(() => {
  const category = props.categories?.find(c => c.id === props.group.category)
  return category?.icon || '👥'
})

const categoryName = computed(() => {
  const category = props.categories?.find(c => c.id === props.group.category)
  return category?.name || 'Social'
})

const handleAction = () => {
  if (isMember.value) {
    emit('leave', props.group)
  } else {
    emit('join', props.group)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>