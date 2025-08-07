<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="$emit('close')">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" 
         @click.stop>
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Create a New Group
          </h2>
          <button @click="$emit('close')" 
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <span class="text-xl">✕</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Group Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="e.g., Vue.js Developers Seattle"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              v-model="form.category"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.icon }} {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              v-model="form.description"
              required
              rows="4"
              placeholder="Tell people what your group is about..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          <!-- Location -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City *
              </label>
              <input
                v-model="form.location.city"
                type="text"
                required
                placeholder="Seattle, WA"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Radius (km)
              </label>
              <input
                v-model.number="form.location.radius"
                type="number"
                min="1"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
            </div>
          </div>

          <!-- Coordinates (optional for now) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Latitude (optional)
              </label>
              <input
                v-model.number="form.location.lat"
                type="number"
                step="any"
                placeholder="47.6062"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Longitude (optional)
              </label>
              <input
                v-model.number="form.location.lng"
                type="number"
                step="any"
                placeholder="-122.3321"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              v-model="tagInput"
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
              type="text"
              placeholder="Type a tag and press Enter or comma"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
            <div class="flex flex-wrap gap-2 mt-2" v-if="form.tags.length > 0">
              <span v-for="(tag, index) in form.tags" :key="index"
                    class="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                {{ tag }}
                <button @click="removeTag(index)" type="button" 
                        class="text-blue-600 hover:text-blue-800 dark:text-blue-300">
                  ×
                </button>
              </span>
            </div>
          </div>

          <!-- Privacy -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Privacy
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="form.privacy"
                  value="public"
                  type="radio"
                  class="mr-2 text-blue-500"
                >
                <span class="text-gray-700 dark:text-gray-300">
                  🌍 Public - Anyone can find and join this group
                </span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.privacy"
                  value="private"
                  type="radio"
                  class="mr-2 text-blue-500"
                >
                <span class="text-gray-700 dark:text-gray-300">
                  🔒 Private - Only invited members can join
                </span>
              </label>
            </div>
          </div>

          <!-- Settings -->
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Group Settings
            </h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="form.settings.allowMemberEvents"
                  type="checkbox"
                  class="mr-2 text-blue-500"
                >
                <span class="text-gray-700 dark:text-gray-300">
                  Allow members to create events
                </span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="form.settings.requireApproval"
                  type="checkbox"
                  class="mr-2 text-blue-500"
                >
                <span class="text-gray-700 dark:text-gray-300">
                  Require approval for new members
                </span>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? 'Creating...' : 'Create Group' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { EventCategory, Group } from '@/types/event'

const props = defineProps<{
  categories: EventCategory[]
  currentUser: any
}>()

const emit = defineEmits<{
  close: []
  created: [groupId: string]
}>()

const loading = ref(false)
const tagInput = ref('')

const form = reactive({
  name: '',
  category: '',
  description: '',
  location: {
    city: '',
    lat: 0,
    lng: 0,
    radius: 10
  },
  tags: [] as string[],
  privacy: 'public' as 'public' | 'private',
  settings: {
    allowMemberEvents: true,
    requireApproval: false
  }
})

const isFormValid = computed(() => {
  return form.name.trim() && 
         form.category && 
         form.description.trim() && 
         form.location.city.trim()
})

const addTag = () => {
  const tag = tagInput.value.trim().replace(',', '')
  if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  
  try {
    const groupData: Partial<Group> = {
      name: form.name,
      category: form.category,
      description: form.description,
      location: form.location,
      tags: form.tags,
      privacy: form.privacy,
      organizer: props.currentUser?.pub || 'anonymous',
      settings: form.settings
    }
    
    // This would be connected to the group provider
    console.log('Creating group:', groupData)
    
    // Simulate creation
    setTimeout(() => {
      const fakeId = 'group_' + Date.now()
      emit('created', fakeId)
      loading.value = false
    }, 1000)
    
  } catch (error) {
    console.error('Failed to create group:', error)
    loading.value = false
  }
}
</script>