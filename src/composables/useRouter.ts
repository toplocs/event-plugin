/**
 * Custom routing composable for plugin architecture
 * Uses query parameters for navigation since Vue Router might not work in plugins
 */
import { ref, computed, watch } from 'vue'

export interface Route {
  path: string
  name: string
  component: string
  meta?: {
    title?: string
    icon?: string
  }
}

export interface RouteQuery {
  [key: string]: string | undefined
}

const currentPath = ref('/')
const currentQuery = ref<RouteQuery>({})

// Available routes
const routes: Route[] = [
  { path: '/', name: 'events', component: 'Main', meta: { title: 'Events', icon: '📅' } },
  { path: '/upcoming', name: 'upcoming', component: 'Main', meta: { title: 'Upcoming', icon: '⏰' } },
  { path: '/past', name: 'past', component: 'Main', meta: { title: 'Past', icon: '📚' } },
  { path: '/my-events', name: 'my-events', component: 'Main', meta: { title: 'My Events', icon: '👤' } },
  { path: '/attending', name: 'attending', component: 'Main', meta: { title: 'Attending', icon: '✅' } },
  { path: '/groups', name: 'groups', component: 'GroupsView', meta: { title: 'Groups', icon: '👥' } },
  { path: '/group', name: 'group-detail', component: 'GroupDetail', meta: { title: 'Group Details', icon: '👥' } },
  { path: '/create', name: 'create', component: 'EventCreate', meta: { title: 'Create Event', icon: '➕' } },
  { path: '/settings', name: 'settings', component: 'Settings', meta: { title: 'Settings', icon: '⚙️' } }
]

export function useRouter() {
  const navigate = (path: string, query: RouteQuery = {}) => {
    currentPath.value = path
    currentQuery.value = query
    
    // Update URL query parameters
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      
      // Clear existing plugin-specific params
      const pluginParams = ['pluginPath', 'pluginView', 'eventId', 'tab']
      pluginParams.forEach(param => url.searchParams.delete(param))
      
      // Set new params
      url.searchParams.set('pluginPath', path)
      Object.entries(query).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value)
        }
      })
      
      window.history.replaceState({}, '', url.toString())
    }
  }

  const getCurrentRoute = () => {
    return routes.find(r => r.path === currentPath.value) || routes[0]
  }

  const initFromQuery = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const path = params.get('pluginPath') || '/'
      const query: RouteQuery = {}
      
      // Extract relevant query parameters
      params.forEach((value, key) => {
        if (key !== 'pluginPath') {
          query[key] = value
        }
      })
      
      currentPath.value = path
      currentQuery.value = query
    }
  }

  const getRoutes = () => routes

  const buildUrl = (path: string, query: RouteQuery = {}) => {
    const params = new URLSearchParams()
    params.set('pluginPath', path)
    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    return `?${params.toString()}`
  }

  return {
    currentPath: computed(() => currentPath.value),
    currentQuery: computed(() => currentQuery.value),
    currentRoute: computed(() => getCurrentRoute()),
    routes: computed(() => routes),
    navigate,
    initFromQuery,
    getRoutes,
    buildUrl
  }
}

// Global router instance
export const router = useRouter()