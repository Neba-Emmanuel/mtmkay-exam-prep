'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { StudentShell } from '@/components/shared/StudentShell'
import {
  ChevronLeft, ChevronRight, Eye, Calculator,
  AlertTriangle, FlaskConical, Shield, Wrench,
  CheckCircle2, Circle, BookOpen,
} from 'lucide-react'
import api from '@/lib/api'

/* ─── Types ──────────────────────────────────────────── */
interface PracticalStep {
  id: string
  orderIndex: number
  title: string
  description: string
  observation: string | null
  calculation: string | null
  commonMistakes: string | null
  media: { type: string; url: string; caption: string | null } | null
}

interface PracticalDetail {
  id: string
  title: string
  subject: string
  objective: string | null
  apparatus: string | null
  safety: string | null
  imageUrl?: string | null
  aiGenerated?: boolean
  steps: PracticalStep[]
  questions: Array<{
    id: string
    question: string
    answer: string
    explanation: string | null
  }>
}

/* ─── Subject color ──────────────────────────────────── */
const SUBJECT_STYLE: Record<string, { bg: string; text: string; strip: string }> = {
  Physics:   { bg: '#EFF6FF', text: '#1D4ED8', strip: '#3B82F6' },
  Chemistry: { bg: '#F0FDF4', text: '#15803D', strip: '#22C55E' },
  Biology:   { bg: '#FDF4FF', text: '#7E22CE', strip: '#A855F7' },
}
function subjectStyle(s: string) {
  return SUBJECT_STYLE[s] ?? { bg: '#F1F5F9', text: '#475569', strip: '#94A3B8' }
}

