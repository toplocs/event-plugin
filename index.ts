// Plugin Development Environment with error boundary
import { createPluginDevelopmentEnvironment, type PluginDevConfig } from '@toplocs/plugin-sdk';
import '@toplocs/plugin-sdk/style.css';

// Import plugin configuration and components
import pluginConfig from './src/index';
import InfoContentComponent from './src/views/info/Main.vue';
import InfoSidebarComponent from './src/views/info/Sidebar.vue';
import SettingsContentComponent from './src/views/settings/Content.vue';

console.log('Plugin config:', pluginConfig);

// Create development environment with plugin configuration
const devConfig: PluginDevConfig = {
  pluginConfig,
  components: {
    InfoContent: InfoContentComponent,
    InfoSidebar: InfoSidebarComponent,
    SettingsContent: SettingsContentComponent
  }
};

try {
  const app = createPluginDevelopmentEnvironment(devConfig);
  
  // Add global error handler
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue error:', err, info);
  };
  
  // Add unhandled rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Don't prevent default to see if it helps with Suspense
  });
  
  app.mount('#plugin-dev');
} catch (error) {
  console.error('Failed to create plugin development environment:', error);
}