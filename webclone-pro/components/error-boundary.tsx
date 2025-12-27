/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree and provides
 * a fallback UI with secure error reporting
 */

'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'
import { logSecureError } from '@/lib/secure-logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'section'
}

interface State {
  hasError: boolean
  errorId?: string
  errorMessage?: string
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorMessage: error.message
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Securely log the error without exposing sensitive information
    const errorDetails = logSecureError(
      error,
      {
        component: 'ErrorBoundary',
        level: this.props.level || 'component',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      },
      {
        componentStack: errorInfo.componentStack,
        errorBoundaryStack: errorInfo.componentStack,
      }
    )

    // Update state with error ID for user reference
    this.setState({
      hasError: true,
      errorId: errorDetails.errorId,
      errorMessage: error.message
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to error monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportToMonitoringService(error, errorInfo, errorDetails.errorId)
    }
  }

  private reportToMonitoringService(error: Error, errorInfo: ErrorInfo, errorId: string) {
    // In production, send error details to monitoring service
    // This would integrate with services like Sentry, LogRocket, etc.
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: window.navigator.userAgent
        })
      }).catch(() => {
        // Silently fail if error reporting fails
      })
    } catch {
      // Silently fail if fetch is not available
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorId: undefined, errorMessage: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI based on error level
      const isPageLevel = this.props.level === 'page'
      
      return (
        <div className={`flex items-center justify-center ${isPageLevel ? 'min-h-screen' : 'min-h-[200px]'} p-4`}>
          <SimpleCard className="max-w-md w-full text-center" variant="elevated" padding="lg">
            <div className="space-y-4">
              <div className="flex justify-center">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isPageLevel ? 'Page Error' : 'Something went wrong'}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400">
                  {isPageLevel 
                    ? 'The page encountered an error and could not be displayed properly.'
                    : 'This component encountered an error. Try refreshing or reload the page.'
                  }
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.errorMessage && (
                  <details className="text-left mt-4">
                    <summary className="cursor-pointer text-sm text-gray-500">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                      {this.state.errorMessage}
                    </pre>
                  </details>
                )}
                
                {this.state.errorId && (
                  <p className="text-xs text-gray-500">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <SimpleButton
                  onClick={this.handleRetry}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </SimpleButton>
                
                {isPageLevel ? (
                  <SimpleButton
                    onClick={this.handleGoHome}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Go Home
                  </SimpleButton>
                ) : (
                  <SimpleButton
                    onClick={this.handleReload}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Page
                  </SimpleButton>
                )}
              </div>

              {process.env.NODE_ENV === 'production' && (
                <p className="text-xs text-gray-500">
                  If this problem persists, please contact support with the error ID above.
                </p>
              )}
            </div>
          </SimpleCard>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional component wrapper for easier usage in function components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Specialized error boundaries for different contexts
export function PageErrorBoundary({ children, onError }: { children: ReactNode, onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <ErrorBoundary level="page" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ children, onError }: { children: ReactNode, onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <ErrorBoundary level="component" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

export function SectionErrorBoundary({ children, onError }: { children: ReactNode, onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <ErrorBoundary level="section" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary