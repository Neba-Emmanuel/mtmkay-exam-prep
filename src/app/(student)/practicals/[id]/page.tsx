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

/* ─── Brand blue token map ───────────────────────────── */
const B = {
  50:  '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
}

/* ─── Subject accent ─────────────────────────────────── */
const SUBJECT_STYLE: Record<string, { bg: string; text: string; strip: string; border: string }> = {
  Physics:   { bg: B[50],      text: B[700],    strip: B[500],    border: B[200] },
  Chemistry: { bg: '#F0FDF4',  text: '#15803D', strip: '#22C55E', border: '#BBF7D0' },
  Biology:   { bg: '#FDF4FF',  text: '#7E22CE', strip: '#A855F7', border: '#E9D5FF' },
}
function subjectStyle(s: string) {
  return SUBJECT_STYLE[s] ?? { bg: B[50], text: B[700], strip: B[400], border: B[200] }
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
            <div
              className="w-9 h-9 rounded-full border-2 animate-spin"
              style={{ borderColor: B[100], borderTopColor: B[500] }}
            />
            <p className="text-sm" style={{ color: B[400] }}>Loading practical…</p>
          </div>
        </div>
      </StudentShell>
    )
  }

  if (!practical) {
    return (
      <StudentShell title="Practical">
        <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ color: B[300] }}>
          <FlaskConical className="w-10 h-10 opacity-40" />
          <p className="text-sm">Practical not found.</p>
          <Link
            href="/practicals"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ border: `1px solid ${B[200]}`, color: B[600], background: B[50] }}
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ border: `1px solid ${B[200]}`, color: B[600], background: B[50] }}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Practicals
        </Link>
      }
    >
      <div className="space-y-6 pb-12">

        {/* Title strip */}
        <div className="pb-5" style={{ borderBottom: `1px solid ${B[100]}` }}>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: ss.bg, color: ss.text, border: `1px solid ${ss.border}` }}
            >
              {practical.subject}
            </span>
            <span className="text-xs" style={{ color: 'grey' }}>{totalSteps} steps</span>
            
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: B[600] }}>
            {practical.title}
          </h1>
          {practical.objective && (
            <p className="text-sm mt-2 max-w-2xl leading-relaxed" style={{ color: 'grey' }}>
              {practical.objective}
            </p>
          )}
        </div>

        {/* Main layout */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">

          {/* ── Left: step reader ── */}
          <div className="space-y-4">

            {/* AI lab image */}
            {practical.imageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: `1px solid ${B[100]}` }}>
                <img
                  src={practical.imageUrl}
                  alt={`${practical.title} lab setup`}
                  className="w-full max-h-72 object-contain bg-white p-4"
                />
                <p className="text-xs px-4 py-2" style={{ color: B[400], background: B[50] }}>
                  AI-generated lab setup diagram
                </p>
              </div>
            )}

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'grey' }}>
                <span>
                  Step <span className="font-semibold" style={{ color: 'grey' }}>{activeStep + 1}</span> of {totalSteps}
                </span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: B[100] }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${B[400]}, ${B[600]})` }}
                />
              </div>
            </div>

            {/* Step card */}
            {step && (
              <div
                className="rounded-2xl shadow-sm overflow-hidden"
                style={{ background: 'white', border: `1px solid ${B[100]}` }}
              >
                {/* Blue gradient top strip */}
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${B[400]}, ${B[700]})` }} />

                <div className="p-6 sm:p-8 space-y-5">
                  {/* Step heading */}
                  <div className="flex items-start gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                      style={{ background: B[500], color: 'white' }}
                    >
                      {step.orderIndex}
                    </span>
                    <h2 className="text-lg font-bold leading-snug" style={{ color: B[800] }}>{step.title}</h2>
                  </div>

                  {/* Description */}
                  <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base text-gray-700">
                    {step.description}
                  </p>

                  {/* Media */}
                  {step.media?.url && (
                    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${B[100]}` }}>
                      <img
                        src={step.media.url}
                        alt={step.media.caption ?? step.title}
                        className="w-full max-h-72 object-cover"
                      />
                      {step.media.caption && (
                        <p className="text-xs px-3 py-2" style={{ color: B[400], background: B[50] }}>
                          {step.media.caption}
                        </p>
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
                      style={{ bg: B[50], border: B[200], titleColor: B[800], textColor: B[700], iconColor: B[500] }}
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ border: `1px solid ${B[200]}`, color: B[600], background: B[50] }}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {/* Step progress dots */}
              <div className="flex items-center gap-1.5">
                {practical.steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width:  i === activeStep ? 20 : 6,
                      height: 6,
                      background: i < activeStep ? B[400] : i === activeStep ? B[600] : B[100],
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveStep((s) => s + 1)}
                disabled={isLast}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ border: `1px solid ${B[200]}`, color: B[600], background: B[50] }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Completion banner */}
            {isLast && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: B[50], border: `1px solid ${B[200]}` }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: B[100] }}
                >
                  <CheckCircle2 className="w-5 h-5" style={{ color: B[500] }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: B[700] }}>All steps complete!</p>
                  <p className="text-xs mt-0.5" style={{ color: B[400] }}>
                    Review the questions below to test your understanding.
                  </p>
                </div>
              </div>
            )}

            {/* Review questions */}
            {practical.questions?.length > 0 && (
              <div
                className="rounded-2xl shadow-sm p-6 space-y-4"
                style={{ background: 'white', border: `1px solid ${B[100]}` }}
              >
                {/* Section header */}
                <div
                  className="flex items-center gap-2 pb-3 mb-1"
                  style={{ borderBottom: `1px solid ${B[50]}` }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: B[50] }}
                  >
                    <BookOpen className="w-4 h-4" style={{ color: B[500] }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: B[700] }}>Review questions</p>
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{ background: B[100], color: B[600] }}
                  >
                    {practical.questions.length} questions
                  </span>
                </div>

                {practical.questions.map((q, i) => {
                  const revealed = revealedAnswers.has(q.id)
                  return (
                    <div
                      key={q.id}
                      className="rounded-xl p-4 space-y-2 transition-all"
                      style={{
                        border: `1px solid ${revealed ? B[200] : B[100]}`,
                        background: revealed ? B[50] : 'white',
                      }}
                    >
                      <p className="text-sm font-medium text-gray-800">
                        <span className="mr-1.5 font-bold" style={{ color: B[400] }}>{i + 1}.</span>
                        {q.question}
                      </p>
                      {revealed ? (
                        <div className="space-y-1.5 pt-1">
                          <p
                            className="text-sm rounded-lg px-3 py-2 leading-relaxed"
                            style={{ color: B[800], background: B[100], border: `1px solid ${B[200]}` }}
                          >
                            {q.answer}
                          </p>
                          {q.explanation && (
                            <p className="text-xs italic leading-relaxed" style={{ color: B[400] }}>
                              {q.explanation}
                            </p>
                          )}
                          <button
                            onClick={() => toggleAnswer(q.id)}
                            className="text-xs font-medium transition-colors"
                            style={{ color: B[400] }}
                          >
                            Hide answer
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleAnswer(q.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{ border: `1px solid ${B[200]}`, color: B[600], background: 'white' }}
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
            <div
              className="rounded-2xl shadow-sm p-4"
              style={{ background: 'white', border: `1px solid ${B[100]}` }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: B[500] }}
              >
                All steps
              </p>
              <div className="space-y-0.5">
                {practical.steps.map((s, i) => {
                  const done    = i < activeStep
                  const current = i === activeStep
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveStep(i)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                      style={current
                        ? { background: B[50], border: `1px solid ${B[100]}` }
                        : { background: 'transparent' }}
                    >
                      <span className="shrink-0">
                        {done ? (
                          <CheckCircle2 className="w-4 h-4" style={{ color: B[400] }} />
                        ) : current ? (
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: B[500] }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: B[500] }} />
                          </div>
                        ) : (
                          <Circle className="w-4 h-4" style={{ color: B[200] }} />
                        )}
                      </span>
                      <span
                        className="flex-1 text-xs leading-snug"
                        style={{
                          color: current ? B[700] : done ? B[300] : '#374151',
                          textDecoration: done ? 'line-through' : 'none',
                        }}
                      >
                        {s.orderIndex}. {s.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Apparatus */}
            {practical.apparatus && (
              <div
                className="rounded-2xl shadow-sm p-4"
                style={{ background: 'white', border: `1px solid ${B[100]}` }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4" style={{ color: B[400] }} />
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: B[600] }}>Apparatus</p>
                </div>
                <p className="text-xs leading-relaxed text-gray-600 whitespace-pre-wrap">{practical.apparatus}</p>
              </div>
            )}

            {/* Safety */}
            {practical.safety && (
              <div className="rounded-2xl p-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Safety</p>
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