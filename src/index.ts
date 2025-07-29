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

const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '')

const pluginConfig: BasePluginConfig = {
  id: 'event_plugin',
  name: 'Events',
  url: `${baseUrl}/plugin.js`,
  version: '1.0.0',
  description: 'Create and manage events within TopLocs communities',
  author: 'TopLocs Team',
  slots: [
    { entity: 'Topic', page: 'Info', slot: 'Sidebar', component: 'Sidebar' },
    { entity: 'Topic', page: 'Settings', slot: 'Content', component: 'Content' },
    { entity: 'Topic', page: 'Info', slot: 'Content', component: 'Main' },
    { entity: 'Location', page: 'Info', slot: 'Sidebar', component: 'Sidebar' },
    { entity: 'Location', page: 'Settings', slot: 'Content', component: 'Content' },
    { entity: 'Location', page: 'Info', slot: 'Content', component: 'Main' },
  ]
};

export default pluginConfig;