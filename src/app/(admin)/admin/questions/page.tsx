'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import { generateExplanation } from '@/lib/gemini'
import {
  FileQuestion, Plus, Search, Pencil, Trash2, X, Check,
  ChevronUp, ChevronDown, ChevronsUpDown, Minus, Sparkles,
  Image as ImageIcon, ScrollText,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────── */
interface Subject {
  id: string
  name: string
  examType?: { name: string }
}

interface Option {
  id?: string
  text: string
  isCorrect: boolean
}

interface Question {
  id: string
  text: string
  passageTitle?: string | null
  passageText?: string | null
  imageUrls?: string[] | null
  groupId?: string | null
  explanation?: string
  difficulty?: string
  subject?: Subject
  subjectId?: string
  options?: Option[]
  [key: string]: unknown
}

type SortKey = 'text' | 'subject' | 'difficulty'
type SortDir = 'asc' | 'desc'

const DIFFICULTIES = ['easy', 'medium', 'hard']

const DIFF_STYLE: Record<string, { bg: string; text: string }> = {
  easy:   { bg: '#DCFCE7', text: '#166534' },
  medium: { bg: '#FEF9C3', text: '#854D0E' },
  hard:   { bg: '#FEE2E2', text: '#991B1B' },
}

const EMPTY_OPTION: Option = { text: '', isCorrect: false }
const createQuestionDraft = () => ({
  text: '',
  explanation: '',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ] as Option[],
})
const EMPTY_FORM = {
  includePassage: false,
  includeImages: false,
  passageTitle: '',
  passageText: '',
  imageUrlsText: '',
  difficulty: 'medium',
  subjectId: '',
  questions: [createQuestionDraft()],
}

/* ─── Helpers ────────────────────────────────────────── */
function diffStyle(d?: string) {
  return DIFF_STYLE[d?.toLowerCase() ?? ''] ?? { bg: '#F1F5F9', text: '#64748B' }
}

function truncate(s: string, n = 90) {
  return s.length > n ? `${s.slice(0, n)}…` : s
}

type QuestionDraft = ReturnType<typeof createQuestionDraft>
type QuestionFormData = typeof EMPTY_FORM

function normalizeQuestionDraft(question: QuestionDraft) {
  const options = question.options
    .map((option) => ({
      id: option.id,
      text: option.text.trim(),
      isCorrect: option.isCorrect,
    }))
    .filter((option) => option.text.length > 0)

  if (!question.text.trim()) throw new Error('Enter a question')
  if (options.length < 2) throw new Error('Add at least two answer options')
  if (!options.some((option) => option.isCorrect)) throw new Error('Mark one answer option as correct')

  return {
    text: question.text.trim(),
    explanation: question.explanation.trim(),
    options,
  }
}

function prepareQuestionPayload(form: QuestionFormData) {
  if (!form.subjectId) throw new Error('Select a subject')

  const imageUrls = form.includeImages
    ? form.imageUrlsText.split('\n').map((url) => url.trim()).filter(Boolean)
    : []
  const hasSharedContext = form.includePassage || form.includeImages
  const questions = form.questions.map(normalizeQuestionDraft)

  if (hasSharedContext && !form.passageText.trim() && imageUrls.length === 0) {
    throw new Error('Add passage text or at least one image URL')
  }

  if (hasSharedContext) {
    return {
      subjectId: form.subjectId,
      difficulty: form.difficulty,
      passageTitle: form.includePassage ? form.passageTitle.trim() : '',
      passageText: form.includePassage ? form.passageText.trim() : '',
      imageUrls,
      questions,
    }
  }

  return {
    subjectId: form.subjectId,
    difficulty: form.difficulty,
    ...questions[0],
    passageTitle: form.passageTitle.trim(),
    passageText: form.passageText.trim(),
    imageUrls,
  }
}

