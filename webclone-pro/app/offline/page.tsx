'use client'

import { useEffect, useState } from 'react'
import { WifiOff, RefreshCcw, Home, Activity } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    setRetrying(true)
    
    try {
      // Try to fetch a lightweight resource to test connection
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache'
      })
      
      if (response.ok) {
        // Connection restored, redirect to dashboard
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.log('Still offline')
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <WifiOff className="w-12 h-12 text-white/60" />
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-8">
          {isOnline ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-4">
                Connection Restored!
              </h1>
              <p className="text-white/60 mb-6">
                Your internet connection has been restored. You can now continue using WebClone Pro.
              </p>
              <Link href="/dashboard">
                <button className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
                  <Home className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-4">
                You're Currently Offline
              </h1>
              <p className="text-white/60 mb-6">
                Don't worry! You can still access cached content and work on your projects. 
                Your changes will sync automatically when you're back online.
              </p>
            </>
          )}
        </div>

        {/* Available Actions */}
        {!isOnline && (
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCcw className={`w-5 h-5 mr-2 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Checking Connection...' : 'Try Again'}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard">
                <button className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 transition-colors">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
              </Link>
              
              <Link href="/templates">
                <button className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white font-medium hover:bg-white/10 transition-colors">
                  <Activity className="w-4 h-4 mr-2" />
                  Templates
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Offline Features */}
        {!isOnline && (
          <div className="mt-12 p-6 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              What You Can Do Offline
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                <p className="text-white/80">
                  Browse cached projects and templates
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                <p className="text-white/80">
                  Edit existing project configurations
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                <p className="text-white/80">
                  Review analytics and metrics
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                <p className="text-white/80">
                  Changes will sync when you're back online
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Tips */}
        {!isOnline && (
          <div className="mt-8 text-left">
            <h4 className="text-sm font-medium text-white/80 mb-3">
              Connection Tips:
            </h4>
            <div className="space-y-2 text-sm text-white/60">
              <p>• Check your WiFi or mobile data connection</p>
              <p>• Try moving to an area with better signal</p>
              <p>• Restart your router or mobile data</p>
              <p>• Contact your internet service provider if issues persist</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}