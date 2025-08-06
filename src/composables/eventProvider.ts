import { ref, inject, provide, onMounted, onUnmounted, nextTick, watch } from 'vue';
import type { Ref, InjectionKey } from 'vue';
import type { Event, User } from '../types/event'
import gun from '../gun';

interface EventContext {
  events: Ref<Event[]>;
  loading: Ref<boolean>;
  createEvent: (eventData: Partial<Event>) => Promise<string>;
  updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  joinEvent: (eventId: string, user: User) => Promise<void>;
  leaveEvent: (eventId: string, userPub: string) => Promise<void>;
}

const eventKey: InjectionKey<EventContext> = Symbol('event');

// Global shared state across all instances
const globalEvents = ref<Event[]>([]);
const globalLoading = ref(false);
const loadedSpaces = new Set<string>();

// Add global watcher for debugging
watch(globalEvents, (newEvents, oldEvents) => {
  console.log('🔄 Global events array changed!', {
    oldLength: oldEvents?.length || 0,
    newLength: newEvents.length,
    change: newEvents.length - (oldEvents?.length || 0)
  });
}, { deep: true });

// Gun.js helper functions - restructured for Gun's data model
const saveEventToGun = (event: Event): Promise<void> => {
  console.log('💾 Saving event to Gun:', event.id, 'in space:', event.space);
  
  return new Promise(async (resolve, reject) => {
    try {
      // Create the event reference
      const eventRef = gun.get('events').get(event.space).get(event.id);
      
      // Save basic event data (no arrays)
      const basicEventData = {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time || '',
        recurring: event.recurring,
        limit: event.limit,
        creator: event.creator,
        created: event.created,
        attendeeCount: event.attendeeCount || 0,
        space: event.space,
        deleted: event.deleted || false
      };
      
      // Save basic data
      eventRef.put(basicEventData, (ack) => {
        if (ack.err) {
          console.error('❌ Failed to save basic event data:', ack.err);
          reject(new Error(ack.err));
          return;
        }
      });
      
      // Save interests as Gun set (if any)
      if (event.interests && event.interests.length > 0) {
        const interestsSet = eventRef.get('interests');
        event.interests.forEach(interest => {
          interestsSet.set(interest);
        });
      }
      
      // Save locations as Gun set (if any)
      if (event.locations && event.locations.length > 0) {
        const locationsSet = eventRef.get('locations');
        event.locations.forEach(location => {
          locationsSet.set(location);
        });
      }
      
      // Save attendees as Gun set (if any)
      if (event.attendees && Object.keys(event.attendees).length > 0) {
        const attendeesSet = eventRef.get('attendees');
        Object.entries(event.attendees).forEach(([userPub, attendee]) => {
          attendeesSet.get(userPub).put(attendee);
        });
      }
      
      console.log('✅ Event saved to Gun successfully:', event.id);
      resolve();
      
    } catch (error) {
      console.error('❌ Error saving event to Gun:', error);
      reject(error);
    }
  });
};

