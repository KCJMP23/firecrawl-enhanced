// PWA utilities for WebClone Pro 2026
import { useState, useEffect } from 'react'

export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>
}

export class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null
  private isInstalled = false
  private serviceWorker: ServiceWorkerRegistration | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private async init() {
    // Check if already installed
    this.isInstalled = this.checkIfInstalled()

    // Listen for install prompt
    this.setupInstallPrompt()

    // Register service worker
    await this.registerServiceWorker()

    // Setup offline detection
    this.setupOfflineDetection()

    // Setup push notifications
    this.setupPushNotifications()
  }

  // Check if app is installed
  private checkIfInstalled(): boolean {
    // Check for various installation indicators
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches
    
    // Check for iOS Safari
    const isIOSSafari = 'standalone' in navigator && (navigator as any).standalone
    
    // Check for Android Chrome
    const isAndroidChrome = window.matchMedia('(display-mode: standalone)').matches
    
    return isStandalone || isFullscreen || isMinimalUI || isIOSSafari || isAndroidChrome
  }

  // Setup install prompt handling
  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      
      // Save the event so it can be triggered later
      this.deferredPrompt = e as any
      
      // Show custom install button
      this.showInstallButton()
    })

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      this.isInstalled = true
      this.hideInstallButton()
      this.showWelcomeMessage()
    })
  }

  // Register service worker
  private async registerServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        this.serviceWorker = registration

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                this.showUpdatePrompt()
              }
            })
          }
        })

        console.log('Service Worker registered successfully')
        return true
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        return false
      }
    }
    return false
  }

  // Setup offline detection
  private setupOfflineDetection() {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine
      
      if (isOnline) {
        this.handleOnline()
      } else {
        this.handleOffline()
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    // Initial check
    updateOnlineStatus()
  }

  // Handle online state
  private handleOnline() {
    console.log('App is online')
    this.hideOfflineIndicator()
    
    // Trigger background sync if service worker is available
    if (this.serviceWorker && 'sync' in window.ServiceWorkerRegistration.prototype) {
      this.serviceWorker.sync.register('project-sync').catch(console.error)
      this.serviceWorker.sync.register('analytics-sync').catch(console.error)
    }
  }

  // Handle offline state
  private handleOffline() {
    console.log('App is offline')
    this.showOfflineIndicator()
  }

  // Setup push notifications
  private async setupPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        console.log('Push notifications enabled')
        await this.subscribeToPush()
      }
    }
  }

  // Subscribe to push notifications
  private async subscribeToPush() {
    if (!this.serviceWorker) return

    try {
      const subscription = await this.serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      })

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      })
    } catch (error) {
      console.error('Push subscription failed:', error)
    }
  }

  // Utility to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    
    return outputArray
  }

  // Public methods
  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const choiceResult = await this.deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        return true
      } else {
        console.log('User dismissed the install prompt')
        return false
      }
    } catch (error) {
      console.error('Install prompt failed:', error)
      return false
    } finally {
      this.deferredPrompt = null
    }
  }

  public isAppInstalled(): boolean {
    return this.isInstalled
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null
  }

  public async updateServiceWorker() {
    if (this.serviceWorker && this.serviceWorker.waiting) {
      this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  // UI methods (these would be implemented with your UI framework)
  private showInstallButton() {
    // Dispatch custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('pwa-install-available'))
  }

  private hideInstallButton() {
    window.dispatchEvent(new CustomEvent('pwa-install-completed'))
  }

  private showWelcomeMessage() {
    window.dispatchEvent(new CustomEvent('pwa-welcome'))
  }

  private showUpdatePrompt() {
    window.dispatchEvent(new CustomEvent('pwa-update-available'))
  }

  private showOfflineIndicator() {
    window.dispatchEvent(new CustomEvent('pwa-offline'))
  }

  private hideOfflineIndicator() {
    window.dispatchEvent(new CustomEvent('pwa-online'))
  }
}

// React hook for PWA functionality
export function usePWA() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const pwaManager = new PWAManager()

    // Listen for PWA events
    const handleInstallAvailable = () => setCanInstall(true)
    const handleInstallCompleted = () => {
      setCanInstall(false)
      setIsInstalled(true)
    }
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)
    const handleUpdateAvailable = () => setUpdateAvailable(true)

    window.addEventListener('pwa-install-available', handleInstallAvailable)
    window.addEventListener('pwa-install-completed', handleInstallCompleted)
    window.addEventListener('pwa-offline', handleOffline)
    window.addEventListener('pwa-online', handleOnline)
    window.addEventListener('pwa-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable)
      window.removeEventListener('pwa-install-completed', handleInstallCompleted)
      window.removeEventListener('pwa-offline', handleOffline)
      window.removeEventListener('pwa-online', handleOnline)
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
    }
  }, [])

  return {
    canInstall,
    isInstalled,
    isOffline,
    updateAvailable,
    installApp: () => new PWAManager().installApp(),
    updateApp: () => new PWAManager().updateServiceWorker()
  }
}

// Export singleton instance
export const pwaManager = new PWAManager()