<template>
  <div className="ml-4 min-w-[150px]">
    <Title>Chat rooms:</Title>
    <ChatListItem
      v-for="room of chatRooms"
      :key="room.id"
      :title="room.title"
      @click="() => selectChatRoom(room.id)"
    />
    <router-link
      :to="href"
      class="flex items-center p-2 w-full border-t border-gray-100 dark:border-gray-700 hover:bg-blue-50 text-blue-500 dark:hover:bg-gray-800 transition duration-150 ease-in-out cursor-pointer"
    > New chat room
    </router-link>
  </div>
</template>

<script setup lang="ts">
import '../assets/main.css';
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Title from './common/Title.vue';
import ChatListItem from './ChatListItem.vue';

const props = defineProps({
  chatRooms: {
    type: Array,
    default: [],
  },
  href: {
    type: String,
    default: '',
  }
});
const emit = defineEmits(['selectChatRoom']);

const selectChatRoom = (id: String) => {
  emit('selectChatRoom', id);
}
</script>
