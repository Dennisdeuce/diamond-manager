/**
 * Centralized error reporter hook.
 * Collects errors for future integration with Sentry, LogRocket, etc.
 * In development, logs to console. In production, batches and could POST to an endpoint.
 */

interface ErrorReport {
  message: string
  context?: string
  error?: unknown
  timestamp: number
}

const errorBuffer: ErrorReport[] = []
const MAX_BUFFER = 50

function reportError(message: string, context?: string, error?: unknown) {
  const report: ErrorReport = {
    message,
    context,
    error,
    timestamp: Date.now(),
  }

  // Always console.error in dev
  if (import.meta.env.DEV) {
    console.error(`[${context || 'app'}]`, message, error)
  }

  // Buffer for batch reporting
  errorBuffer.push(report)
  if (errorBuffer.length > MAX_BUFFER) {
    errorBuffer.shift()
  }

  // In production, this is where you'd send to Sentry/LogRocket:
  // if (import.meta.env.PROD && typeof window.__SENTRY__ !== 'undefined') {
  //   Sentry.captureException(error instanceof Error ? error : new Error(message))
  // }
}

function getRecentErrors(): ErrorReport[] {
  return [...errorBuffer]
}

export function useErrorReporter() {
  return {
    reportError,
    getRecentErrors,
  }
}

// Export standalone for use outside React components
export { reportError, getRecentErrors }
