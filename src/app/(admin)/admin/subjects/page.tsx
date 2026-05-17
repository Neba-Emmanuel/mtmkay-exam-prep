'use client'

import { useEffect, useState, useRef } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import {
  BookOpen, Plus, Search, Pencil, Trash2, X, Check,
  ChevronUp, ChevronDown, ChevronsUpDown, Layers, Hash, FileText,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */
interface ExamType {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
  examType?: ExamType
  examTypeId?: string
  _count?: {
    topics?: number
    questions?: number
  }
  [key: string]: unknown
}

type SortKey = 'name' | 'examType' | 'topics' | 'questions'
type SortDir = 'asc' | 'desc'

const EMPTY_FORM = { name: '', examTypeId: '' }

/* ─── Accent palette per exam type (hashed) ────────── */
const ACCENTS = [
  { bg: '#EDE9FE', text: '#5B21B6', dot: '#7C3AED' },
  { bg: '#E0F2FE', text: '#0369A1', dot: '#0284C7' },
  { bg: '#FCE7F3', text: '#9D174D', dot: '#BE185D' },
  { bg: '#DCFCE7', text: '#166534', dot: '#16A34A' },
  { bg: '#FEF9C3', text: '#854D0E', dot: '#CA8A04' },
  { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  { bg: '#F0FDF4', text: '#14532D', dot: '#15803D' },
  { bg: '#FFF7ED', text: '#9A3412', dot: '#EA580C' },
]
function accentFor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff
  return ACCENTS[h % ACCENTS.length]
}

/* ─── Stat badge ─────────────────────────────────────── */
function StatBadge({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <Icon className="w-3.5 h-3.5 text-gray-300" />
      <span className="font-medium text-gray-700 tabular-nums">{value}</span>
      <span>{label}</span>
    </span>
  )
}

/* ─── Modal shell ────────────────────────────────────── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: 'modalIn 0.18s ease' }}>
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

/* ─── Subject Form ───────────────────────────────────── */
function SubjectForm({
  initial = EMPTY_FORM, examTypes, onSubmit, onCancel, isEdit, loading, error,
}: {
  initial?: typeof EMPTY_FORM
  examTypes: ExamType[]
  onSubmit: (data: typeof EMPTY_FORM) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
  loading: boolean
  error: string
}) {
  const [form, setForm] = useState(initial)
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))
  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition'

  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Subject name</label>
        <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Mathematics" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Exam type</label>
        <select className={inputCls} value={form.examTypeId} onChange={(e) => set('examTypeId', e.target.value)}>
          <option value="">— Select exam type —</option>
          {examTypes.map((et) => (
            <option key={et.id} value={et.id}>{et.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => onSubmit(form)}
          disabled={loading || !form.name.trim()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Check className="w-4 h-4" />}
          {isEdit ? 'Save changes' : 'Create subject'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─── Delete Confirm ─────────────────────────────────── */
function DeleteConfirm({ subject, onConfirm, onCancel, loading, error }: {
  subject: Subject; onConfirm: () => void; onCancel: () => void; loading: boolean; error: string
}) {
  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <Trash2 className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-red-900">{subject.name}</p>
          {subject.examType && <p className="text-xs text-red-500">{subject.examType.name}</p>}
        </div>
      </div>
      <p className="text-sm text-gray-500">
        This will permanently delete <span className="font-medium text-gray-700">{subject.name}</span> along with all its topics and questions. This cannot be undone.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete subject
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterExam, setFilterExam] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'name', dir: 'asc' })

  const [addOpen, setAddOpen] = useState(false)
  const [editSubject, setEditSubject] = useState<Subject | null>(null)
  const [deleteSubject, setDeleteSubject] = useState<Subject | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/subjects'),
      api.get('/exams/categories').catch(() => ({ data: [] })),
    ])
      .then(([s, et]) => { setSubjects(s.data); setExamTypes(et.data) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const toggleSort = (key: SortKey) =>
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })

  const filtered = subjects
    .filter((s) => {
      const q = search.toLowerCase()
      const matchQ = s.name.toLowerCase().includes(q) || (s.examType?.name ?? '').toLowerCase().includes(q)
      const matchE = !filterExam || s.examType?.id === filterExam
      return matchQ && matchE
    })
    .sort((a, b) => {
      let av = '', bv = ''
      if (sort.key === 'name') { av = a.name; bv = b.name }
      else if (sort.key === 'examType') { av = a.examType?.name ?? ''; bv = b.examType?.name ?? '' }
      else if (sort.key === 'topics') { av = String(a._count?.topics ?? 0); bv = String(b._count?.topics ?? 0) }
      else if (sort.key === 'questions') { av = String(a._count?.questions ?? 0); bv = String(b._count?.questions ?? 0) }
      const cmp = sort.key === 'topics' || sort.key === 'questions'
        ? Number(av) - Number(bv)
        : av.localeCompare(bv)
      return sort.dir === 'asc' ? cmp : -cmp
    })

  /* ── CRUD ── */
  const handleAdd = async (form: typeof EMPTY_FORM) => {
    setModalLoading(true); setModalError('')
    try {
      const { data } = await api.post('/admin/subjects', form)
      setSubjects((s) => [data, ...s])
      setAddOpen(false)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create subject')
    } finally { setModalLoading(false) }
  }

  const handleEdit = async (form: typeof EMPTY_FORM) => {
    if (!editSubject) return
    setModalLoading(true); setModalError('')
    try {
      const { data } = await api.patch(`/admin/subjects/${editSubject.id}`, form)
      setSubjects((s) => s.map((x) => x.id === editSubject.id ? data : x))
      setEditSubject(null)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update subject')
    } finally { setModalLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteSubject) return
    setModalLoading(true); setModalError('')
    try {
      await api.delete(`/admin/subjects/${deleteSubject.id}`)
      setSubjects((s) => s.filter((x) => x.id !== deleteSubject.id))
      setDeleteSubject(null)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete subject')
    } finally { setModalLoading(false) }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sort.key !== k) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 ml-1 inline" />
    return sort.dir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-gray-700 ml-1 inline" />
      : <ChevronDown className="w-3.5 h-3.5 text-gray-700 ml-1 inline" />
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide select-none cursor-pointer hover:text-gray-900 transition-colors'

  /* ── Exam type filter options ── */
  const examOptions = Array.from(new Map(subjects.map((s) => [s.examType?.id, s.examType] as const).filter((entry): entry is readonly [string, ExamType] => !!entry[0])).values())

  return (
    <AdminShell title="Subjects" description="">
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600">Subjects</h1>
            <p className="text-sm text-gray-400 mt-1">{subjects.length} subject{subjects.length !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={() => { setModalError(''); setAddOpen(true) }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add subject
          </button>
        </div>

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              placeholder="Search subjects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {examOptions.length > 0 && (
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition bg-white"
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
            >
              <option value="">All exam types</option>
              {examOptions.map((et) => (
                <option key={et.id} value={et.id}>{et.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Table / loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
              <p className="text-sm text-gray-400">Loading subjects…</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={thCls} onClick={() => toggleSort('name')}>
                      Subject <SortIcon k="name" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('examType')}>
                      Exam type <SortIcon k="examType" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('topics')}>
                      Topics <SortIcon k="topics" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('questions')}>
                      Questions <SortIcon k="questions" />
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <BookOpen className="w-8 h-8 opacity-40" />
                          <p className="text-sm">{search || filterExam ? 'No subjects match your filters' : 'No subjects found'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((subject) => {
                      const ac = accentFor(subject.examType?.name ?? subject.name)
                      const topics = subject._count?.topics ?? 0
                      const questions = subject._count?.questions ?? 0
                      return (
                        <tr key={subject.id} className="hover:bg-gray-50/60 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: ac.bg }}>
                                <BookOpen className="w-4 h-4" style={{ color: ac.dot }} />
                              </div>
                              <span className="font-medium text-gray-900">{subject.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {subject.examType ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: ac.bg, color: ac.text }}>
                                {subject.examType.name}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs italic">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatBadge icon={Layers} value={topics} label="topics" />
                          </td>
                          <td className="px-4 py-3">
                            <StatBadge icon={Hash} value={questions} label="questions" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setModalError(''); setEditSubject(subject) }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setModalError(''); setDeleteSubject(subject) }}
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
                  Showing {filtered.length} of {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add new subject">
        <SubjectForm
          examTypes={examTypes}
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={modalLoading}
          error={modalError}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editSubject} onClose={() => setEditSubject(null)} title="Edit subject">
        {editSubject && (
          <SubjectForm
            isEdit
            examTypes={examTypes}
            initial={{ name: editSubject.name, examTypeId: editSubject.examTypeId ?? editSubject.examType?.id ?? '' }}
            onSubmit={handleEdit}
            onCancel={() => setEditSubject(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteSubject} onClose={() => setDeleteSubject(null)} title="Delete subject">
        {deleteSubject && (
          <DeleteConfirm
            subject={deleteSubject}
            onConfirm={handleDelete}
            onCancel={() => setDeleteSubject(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>
    </AdminShell>
  )
}