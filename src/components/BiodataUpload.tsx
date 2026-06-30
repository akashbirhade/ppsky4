'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'

interface ExtractedData {
  firstName?: string
  lastName?: string
  religion?: string
  caste?: string
  motherTongue?: string
  height?: string
  education?: string
  occupation?: string
  income?: string
  city?: string
  state?: string
  country?: string
  about?: string
  dateOfBirth?: string
  age?: string
  maritalStatus?: string
  gender?: string
  hobbies?: string
  familyType?: string
  fatherOccupation?: string
  motherOccupation?: string
  siblings?: string
}

interface BiodataUploadProps {
  userId: string
  authFetch: (url: string, options?: RequestInit) => Promise<Response>
  onExtracted: (data: ExtractedData, fileUrl: string) => void
}

export default function BiodataUpload({ userId, authFetch, onExtracted }: BiodataUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [savedFileUrl, setSavedFileUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setSuccess(null)
    setExtractedData(null)

    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 'image/png', 'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, image (JPEG/PNG), Word document, or text file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('biodata', file)
      formData.append('userId', userId)

      const res = await authFetch('/api/biodata-extract', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process biodata')
      }

      setSavedFileUrl(data.savedFileUrl)
      setExtractedData(data.extractedData || {})
      setSuccess(data.message || 'Biodata processed successfully!')

      if (data.extractedData && Object.keys(data.extractedData).length > 0) {
        onExtracted(data.extractedData, data.savedFileUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload biodata')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const extractedFields = extractedData
    ? Object.entries(extractedData).filter(([, v]) => v)
    : []

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-purple-400 bg-purple-500/10'
            : 'border-teal-200/50 dark:border-purple-500/20 hover:border-purple-400/40 hover:bg-teal-50/50 dark:hover:bg-purple-500/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.txt"
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-purple-400 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-purple-200">Processing your biodata...</p>
            <p className="text-xs text-slate-400 dark:text-purple-300/40">Extracting details from document</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-purple-500/10 flex items-center justify-center">
              <FileText className="h-8 w-8 text-teal-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-purple-200">
                Upload Biodata Document
              </p>
              <p className="text-xs text-slate-400 dark:text-purple-300/40 mt-1">
                Drag & drop or click to upload PDF, Image, or Word document
              </p>
              <p className="text-[10px] text-slate-400 dark:text-purple-300/30 mt-2">
                Max 10MB • We&apos;ll extract your details automatically
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Saved File Link */}
      {savedFileUrl && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
          <FileText className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="text-xs text-slate-600 dark:text-blue-300/70">Biodata saved:</span>
          <a
            href={savedFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline truncate"
          >
            {savedFileUrl.split('/').pop()}
          </a>
        </div>
      )}

      {/* Extracted Data Preview */}
      {extractedFields.length > 0 && (
        <div className="p-4 bg-teal-50/50 dark:bg-purple-500/5 border border-teal-200/50 dark:border-purple-500/15 rounded-2xl">
          <h4 className="text-sm font-medium text-slate-700 dark:text-purple-200 mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            Extracted Details ({extractedFields.length} fields found)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {extractedFields.map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-slate-400 dark:text-purple-300/40 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>{' '}
                <span className="text-slate-700 dark:text-purple-100">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-purple-300/30 mt-3">
            ✓ These details have been auto-filled in your profile. Review and save to confirm.
          </p>
        </div>
      )}
    </div>
  )
}
