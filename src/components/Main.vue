<template>
  <Title>
    {{ chat?.title }}
  </Title>

  <div v-if="chat?.interests.length">
    <div class="mt-2 flex flex-wrap gap-2">
      <span v-for="interest in chat?.interests">
        <InterestBadge
          :key="interest.id"
          :title="interest.title"
        />
      </span>
    </div>
  </div>

  <div v-if="chat?.locations.length">
    <div class="mt-2 flex flex-wrap gap-2">
      <span v-for="location in chat?.locations">
        <LocationBadge
          :key="location.id"
          :title="location.title"
        />
      </span>
    </div>
  </div>

  <div class="flex-1 p:2 justify-between flex flex-col min-h-[500px]">
    <ChatMessages
      :user="user"
      :messages="messages"
    />
    
    <ChatPanel
      v-if="user"
      :roomId="roomId"
      :socket="socket"
      :user="user"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import { socket } from '../socket';
import Title from './common/Title.vue';
import ChatMessages from './ChatMessages.vue';
import ChatPanel from './ChatPanel.vue';
import InterestBadge from './badges/InterestBadge.vue';
import LocationBadge from './badges/LocationBadge.vue';

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  }
});
const chat = ref();
const messages = ref<Array>([]);

watchEffect(() => {
  if (props.roomId) socket.emit('join_room', { roomId: props.roomId });
});

onMounted(() => {
  socket.on('message', ({ msg }) => messages.value.push(msg));
  socket.on('join_room', ({ room }) => {
    chat.value = room;
    messages.value = [...room.messages];
  });
});

onBeforeUnmount(() => {
  socket.off('message');
  socket.off('join_room');
  socket.emit('leave_room', { roomId: props.roomId });
});
</script>
