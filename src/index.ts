/**
 * Main plugin entry point
 * This file defines the plugin configuration and exports it for use in TopLocs
 */

import type { BasePluginConfig } from '@toplocs/plugin-sdk'

const baseUrl = typeof window !== 'undefined' 
  ? window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '')
  : ''

const pluginConfig: BasePluginConfig = {
  id: 'event_plugin',
  name: 'Events',
  url: `${baseUrl}/plugin.js`,
  version: '1.0.0',
  description: 'Create and manage events within TopLocs communities',
  author: 'TopLocs Team',
  slots: [
    { entity: 'Topic', page: 'Info', slot: 'Sidebar', component: 'InfoSidebar' },
    { entity: 'Topic', page: 'Settings', slot: 'Content', component: 'SettingsContent' },
    { entity: 'Topic', page: 'Info', slot: 'Content', component: 'InfoContent' },
    { entity: 'Location', page: 'Info', slot: 'Sidebar', component: 'InfoSidebar' },
    { entity: 'Location', page: 'Settings', slot: 'Content', component: 'SettingsContent' },
    { entity: 'Location', page: 'Info', slot: 'Content', component: 'InfoContent' },
  ]
};

export default pluginConfig;