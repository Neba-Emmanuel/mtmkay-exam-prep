'use client'

import { useEffect, useState, useRef } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import {
  Users, Plus, Search, Pencil, Trash2, X, Check,
  ChevronUp, ChevronDown, ChevronsUpDown, ShieldCheck, UserCircle2,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'student' | string
  isActive: boolean
  createdAt: string
  [key: string]: unknown
}

type SortKey = 'name' | 'email' | 'role' | 'isActive' | 'createdAt'
type SortDir = 'asc' | 'desc'

const EMPTY_FORM = { firstName: '', lastName: '', email: '', role: 'student', isActive: true, password: '' }

/* ─── Helpers ────────────────────────────────────────── */
function initials(u: User) {
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase()
}

function roleColor(role: string) {
  if (role === 'admin') return { bg: '#EDE9FE', text: '#5B21B6' }
  return { bg: '#E0F2FE', text: '#0369A1' }
}

function statusPill(active: boolean) {
  return active
    ? { bg: '#DCFCE7', text: '#15803D', label: 'Active' }
    : { bg: '#F1F5F9', text: '#64748B', label: 'Inactive' }
}

const avatarColors = [
  ['#EDE9FE', '#7C3AED'], ['#E0F2FE', '#0369A1'],
  ['#FCE7F3', '#9D174D'], ['#FEF9C3', '#92400E'],
  ['#DCFCE7', '#166534'], ['#FEE2E2', '#991B1B'],
]
function avatarColor(name: string) {
  const i = (name.charCodeAt(0) || 0) % avatarColors.length
  return avatarColors[i]
}

/* ─── Sub-components ─────────────────────────────────── */

function Avatar({ user }: { user: User }) {
  const [bg, fg] = avatarColor(user.firstName + user.lastName)
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
      style={{ background: bg, color: fg }}
    >
      {initials(user)}
    </div>
  )
}

function Pill({ bg, text, label }: { bg: string; text: string; label: string }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color: text }}
    >
      {label}
    </span>
  )
}

/* ─── Modal ──────────────────────────────────────────── */
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}
function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.18s ease' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(10px) scale(0.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

/* ─── User Form ──────────────────────────────────────── */
interface UserFormProps {
  initial?: typeof EMPTY_FORM
  onSubmit: (data: typeof EMPTY_FORM) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
  loading: boolean
  error: string
}
function UserForm({ initial = EMPTY_FORM, onSubmit, onCancel, isEdit, loading, error }: UserFormProps) {
  const [form, setForm] = useState(initial)
  const set = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }))

  const inputCls =
    'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition'

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">First name</label>
          <input className={inputCls} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Jane" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Last name</label>
          <input className={inputCls} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Doe" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
        <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@school.edu" />
      </div>
      {!isEdit && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
          <input type="password" className={inputCls} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
          <select className={inputCls} value={form.role} onChange={(e) => set('role', e.target.value)}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select className={inputCls} value={String(form.isActive)} onChange={(e) => set('isActive', e.target.value === 'true')}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => onSubmit(form)}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isEdit ? 'Save changes' : 'Create user'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─── Delete Confirm ─────────────────────────────────── */
