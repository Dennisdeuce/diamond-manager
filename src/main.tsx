import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { reportError } from './hooks/useErrorReporter'
import './index.css'

// Global error handlers — catch unhandled errors and rejections
window.addEventListener('error', (event) => {
  reportError(event.message || 'Unhandled error', 'window.onerror', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason instanceof Error ? event.reason.message : String(event.reason)
  reportError(reason, 'unhandledrejection', event.reason)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Register service worker for PWA / offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/diamond-manager/sw.js')
      .catch(() => {/* SW registration failed — app still works */})
  })
}
