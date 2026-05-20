'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import {
  CreditCard, Search, ChevronUp, ChevronDown, ChevronsUpDown,
  X, Check, Clock, AlertCircle, Ban, Eye, RefreshCw,
  TrendingUp, Wallet, CircleDollarSign, Users,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */
interface PaymentUser {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
}

interface Payment {
  id: string
  amount: number
  currency: string
  method?: string
  status: string
  reference?: string
  notes?: string
  user?: PaymentUser
  createdAt: string
  [key: string]: unknown
}

type SortKey = 'user' | 'amount' | 'method' | 'status' | 'createdAt'
type SortDir = 'asc' | 'desc'

/* ─── Status config ──────────────────────────────────── */
const STATUS = {
  pending:   { bg: '#FEF9C3', text: '#854D0E', icon: Clock,         label: 'Pending' },
  verified:  { bg: '#DCFCE7', text: '#166534', icon: Check,         label: 'Verified' },
  approved:  { bg: '#DCFCE7', text: '#166534', icon: Check,         label: 'Approved' },
  failed:    { bg: '#FEE2E2', text: '#991B1B', icon: AlertCircle,   label: 'Failed' },
  cancelled: { bg: '#F1F5F9', text: '#64748B', icon: Ban,           label: 'Cancelled' },
  refunded:  { bg: '#EDE9FE', text: '#5B21B6', icon: RefreshCw,     label: 'Refunded' },
} as const

type StatusKey = keyof typeof STATUS

function statusCfg(s: string) {
  return STATUS[s.toLowerCase() as StatusKey] ?? { bg: '#F1F5F9', text: '#64748B', icon: Clock, label: s }
}

/* ─── Method icon ────────────────────────────────────── */
const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  card:         { bg: '#EDE9FE', text: '#5B21B6' },
  mobile_money: { bg: '#E0F2FE', text: '#0369A1' },
  bank:         { bg: '#DCFCE7', text: '#166534' },
  cash:         { bg: '#FEF9C3', text: '#854D0E' },
}
function methodStyle(m?: string) {
  return METHOD_COLORS[(m ?? '').toLowerCase()] ?? { bg: '#F1F5F9', text: '#64748B' }
}

/* ─── Helpers ────────────────────────────────────────── */
function userName(u?: PaymentUser) {
  if (!u) return '—'
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
  return name || u.email || '—'
}

function initials(u?: PaymentUser) {
  const f = u?.firstName?.[0] ?? ''
  const l = u?.lastName?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
}

