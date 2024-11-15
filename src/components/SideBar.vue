<template>
  <div className="mb-4 min-w-[200px]">

  </div>
</template>

<script setup lang="ts">
import '../assets/main.css';
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Title from './common/Title.vue';

const props = defineProps({
  wikiPages: {
    type: Array,
    default: [],
  },
  href: {
    type: String,
    default: '',
  }
});
const emit = defineEmits(['selectWikiPage']);

const selectWikiPage = (id: String) => {
  emit('selectWikiPage', id);
}
</script>