function prepareQuestionUpdatePayload(form: QuestionFormData) {
  if (!form.subjectId) throw new Error('Select a subject')

  const imageUrls = form.includeImages
    ? form.imageUrlsText.split('\n').map((url) => url.trim()).filter(Boolean)
    : []
  const question = normalizeQuestionDraft(form.questions[0])

  if ((form.includePassage || form.includeImages) && !form.passageText.trim() && imageUrls.length === 0) {
    throw new Error('Add passage text or at least one image URL')
  }

  return {
    subjectId: form.subjectId,
    difficulty: form.difficulty,
    passageTitle: form.includePassage ? form.passageTitle.trim() : '',
    passageText: form.includePassage ? form.passageText.trim() : '',
    imageUrls,
    ...question,
  }
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

/* ─── Question Form ──────────────────────────────────── */
function QuestionForm({ initial, subjects, onSubmit, onCancel, isEdit, loading, error }: {
  initial?: QuestionFormData
  subjects: Subject[]
  onSubmit: (data: QuestionFormData) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
  loading: boolean
  error: string
}) {
  const [form, setForm] = useState<QuestionFormData>(initial ?? EMPTY_FORM)
  const [explainLoading, setExplainLoading] = useState(false)
  const [explainError, setExplainError] = useState('')

  const setField = (k: string, v: unknown) => setForm((p) => ({ ...p, [k]: v }))

  const setQuestion = (questionIndex: number, patch: Partial<QuestionDraft>) =>
    setForm((p) => ({
      ...p,
      questions: p.questions.map((question, idx) =>
        idx === questionIndex ? { ...question, ...patch } : question
      ),
    }))

  const setOption = (questionIndex: number, optionIndex: number, k: keyof Option, v: unknown) =>
    setForm((p) => ({
      ...p,
      questions: p.questions.map((question, qIdx) =>
        qIdx === questionIndex
          ? {
              ...question,
              options: question.options.map((option, oIdx) =>
                oIdx === optionIndex
                  ? { ...option, [k]: v }
                  : k === 'isCorrect' && v
                    ? { ...option, isCorrect: false }
                    : option
              ),
            }
          : question
      ),
    }))

  const addOption = (questionIndex: number) =>
    setForm((p) => ({
      ...p,
      questions: p.questions.map((question, idx) =>
        idx === questionIndex ? { ...question, options: [...question.options, { ...EMPTY_OPTION }] } : question
      ),
    }))

  const removeOption = (questionIndex: number, optionIndex: number) =>
    setForm((p) => ({
      ...p,
      questions: p.questions.map((question, idx) =>
        idx === questionIndex
          ? { ...question, options: question.options.filter((_, oIdx) => oIdx !== optionIndex) }
          : question
      ),
    }))

  const addQuestion = () =>
    setForm((p) => ({ ...p, questions: [...p.questions, createQuestionDraft()] }))

  const removeQuestion = (questionIndex: number) =>
    setForm((p) => ({ ...p, questions: p.questions.filter((_, idx) => idx !== questionIndex) }))

  const handleAutoExplain = async (questionIndex: number) => {
    setExplainError('')
    const question = form.questions[questionIndex]
    if (!question.text.trim()) {
      setExplainError('Enter a question first')
      return
    }
    const correctOption = question.options.find(o => o.isCorrect)
    if (!correctOption) {
      setExplainError('Mark the correct answer first')
      return
    }
    if (!correctOption.text.trim()) {
      setExplainError('Correct answer text is empty')
      return
    }

    setExplainLoading(true)
    try {
      const explanation = await generateExplanation(question.text, correctOption.text)
      setQuestion(questionIndex, { explanation })
    } catch (e: unknown) {
      setExplainError((e as Error)?.message ?? 'Failed to generate explanation')
    } finally {
      setExplainLoading(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

  const hasSharedContext = form.includePassage || form.includeImages
  const validQuestions = form.questions.every((question) => {
    const filledOptions = question.options.filter((o) => o.text.trim()).length
    const hasCorrect = question.options.some((o) => o.isCorrect && o.text.trim())
    return question.text.trim() && filledOptions >= 2 && hasCorrect
  })
  const canSubmit = form.subjectId && validQuestions && (!hasSharedContext || form.passageText.trim() || form.imageUrlsText.trim())

  const renderQuestionEditor = (question: QuestionDraft, index: number) => {
    const filledOptions = question.options.filter((o) => o.text.trim()).length
    const hasCorrect = question.options.some((o) => o.isCorrect && o.text.trim())

    return (
      <div key={index} className={hasSharedContext ? 'rounded-xl border border-gray-100 bg-white p-4 space-y-4' : 'space-y-5'}>
        {hasSharedContext && (
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Question {index + 1}</p>
            {form.questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Question text</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={question.text}
            onChange={(e) => setQuestion(index, { text: e.target.value })}
            placeholder="Type the question here..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-500">Answer options</label>
            <span className="text-xs text-gray-400">Click the circle to mark the correct answer</span>
          </div>
          <div className="space-y-2">
            {question.options.map((opt, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOption(index, optionIndex, 'isCorrect', true)}
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    opt.isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-emerald-400'
                  }`}
                >
                  {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                </button>
                <input
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    opt.isCorrect
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900 focus:ring-emerald-300'
                      : 'border-gray-200 text-gray-900 focus:ring-blue-500'
                  }`}
                  value={opt.text}
                  onChange={(e) => setOption(index, optionIndex, 'text', e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                />
                {question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index, optionIndex)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {question.options.length < 6 && (
            <button
              type="button"
              onClick={() => addOption(index)}
              className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add option
            </button>
          )}
          {filledOptions > 0 && !hasCorrect && (
            <p className="text-xs text-amber-600 mt-1">Mark one filled option as the correct answer.</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="block text-xs font-medium text-gray-500">Explanation <span className="text-gray-300 font-normal">(optional)</span></label>
            <button
              type="button"
              onClick={() => handleAutoExplain(index)}
              disabled={explainLoading}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
              title="Generate explanation using AI"
            >
              {explainLoading ? (
                <span className="w-3 h-3 border-1.5 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              Auto-explain
            </button>
          </div>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            value={question.explanation}
            onChange={(e) => setQuestion(index, { explanation: e.target.value })}
            placeholder="Explain why the correct answer is right..."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
      {explainError && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{explainError}</p>}

      {/* Subject + Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
          <select className={inputCls} value={form.subjectId} onChange={(e) => setField('subjectId', e.target.value)}>
            <option value="">— Select subject —</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} {s.examType ? `(${s.examType.name})` : ''}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Difficulty</label>
          <div className="flex gap-1.5">
            {DIFFICULTIES.map((d) => {
              const ds = DIFF_STYLE[d]
              const active = form.difficulty === d
              return (
                <button
                  key={d}
                  onClick={() => setField('difficulty', d)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium capitalize border transition-all"
                  style={active
                    ? { background: ds.bg, color: ds.text, borderColor: 'transparent' }
                    : { background: 'white', color: '#9CA3AF', borderColor: '#E5E7EB' }
                  }
                >
                  {d}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {!isEdit && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setField('includePassage', !form.includePassage)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              form.includePassage
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            {form.includePassage ? 'Remove passage' : 'Add passage'}
          </button>
          <button
            type="button"
            onClick={() => setField('includeImages', !form.includeImages)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              form.includeImages
                ? 'bg-sky-50 border-sky-200 text-sky-700'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {form.includeImages ? 'Remove images' : 'Add images'}
          </button>
        </div>
      )}

      {hasSharedContext && (
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-3">
          {form.includePassage && (
            <>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <ScrollText className="w-3.5 h-3.5" />
                Shared passage
              </div>
              <input
                className={inputCls}
                value={form.passageTitle}
                onChange={(e) => setField('passageTitle', e.target.value)}
                placeholder="Passage title (optional)"
              />
              <textarea
                className={`${inputCls} resize-none`}
                rows={5}
                value={form.passageText}
                onChange={(e) => setField('passageText', e.target.value)}
                placeholder="Paste the passage students should read before answering the questions..."
              />
            </>
          )}
          {form.includeImages && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <ImageIcon className="w-3.5 h-3.5" />
                Shared images
              </div>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                value={form.imageUrlsText}
                onChange={(e) => setField('imageUrlsText', e.target.value)}
                placeholder="Add one image URL per line for diagrams, charts, maps, or source images..."
              />
            </div>
          )}
        </div>
      )}

      {renderQuestionEditor(form.questions[0], 0)}

      {hasSharedContext && (
        <div className="space-y-3">
          {form.questions.slice(1).map((question, offset) => renderQuestionEditor(question, offset + 1))}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-blue-200 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add another question under this source
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onSubmit(form)}
          disabled={loading || !canSubmit}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Check className="w-4 h-4" />}
          {isEdit ? 'Save changes' : 'Create question'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─── Delete Confirm ─────────────────────────────────── */
function DeleteConfirm({ question, onConfirm, onCancel, loading, error }: {
  question: Question; onConfirm: () => void; onCancel: () => void; loading: boolean; error: string
}) {
  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
      <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-sm font-medium text-red-900 line-clamp-3">{question.text}</p>
        {question.subject && <p className="text-xs text-red-500 mt-1">{question.subject.name}</p>}
      </div>
      <p className="text-sm text-gray-500">This will permanently delete the question and all its answer options. This cannot be undone.</p>
      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete question
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'text', dir: 'asc' })

  const [addOpen, setAddOpen] = useState(false)
  const [editQuestion, setEditQuestion] = useState<Question | null>(null)
  const [deleteQuestion, setDeleteQuestion] = useState<Question | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/questions'),
      api.get('/admin/subjects').catch(() => ({ data: [] })),
    ])
      .then(([q, s]) => { setQuestions(q.data); setSubjects(s.data) })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const toggleSort = (key: SortKey) =>
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })

  const filtered = questions
    .filter((q) => {
      const query = search.toLowerCase()
      const matchQ = q.text.toLowerCase().includes(query) || (q.subject?.name ?? '').toLowerCase().includes(query)
      const matchS = !filterSubject || q.subject?.id === filterSubject
      const matchD = !filterDiff || (q.difficulty ?? '').toLowerCase() === filterDiff
      return matchQ && matchS && matchD
    })
    .sort((a, b) => {
      let av = '', bv = ''
      if (sort.key === 'text') { av = a.text; bv = b.text }
      else if (sort.key === 'subject') { av = a.subject?.name ?? ''; bv = b.subject?.name ?? '' }
      else if (sort.key === 'difficulty') {
        const order = { easy: 0, medium: 1, hard: 2 }
        const ai = order[(a.difficulty ?? '').toLowerCase() as keyof typeof order] ?? 99
        const bi = order[(b.difficulty ?? '').toLowerCase() as keyof typeof order] ?? 99
        return sort.dir === 'asc' ? ai - bi : bi - ai
      }
      return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  /* ── Form builder from Question ── */
  function toForm(q: Question): QuestionFormData {
    return {
      includePassage: !!q.passageText,
      includeImages: Array.isArray(q.imageUrls) && q.imageUrls.length > 0,
      passageTitle: q.passageTitle ?? '',
      passageText: q.passageText ?? '',
      imageUrlsText: Array.isArray(q.imageUrls) ? q.imageUrls.join('\n') : '',
      difficulty: (q.difficulty ?? 'medium').toLowerCase(),
      subjectId: q.subjectId ?? q.subject?.id ?? '',
      questions: [{
        text: q.text,
        explanation: q.explanation ?? '',
        options: q.options?.length
          ? q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect }))
          : createQuestionDraft().options,
      }],
    }
  }

  /* ── CRUD ── */
  const handleAdd = async (form: typeof EMPTY_FORM) => {
    setModalLoading(true); setModalError('')
    try {
      const payload = prepareQuestionPayload(form)
      const { data } = await api.post('/admin/questions', payload)
      setQuestions((q) => Array.isArray(data) ? [...data, ...q] : [data, ...q])
      setAddOpen(false)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (e as Error)?.message ?? 'Failed to create question')
    } finally { setModalLoading(false) }
  }

  const handleEdit = async (form: typeof EMPTY_FORM) => {
    if (!editQuestion) return
    setModalLoading(true); setModalError('')
    try {
      const payload = prepareQuestionUpdatePayload(form)
      const endpoint = `/admin/questions/${editQuestion.id}`
      const { data } = await api.put(endpoint, payload)
      setQuestions((q) => q.map((x) => x.id === editQuestion.id ? data : x))
      setEditQuestion(null)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (e as Error)?.message ?? 'Failed to update question')
    } finally { setModalLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteQuestion) return
    setModalLoading(true); setModalError('')
    try {
      await api.delete(`/admin/questions/${deleteQuestion.id}`)
      setQuestions((q) => q.filter((x) => x.id !== deleteQuestion.id))
      setDeleteQuestion(null)
    } catch (e: unknown) {
      setModalError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete question')
    } finally { setModalLoading(false) }
  }

  const renderSortIcon = (k: SortKey) => {
    if (sort.key !== k) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 ml-1 inline" />
    return sort.dir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-gray-700 ml-1 inline" />
      : <ChevronDown className="w-3.5 h-3.5 text-gray-700 ml-1 inline" />
  }

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide select-none cursor-pointer hover:text-gray-900 transition-colors'

  const subjectOptions = Array.from(
    new Map(questions.map((q) => [q.subject?.id, q.subject] as const).filter(([id]) => id !== undefined)).values()
  ) as Subject[]

  return (
    <AdminShell title="Questions" description="">
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600">Question Bank</h1>
            <p className="text-sm text-gray-400 mt-1">{questions.length} question{questions.length !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={() => { setModalError(''); setAddOpen(true) }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add question
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {subjectOptions.length > 0 && (
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="">All subjects</option>
              {subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.name} {s.examType ? `(${s.examType.name})` : ''}</option>)}
            </select>
          )}
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
          >
            <option value="">All difficulties</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-gray-400">Loading questions…</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={thCls} onClick={() => toggleSort('text')}>
                      Question {renderSortIcon('text')}
                    </th>
                    <th className={thCls} onClick={() => toggleSort('subject')}>
                      Subject {renderSortIcon('subject')}
                    </th>
                    <th className={thCls} onClick={() => toggleSort('difficulty')}>
                      Difficulty {renderSortIcon('difficulty')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <FileQuestion className="w-8 h-8 opacity-40" />
                          <p className="text-sm">{search || filterSubject || filterDiff ? 'No questions match your filters' : 'No questions found'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((q) => {
                      const ds = diffStyle(q.difficulty)
                      return (
                        <tr key={q.id} className="hover:bg-gray-50/60 transition-colors group">
                          <td className="px-4 py-3 max-w-xs">
                            <p className="text-gray-900 font-medium leading-snug">{truncate(q.text)}</p>
                            {(q.passageText || (q.imageUrls?.length ?? 0) > 0) && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {q.passageText && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[11px] font-medium">
                                    <ScrollText className="w-3 h-3" /> Passage
                                  </span>
                                )}
                                {(q.imageUrls?.length ?? 0) > 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[11px] font-medium">
                                    <ImageIcon className="w-3 h-3" /> {q.imageUrls?.length} image{q.imageUrls?.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            )}
                            {q.options && q.options.length > 0 && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {q.options.length} option{q.options.length !== 1 ? 's' : ''}
                                {' · '}
                                <span className="text-emerald-600">
                                  {q.options.find((o) => o.isCorrect)?.text
                                    ? truncate(q.options.find((o) => o.isCorrect)!.text, 40)
                                    : 'no answer set'}
                                </span>
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {q.subject
                              ? <span className="text-sm text-gray-600">{q.subject.name}</span>
                              : <span className="text-gray-300 text-xs italic">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {q.difficulty ? (
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                                style={{ background: ds.bg, color: ds.text }}
                              >
                                {q.difficulty}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs italic">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => { setModalError(''); setEditQuestion(q) }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => { setModalError(''); setDeleteQuestion(q) }}
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
                  Showing {filtered.length} of {questions.length} question{questions.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add new question" wide>
        <QuestionForm
          subjects={subjects}
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          loading={modalLoading}
          error={modalError}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editQuestion} onClose={() => setEditQuestion(null)} title="Edit question" wide>
        {editQuestion && (
          <QuestionForm
            key={editQuestion.id}
            isEdit
            subjects={subjects}
            initial={toForm(editQuestion)}
            onSubmit={handleEdit}
            onCancel={() => setEditQuestion(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteQuestion} onClose={() => setDeleteQuestion(null)} title="Delete question">
        {deleteQuestion && (
          <DeleteConfirm
            question={deleteQuestion}
            onConfirm={handleDelete}
            onCancel={() => setDeleteQuestion(null)}
            loading={modalLoading}
            error={modalError}
          />
        )}
      </Modal>
    </AdminShell>
  )
}
