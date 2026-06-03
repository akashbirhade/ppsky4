'use client'

import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Hook: Animate elements as they appear in viewport
export function useScrollReveal(options?: { stagger?: number; y?: number; duration?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const children = ref.current.children
    if (children.length === 0) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        {
          opacity: 0,
          y: options?.y ?? 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: options?.duration ?? 0.7,
          stagger: options?.stagger ?? 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [options?.stagger, options?.y, options?.duration])

  return ref
}

// Hook: Slide in from left/right
export function useSlideIn(direction: 'left' | 'right' = 'left', delay = 0) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          x: direction === 'left' ? -80 : 80,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay,
          ease: 'power3.out',
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [direction, delay])

  return ref
}

// Hook: Scale and fade in
export function useScaleIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.6, delay, ease: 'back.out(1.4)' }
      )
    }, ref)

    return () => ctx.revert()
  }, [delay])

  return ref
}

// Hook: Staggered cards animation
export function useStaggerCards() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const cards = ref.current.children
    if (cards.length === 0) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 60,
          scale: 0.9,
          rotateX: 10,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        }
      )
    }, ref)

    return () => ctx.revert()
  }, [])

  return ref
}

// Hook: Smooth slide transition for profile navigation (Next/Prev)
export function useProfileSlide() {
  const ref = useRef<HTMLDivElement>(null)

  const animateSlide = useCallback((direction: 'next' | 'prev') => {
    if (!ref.current) return

    const xStart = direction === 'next' ? 100 : -100

    gsap.fromTo(
      ref.current,
      { opacity: 0, x: xStart, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
    )
  }, [])

  return { ref, animateSlide }
}

// Hook: Navbar dropdown animation  
export function useDropdownAnimation() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current,
      { opacity: 0, y: -10, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
    )
  })

  return ref
}

// Utility: Animate number counting up
export function animateCounter(element: HTMLElement, target: number, duration = 1.5) {
  const obj = { val: 0 }
  gsap.to(obj, {
    val: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.val).toString()
    },
  })
}
