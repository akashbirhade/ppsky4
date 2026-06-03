'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Page enter animation
      const tl = gsap.timeline()
      
      // Overlay slides out
      tl.fromTo(overlayRef.current,
        { xPercent: 0 },
        { xPercent: 100, duration: 0.5, ease: 'power3.inOut' }
      )
      
      // Content fades and slides in
      tl.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
    })

    return () => ctx.revert()
  }, [pathname])

  return (
    <div className="relative overflow-hidden">
      {/* Slide overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-gradient-to-r from-purple-900 via-purple-700 to-fuchsia-900 pointer-events-none"
        style={{ transform: 'translateX(100%)' }}
      />
      <div ref={containerRef}>
        {children}
      </div>
    </div>
  )
}
