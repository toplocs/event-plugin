/**
 * Main plugin entry point
 * This file defines the plugin configuration and exports it for use in TopLocs
 */

interface BasePluginConfig {
  id: string;
  name: string;
  url: string;
  version?: string;
  description?: string;
  author?: string;
  slots: Array<PluginSlot>;
}

interface PluginSlot {
  slot: string;
  component: string;
}

const pluginConfig: BasePluginConfig = {
  id: 'event_plugin',
  name: 'Events',
  url: 'http://localhost:3007/assets/plugin.js',
  version: '1.0.0',
  description: 'Create and manage events within TopLocs communities',
  author: 'TopLocs Team',
  slots: [
    { entity: 'Topic', page: 'Info', slot: 'Sidebar', component: 'SidebarView' },
    { entity: 'Topic', page: 'Settings', slot: 'Content', component: 'SettingsView' },
    { entity: 'Topic', page: 'Info', slot: 'Content', component: 'MainView' },
    { entity: 'Location', page: 'Info', slot: 'Sidebar', component: 'SidebarView' },
    { entity: 'Location', page: 'Settings', slot: 'Content', component: 'SettingsView' },
    { entity: 'Location', page: 'Info', slot: 'Content', component: 'MainView' },
  ]
};

export default pluginConfig;