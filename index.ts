// Plugin Development Environment
import { createPluginDevelopmentEnvironment, type PluginDevConfig } from '@toplocs/plugin-sdk';
import '@toplocs/plugin-sdk/style.css';

// Import plugin configuration and components
import pluginConfig from './src/index';
import SidebarView from './src/views/SidebarView.vue';
import SettingsView from './src/views/SettingsView.vue';
import MainView from './src/views/MainView.vue';

// Create development environment with plugin configuration
const devConfig: PluginDevConfig = {
  pluginConfig,
  components: {
    SidebarView,
    SettingsView,
    MainView
  }
};

const app = createPluginDevelopmentEnvironment(devConfig);

app.mount('#plugin-dev');