import './assets/main.css';
import { createApp } from 'vue';
import InfoPage from './InfoPage.vue';
import '@toplocs/plugin-sdk/style.css';

try {
  const app = createApp(InfoPage);
  app.mount('#app');
} catch (error) {
  console.error('Failed to mount landing page:', error);
}