'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import { generatePractical, generateLabImage } from '@/lib/gemini'
import {
  Beaker, Plus, Search, Pencil, Trash2, X, Check,
  ChevronUp, ChevronDown, ChevronsUpDown, Minus, GripVertical,
  Crown, FlaskConical, ListOrdered, Sparkles,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */
interface Subject {
  id: string
  name: string
  examType?: { name: string }
}

interface Step {
  id?: string
  order: number
  instruction: string
  observation?: string | null
  calculation?: string | null
  commonMistakes?: string | null
}

interface Practical {
  id: string
  title: string
  description?: string
  objective?: string | null
  apparatus?: string | null
  safety?: string | null
  subject?: Subject
  subjectId?: string
  isPremium: boolean
  aiGenerated?: boolean
  imageUrl?: string | null
  _count?: { steps?: number }
  steps?: Step[]
  [key: string]: unknown
}

type SortKey = 'title' | 'subject' | 'steps' | 'isPremium'
type SortDir = 'asc' | 'desc'

const EMPTY_STEP = (): Step => ({ order: 0, instruction: '', observation: null, calculation: null, commonMistakes: null })
const EMPTY_FORM = {
  title: '',
  description: '',
  objective: null as string | null,
  apparatus: null as string | null,
  safety: null as string | null,
  subjectId: '',
  isPremium: false,
  aiGenerated: false,
  imageUrl: null as string | null,
  steps: [{ order: 1, instruction: '', observation: null, calculation: null, commonMistakes: null }] as Step[],
}

/* ─── Modal ──────────────────────────────────────────── */
function Modal({ open, onClose, title, wide, children }: {
  open: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode
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
        className={`w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${wide ? 'max-w-2xl' : 'max-w-md'}`}
        style={{ maxHeight: '90vh', animation: 'modalIn 0.18s ease' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(10px) scale(0.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

/* ─── Practical Form ─────────────────────────────────── */
function PracticalForm({ initial, subjects, onSubmit, onCancel, isEdit, loading, error }: {
  initial?: typeof EMPTY_FORM
  subjects: Subject[]
  onSubmit: (data: typeof EMPTY_FORM) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
  loading: boolean
  error: string
}) {
  const [form, setForm] = useState<typeof EMPTY_FORM>(initial ?? EMPTY_FORM)
  const [topic, setTopic] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiGenerated, setAiGenerated] = useState(false)

  const setField = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }))

  const setStep = (i: number, key: string, val: string) =>
    setForm((p) => ({
      ...p,
      steps: p.steps.map((s, idx) => idx === i ? { ...s, [key]: val } : s),
    }))

  const addStep = () =>
    setForm((p) => ({
      ...p,
      steps: [...p.steps, { order: p.steps.length + 1, instruction: '', observation: null, calculation: null, commonMistakes: null }],
    }))

  const removeStep = (i: number) =>
    setForm((p) => ({
      ...p,
      steps: p.steps
        .filter((_, idx) => idx !== i)
        .map((s, idx) => ({ ...s, order: idx + 1 })),
    }))

  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= form.steps.length) return
    setForm((p) => {
      const steps = [...p.steps]
      ;[steps[i], steps[j]] = [steps[j], steps[i]]
      return { ...p, steps: steps.map((s, idx) => ({ ...s, order: idx + 1 })) }
    })
  }

  const handleAIGenerate = async () => {
    setAiError('')
    if (!form.subjectId) {
      setAiError('Please select a subject first')
      return
    }
    if (!topic.trim()) {
      setAiError('Please enter a topic')
      return
    }
    
    setAiLoading(true)
    try {
      const subject = subjects.find(s => s.id === form.subjectId)
      if (!subject) throw new Error('Subject not found')
      
      const result = await generatePractical(subject.name, topic)
      const imageUrl = generateLabImage(result.title, subject.name)
      
      setForm(p => ({
        ...p,
        title: result.title,
        description: result.description,
        objective: result.objective,
        apparatus: result.apparatus,
        safety: result.safety,
        aiGenerated: true,
        imageUrl,
        steps: result.steps.map((s, idx) => ({
          order: idx + 1,
          instruction: s.instruction,
          observation: s.observation || null,
          calculation: s.calculation || null,
          commonMistakes: s.commonMistakes || null,
        })),
      }))
      setAiGenerated(true)
      setTopic('')
    } catch (e: unknown) {
      setAiError((e as Error)?.message ?? 'Failed to generate practical')
    } finally {
      setAiLoading(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition'

  return (
    <div className="space-y-5">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
      {aiError && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{aiError}</p>}
      {aiGenerated && <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">✓ AI generated — review before saving</p>}

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
        Enter a topic, select the subject, and click Generate to fill title, description, objective, apparatus, safety, and procedure steps automatically.
      </div>

      {/* Topic + AI Generate */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Topic <span className="text-gray-300 font-normal">(for AI generation)</span></label>
        <div className="flex gap-2">
          <input
            className={inputCls}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Acid-base titration using burette"
          />
          <button
            onClick={handleAIGenerate}
            disabled={aiLoading || !form.subjectId}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0 whitespace-nowrap"
            title={!form.subjectId ? 'Select subject first' : 'Generate using AI'}
          >
            {aiLoading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {aiLoading ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
        <input
          className={inputCls}
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder="e.g. Titration of Hydrochloric Acid"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Description <span className="text-gray-300 font-normal">(optional)</span>
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={2}
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Brief overview of what this practical covers…"
        />
      </div>

      {/* Objective, Apparatus, Safety */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Objective <span className="text-gray-300 font-normal">(optional)</span></label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            value={form.objective || ''}
            onChange={(e) => setField('objective', e.target.value || null)}
            placeholder="What students should learn from this practical…"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Apparatus <span className="text-gray-300 font-normal">(optional)</span></label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            value={form.apparatus || ''}
            onChange={(e) => setField('apparatus', e.target.value || null)}
            placeholder="Equipment and materials needed…"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Safety <span className="text-gray-300 font-normal">(optional)</span></label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            value={form.safety || ''}
            onChange={(e) => setField('safety', e.target.value || null)}
            placeholder="Safety precautions and warnings…"
          />
        </div>
      </div>

      {/* Subject + Premium */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
          <select className={inputCls} value={form.subjectId} onChange={(e) => setField('subjectId', e.target.value)}>
            <option value="">— Select subject —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}{s.examType ? ` (${s.examType.name})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Access</label>
          <div className="flex gap-1.5">
            <button
              onClick={() => setField('isPremium', false)}
              className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
              style={!form.isPremium
                ? { background: '#E0F2FE', color: '#0369A1', borderColor: 'transparent' }
                : { background: 'white', color: '#9CA3AF', borderColor: '#E5E7EB' }}
            >
              Free
            </button>
            <button
              onClick={() => setField('isPremium', true)}
              className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all inline-flex items-center justify-center gap-1"
              style={form.isPremium
                ? { background: '#FEF9C3', color: '#854D0E', borderColor: 'transparent' }
                : { background: 'white', color: '#9CA3AF', borderColor: '#E5E7EB' }}
            >
              <Crown className="w-3 h-3" /> Premium
            </button>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500">
            Procedure steps
            <span className="ml-1.5 text-gray-300 font-normal">({form.steps.length})</span>
          </label>
          <span className="text-xs text-gray-400">Steps will be shown in order</span>
        </div>
        <div className="space-y-3">
          {form.steps.map((step, i) => (
            <div key={i}>
              <div className="flex items-start gap-2 mb-2">
                {/* Step number */}
                <div className="w-6 h-9 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-gray-400 tabular-nums">{i + 1}</span>
                </div>
                {/* Move buttons */}
                <div className="flex flex-col gap-0.5 shrink-0 pt-1">
                  <button
                    onClick={() => moveStep(i, -1)}
                    disabled={i === 0}
                    className="w-5 h-4 rounded flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveStep(i, 1)}
                    disabled={i === form.steps.length - 1}
                    className="w-5 h-4 rounded flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                {/* Instruction */}
                <textarea
                  className={`flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none`}
                  rows={2}
                  value={step.instruction}
                  onChange={(e) => setStep(i, 'instruction', e.target.value)}
                  placeholder={`Step ${i + 1} instruction…`}
                />
                {form.steps.length > 1 && (
                  <button
                    onClick={() => removeStep(i)}
                    className="w-7 h-7 mt-1 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Observation, Calculation, Common Mistakes */}
              <div className="ml-8 grid grid-cols-1 gap-2">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={1}
                  value={step.observation || ''}
                  onChange={(e) => setStep(i, 'observation', e.target.value)}
                  placeholder="Observation…"
                />
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={1}
                  value={step.calculation || ''}
                  onChange={(e) => setStep(i, 'calculation', e.target.value)}
                  placeholder="Calculation…"
                />
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={1}
                  value={step.commonMistakes || ''}
                  onChange={(e) => setStep(i, 'commonMistakes', e.target.value)}
                  placeholder="Common mistakes…"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addStep}
          className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add step
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSubmit(form)}
          disabled={loading || !form.title.trim()}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Check className="w-4 h-4" />}
          {isEdit ? 'Save changes' : 'Create practical'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─── Delete Confirm ─────────────────────────────────── */
function DeleteConfirm({ practical, onConfirm, onCancel, loading, error }: {
  practical: Practical; onConfirm: () => void; onCancel: () => void; loading: boolean; error: string
}) {
  const steps = practical._count?.steps ?? practical.steps?.length ?? 0
  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
          <Trash2 className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-red-900">{practical.title}</p>
          <p className="text-xs text-red-500 mt-0.5">
            {practical.subject?.name && <>{practical.subject.name} · </>}
            {steps} step{steps !== 1 ? 's' : ''}
            {practical.isPremium && ' · Premium'}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-500">
        This will permanently delete <span className="font-medium text-gray-700">{practical.title}</span> and all its procedure steps. This cannot be undone.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete practical
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function AdminPracticalsPage() {
  const [practicals, setPracticals] = useState<Practical[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterPremium, setFilterPremium] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'title', dir: 'asc' })

  const [addOpen, setAddOpen] = useState(false)
  const [editPractical, setEditPractical] = useState<Practical | null>(null)
  const [deletePractical, setDeletePractical] = useState<Practical | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/practicals'),
      api.get('/admin/subjects').catch(() => ({ data: [] })),
    ])
      .then(([p, s]) => { setPracticals(p.data); setSubjects(s.data) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const toggleSort = (key: SortKey) =>
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })

  const filtered = practicals
    .filter((p) => {
      const q = search.toLowerCase()
      const matchQ = p.title.toLowerCase().includes(q) || (p.subject?.name ?? '').toLowerCase().includes(q)
      const matchS = !filterSubject || p.subject?.id === filterSubject
      const matchP = !filterPremium || String(p.isPremium) === filterPremium
      return matchQ && matchS && matchP
    })
    .sort((a, b) => {
      let cmp = 0
      if (sort.key === 'title') cmp = a.title.localeCompare(b.title)
      else if (sort.key === 'subject') cmp = (a.subject?.name ?? '').localeCompare(b.subject?.name ?? '')
      else if (sort.key === 'steps') cmp = (a._count?.steps ?? 0) - (b._count?.steps ?? 0)
      else if (sort.key === 'isPremium') cmp = Number(a.isPremium) - Number(b.isPremium)
      return sort.dir === 'asc' ? cmp : -cmp
    })

  /* ── Form builder ── */
  function toForm(p: Practical): typeof EMPTY_FORM {
    return {
      title: p.title,
      description: p.description ?? '',
      objective: p.objective ?? null,
      apparatus: p.apparatus ?? null,
      safety: p.safety ?? null,
      subjectId: p.subjectId ?? p.subject?.id ?? '',
      isPremium: p.isPremium,
      aiGenerated: p.aiGenerated ?? false,
      imageUrl: p.imageUrl ?? null,
      steps: p.steps?.length
        ? [...p.steps].sort((a, b) => a.order - b.order).map((s) => ({ 
            id: s.id, 
            order: s.order, 
            instruction: s.instruction,
            observation: s.observation ?? null,
            calculation: s.calculation ?? null,
            commonMistakes: s.commonMistakes ?? null,
          }))
        : [{ order: 1, instruction: '', observation: null, calculation: null, commonMistakes: null }],
    }
  }

  /* ── CRUD ── */
  const handleAdd = async (form: typeof EMPTY_FORM) => {
    setModalLoading(true); setModalError('')
    try {
      const { data } = await api.post('/admin/practicals', form)
      setPracticals((p) => [data, ...p])
      setAddOpen(false)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create practical')
    } finally { setModalLoading(false) }
  }

  const handleEdit = async (form: typeof EMPTY_FORM) => {
    if (!editPractical) return
    setModalLoading(true); setModalError('')
    try {
      const { data } = await api.patch(`/admin/practicals/${editPractical.id}`, form)
      setPracticals((p) => p.map((x) => x.id === editPractical.id ? data : x))
      setEditPractical(null)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update practical')
    } finally { setModalLoading(false) }
  }

  const handleDelete = async () => {
    if (!deletePractical) return
    setModalLoading(true); setModalError('')
    try {
      await api.delete(`/admin/practicals/${deletePractical.id}`)
      setPracticals((p) => p.filter((x) => x.id !== deletePractical.id))
      setDeletePractical(null)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete practical')
    } finally { setModalLoading(false) }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sort.key !== k) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 ml-1 inline" />
    return sort.dir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-gray-700 ml-1 inline" />
      : <ChevronDown className="w-3.5 h-3.5 text-gray-700 ml-1 inline" />
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide select-none cursor-pointer hover:text-gray-900 transition-colors'

  const subjectOptions = Array.from(
    new Map(practicals.map((p) => [p.subject?.id, p.subject] as const).filter(([id]) => id)).values()
  ) as Subject[]

  return (
    <AdminShell title="Practicals" description="">
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600">Practicals</h1>
            <p className="text-sm text-gray-400 mt-1">{practicals.length} practical{practicals.length !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={() => { setModalError(''); setAddOpen(true) }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add practical
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              placeholder="Search practicals…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {subjectOptions.length > 0 && (
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="">All subjects</option>
              {subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.name} {s.examType ? `(${s.examType.name})` : ''}</option>)}
            </select>
          )}
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition"
            value={filterPremium}
            onChange={(e) => setFilterPremium(e.target.value)}
          >
            <option value="">All access</option>
            <option value="false">Free</option>
            <option value="true">Premium</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
              <p className="text-sm text-gray-400">Loading practicals…</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={thCls} onClick={() => toggleSort('title')}>
                      Practical <SortIcon k="title" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('subject')}>
                      Subject <SortIcon k="subject" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('steps')}>
                      Steps <SortIcon k="steps" />
                    </th>
                    <th className={thCls} onClick={() => toggleSort('isPremium')}>
                      Access <SortIcon k="isPremium" />
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <FlaskConical className="w-8 h-8 opacity-40" />
                          <p className="text-sm">{search || filterSubject || filterPremium ? 'No practicals match your filters' : 'No practicals found'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((p) => {
                      const steps = p._count?.steps ?? p.steps?.length ?? 0
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/60 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                                <Beaker className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{p.title}</p>
                                {p.description && (
                                  <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{p.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                          {p.subject ? (
                            <span className="text-sm text-gray-600">
                              {p.subject.name}{p.subject.examType ? ` (${p.subject.examType.name})` : ''}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs italic">—</span>
                          )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <ListOrdered className="w-3.5 h-3.5 text-gray-300" />
                              <span className="font-medium text-gray-700 tabular-nums">{steps}</span>
                              <span>step{steps !== 1 ? 's' : ''}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {p.isPremium ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                <Crown className="w-3 h-3" /> Premium
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-600">
                                Free
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setModalError(''); setEditPractical(p) }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { setModalError(''); setDeletePractical(p) }}
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
                  Showing {filtered.length} of {practicals.length} practical{practicals.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add new practical" wide>
        <PracticalForm
          subjects={subjects}
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={modalLoading}
          error={modalError}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editPractical} onClose={() => setEditPractical(null)} title="Edit practical" wide>
        {editPractical && (
          <PracticalForm
            isEdit
            subjects={subjects}
            initial={toForm(editPractical)}
            onSubmit={handleEdit}
            onCancel={() => setEditPractical(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deletePractical} onClose={() => setDeletePractical(null)} title="Delete practical">
        {deletePractical && (
          <DeleteConfirm
            practical={deletePractical}
            onConfirm={handleDelete}
            onCancel={() => setDeletePractical(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>
    </AdminShell>
  )
}