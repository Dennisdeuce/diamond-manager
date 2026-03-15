import { Component, type ReactNode, type ErrorInfo } from 'react'
import { reportError } from '../hooks/useErrorReporter'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error.message, 'ErrorBoundary', error)
    console.error('ErrorBoundary caught:', error, info.componentStack)

    // Auto-reload on stale chunk errors (happens after deploys with code splitting)
    const isChunkError =
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Loading CSS chunk')
    if (isChunkError && !sessionStorage.getItem('chunk_reload')) {
      sessionStorage.setItem('chunk_reload', '1')
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-navy-700 mb-2">Something went wrong</h1>
            <p className="text-sm text-navy-400 mb-6">
              The app ran into an unexpected error. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-navy-500 text-white rounded-lg font-medium hover:bg-navy-600 transition-colors"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-navy-300 cursor-pointer">Technical details</summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
