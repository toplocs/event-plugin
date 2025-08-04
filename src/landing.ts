import './assets/main.css';
import { createApp } from 'vue';
import InfoPage from './InfoPage.vue';
import '@toplocs/plugin-sdk/style.css';

const app = createApp(InfoPage);

app.mount('#app');