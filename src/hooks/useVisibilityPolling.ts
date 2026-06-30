'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Polls a function at the given interval, but ONLY when the tab is visible.
 * Pauses polling when the user switches tabs (saves bandwidth & battery).
 * Immediately fetches once when the tab becomes visible again.
 */
export function useVisibilityPolling(
  fn: () => void,
  intervalMs: number,
  enabled: boolean = true
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const fnRef = useRef(fn)
  fnRef.current = fn

  const start = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => fnRef.current(), intervalMs)
  }, [intervalMs])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled) { stop(); return }

    // Initial call
    fnRef.current()

    // Start polling if visible
    if (!document.hidden) start()

    const handleVisibility = () => {
      if (document.hidden) {
        stop()
      } else {
        fnRef.current() // Fetch immediately on tab focus
        start()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [enabled, start, stop])
}
