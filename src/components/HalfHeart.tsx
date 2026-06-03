'use client'

import { useId } from 'react'

interface HalfHeartProps {
  className?: string
}

/**
 * Heart icon with left half sky-blue and right half purple — used as a drop-in
 * replacement for the Lucide <Heart> icon across the app.
 */
const HalfHeart = ({ className = '' }: HalfHeartProps) => {
  const uid = useId().replace(/:/g, '')
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={`url(#${uid})`}
        stroke="none"
      />
    </svg>
  )
}

export default HalfHeart
