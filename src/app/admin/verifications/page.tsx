'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, X, FileText, Camera, GraduationCap, Briefcase, Clock, XCircle } from 'lucide-react'

interface Verification {
  id: string
  userId: string
  type: 'id_proof' | 'photo' | 'education' | 'employment'
  documentUrl: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

const typeIcons = {
  id_proof: FileText,
  photo: Camera,
  education: GraduationCap,
  employment: Briefcase,
}

const typeLabels = {
  id_proof: 'ID Proof',
  photo: 'Photo Verification',
  education: 'Education',
  employment: 'Employment',
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [rejectModal, setRejectModal] = useState<Verification | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const fetchVerifications = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('soulmateSync_token')
      const res = await fetch(`/api/admin/verifications?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setVerifications(data.verifications)
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchVerifications()
  }, [fetchVerifications])

  async function reviewVerification(id: string, approved: boolean, reason?: string) {
    try {
      const token = localStorage.getItem('soulmateSync_token')
      await fetch('/api/admin/verifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verificationId: id, approved, rejectionReason: reason }),
      })
      fetchVerifications()
      setRejectModal(null)
      setRejectionReason('')
    } catch {}
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-400" /> Verification Queue
          </h1>
          <p className="text-purple-300/50 text-sm mt-1">Review and approve user verifications</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-white/[0.03] p-1 rounded-xl border border-purple-500/10 w-fit">
        {['pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f ? 'bg-purple-600/30 text-white border border-purple-500/30' : 'text-purple-300/50 hover:text-white'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Verification List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : verifications.length === 0 ? (
        <div className="bg-white/[0.03] border border-purple-500/10 rounded-2xl p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-400/30 mx-auto mb-4" />
          <p className="text-purple-300/50 text-sm">No {filter} verifications</p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map(v => {
            const Icon = typeIcons[v.type] || FileText
            return (
              <div key={v.id} className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  v.status === 'pending' ? 'bg-yellow-500/10' : v.status === 'approved' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    v.status === 'pending' ? 'text-yellow-400' : v.status === 'approved' ? 'text-green-400' : 'text-red-400'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">{typeLabels[v.type]}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                      v.status === 'pending' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' :
                      v.status === 'approved' ? 'bg-green-500/10 text-green-300 border-green-500/20' :
                      'bg-red-500/10 text-red-300 border-red-500/20'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/50">
                    User: {v.userId} • Submitted: {new Date(v.submittedAt).toLocaleDateString()}
                    {v.reviewedAt && ` • Reviewed: ${new Date(v.reviewedAt).toLocaleDateString()}`}
                  </p>
                  {v.rejectionReason && (
                    <p className="text-xs text-red-300/60 mt-1">Reason: {v.rejectionReason}</p>
                  )}
                </div>

                {v.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => reviewVerification(v.id, true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 text-green-300 text-xs border border-green-500/20 hover:bg-green-500/20 transition-all">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button onClick={() => setRejectModal(v)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-300 text-xs border border-red-500/20 hover:bg-red-500/20 transition-all">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setRejectModal(null)}>
          <div className="bg-[#1a0a2e] border border-purple-500/20 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Reject Verification</h3>
            <textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-white/[0.03] border border-purple-500/10 rounded-xl text-white text-sm placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/30 mb-4 h-20 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/10 transition-all">
                Cancel
              </button>
              <button onClick={() => reviewVerification(rejectModal.id, false, rejectionReason)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
