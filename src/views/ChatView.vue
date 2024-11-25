<template>
  <Container>
    <Card >
      <ChatPlugin
        v-if="roomId"
        :user="profile"
        :roomId="roomId"
      />

      <span v-else>
        No chat rooms available
      </span>
    </Card>

    <Sidebar
      :chatRooms="chatRooms"
      :href="href"
      @selectChatRoom="selectChatRoom"
    />
  </Container>
</template>

<script setup lang="ts">
import '../assets/main.css';
import axios from 'axios';
import { ref, inject, computed, onMounted } from 'vue';
import Container from '../components/common/Container.vue';
import Card from '../components/common/Card.vue';
import Title from '../components/common/Title.vue';
import IconButton from '../components/common/IconButton.vue';
import ChatPlugin from '../components/Main.vue';
import Sidebar from '../components/SideBar.vue';

const apiURL = import.meta.env.VITE_API_URL;
const interest = inject('interest');
const location = inject('location')
const profile = inject('profile');
const tab = inject('tab');
const roomId = ref('');
const chatRooms = ref([]);
const href = computed(() => {
  const params = new URLSearchParams();
  if (interest.value) params.append('interest', interest.value?.id);
  if (location.value) params.append('location', location.value?.id);

  return `/chat/create${params.toString() ? '?' + params.toString() : ''}`;
});

const fetchChatRooms = async (prop: String) => {
  try {
    const response = await axios.get(`/api/chat/rooms/${prop}`);

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

const selectChatRoom = (id: String) => {
  roomId.value = id;
}

onMounted(async () => {
  chatRooms.value = await fetchChatRooms(
    interest.value?.id || location.value?.id
  );
  if (chatRooms.value.length) {
    roomId.value = chatRooms.value[0].id;
  }
  tab.value = 'Chat';
});

axios.defaults.baseURL = apiURL;
</script>