const loadEventsFromGun = (space: string) => {
  // Don't load the same space multiple times
  if (loadedSpaces.has(space)) {
    console.log('Space already loaded:', space);
    return;
  }
  
  loadedSpaces.add(space);
  globalLoading.value = true;
  console.log('🔄 Loading events from Gun for space:', space);
  
  // Load events using Gun's native approach
  gun.get('events').get(space).map().once((eventData, eventId) => {
    console.log('📦 Found event data:', eventId, eventData);
    
    // Skip Gun metadata and only process actual events
    if (!eventData || typeof eventData !== 'object' || eventData._ || !eventId || !eventId.startsWith('event_')) {
      return;
    }
    
    // Check if already loaded
    const existingIndex = globalEvents.value.findIndex(e => e.id === eventId);
    if (existingIndex !== -1) {
      console.log('Event already loaded:', eventId);
      return;
    }
    
    // Create event object with basic data
    const event: Event = {
      id: eventId,
      title: eventData.title || '',
      description: eventData.description || '',
      date: eventData.date || '',
      time: eventData.time || '',
      recurring: eventData.recurring || 1,
      limit: eventData.limit || 0,
      creator: eventData.creator || 'anonymous',
      created: eventData.created || Date.now(),
      attendeeCount: eventData.attendeeCount || 0,
      space: space,
      deleted: eventData.deleted || false,
      interests: [], // Will be loaded from Gun set
      locations: [], // Will be loaded from Gun set
      attendees: {} // Will be loaded from Gun set
    };
    
    console.log('🔄 Loading event details for:', eventId);
    
    // Load interests from Gun set
    const interestsPromise = new Promise<void>((resolve) => {
      let interestsLoaded = false;
      gun.get('events').get(space).get(eventId).get('interests').map().once((interestData, interestKey) => {
        if (interestData && typeof interestData === 'string') {
          event.interests.push(interestData);
          console.log('📝 Loaded interest:', interestData);
        }
      });
      // Set timeout to resolve even if no interests
      setTimeout(() => {
        if (!interestsLoaded) {
          interestsLoaded = true;
          resolve();
        }
      }, 200);
    });
    
    // Load locations from Gun set
    const locationsPromise = new Promise<void>((resolve) => {
      let locationsLoaded = false;
      gun.get('events').get(space).get(eventId).get('locations').map().once((locationData, locationKey) => {
        if (locationData && typeof locationData === 'string') {
          event.locations.push(locationData);
          console.log('📍 Loaded location:', locationData);
        }
      });
      // Set timeout to resolve even if no locations
      setTimeout(() => {
        if (!locationsLoaded) {
          locationsLoaded = true;
          resolve();
        }
      }, 200);
    });
    
    // Load attendees from Gun set
    const attendeesPromise = new Promise<void>((resolve) => {
      let attendeesLoaded = false;
      gun.get('events').get(space).get(eventId).get('attendees').map().once((attendeeData, attendeePub) => {
        if (attendeeData && typeof attendeeData === 'object' && !attendeeData._) {
          event.attendees[attendeePub] = attendeeData as any;
          console.log('👤 Loaded attendee:', attendeePub);
        }
      });
      // Set timeout to resolve even if no attendees
      setTimeout(() => {
        if (!attendeesLoaded) {
          attendeesLoaded = true;
          resolve();
        }
      }, 200);
    });
    
    // Wait for all data to load, then add to global array
    Promise.all([interestsPromise, locationsPromise, attendeesPromise]).then(() => {
      if (!event.deleted) {
        globalEvents.value.unshift(event); // Add to beginning for newest first
        console.log('✅ Fully loaded event:', eventId, event.title, {
          interests: event.interests,
          locations: event.locations,
          attendees: Object.keys(event.attendees).length
        });
        console.log('🔍 Global events array now contains:', globalEvents.value.length, 'events');
        console.log('🔍 Event titles:', globalEvents.value.map(e => e.title));
        console.log('🔍 Global events reactivity trigger - array reference:', globalEvents);
        
        // Force Vue reactivity update with nextTick
        nextTick(() => {
          console.log('🔄 Vue nextTick - DOM should update now');
          console.log('🔄 Global events in nextTick:', globalEvents.value.length);
        });
      }
    });
  });
  
  // Set loading to false after a delay to allow Gun to process
  setTimeout(() => {
    globalLoading.value = false;
    console.log('✅ Finished loading events. Total:', globalEvents.value.length);
  }, 2000); // Increased timeout to allow for Gun set loading
  
  // Real-time listener is handled by the individual Gun queries above
};

