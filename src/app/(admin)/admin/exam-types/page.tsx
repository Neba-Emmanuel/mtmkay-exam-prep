'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import { Check, Pencil, Plus, Trash2, X, GraduationCap } from 'lucide-react'

/* ─── Types ──────────────────────────────────────────── */
interface ExamType {
  id: string
  name: string
  description?: string
}

const EMPTY_FORM = { name: '', description: '' }
type FormState = typeof EMPTY_FORM

const errMsg = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback

/* ─── Accent palette (hashed) ────────────────────────── */
const ACCENTS = [
  { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
  { bg: '#F5F3FF', text: '#6D28D9', dot: '#8B5CF6' },
  { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
  { bg: '#FDF4FF', text: '#7E22CE', dot: '#A855F7' },
  { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
]
function accentFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff
  return ACCENTS[h % ACCENTS.length]
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
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
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

/* ─── Exam Type Form ─────────────────────────────────── */
function ExamTypeForm({ initial = EMPTY_FORM, onSubmit, onCancel, loading, error }: {
  initial?: FormState
  onSubmit: (form: FormState) => Promise<void>
  onCancel: () => void
  loading: boolean
  error: string
}) {
  const [form, setForm] = useState(initial)
  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
        <input
          className={inputCls}
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="e.g. GCE, BEPC, WASSCE"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Description <span className="text-gray-300 font-normal">(optional)</span>
        </label>
        <input
          className={inputCls}
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Brief description of this exam type"
        />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => onSubmit(form)}
          disabled={loading || !form.name.trim()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Check className="w-4 h-4" />}
          Save
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
function DeleteConfirm({ examType, onConfirm, onCancel, loading, error }: {
  examType: ExamType; onConfirm: () => void; onCancel: () => void; loading: boolean; error: string
}) {
  return (
    <div className="space-y-4">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <Trash2 className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-red-900">{examType.name}</p>
          {examType.description && <p className="text-xs text-red-500">{examType.description}</p>}
        </div>
      </div>
      <p className="text-sm text-gray-500">
        This will permanently delete{' '}
        <span className="font-medium text-gray-700">{examType.name}</span>{' '}
        and may affect associated subjects and questions. This cannot be undone.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Trash2 className="w-4 h-4" />}
          Delete
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

/* ─── Main Page ──────────────────────────────────────── */
export default function AdminExamTypesPage() {
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editExamType, setEditExamType] = useState<ExamType | null>(null)
  const [deleteExamType, setDeleteExamType] = useState<ExamType | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    let mounted = true
    api.get('/admin/exam-types')
      .then((r) => { if (mounted) setExamTypes(r.data) })
      .catch(console.error)
      .finally(() => { if (mounted) setIsLoading(false) })
    return () => { mounted = false }
  }, [])

  const handleAdd = async (form: FormState) => {
    setModalLoading(true); setModalError('')
    try {
      const { data } = await api.post('/admin/exam-types', { name: form.name.trim(), description: form.description.trim() })
      setExamTypes((p) => [data, ...p])
      setAddOpen(false)
    } catch (e) {
      setModalError(errMsg(e, 'Failed to create exam type'))
    } finally { setModalLoading(false) }
  }

  const handleEdit = async (form: FormState) => {
    if (!editExamType) return
    setModalLoading(true); setModalError('')
    try {
      const { data } = await api.patch(`/admin/exam-types/${editExamType.id}`, { name: form.name.trim(), description: form.description.trim() })
      setExamTypes((p) => p.map((x) => x.id === editExamType.id ? data : x))
      setEditExamType(null)
    } catch (e) {
      setModalError(errMsg(e, 'Failed to update exam type'))
    } finally { setModalLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteExamType) return
    setModalLoading(true); setModalError('')
    try {
      await api.delete(`/admin/exam-types/${deleteExamType.id}`)
      setExamTypes((p) => p.filter((x) => x.id !== deleteExamType.id))
      setDeleteExamType(null)
    } catch (e) {
      setModalError(errMsg(e, 'Failed to delete exam type'))
    } finally { setModalLoading(false) }
  }

  return (
    <AdminShell title="Exam Types" description="">
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">Exam Types</h1>
            <p className="text-sm text-gray-400 mt-1">
              {examTypes.length} exam type{examTypes.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={() => { setModalError(''); setAddOpen(true) }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add exam type
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-52">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-gray-400">Loading exam types…</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {examTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
                <GraduationCap className="w-8 h-8 opacity-40" />
                <p className="text-sm">No exam types yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {examTypes.map((et) => {
                  const ac = accentFor(et.id)
                  return (
                    <li
                      key={et.id}
                      className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Icon badge */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: ac.bg }}
                      >
                        <GraduationCap className="w-4 h-4" style={{ color: ac.dot }} />
                      </div>

                      {/* Name + description */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{et.name}</p>
                        {et.description && (
                          <p className="text-xs text-gray-400 truncate">{et.description}</p>
                        )}
                      </div>

                      {/* Actions — fade in on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setModalError(''); setEditExamType(et) }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setModalError(''); setDeleteExamType(et) }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {examTypes.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                <p className="text-xs text-gray-400">
                  {examTypes.length} exam type{examTypes.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add exam type">
        <ExamTypeForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={modalLoading}
          error={modalError}
        />
      </Modal>

      <Modal open={!!editExamType} onClose={() => setEditExamType(null)} title="Edit exam type">
        {editExamType && (
          <ExamTypeForm
            initial={{ name: editExamType.name, description: editExamType.description ?? '' }}
            onSubmit={handleEdit}
            onCancel={() => setEditExamType(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>

      <Modal open={!!deleteExamType} onClose={() => setDeleteExamType(null)} title="Delete exam type">
        {deleteExamType && (
          <DeleteConfirm
            examType={deleteExamType}
            onConfirm={handleDelete}
            onCancel={() => setDeleteExamType(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>
    </AdminShell>
  )
}