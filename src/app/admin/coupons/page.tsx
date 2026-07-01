'use client'

import { useState } from 'react'
import { Ticket, Plus, Trash2, Copy, ToggleLeft, ToggleRight } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  discount: number
  type: 'percent' | 'fixed'
  plan: string
  maxUses: number
  usedCount: number
  expiresAt: string
  active: boolean
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: '1', code: 'WELCOME50', discount: 50, type: 'percent', plan: 'all', maxUses: 1000, usedCount: 342, expiresAt: '2026-12-31', active: true },
    { id: '2', code: 'GOLD20', discount: 20, type: 'percent', plan: 'gold', maxUses: 500, usedCount: 89, expiresAt: '2026-08-31', active: true },
    { id: '3', code: 'FLAT200', discount: 200, type: 'fixed', plan: 'all', maxUses: 200, usedCount: 200, expiresAt: '2026-06-30', active: false },
    { id: '4', code: 'PREMIUM70', discount: 70, type: 'percent', plan: 'platinum', maxUses: 100, usedCount: 45, expiresAt: '2026-09-30', active: true },
  ])
  const [showForm, setShowForm] = useState(false)
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percent', plan: 'all', maxUses: '', expiresAt: '' })

  function handleCreate() {
    if (!newCoupon.code || !newCoupon.discount) return
    setCoupons(prev => [...prev, {
      id: Date.now().toString(),
      code: newCoupon.code.toUpperCase(),
      discount: Number(newCoupon.discount),
      type: newCoupon.type as 'percent' | 'fixed',
      plan: newCoupon.plan,
      maxUses: Number(newCoupon.maxUses) || 999,
      usedCount: 0,
      expiresAt: newCoupon.expiresAt || '2026-12-31',
      active: true
    }])
    setNewCoupon({ code: '', discount: '', type: 'percent', plan: 'all', maxUses: '', expiresAt: '' })
    setShowForm(false)
  }

  function toggleCoupon(id: string) {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c))
  }

  function deleteCoupon(id: string) {
    setCoupons(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Ticket className="h-6 w-6 text-amber-400" /> Coupon Management
        </h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all">
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Coupon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Code</label>
              <input value={newCoupon.code} onChange={e => setNewCoupon(p => ({ ...p, code: e.target.value }))} placeholder="e.g. SUMMER50" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none uppercase" />
            </div>
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Discount</label>
              <input type="number" value={newCoupon.discount} onChange={e => setNewCoupon(p => ({ ...p, discount: e.target.value }))} placeholder="50" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none" />
            </div>
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Type</label>
              <select value={newCoupon.type} onChange={e => setNewCoupon(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white outline-none">
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Plan</label>
              <select value={newCoupon.plan} onChange={e => setNewCoupon(p => ({ ...p, plan: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white outline-none">
                <option value="all">All Plans</option>
                <option value="gold">Gold Only</option>
                <option value="platinum">Platinum Only</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Max Uses</label>
              <input type="number" value={newCoupon.maxUses} onChange={e => setNewCoupon(p => ({ ...p, maxUses: e.target.value }))} placeholder="1000" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-purple-300/30 outline-none" />
            </div>
            <div>
              <label className="text-sm text-purple-200/60 mb-1 block">Expires</label>
              <input type="date" value={newCoupon.expiresAt} onChange={e => setNewCoupon(p => ({ ...p, expiresAt: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-white outline-none" />
            </div>
          </div>
          <button onClick={handleCreate} className="mt-4 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition-all">Create Coupon</button>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white/5 border border-purple-500/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-purple-500/20">
                <th className="text-left p-4 text-purple-200/60 font-medium">Code</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Discount</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Plan</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Usage</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Expires</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Status</th>
                <th className="text-left p-4 text-purple-200/60 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-purple-500/10 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white font-medium">{c.code}</span>
                      <button onClick={() => navigator.clipboard.writeText(c.code)} className="text-purple-300/40 hover:text-white"><Copy className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                  <td className="p-4 text-white">{c.discount}{c.type === 'percent' ? '%' : '₹'}</td>
                  <td className="p-4 text-purple-200/60 capitalize">{c.plan}</td>
                  <td className="p-4 text-purple-200/60">{c.usedCount}/{c.maxUses}</td>
                  <td className="p-4 text-purple-200/60">{c.expiresAt}</td>
                  <td className="p-4">
                    <button onClick={() => toggleCoupon(c.id)}>
                      {c.active ? <ToggleRight className="h-5 w-5 text-green-400" /> : <ToggleLeft className="h-5 w-5 text-red-400" />}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteCoupon(c.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
