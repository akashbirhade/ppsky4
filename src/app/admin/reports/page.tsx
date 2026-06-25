'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Eye, Ban, X, MessageCircle } from 'lucide-react'

interface Report {
  id: string
  reportedUserId: string
  reportedByUserId: string
  reason: string
  description: string
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  createdAt: string
  updatedAt: string
  adminNote?: string
  resolvedBy?: string
}

const reasonLabels: Record<string, string> = {
  fake_photos: 'Fake Photos',
  spam: 'Spam / Promotional',
  harassment: 'Harassment',
  inappropriate: 'Inappropriate Content',
  catfish: 'Catfishing / Identity Fraud',
  other: 'Other',
}

const statusColors: Record<string, string> = {
  pending: 'bg-red-500/10 text-red-300 border-red-500/20',
  investigating: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-300 border-green-500/20',
  dismissed: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [actionModal, setActionModal] = useState<{ report: Report; action: string } | null>(null)
  const [adminNote, setAdminNote] = useState('')

  useEffect(() => {
    fetchReports()
  }, [filter])

  async function fetchReports() {
    setLoading(true)
    try {
      const token = localStorage.getItem('soulmateSync_token')
      const params = filter ? `?status=${filter}` : ''
      const res = await fetch(`/api/admin/reports${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports)
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  async function updateReport(reportId: string, status: string, note?: string) {
    try {
      const token = localStorage.getItem('soulmateSync_token')
      await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reportId, status, adminNote: note }),
      })
      fetchReports()
      setActionModal(null)
      setAdminNote('')
    } catch {}
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400" /> Reports & Moderation
          </h1>
          <p className="text-purple-300/50 text-sm mt-1">Review reported profiles and take action</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-white/[0.03] p-1 rounded-xl border border-purple-500/10 w-fit overflow-x-auto">
        {[
          { id: '', label: 'All' },
          { id: 'pending', label: 'Pending' },
          { id: 'investigating', label: 'Investigating' },
          { id: 'resolved', label: 'Resolved' },
          { id: 'dismissed', label: 'Dismissed' },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.id ? 'bg-purple-600/30 text-white border border-purple-500/30' : 'text-purple-300/50 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white/[0.03] border border-purple-500/10 rounded-2xl p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-400/30 mx-auto mb-4" />
          <p className="text-purple-300/50 text-sm">No reports found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className="bg-white/[0.03] backdrop-blur-sm border border-purple-500/10 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  report.status === 'pending' ? 'bg-red-500/10' : 
                  report.status === 'investigating' ? 'bg-yellow-500/10' : 'bg-green-500/10'
                }`}>
                  <AlertTriangle className={`h-5 w-5 ${
                    report.status === 'pending' ? 'text-red-400' : 
                    report.status === 'investigating' ? 'text-yellow-400' : 'text-green-400'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-white">
                      {reasonLabels[report.reason] || report.reason}
                    </h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${statusColors[report.status]}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/60 mt-1">{report.description}</p>
                  <p className="text-[10px] text-purple-300/30 mt-2">
                    Reported user: {report.reportedUserId} • By: {report.reportedByUserId} • {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  {report.adminNote && (
                    <p className="text-xs text-purple-300/60 mt-2 bg-purple-500/5 px-3 py-1.5 rounded-lg border border-purple-500/10">
                      Admin note: {report.adminNote}
                    </p>
                  )}
                </div>

                {(report.status === 'pending' || report.status === 'investigating') && (
                  <div className="flex gap-2 shrink-0">
                    {report.status === 'pending' && (
                      <button onClick={() => updateReport(report.id, 'investigating')}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-yellow-500/10 text-yellow-300 text-xs border border-yellow-500/20 hover:bg-yellow-500/20 transition-all">
                        <Eye className="h-3 w-3" /> Investigate
                      </button>
                    )}
                    <button onClick={() => setActionModal({ report, action: 'resolve' })}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-500/10 text-green-300 text-xs border border-green-500/20 hover:bg-green-500/20 transition-all">
                      <CheckCircle className="h-3 w-3" /> Resolve
                    </button>
                    <button onClick={() => updateReport(report.id, 'dismissed')}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-500/10 text-gray-300 text-xs border border-gray-500/20 hover:bg-gray-500/20 transition-all">
                      <X className="h-3 w-3" /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
          <div className="bg-[#1a0a2e] border border-purple-500/20 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Resolve Report</h3>
            <p className="text-sm text-purple-200/60 mb-4">Add a note about the action taken:</p>
            <textarea
              placeholder="Action taken (e.g., User warned, photos removed, account banned)..."
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              className="w-full p-3 bg-white/[0.03] border border-purple-500/10 rounded-xl text-white text-sm placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/30 mb-4 h-20 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/10 transition-all">
                Cancel
              </button>
              <button onClick={() => updateReport(actionModal.report.id, 'resolved', adminNote)}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all">
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