function formatAmount(amount: number, currency: string) {
  return `${currency?.toUpperCase() ?? ''} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/* ─── Modal ──────────────────────────────────────────── */
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.18s ease' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(10px) scale(0.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

/* ─── Detail Modal ───────────────────────────────────── */
function PaymentDetail({ payment, onClose, onStatusChange }: {
  payment: Payment
  onClose: () => void
  onStatusChange: (id: string, status: string) => Promise<void>
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const cfg = statusCfg(payment.status)
  const StatusIcon = cfg.icon

  const changeStatus = async (status: string) => {
    setLoading(status); setError('')
    try {
      await onStatusChange(payment.id, status)
      onClose()
    } catch {
      setError('Failed to update status')
    } finally { setLoading(null) }
  }

  const actions: { status: string; label: string; style: string }[] = []
  const s = payment.status.toLowerCase()
  if (s === 'pending') {
    actions.push(
      { status: 'verified', label: 'Verify payment', style: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
      { status: 'failed',   label: 'Mark as failed', style: 'border border-red-200 text-red-600 hover:bg-red-50' },
    )
  }
  if (s === 'verified' || s === 'approved') {
    actions.push(
      { status: 'refunded',  label: 'Issue refund',    style: 'border border-violet-200 text-violet-600 hover:bg-violet-50' },
      { status: 'cancelled', label: 'Cancel payment',  style: 'border border-gray-200 text-gray-600 hover:bg-gray-50' },
    )
  }
  if (s === 'failed') {
    actions.push(
      { status: 'pending', label: 'Reset to pending', style: 'border border-amber-200 text-amber-700 hover:bg-amber-50' },
    )
  }

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start gap-4">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right">{value}</span>
    </div>
  )

  return (
    <div className="space-y-5">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

      {/* User strip */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
          {initials(payment.user)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{userName(payment.user)}</p>
          {payment.user?.email && <p className="text-xs text-gray-400">{payment.user.email}</p>}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3 divide-y divide-gray-50">
        <div className="space-y-3">
          <Field label="Amount" value={
            <span className="text-base font-bold text-gray-900">{formatAmount(payment.amount, payment.currency)}</span>
          } />
          <Field label="Status" value={
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.text }}>
              <StatusIcon className="w-3 h-3" /> {cfg.label}
            </span>
          } />
        </div>
        <div className="space-y-3 pt-3">
          {payment.method && <Field label="Method" value={
            <span className="capitalize">{payment.method.replace(/_/g, ' ')}</span>
          } />}
          {payment.reference && <Field label="Reference" value={
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{String(payment.reference)}</code>
          } />}
          <Field label="Date" value={formatDate(String(payment.createdAt))} />
        </div>
        {payment.notes && (
          <div className="pt-3">
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{String(payment.notes)}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Actions</p>
          <div className="flex flex-col gap-2">
            {actions.map((a) => (
              <button
                key={a.status}
                onClick={() => changeStatus(a.status)}
                disabled={!!loading}
                className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors ${a.style}`}
              >
                {loading === a.status
                  ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : null}
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Stat card ──────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-start gap-3">
      <div className="p-2 rounded-xl shrink-0" style={{ background: color + '20' }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'createdAt', dir: 'desc' })
  const [viewPayment, setViewPayment] = useState<Payment | null>(null)

  useEffect(() => {
    api.get('/admin/payments')
      .then((r) => setPayments(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const toggleSort = (key: SortKey) =>
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })

  const filtered = payments
    .filter((p) => {
      const q = search.toLowerCase()
      const matchQ =
        userName(p.user).toLowerCase().includes(q) ||
        (p.user?.email ?? '').toLowerCase().includes(q) ||
        (p.reference ? String(p.reference).toLowerCase().includes(q) : false)
      const matchS = !filterStatus || p.status.toLowerCase() === filterStatus
      const matchM = !filterMethod || (p.method ?? '').toLowerCase() === filterMethod
      return matchQ && matchS && matchM
    })
    .sort((a, b) => {
      let cmp = 0
      if (sort.key === 'user') cmp = userName(a.user).localeCompare(userName(b.user))
      else if (sort.key === 'amount') cmp = Number(a.amount) - Number(b.amount)
      else if (sort.key === 'method') cmp = (a.method ?? '').localeCompare(b.method ?? '')
      else if (sort.key === 'status') cmp = a.status.localeCompare(b.status)
      else if (sort.key === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sort.dir === 'asc' ? cmp : -cmp
    })

  /* ── Status update ── */
  const handleStatusChange = async (id: string, status: string) => {
    const { data } = await api.patch(`/admin/payments/${id}`, { status })
    setPayments((p) => p.map((x) => x.id === id ? data : x))
  }

  /* ── Stats ── */
  const total = payments.length
  const pending = payments.filter((p) => p.status.toLowerCase() === 'pending').length
  const totalRevenue = payments
    .filter((p) => ['verified', 'approved'].includes(p.status.toLowerCase()))
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const uniqueUsers = new Set(payments.map((p) => p.user?.id).filter(Boolean)).size

  const methods = Array.from(new Set(payments.map((p) => p.method).filter(Boolean))) as string[]
  const statuses = Array.from(new Set(payments.map((p) => p.status.toLowerCase()).filter(Boolean)))

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sort.key !== k) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 ml-1 inline" />
    return sort.dir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-gray-700 ml-1 inline" />
      : <ChevronDown className="w-3.5 h-3.5 text-gray-700 ml-1 inline" />
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide select-none cursor-pointer hover:text-gray-900 transition-colors'

  return (
    <AdminShell title="Payments" description="">
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">Payments</h1>
            <p className="text-sm text-gray-400 mt-1">{payments.length} record{payments.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        {/* Stats */}
        {!isLoading && payments.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={CircleDollarSign} label="Verified revenue" value={`${totalRevenue.toLocaleString()}`} color="#16A34A" />
            <StatCard icon={Clock} label="Pending review" value={String(pending)} sub={`of ${total} payments`} color="#D97706" />
            <StatCard icon={TrendingUp} label="Total payments" value={String(total)} color="#2563EB" />
            <StatCard icon={Users} label="Paying users" value={String(uniqueUsers)} color="#7C3AED" />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Search by user, email, or reference…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {statuses.length > 0 && (
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{statusCfg(s).label}</option>
              ))}
            </select>
          )}
          {methods.length > 0 && (
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="">All methods</option>
              {methods.map((m) => (
                <option key={m} value={m.toLowerCase()}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-gray-400">Loading payments…</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={thCls} onClick={() => toggleSort('user')}>
                      User <SortIcon k="user" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('amount')}>
                      Amount <SortIcon k="amount" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('method')}>
                      Method <SortIcon k="method" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('status')}>
                      Status <SortIcon k="status" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('createdAt')}>
                      Date <SortIcon k="createdAt" />
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Wallet className="w-8 h-8 opacity-40" />
                          <p className="text-sm">
                            {search || filterStatus || filterMethod
                              ? 'No payments match your filters'
                              : 'No payments found'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const cfg = statusCfg(p.status)
                      const StatusIcon = cfg.icon
                      const ms = methodStyle(p.method)
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/60 transition-colors group">
                          {/* User */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600 shrink-0">
                                {initials(p.user)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 leading-tight">{userName(p.user)}</p>
                                {p.user?.email && (
                                  <p className="text-xs text-gray-400">{p.user.email}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* Amount */}
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900 tabular-nums">
                              {formatAmount(p.amount, p.currency)}
                            </span>
                          </td>
                          {/* Method */}
                          <td className="px-4 py-3">
                            {p.method ? (
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                                style={{ background: ms.bg, color: ms.text }}
                              >
                                {p.method.replace(/_/g, ' ')}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs italic">—</span>
                            )}
                          </td>
                          {/* Status */}
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ background: cfg.bg, color: cfg.text }}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                          {/* Date */}
                          <td className="px-4 py-3 text-gray-400 text-xs tabular-nums whitespace-nowrap">
                            {formatDate(String(p.createdAt))}
                          </td>
                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setViewPayment(p)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                title="View details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {p.status.toLowerCase() === 'pending' && (
                                <button
                                  onClick={async () => {
                                    try { await handleStatusChange(p.id, 'verified') } catch {}
                                  }}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                  title="Quick verify"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                <p className="text-xs text-gray-400">
                  Showing {filtered.length} of {payments.length} payment{payments.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!viewPayment}
        onClose={() => setViewPayment(null)}
        title="Payment details"
      >
        {viewPayment && (
          <PaymentDetail
            payment={viewPayment}
            onClose={() => setViewPayment(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </Modal>
    </AdminShell>
  )
}