export function eventProvider(instance: string) {
  // Use the global shared arrays instead of creating new ones
  const events = globalEvents;
  const loading = globalLoading;
  
  console.log("🔧 Event provider initialized for space:", instance);
  console.log("🔧 Current global events:", globalEvents.value.length);
  console.log("🔧 Current loaded spaces:", Array.from(loadedSpaces));
  
  // Always try to load events for this space (loadEventsFromGun handles duplicates)
  loadEventsFromGun(instance);
  
  // Create event function that saves to Gun and updates local array
  const createEvent = async (eventData: Partial<Event>) => {
    console.log('Create event:', eventData);
    
    // Generate a unique ID
    const eventId = 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Create the full event object
    const newEvent: Event = {
      id: eventId,
      title: eventData.title || '',
      description: eventData.description || '',
      date: eventData.date || new Date().toISOString(),
      time: eventData.time || '',
      recurring: eventData.recurring || 1,
      limit: eventData.limit || 0,
      interests: eventData.interests || [],
      locations: eventData.locations || [],
      creator: eventData.creator || 'anonymous',
      created: Date.now(),
      attendees: {},
      attendeeCount: 0, // Fix: add this field with default value
      space: instance,
      deleted: false
    };
    
    // Save to Gun
    try {
      await saveEventToGun(newEvent);
      console.log('Event saved to Gun:', eventId);
    } catch (error) {
      console.error('Failed to save event to Gun:', error);
    }
    
    // Add to local events array
    events.value.unshift(newEvent);
    console.log('➕ Added new event to local array. Total events now:', events.value.length);
    console.log('➕ Event titles in array:', events.value.map(e => e.title));
    
    return eventId;
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    console.log('Update event:', eventId, updates);
    const eventIndex = events.value.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      const updatedEvent = { ...events.value[eventIndex], ...updates };
      
      // Save to Gun
      try {
        await saveEventToGun(updatedEvent);
        console.log('Event updated in Gun:', eventId);
      } catch (error) {
        console.error('Failed to update event in Gun:', error);
      }
      
      // Update local array
      events.value[eventIndex] = updatedEvent;
    }
  };

  const deleteEvent = async (eventId: string) => {
    console.log('Delete event:', eventId);
    const event = events.value.find(e => e.id === eventId);
    if (event) {
      // Mark as deleted in Gun
      try {
        gun.get('events').get(event.space).get(eventId).put(null);
        console.log('Event deleted from Gun:', eventId);
      } catch (error) {
        console.error('Failed to delete event from Gun:', error);
      }
      
      // Remove from local array
      events.value = events.value.filter(e => e.id !== eventId);
    }
  };

  const joinEvent = async (eventId: string, user: User) => {
    console.log('Join event:', eventId, user);
    const event = events.value.find(e => e.id === eventId);
    if (event) {
      const attendeeData = {
        pub: user.pub,
        alias: user.alias,
        avatar: user.avatar,
        joinedAt: Date.now(),
        status: 'attending'
      };
      
      // Save to Gun set
      gun.get('events').get(event.space).get(eventId).get('attendees').get(user.pub).put(attendeeData);
      
      // Update local state
      event.attendees[user.pub] = attendeeData;
      event.attendeeCount = Object.keys(event.attendees).length;
      
      // Update attendee count in Gun
      gun.get('events').get(event.space).get(eventId).get('attendeeCount').put(event.attendeeCount);
    }
  };

  const leaveEvent = async (eventId: string, userPub: string) => {
    console.log('Leave event:', eventId, userPub);
    const event = events.value.find(e => e.id === eventId);
    if (event && event.attendees[userPub]) {
      // Remove from Gun set
      gun.get('events').get(event.space).get(eventId).get('attendees').get(userPub).put(null);
      
      // Update local state
      delete event.attendees[userPub];
      event.attendeeCount = Object.keys(event.attendees).length;
      
      // Update attendee count in Gun
      gun.get('events').get(event.space).get(eventId).get('attendeeCount').put(event.attendeeCount);
    }
  };

  provide(eventKey, {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    joinEvent,
    leaveEvent,
  });
}

export function useEvent() {
  const data = inject(eventKey);

  if (!data) {
    console.warn('🚨 No event provider found, returning default values');
    // Return default values instead of throwing
    return {
      events: ref([]),
      loading: ref(false),
      createEvent: async () => 'default-id',
      updateEvent: async () => {},
      deleteEvent: async () => {},
      joinEvent: async () => {},
      leaveEvent: async () => {},
    };
  }

  console.log('🔍 useEvent() returning:', {
    eventsLength: data.events.value.length,
    loading: data.loading.value,
    eventsRef: data.events === globalEvents,
    globalEventsLength: globalEvents.value.length,
    actualEvents: data.events.value.map(e => ({ id: e.id, title: e.title }))
  });

  return data;
}