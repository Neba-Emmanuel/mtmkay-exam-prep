'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useExamStore } from '@/store/examStore'
import { BookOpen, Zap, ClipboardList } from 'lucide-react'
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt'

/* ─── Animated step list ─────────────────────────────── */
const STEPS = [
  'Loading questions…',
  'Setting up your session…',
  'Almost ready…',
]

function LoadingSteps({ mode }: { mode: 'EXAM' | 'PRACTICE' | 'YEAR' }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 900)
    return () => clearInterval(t)
  }, [])

  const Icon = mode === 'EXAM' || mode === 'YEAR' ? ClipboardList : Zap
  const accent = mode === 'EXAM'
    ? { bg: '#EFF6FF', text: '#1D4ED8', ring: '#BFDBFE', deep: '#1E3A8A' }
    : mode === 'YEAR'
      ? { bg: '#ECFEFF', text: '#0E7490', ring: '#A5F3FC', deep: '#155E75' }
    : { bg: '#F0F9FF', text: '#0284C7', ring: '#BAE6FD', deep: '#075985' }

  return (
    <div className="min-h-screen exam-blue-grid flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6 exam-rise-in">

        {/* Icon blob */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div
            className="absolute w-28 h-28 rounded-full opacity-25 animate-ping"
            style={{ background: accent.ring }}
          />
          <div
            className="absolute w-36 h-36 rounded-full border border-white/70"
            style={{ animation: 'examFloat 3.2s ease-in-out infinite' }}
          />
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg exam-pop-in"
            style={{ background: `linear-gradient(135deg, ${accent.bg} 0%, white 56%, ${accent.ring} 100%)`, animation: 'examPulseBlue 2s ease-in-out infinite' }}
          >
            <Icon className="w-9 h-9" style={{ color: accent.text }} />
          </div>
        </div>

        {/* Heading */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent.text }}>
            {mode === 'EXAM' ? 'Exam mode' : mode === 'YEAR' ? 'Past paper' : 'Practice mode'}
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: accent.deep }}>Starting your session</h1>
        </div>

        {/* Spinner + step text */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin"
            style={{ borderTopColor: accent.text }}
          />
          <p className="text-sm text-blue-700 h-5 transition-all duration-300 exam-fade-in" key={step}>
            {STEPS[step]}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width:  i === step ? 20 : 6,
                height: 6,
                background: i <= step ? accent.text : '#E5E7EB',
              }}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400">
          {mode === 'EXAM'
            ? 'Your time will start once the first question loads.'
            : mode === 'YEAR'
              ? 'This session will use questions from the selected year.'
            : 'Take your time — practice mode has no time limit.'}
        </p>
      </div>
    </div>
  )
}

/* ─── Error state ────────────────────────────────────── */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <BookOpen className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Could not start the session</h2>
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Go back to exams
        </button>
      </div>
    </div>
  )
}

/* ─── Content ────────────────────────────────────────── */
function ExamStartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subjectId = searchParams.get('subject')
  const modeParam = searchParams.get('mode')
  const yearParam = searchParams.get('year')
  const startExamSession = useExamStore((s) => s.startExamSession)
  const error = useExamStore((s) => s.error)
  const [upgradeRequired, setUpgradeRequired] = useState(false)
  const [lockedExamTypeId, setLockedExamTypeId] = useState<string | null>(null)

  const parsedYear = yearParam ? Number(yearParam) : null
  const selectedYear = Number.isInteger(parsedYear) ? parsedYear : null
  const mode = selectedYear ? 'YEAR' : modeParam === 'exam' ? 'EXAM' : 'PRACTICE'

  useEffect(() => {
    if (!subjectId) { router.replace('/exams'); return }

    const start = async () => {
      try {
        await startExamSession(subjectId, mode, undefined, selectedYear)
        const sessionId = useExamStore.getState().sessionId
        if (sessionId) router.replace(`/exams/${sessionId}`)
        else router.replace('/exams')
      } catch (err: any) {
        // Check if the error is a free-tier limit (403 upgradeRequired)
        if (err?.response?.status === 403 || err?.response?.data?.upgradeRequired) {
          setUpgradeRequired(true)
          setLockedExamTypeId(err?.response?.data?.examTypeId ?? null)
        }
        // error state shown via store for other errors
      }
    }

    start()
  }, [subjectId, mode, selectedYear, router, startExamSession])

  if (upgradeRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <UpgradePrompt
          title="Exam access required"
          message={error || 'You need active access for this exam type before you can take its questions.'}
          href={lockedExamTypeId ? `/subscription?examTypeId=${lockedExamTypeId}` : '/subscription'}
          onClose={() => router.replace('/exams')}
        />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => router.replace('/exams')} />
  }

  return <LoadingSteps mode={mode} />
}

/* ─── Page ───────────────────────────────────────────── */
export default function ExamStartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
        </div>
      }
    >
      <ExamStartContent />
    </Suspense>
  )
}
