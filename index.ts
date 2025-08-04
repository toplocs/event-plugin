// Plugin Development Environment
import { createPluginDevelopmentEnvironment, type PluginDevConfig } from '@toplocs/plugin-sdk';
import '@toplocs/plugin-sdk/style.css';

// Import plugin configuration and components
import pluginConfig from './src/index';
import InfoContentComponent from './src/views/info/Main.vue';
import InfoSidebarComponent from './src/views/info/Sidebar.vue';
import SettingsContentComponent from './src/views/settings/Content.vue';

// Create development environment with plugin configuration
const devConfig: PluginDevConfig = {
  pluginConfig,
  components: {
    InfoContent: InfoContentComponent,
    InfoSidebar: InfoSidebarComponent,
    SettingsContent: SettingsContentComponent
  }
};

const app = createPluginDevelopmentEnvironment(devConfig);

app.mount('#plugin-dev');