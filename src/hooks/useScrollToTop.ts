import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to top and focuses main content when route changes.
 * Critical for accessibility — screen readers need to know the page changed.
 */
export function useScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)

    // Focus the main content area for screen readers
    const main = document.getElementById('main-content')
    if (main) {
      main.focus({ preventScroll: true })
    }
  }, [pathname])
}