/* ─── Info box ───────────────────────────────────────── */
function InfoBox({ icon: Icon, title, content, style }: {
  icon: React.ElementType
  title: string
  content: string
  style: { bg: string; border: string; titleColor: string; textColor: string; iconColor: string }
}) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: style.bg, borderColor: style.border }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 shrink-0" style={{ color: style.iconColor }} />
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: style.titleColor }}>{title}</p>
      </div>
      <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: style.textColor }}>{content}</p>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function PracticalDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [practical, setPractical] = useState<PracticalDetail | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!id) return
    api.get(`/practicals/${id}`)
      .then((r) => setPractical(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <StudentShell title="Practical">
        <div className="flex items-center justify-center h-60">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
            <p className="text-sm text-gray-400">Loading practical…</p>
          </div>
        </div>
      </StudentShell>
    )
  }

  if (!practical) {
    return (
      <StudentShell title="Practical">
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
          <FlaskConical className="w-10 h-10 opacity-40" />
          <p className="text-sm">Practical not found.</p>
          <Link
            href="/practicals"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to practicals
          </Link>
        </div>
      </StudentShell>
    )
  }

  const ss = subjectStyle(practical.subject)
  const step = practical.steps[activeStep]
  const totalSteps = practical.steps.length
  const progress = totalSteps > 0 ? ((activeStep + 1) / totalSteps) * 100 : 0
  const isFirst = activeStep === 0
  const isLast = activeStep >= totalSteps - 1

  const toggleAnswer = (qid: string) =>
    setRevealedAnswers((prev) => {
      const next = new Set(prev)
      next.has(qid) ? next.delete(qid) : next.add(qid)
      return next
    })

  return (
    <StudentShell
      title={practical.title}
      headerAction={
        <Link
          href="/practicals"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Practicals
        </Link>
      }
    >
      <div className="space-y-6 pb-12">

        {/* Title strip */}
        <div className="border-b border-gray-100 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: ss.bg, color: ss.text }}
            >
              {practical.subject}
            </span>
            <span className="text-xs text-gray-400">{totalSteps} steps</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{practical.title}</h1>
          {practical.objective && (
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">{practical.objective}</p>
          )}
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">

          {/* ── Left: step reader ── */}
          <div className="space-y-4">

            {/* AI-generated lab setup image */}
            {practical.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img
                  src={practical.imageUrl}
                  alt={`${practical.title} lab setup`}
                  className="w-full max-h-72 object-contain bg-white p-4"
                />
                <p className="text-xs text-gray-400 px-4 py-2 bg-gray-50">AI-generated lab setup diagram</p>
              </div>
            )}

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>Step <span className="font-semibold text-gray-700">{activeStep + 1}</span> of {totalSteps}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: ss.strip }}
                />
              </div>
            </div>

            {/* Step card */}
            {step && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Colored strip */}
                <div className="h-1 w-full" style={{ background: ss.strip }} />

                <div className="p-6 sm:p-8 space-y-5">
                  {/* Step heading */}
                  <div className="flex items-start gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                      style={{ background: ss.bg, color: ss.text }}
                    >
                      {step.orderIndex}
                    </span>
                    <h2 className="text-lg font-bold text-gray-900 leading-snug">{step.title}</h2>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                    {step.description}
                  </p>

                  {/* Media */}
                  {step.media?.url && (
                    <div className="rounded-xl overflow-hidden border border-gray-100">
                      <img
                        src={step.media.url}
                        alt={step.media.caption ?? step.title}
                        className="w-full max-h-72 object-cover"
                      />
                      {step.media.caption && (
                        <p className="text-xs text-gray-400 px-3 py-2 bg-gray-50">{step.media.caption}</p>
                      )}
                    </div>
                  )}

                  {/* Info boxes */}
                  {step.observation && (
                    <InfoBox
                      icon={Eye}
                      title="Observation"
                      content={step.observation}
                      style={{ bg: '#F0FDF4', border: '#BBF7D0', titleColor: '#166534', textColor: '#15803D', iconColor: '#22C55E' }}
                    />
                  )}
                  {step.calculation && (
                    <InfoBox
                      icon={Calculator}
                      title="Calculation"
                      content={step.calculation}
                      style={{ bg: '#EFF6FF', border: '#BFDBFE', titleColor: '#1E40AF', textColor: '#1D4ED8', iconColor: '#3B82F6' }}
                    />
                  )}
                  {step.commonMistakes && (
                    <InfoBox
                      icon={AlertTriangle}
                      title="Common mistakes"
                      content={step.commonMistakes}
                      style={{ bg: '#FFFBEB', border: '#FDE68A', titleColor: '#92400E', textColor: '#B45309', iconColor: '#F59E0B' }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveStep((s) => s - 1)}
                disabled={isFirst}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {practical.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width:  i === activeStep ? 20 : 6,
                      height: 6,
                      background: i <= activeStep ? ss.strip : '#E5E7EB',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveStep((s) => s + 1)}
                disabled={isLast}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Completion message */}
            {isLast && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl border"
                style={{ background: ss.bg, borderColor: ss.strip + '40' }}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: ss.strip }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: ss.text }}>All steps complete!</p>
                  <p className="text-xs mt-0.5" style={{ color: ss.text + 'bb' }}>
                    Review the questions below to test your understanding.
                  </p>
                </div>
              </div>
            )}

            {/* Review questions */}
            {practical.questions?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-900">Review questions</p>
                </div>
                {practical.questions.map((q, i) => {
                  const revealed = revealedAnswers.has(q.id)
                  return (
                    <div key={q.id} className="border border-gray-100 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-medium text-gray-800">
                        <span className="text-gray-400 mr-1.5">{i + 1}.</span>{q.question}
                      </p>
                      {revealed ? (
                        <div className="space-y-1.5">
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{q.answer}</p>
                          {q.explanation && (
                            <p className="text-xs text-gray-400 italic">{q.explanation}</p>
                          )}
                          <button
                            onClick={() => toggleAnswer(q.id)}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            Hide answer
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleAnswer(q.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Reveal answer
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <aside className="space-y-4">

            {/* Step list */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">All steps</p>
              <div className="space-y-1">
                {practical.steps.map((s, i) => {
                  const done    = i < activeStep
                  const current = i === activeStep
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveStep(i)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-all"
                      style={current
                        ? { background: ss.bg, color: ss.text }
                        : { color: done ? '#6B7280' : '#374151' }}
                    >
                      <span className="shrink-0">
                        {done
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          : current
                          ? <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: ss.strip }}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ss.strip }} />
                            </div>
                          : <Circle className="w-4 h-4 text-gray-300" />}
                      </span>
                      <span className={`flex-1 text-xs leading-snug ${done ? 'line-through text-gray-400' : ''}`}>
                        {s.orderIndex}. {s.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Apparatus */}
            {practical.apparatus && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Apparatus</p>
                </div>
                <p className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">{practical.apparatus}</p>
              </div>
            )}

            {/* Safety */}
            {practical.safety && (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Safety</p>
                </div>
                <p className="text-xs text-red-700 whitespace-pre-wrap leading-relaxed">{practical.safety}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </StudentShell>
  )
}