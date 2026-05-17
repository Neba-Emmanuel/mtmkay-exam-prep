'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useExamStore } from '@/store/examStore'
import { BookOpen, Zap, ClipboardList } from 'lucide-react'

/* ─── Animated step list ─────────────────────────────── */
const STEPS = [
  'Loading questions…',
  'Setting up your session…',
  'Almost ready…',
]

function LoadingSteps({ mode }: { mode: 'EXAM' | 'PRACTICE' }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 900)
    return () => clearInterval(t)
  }, [])

  const Icon = mode === 'EXAM' ? ClipboardList : Zap
  const accent = mode === 'EXAM'
    ? { bg: '#EFF6FF', text: '#1D4ED8', ring: '#BFDBFE' }
    : { bg: '#F0FDF4', text: '#15803D', ring: '#BBF7D0' }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">

        {/* Icon blob */}
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div
            className="absolute w-24 h-24 rounded-full opacity-30 animate-ping"
            style={{ background: accent.ring }}
          />
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ background: accent.bg }}
          >
            <Icon className="w-9 h-9" style={{ color: accent.text }} />
          </div>
        </div>

        {/* Heading */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accent.text }}>
            {mode === 'EXAM' ? 'Exam mode' : 'Practice mode'}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Starting your session</h1>
        </div>

        {/* Spinner + step text */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-gray-200 animate-spin"
            style={{ borderTopColor: accent.text }}
          />
          <p className="text-sm text-gray-500 h-5 transition-all duration-300">
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
        <h2 className="text-lg font-semibold text-gray-900">Couldn't start the session</h2>
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
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
  const startExamSession = useExamStore((s) => s.startExamSession)
  const error = useExamStore((s) => s.error)

  const mode = modeParam === 'exam' ? 'EXAM' : 'PRACTICE'

  useEffect(() => {
    if (!subjectId) { router.replace('/exams'); return }

    const start = async () => {
      try {
        await startExamSession(subjectId, mode)
        const sessionId = useExamStore.getState().sessionId
        if (sessionId) router.replace(`/exams/${sessionId}`)
        else router.replace('/exams')
      } catch {
        // error state shown via store
      }
    }

    start()
  }, [subjectId, modeParam, router, startExamSession])

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
          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
        </div>
      }
    >
      <ExamStartContent />
    </Suspense>
  )
}