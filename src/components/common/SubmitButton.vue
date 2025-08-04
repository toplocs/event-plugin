<template>
  <button
    type="submit"
    :disabled="disabled"
    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
});
</script>