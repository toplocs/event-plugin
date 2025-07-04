<template>
  <component 
    :is="activeComponent" 
    v-bind="componentProps"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Main from './Main.vue'
import Settings from './Settings.vue'
import Sidebar from './Sidebar.vue'

const props = defineProps<{
  component?: string
  gun: any
  user: any
  space: string
  sphere?: any
}>()

const activeComponent = computed(() => {
  switch (props.component) {
    case 'settings':
      return Settings
    case 'sidebar':
      return Sidebar
    default:
      return Main
  }
})

const componentProps = computed(() => ({
  gun: props.gun,
  user: props.user,
  space: props.space,
  sphere: props.sphere
}))
</script>