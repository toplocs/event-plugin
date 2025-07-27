import { createPluginDevelopmentEnvironment, type PluginDevConfig } from '@toplocs/plugin-dev-sdk';
import pluginConfig from './src/index';
import SidebarComponent from './src/views/info/Sidebar.vue';
import ContentComponent from './src/views/settings/Content.vue';
import MainComponent from './src/views/info/Main.vue';

const devConfig: PluginDevConfig = {
  pluginConfig,
  components: {
    Sidebar: SidebarComponent,
    Content: ContentComponent,
    Main: MainComponent
  }
};

const app = createPluginDevelopmentEnvironment(devConfig);
app.mount('#plugin-dev');