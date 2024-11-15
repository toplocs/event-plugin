<template>
  <TextInput
    type="text"
    name="interest"
    autoComplete="interest"
    placeholder="Add some interests"
    @keydown.enter.prevent="addInterest"
    v-model="input"
  />
  <div class="mt-2 space-x-1 space-y-1">
    <span v-for="title of interests">
      <InterestBadge
        :key="title"
        :title="title"
        :remove="() => removeInterest(title)"
      />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TextInput from './common/TextInput.vue';
import InterestBadge from './badges/InterestBadge.vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  }
});
const emit = defineEmits(['update:modelValue'])
const interests = ref(props.modelValue.filter(x => x != ''));
const input = ref('');

function addInterest() {
  if (interests.value.includes(input.value)) return;
  interests.value.push(input.value);
  input.value = '';
  emit('update:modelValue', interests.value);
}

function removeInterest(title: String) {
  interests.value = interests.value.filter(x => x != title);
  emit('update:modelValue', interests.value);
}
</script>
