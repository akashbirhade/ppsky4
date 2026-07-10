'use client'

import { useRef, useCallback } from 'react'

interface SwipeHandlers {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerCancel: (e: React.PointerEvent) => void
}

/**
 * Detects horizontal swipe/drag gestures using Pointer Events so it works with
 * BOTH touch (mobile) and mouse (desktop). Returns handlers to spread on the
 * swipeable element. Pair with `style={{ touchAction: 'pan-y' }}` on that element
 * so vertical scrolling still works while horizontal drags are captured.
 */
export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold: number = 50
): SwipeHandlers {
  const startX = useRef(0)
  const startY = useRef(0)
  const deltaX = useRef(0)
  const swiping = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Ignore secondary mouse buttons
    if (e.pointerType === 'mouse' && e.button !== 0) return
    startX.current = e.clientX
    startY.current = e.clientY
    deltaX.current = 0
    swiping.current = true
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      /* setPointerCapture can throw if the pointer was already released */
    }
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!swiping.current) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    // If the gesture is clearly vertical, let the page scroll instead
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) {
      swiping.current = false
      return
    }
    deltaX.current = dx
  }, [])

  const finish = useCallback((e: React.PointerEvent) => {
    if (!swiping.current) return
    swiping.current = false
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    if (deltaX.current > threshold) {
      onSwipeRight()
    } else if (deltaX.current < -threshold) {
      onSwipeLeft()
    }
    deltaX.current = 0
  }, [onSwipeLeft, onSwipeRight, threshold])

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    swiping.current = false
    deltaX.current = 0
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp: finish, onPointerCancel }
}
