'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Camera, X } from 'lucide-react'

interface PhotoGuidelinesProps {
  isOpen: boolean
  onClose: () => void
}

export default function PhotoGuidelines({ isOpen, onClose }: PhotoGuidelinesProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-400" /> Photo Guidelines
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-purple-200/60 mb-4">
          Good photos increase your match rate by 5x. Follow these guidelines:
        </p>

        {/* Do's */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-green-500 mb-2 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> Do&apos;s
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-purple-200/70">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              Clear, well-lit face photo (front-facing)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              Recent photo (within last 6 months)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              Smile naturally — it increases matches by 40%
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              At least 3 photos (face, full-length, casual)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              Dress presentably (formal or smart casual)
            </li>
          </ul>
        </div>

        {/* Don'ts */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-1">
            <XCircle className="h-4 w-4" /> Don&apos;ts
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-purple-200/70">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✗</span>
              Group photos (we can&apos;t tell who you are)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✗</span>
              Heavy filters or edits
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✗</span>
              Sunglasses, masks, or anything hiding your face
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✗</span>
              Blurry or low-resolution images
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">✗</span>
              Inappropriate or revealing content
            </li>
          </ul>
        </div>

        {/* Moderation note */}
        <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200/50 dark:border-yellow-500/20 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-200/80">
              All photos are reviewed by our moderation team. Photos that violate guidelines will be removed and may result in account suspension.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
