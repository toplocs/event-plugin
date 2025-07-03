import Gun from 'gun/gun'
import 'gun/sea'
import 'gun/axe'

// Initialize Gun instance
// In production, this would connect to the main Tribelike Gun relay
const gun = Gun({
  peers: [
    'https://toplocs.com/gun', // Main Tribelike relay
    'wss://toplocs.com/gun'    // WebSocket relay
  ],
  localStorage: true,
  radisk: true
})

// Export for use in plugin
export default gun

// Helper to get Gun instance from main app if available
export function getGunInstance() {
  // Check if we're running inside Tribelike main app
  if (window.__tribelike_gun) {
    return window.__tribelike_gun
  }
  // Otherwise use our own instance
  return gun
}

// Declare global type
declare global {
  interface Window {
    __tribelike_gun?: IGunInstance
  }
}