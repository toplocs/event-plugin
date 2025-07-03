# Event Plugin for Tribelike (Pure P2P) 🎉

**Status**: ✅ Successfully deployed as the **first pure P2P plugin** for Tribelike!

## Overview
A pure peer-to-peer event management plugin for Tribelike. Create, join, and manage events without any backend server - just Gun.js and the community.

### Live Demo
- **Production**: https://tribelike.shniq.dev/plugins/event-plugin/
- **Branch**: `event-plugin-p2p`
- **Deployed**: July 3, 2025

## Features
- 📅 **Event Creation**: Schedule events with date/time picker
- 🔄 **Recurring Events**: Support for weekly, bi-weekly, monthly events  
- 👥 **RSVP System**: Join/leave events with real-time attendee updates
- 🎯 **Interest-based**: Tag events with relevant interests
- 📍 **Location-aware**: Associate events with locations
- 🚫 **Participant Limits**: Set maximum attendees
- ⚡ **Real-time Updates**: Live sync via Gun.js
- 🔒 **Offline-first**: Works without internet connection

## Architecture

### Pure P2P - No Backend!
```
Browser ↔ Gun.js ↔ P2P Network
                     ↓
             Gun Relay (26 lines)
```

### Data Model
```javascript
// Events stored in Gun
gun.get('plugins').get('events').get(sphereId).get('list').get(eventId)

// Event structure
{
  id: 'random-id',
  title: 'Tribelike Meetup Munich',
  description: 'Let\'s discuss P2P social networks',
  date: '2025-07-15T18:00:00Z',
  recurring: 1, // 1=once, 2=weekly, 3=bi-weekly, 4=monthly
  limit: 50,
  interests: ['tribelike', 'p2p', 'decentralized'],
  locations: ['munich'],
  creator: 'user-public-key',
  created: 1234567890,
  attendees: {
    'user-id-1': { profile, joinedAt, status },
    'user-id-2': { profile, joinedAt, status }
  }
}
```

## Development

### Install
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

Output will be in `dist/` directory.

### Build with Custom Base Path
For deployment under a subpath:
```bash
PLUGIN_BASE_PATH="/plugins/event-plugin/" pnpm build
```

## Integration with Tribelike

### Module Federation Exposes
- `./EventListView` - List of upcoming events
- `./EventDetailView` - Event details and RSVP
- `./EventCreateView` - Create new event form
- `./Main` - Plugin router/entry point

### Required Injections
The plugin expects these to be injected from the main app:
- `profile` - Current user profile
- `interest` - Current interest context (optional)
- `location` - Current location context (optional)
- `sphereId` - Current sphere ID
- `tab` - For navigation state

### Gun.js Integration
The plugin will use the main app's Gun instance if available (`window.__tribelike_gun`), otherwise creates its own connection to the Tribelike relay.

## Usage Example

### Creating an Event
```javascript
const eventData = {
  title: 'P2P Developers Meetup',
  description: 'Monthly gathering for P2P enthusiasts',
  date: new Date('2025-08-01T19:00'),
  recurring: 2, // Weekly
  limit: 30,
  interests: ['programming', 'p2p', 'gun.js'],
  locations: ['berlin']
}

const eventId = await createEvent(eventData)
```

### Joining an Event
```javascript
await joinEvent(eventId, userProfile)
```

### Real-time Event Updates
```javascript
// Subscribe to event list
const unsubscribe = subscribeToEvents({ interest: 'p2p' })

// Subscribe to specific event attendees
const unsubAttendees = subscribeToAttendees(eventId, (attendees) => {
  console.log(`${attendees.length} people attending`)
})
```

## Deployment

### GitHub Actions Integration
The plugin is automatically built and deployed with Tribelike:
1. Plugin is cloned to isolated environment
2. Dependencies installed with npm
3. Built with correct base path
4. Deployed to `/plugins/event-plugin/`

### Manual Registration
If not auto-registered, add to Gun:
```javascript
gun.get('plugins').set({
  id: 'event-plugin',
  name: 'Events (P2P)',
  url: '/plugins/event-plugin/plugin.js',
  version: '1.0.0',
  enabled: true
})
```

## Differences from Old Plugin
- **No Backend**: Pure P2P with Gun.js
- **No axios**: All data operations via Gun
- **Real-time by default**: Live updates built-in
- **Offline-first**: Works without server
- **User-owned data**: Events stored in Gun graph

## Future Enhancements
- [ ] Calendar view
- [ ] Event reminders
- [ ] Private events (encrypted)
- [ ] Event comments/discussion
- [ ] Photo sharing
- [ ] Location map integration
- [ ] iCal export

## Key Achievements 🏆
- **First Pure P2P Plugin**: Pioneering true decentralized plugins
- **No Backend Required**: 100% client-side with Gun.js
- **GitHub Actions Deployment**: Automated build & deploy pipeline
- **Module Federation**: Dynamic loading in main app
- **TypeScript + Vue 3**: Modern tech stack
- **Real Production Deployment**: Live at tribelike.shniq.dev

## Development Story
This plugin started as a confused repository that went through multiple identity changes (wiki → event → chat). In July 2025, we cleaned it up and created the `event-plugin-p2p` branch, making it the first plugin to achieve Tribelike's vision of pure P2P functionality.

## License
Same as Tribelike main project