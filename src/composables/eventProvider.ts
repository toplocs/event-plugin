import { ref, inject, provide, onMounted, onUnmounted } from 'vue';
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

export function eventProvider(instance: string) {
  const events = ref<Event[]>([]);
  const loading = ref(false);
  
  // Gun references
  const eventsRef = gun.get('events').get(instance);
  
  // Active listeners for cleanup
  const listeners: any[] = [];

  // Load all events
  const loadEvents = () => {
    loading.value = true;
    events.value = [];
    
    const listener = eventsRef.map().on((event: any, id: string) => {
      if (!event || event === null) return;
      
      const existingIndex = events.value.findIndex(e => e.id === id);
      const eventData: Event = {
        id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        recurring: event.recurring || 1,
        limit: event.limit || 0,
        interests: event.interests || [],
        locations: event.locations || [],
        creator: event.creator,
        created: event.created || Date.now(),
        attendees: event.attendees || {},
        space: event.space || instance
      };
      
      if (existingIndex >= 0) {
        events.value[existingIndex] = eventData;
      } else {
        events.value.push(eventData);
      }
      
      loading.value = false;
    });
    
    listeners.push(listener);
    
    // Set loading to false after timeout if no data
    setTimeout(() => {
      loading.value = false;
    }, 2000);
  };

  // Create a new event
  const createEvent = async (eventData: Partial<Event>) => {
    const eventId = gun._.opt.uuid();
    const event = {
      ...eventData,
      created: Date.now(),
      space: instance,
      attendees: {}
    };
    
    eventsRef.get(eventId).put(event);
    
    return eventId;
  };

  // Update an event
  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    eventsRef.get(eventId).put(updates);
  };

  // Delete an event (mark as deleted)
  const deleteEvent = async (eventId: string) => {
    eventsRef.get(eventId).put({ deleted: true });
  };

  // Join an event
  const joinEvent = async (eventId: string, user: User) => {
    const attendeeData = {
      pub: user.pub,
      alias: user.alias,
      avatar: user.avatar,
      joinedAt: Date.now(),
      status: 'attending'
    };
    
    eventsRef.get(eventId).get('attendees').get(user.pub).put(attendeeData);
    
    // Update attendee count
    const event = events.value.find(e => e.id === eventId);
    if (event) {
      const count = Object.keys(event.attendees || {}).length + 1;
      eventsRef.get(eventId).put({ attendeeCount: count });
    }
  };

  // Leave an event
  const leaveEvent = async (eventId: string, userPub: string) => {
    eventsRef.get(eventId).get('attendees').get(userPub).put(null);
    
    // Update attendee count
    const event = events.value.find(e => e.id === eventId);
    if (event && event.attendees) {
      const count = Math.max(0, Object.keys(event.attendees).length - 1);
      eventsRef.get(eventId).put({ attendeeCount: count });
    }
  };

  onMounted(() => {
    loadEvents();
  });

  onUnmounted(() => {
    // Cleanup listeners
    listeners.forEach(listener => listener.off());
    listeners.length = 0;
  });

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
    throw new Error('Composable must have an event provider.');
  }

  return data;
}