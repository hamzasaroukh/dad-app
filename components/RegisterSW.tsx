'use client'

import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})

      // If a new service worker takes over, the app has a new version — reload to get it.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }

    // Whenever the app comes back into view (reopened from home screen, switched
    // back from another app), refetch so the user always sees the latest data/code
    // instead of a frozen, possibly stale, in-memory page.
    let hiddenAt: number | null = null
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
      } else if (document.visibilityState === 'visible') {
        if (hiddenAt !== null && Date.now() - hiddenAt > 3000) {
          window.location.reload()
        }
        hiddenAt = null
        navigator.serviceWorker?.getRegistration().then((reg) => reg?.update())
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // iOS/Safari can restore the page from its back-forward cache instead of
    // reloading it, silently keeping old code/data on screen — force a reload then.
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', onPageShow)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  return null
}
