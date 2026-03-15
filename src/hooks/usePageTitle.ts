import { useEffect } from 'react'

const BASE_TITLE = 'Diamond Manager'

/**
 * Sets the document title for the current page.
 * Improves SEO, accessibility (screen readers announce page changes),
 * and browser tab clarity.
 */
export function usePageTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [pageTitle])
}
