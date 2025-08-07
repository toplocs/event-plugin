import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import gun from './gun';

try {
  const app = createApp(App);
  app.mount('#event-plugin');
} catch (error) {
  console.error('Failed to mount event plugin app:', error);
}