'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { StudentShell } from '@/components/shared/StudentShell'
import api from '@/lib/api'
import { formatDate, calculatePercentage, getGradeLabel } from '@/lib/utils'
import {
  CheckCircle2, XCircle, MinusCircle, Clock, Zap,
  ChevronDown, ChevronUp, BookOpen, TrendingUp,
  ChevronLeft,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────── */
interface QuestionResult {
  id: string
  text: string
  options: Array<{ id: string; text: string }>
  selectedOption: string | null
  correctOption: string
  explanation: string
}

interface ResultData {
  id: string
  examType: string
  subject: string
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unanswered: number
  completedAt: string
  timeTaken: number
  questions: QuestionResult[]
}

/* ─── Helpers ────────────────────────────────────────── */
function gradeStyle(pct: number) {
  if (pct >= 75) return { color: '#15803D', bg: '#DCFCE7', label: 'Excellent', strip: '#22C55E' }
  if (pct >= 60) return { color: '#1D4ED8', bg: '#EFF6FF', label: 'Good',      strip: '#3B82F6' }
  if (pct >= 50) return { color: '#B45309', bg: '#FEF3C7', label: 'Average',   strip: '#F59E0B' }
  return            { color: '#B91C1C', bg: '#FEE2E2', label: 'Below pass',  strip: '#EF4444' }
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

/* ─── Score ring ─────────────────────────────────────── */
function ScoreRing({ pct, size = 120 }: { pct: number; size?: number }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const fill = Math.min(pct / 100, 1) * circ
  const { color } = gradeStyle(pct)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth="8" />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
      />
    </svg>
  )
}

/* ─── Stat box ───────────────────────────────────────── */
function StatBox({ value, label, bg, color }: { value: string | number; label: string; bg: string; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-4 rounded-2xl border border-gray-100" style={{ background: bg }}>
      <p className="text-2xl font-bold tabular-nums" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

/* ─── Question status ────────────────────────────────── */
function qStatus(q: QuestionResult) {
  if (q.selectedOption === q.correctOption) return 'correct'
  if (q.selectedOption) return 'wrong'
  return 'skipped'
}

/* ─── Main Page ──────────────────────────────────────── */
export default function ResultsPage() {
  const params = useParams()
  const resultId = params.resultId as string
  const [result, setResult] = useState<ResultData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [openQ, setOpenQ] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all')

  useEffect(() => {
    if (!resultId) return
    api.get(`/results/${resultId}`)
      .then((r) => setResult(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [resultId])

  if (isLoading) {
    return (
      <StudentShell title="Results">
        <div className="flex items-center justify-center h-60">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
            <p className="text-sm text-gray-400">Loading results…</p>
          </div>
        </div>
      </StudentShell>
    )
  }

  if (!result) {
    return (
      <StudentShell title="Results">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
          <TrendingUp className="w-10 h-10 opacity-40" />
          <p className="text-sm">Result not found</p>
          <Link href="/results" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to results
          </Link>
        </div>
      </StudentShell>
    )
  }

  const pct = calculatePercentage(result.score, result.totalQuestions)
  const gs = gradeStyle(pct)

  const filteredQs = result.questions.filter((q) => {
    if (filter === 'all') return true
    return qStatus(q) === filter
  })

  const filterCounts = {
    all:     result.questions.length,
    correct: result.correctAnswers,
    wrong:   result.wrongAnswers,
    skipped: result.unanswered,
  }

  return (
    <StudentShell
      title="Results"
      headerAction={
        <Link
          href="/exams"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" /> New exam
        </Link>
      }
    >
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
          <Link
            href="/results"
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
              {result.examType}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-blue-700 leading-tight">{result.subject}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(result.completedAt)}</p>
          </div>
        </div>

        {/* ── Score summary card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: gs.strip }} />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">

              {/* Ring */}
              <div className="relative shrink-0">
                <ScoreRing pct={pct} size={120} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: gs.color }}>{pct}%</span>
                  <span className="text-xs text-gray-400">Score</span>
                </div>
              </div>

              {/* Grade + summary */}
              <div className="flex-1 text-center sm:text-left">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mb-2"
                  style={{ background: gs.bg, color: gs.color }}
                >
                  {gs.label}
                </span>
                <p className="text-gray-600 text-sm">
                  You answered <span className="font-semibold text-gray-900">{result.correctAnswers}</span> of{' '}
                  <span className="font-semibold text-gray-900">{result.totalQuestions}</span> questions correctly.
                </p>
                {result.unanswered > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{result.unanswered} question{result.unanswered !== 1 ? 's' : ''} left unanswered.</p>
                )}
              </div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <StatBox value={result.correctAnswers} label="Correct"   bg="#F0FDF4" color="#15803D" />
              <StatBox value={result.wrongAnswers}   label="Wrong"     bg="#FEF2F2" color="#B91C1C" />
              <StatBox value={result.unanswered}     label="Skipped"   bg="#F8FAFC" color="#64748B" />
              <StatBox value={formatTime(result.timeTaken)} label="Time taken" bg="#EFF6FF" color="#1D4ED8" />
            </div>
          </div>
        </div>

        {/* ── Answer review ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-900">Answer review</p>
              <p className="text-xs text-gray-400">Click a question to see details and explanations</p>
            </div>
            {/* Filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'correct', 'wrong', 'skipped'] as const).map((f) => {
                const style = f === 'correct' ? { active: '#DCFCE7', color: '#15803D' }
                            : f === 'wrong'   ? { active: '#FEE2E2', color: '#B91C1C' }
                            : f === 'skipped' ? { active: '#F1F5F9', color: '#64748B' }
                            :                   { active: '#111827', color: 'white' }
                const isActive = filter === f
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all capitalize"
                    style={isActive
                      ? f === 'all'
                        ? { background: '#111827', color: 'white', borderColor: 'transparent' }
                        : { background: style.active, color: style.color, borderColor: 'transparent' }
                      : { background: 'white', color: '#9CA3AF', borderColor: '#E5E7EB' }}
                  >
                    {f} ({filterCounts[f]})
                  </button>
                )
              })}
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredQs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                <BookOpen className="w-7 h-7 opacity-40" />
                <p className="text-sm">No questions in this category</p>
              </div>
            ) : (
              filteredQs.map((q, i) => {
                const status  = qStatus(q)
                const isOpen  = openQ === q.id
                const qIndex  = result.questions.indexOf(q)

                const statusCfg = {
                  correct: { icon: CheckCircle2, color: '#15803D', bg: '#F0FDF4', label: 'Correct' },
                  wrong:   { icon: XCircle,      color: '#B91C1C', bg: '#FEF2F2', label: 'Wrong' },
                  skipped: { icon: MinusCircle,  color: '#64748B', bg: '#F8FAFC', label: 'Skipped' },
                }[status]
                const StatusIcon = statusCfg.icon

                return (
                  <div key={q.id}>
                    {/* Question row */}
                    <button
                      onClick={() => setOpenQ(isOpen ? null : q.id)}
                      className="w-full flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors text-left"
                    >
                      {/* Status indicator */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: statusCfg.bg }}
                      >
                        <StatusIcon className="w-4 h-4" style={{ color: statusCfg.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">Q{qIndex + 1}</p>
                        <p className="text-sm text-gray-800 leading-snug line-clamp-2">{q.text}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: statusCfg.bg, color: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </span>
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="px-5 pb-5 pl-16 space-y-3">
                        {/* Full question text */}
                        <p className="text-sm text-gray-700 font-medium">{q.text}</p>

                        {/* Options */}
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => {
                            const isCorrect  = opt.id === q.correctOption
                            const isSelected = opt.id === q.selectedOption
                            const isWrong    = isSelected && !isCorrect

                            let style = { bg: '#F8FAFC', border: '#E5E7EB', text: '#374151' }
                            if (isCorrect)      style = { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' }
                            else if (isWrong)   style = { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' }

                            return (
                              <div
                                key={opt.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm"
                                style={{ background: style.bg, borderColor: style.border, color: style.text }}
                              >
                                <span
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                  style={isCorrect
                                    ? { background: '#BBF7D0', color: '#15803D' }
                                    : isWrong
                                    ? { background: '#FECACA', color: '#B91C1C' }
                                    : { background: '#E5E7EB', color: '#6B7280' }}
                                >
                                  {LABELS[oi]}
                                </span>
                                <span className="flex-1">{opt.text}</span>
                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                                {isWrong   && <XCircle      className="w-4 h-4 text-red-400    shrink-0" />}
                              </div>
                            )
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                            <BookOpen className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-blue-700 mb-1">Explanation</p>
                              <p className="text-sm text-blue-800 leading-relaxed">{q.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Back / retake */}
        <div className="flex items-center justify-between">
          <Link
            href="/results"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> All results
          </Link>
          <Link
            href="/exams"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-4 h-4" /> Take another exam
          </Link>
        </div>
      </div>
    </StudentShell>
  )
}