function DeleteConfirm({ user, onConfirm, onCancel, loading, error }: {
  user: User; onConfirm: () => void; onCancel: () => void; loading: boolean; error: string
}) {
  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <Trash2 className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-red-900">{user.firstName} {user.lastName}</p>
          <p className="text-xs text-red-600">{user.email}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500">This action cannot be undone. The user and all associated data will be permanently removed.</p>
      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete user
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'createdAt', dir: 'desc' })

  const [addOpen, setAddOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)

  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    api.get('/admin/users').then((r) => setUsers(r.data)).catch(console.error).finally(() => setIsLoading(false))
  }, [])

  /* ── Sorting ── */
  const toggleSort = (key: SortKey) => {
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  /* ── Filtering + sorting ── */
  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase()
      return (
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      let av: string, bv: string
      if (sort.key === 'name') { av = `${a.firstName} ${a.lastName}`; bv = `${b.firstName} ${b.lastName}` }
      else if (sort.key === 'isActive') { av = String(a.isActive); bv = String(b.isActive) }
      else { av = String(a[sort.key] ?? ''); bv = String(b[sort.key] ?? '') }
      return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  /* ── CRUD handlers ── */
  const handleAdd = async (form: typeof EMPTY_FORM) => {
    setModalLoading(true); setModalError('')
    try {
      const { data } = await api.post('/admin/users', form)
      setUsers((u) => [data, ...u])
      setAddOpen(false)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create user')
    } finally { setModalLoading(false) }
  }

  const handleEdit = async (form: typeof EMPTY_FORM) => {
    if (!editUser) return
    setModalLoading(true); setModalError('')
    try {
      const { data } = await api.patch(`/admin/users/${editUser.id}`, form)
      setUsers((u) => u.map((x) => x.id === editUser.id ? data : x))
      setEditUser(null)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update user')
    } finally { setModalLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    setModalLoading(true); setModalError('')
    try {
      await api.delete(`/admin/users/${deleteUser.id}`)
      setUsers((u) => u.filter((x) => x.id !== deleteUser.id))
      setDeleteUser(null)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete user')
    } finally { setModalLoading(false) }
  }

  const openEdit = (user: User) => { setModalError(''); setEditUser(user) }
  const openDelete = (user: User) => { setModalError(''); setDeleteUser(user) }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sort.key !== k) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 ml-1" />
    return sort.dir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-gray-700 ml-1" />
      : <ChevronDown className="w-3.5 h-3.5 text-gray-700 ml-1" />
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide select-none cursor-pointer hover:text-gray-900 transition-colors'

  return (
    <AdminShell title="Users" description="">
      <div className="space-y-6 pb-12">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600">Users</h1>
            <p className="text-sm text-gray-400 mt-1">{users.length} account{users.length !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={() => { setModalError(''); setAddOpen(true) }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add user
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            placeholder="Search by name, email, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
              <p className="text-sm text-gray-400">Loading users…</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={thCls} onClick={() => toggleSort('name')}>
                      <span className="inline-flex items-center">Name <SortIcon k="name" /></span>
                    </th>
                    <th className={thCls} onClick={() => toggleSort('email')}>
                      <span className="inline-flex items-center">Email <SortIcon k="email" /></span>
                    </th>
                    <th className={thCls} onClick={() => toggleSort('role')}>
                      <span className="inline-flex items-center">Role <SortIcon k="role" /></span>
                    </th>
                    <th className={thCls} onClick={() => toggleSort('isActive')}>
                      <span className="inline-flex items-center">Status <SortIcon k="isActive" /></span>
                    </th>
                    <th className={thCls} onClick={() => toggleSort('createdAt')}>
                      <span className="inline-flex items-center">Joined <SortIcon k="createdAt" /></span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <UserCircle2 className="w-8 h-8 opacity-40" />
                          <p className="text-sm">{search ? 'No users match your search' : 'No users found'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => {
                      const rc = roleColor(user.role)
                      const sc = statusPill(user.isActive)
                      return (
                        <tr key={user.id} className="hover:bg-gray-50/60 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar user={user} />
                              <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: rc.bg, color: rc.text }}>
                              {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Pill bg={sc.bg} text={sc.text} label={sc.label} />
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs tabular-nums">{formatDate(String(user.createdAt))}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEdit(user)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openDelete(user)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
                  Showing {filtered.length} of {users.length} user{users.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add new user">
        <UserForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={modalLoading}
          error={modalError}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit user">
        {editUser && (
          <UserForm
            isEdit
            initial={{
              firstName: editUser.firstName,
              lastName: editUser.lastName,
              email: editUser.email,
              role: editUser.role,
              isActive: editUser.isActive,
              password: '',
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditUser(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete user">
        {deleteUser && (
          <DeleteConfirm
            user={deleteUser}
            onConfirm={handleDelete}
            onCancel={() => setDeleteUser(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>
    </AdminShell>
  )
}