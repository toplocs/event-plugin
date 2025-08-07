/**
 * SDK interface for testing the routing system
 * Provides programmatic access to the router for testing and external integrations
 */

import { router, type Route, type RouteQuery } from '@/composables/useRouter'

export interface RouterSDK {
  // Navigation
  navigate(path: string, query?: RouteQuery): void
  goBack(): void
  goForward(): void
  
  // Route information
  getCurrentPath(): string
  getCurrentQuery(): RouteQuery
  getCurrentRoute(): Route | undefined
  
  // Route testing
  isRouteActive(path: string): boolean
  isValidPath(path: string): boolean
  
  // URL building
  buildUrl(path: string, query?: RouteQuery): string
  
  // Route discovery
  getAllRoutes(): Route[]
  findRoute(path: string): Route | undefined
  
  // Testing utilities
  mockNavigation(path: string, query?: RouteQuery): void
  resetRouter(): void
}

class RouterSDKImplementation implements RouterSDK {
  private history: string[] = []
  private historyIndex: number = -1

  navigate(path: string, query: RouteQuery = {}) {
    // Add to history
    this.history = this.history.slice(0, this.historyIndex + 1)
    this.history.push(path)
    this.historyIndex = this.history.length - 1
    
    router.navigate(path, query)
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--
      const previousPath = this.history[this.historyIndex]
      router.navigate(previousPath)
    }
  }

  goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      const nextPath = this.history[this.historyIndex]
      router.navigate(nextPath)
    }
  }

  getCurrentPath(): string {
    return router.currentPath.value
  }

  getCurrentQuery(): RouteQuery {
    return router.currentQuery.value
  }

  getCurrentRoute(): Route | undefined {
    return router.currentRoute.value
  }

  isRouteActive(path: string): boolean {
    return this.getCurrentPath() === path
  }

  isValidPath(path: string): boolean {
    return router.routes.value.some(route => route.path === path)
  }

  buildUrl(path: string, query: RouteQuery = {}): string {
    return router.buildUrl(path, query)
  }

  getAllRoutes(): Route[] {
    return router.routes.value
  }

  findRoute(path: string): Route | undefined {
    return router.routes.value.find(route => route.path === path)
  }

  mockNavigation(path: string, query: RouteQuery = {}) {
    // For testing - navigate without updating browser URL
    const route = this.findRoute(path)
    if (route) {
      // Simulate navigation without side effects
      console.log(`Mock navigation to ${path}`, query)
    }
  }

  resetRouter() {
    this.history = []
    this.historyIndex = -1
    router.navigate('/')
  }
}

// Create SDK instance
export const routerSDK = new RouterSDKImplementation()

// Export testing utilities
export const RouterTestUtils = {
  // Test route navigation
  testNavigation: async (path: string, query?: RouteQuery) => {
    const initialPath = routerSDK.getCurrentPath()
    routerSDK.navigate(path, query)
    
    return {
      success: routerSDK.getCurrentPath() === path,
      initialPath,
      finalPath: routerSDK.getCurrentPath(),
      query: routerSDK.getCurrentQuery()
    }
  },

  // Test all routes
  testAllRoutes: async () => {
    const routes = routerSDK.getAllRoutes()
    const results: Array<{path: string, success: boolean, error?: string}> = []
    
    for (const route of routes) {
      try {
        const result = await RouterTestUtils.testNavigation(route.path)
        results.push({
          path: route.path,
          success: result.success
        })
      } catch (error) {
        results.push({
          path: route.path,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return results
  },

  // Test URL building
  testUrlBuilding: () => {
    const routes = routerSDK.getAllRoutes()
    const results: Array<{path: string, url: string, success: boolean}> = []
    
    for (const route of routes) {
      const url = routerSDK.buildUrl(route.path, { test: 'param' })
      results.push({
        path: route.path,
        url,
        success: url.includes(route.path)
      })
    }
    
    return results
  },

  // Generate test report
  generateTestReport: async () => {
    const navigationTests = await RouterTestUtils.testAllRoutes()
    const urlTests = RouterTestUtils.testUrlBuilding()
    
    return {
      timestamp: new Date().toISOString(),
      navigation: {
        total: navigationTests.length,
        passed: navigationTests.filter(r => r.success).length,
        failed: navigationTests.filter(r => !r.success).length,
        details: navigationTests
      },
      urlBuilding: {
        total: urlTests.length,
        passed: urlTests.filter(r => r.success).length,
        failed: urlTests.filter(r => !r.success).length,
        details: urlTests
      },
      routes: routerSDK.getAllRoutes().map(r => ({
        path: r.path,
        name: r.name,
        component: r.component,
        title: r.meta?.title
      }))
    }
  }
}

// Global window access for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).routerSDK = routerSDK
  ;(window as any).RouterTestUtils = RouterTestUtils
}