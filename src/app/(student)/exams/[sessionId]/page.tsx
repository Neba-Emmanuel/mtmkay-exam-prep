'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { useExamStore } from '@/store/examStore'
import { formatTime } from '@/lib/utils'
import {
  ChevronLeft, ChevronRight, Flag, Send,
  Clock, CheckCircle2, Circle, BookmarkCheck,
  AlertTriangle,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────── */
interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  text: string
  options: Option[]
}

/* ─── Option label A B C D ───────────────────────────── */
const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

/* ─── Confirm modal ──────────────────────────────────── */
function SubmitConfirm({
  total,
  answered,
  marked,
  onConfirm,
  onCancel,
  isSubmitting,
}: {
  total: number
  answered: number
  marked: number
  onConfirm: () => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const unanswered = total - answered
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)' }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6" style={{ animation: 'modalIn 0.18s ease' }}>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="text-base font-semibold text-gray-900 text-center mb-1">Submit exam?</h2>
        <p className="text-sm text-gray-500 text-center mb-5">This cannot be undone.</p>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Answered', value: answered, color: '#16A34A' },
            { label: 'Marked',   value: marked,   color: '#D97706' },
            { label: 'Skipped',  value: unanswered, color: '#9CA3AF' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-gray-50 py-2.5 text-center">
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Keep going
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            {isSubmitting
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send className="w-3.5 h-3.5" />}
            Submit
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(10px) scale(0.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function ExamSessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const {
    currentQuestionIndex,
    answers,
    timeRemaining,
    isExamStarted,
    isExamSubmitted,
    setCurrentQuestionIndex,
    setAnswer,
    setTimeRemaining,
    submitExamSession,
    resetExam,
  } = useExamStore()

  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  /* Fetch session */
  useEffect(() => {
    if (!sessionId) return
    api.get(`/exams/${sessionId}`)
      .then((r) => {
        setQuestions(r.data.questions)
        setTimeRemaining(r.data.timeRemaining)
        useExamStore.setState({
          sessionId,
          examId: r.data.subject,
          isExamStarted: true,
          isExamSubmitted: false,
          answers: r.data.answers ?? {},
        })
      })
      .catch(() => router.push('/exams'))
      .finally(() => setIsLoading(false))
  }, [sessionId, router, setTimeRemaining])

  /* Timer */
  useEffect(() => {
    if (!isExamStarted || isExamSubmitted || timeRemaining <= 0) return
    const t = setInterval(() => setTimeRemaining(timeRemaining - 1), 1000)
    return () => clearInterval(t)
  }, [timeRemaining, isExamStarted, isExamSubmitted, setTimeRemaining])

  /* Auto-submit on timeout */
  useEffect(() => {
    if (timeRemaining === 0 && isExamStarted && !isExamSubmitted) handleSubmit()
  }, [timeRemaining])

  const handleAnswerSelect = (optionId: string) => {
    const q = questions[currentQuestionIndex]
    if (!q) return
    setAnswer(q.id, {
      selectedOption: optionId,
      isMarkedForReview: answers[q.id]?.isMarkedForReview ?? false,
    })
    api.post(`/exams/${sessionId}/save-answer`, { questionId: q.id, selectedOption: optionId }).catch(() => {})
  }

  const handleMarkForReview = () => {
    const q = questions[currentQuestionIndex]
    if (!q) return
    setAnswer(q.id, {
      selectedOption: answers[q.id]?.selectedOption ?? null,
      isMarkedForReview: !answers[q.id]?.isMarkedForReview,
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setShowConfirm(false)
    try {
      const result = await submitExamSession()
      const resultId = result?.id ?? result?.resultId
      resetExam()
      router.push(resultId ? `/results/${resultId}` : '/results')
    } catch {
      setIsSubmitting(false)
    }
  }

  /* ── Derived ── */
  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions  = questions.length
  const answeredCount   = Object.values(answers).filter((a) => a.selectedOption).length
  const markedCount     = Object.values(answers).filter((a) => a.isMarkedForReview).length
  const progress        = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
  const isLowTime       = timeRemaining < 300
  const currentAnswer   = currentQuestion ? answers[currentQuestion.id] : undefined
  const isMarked        = currentAnswer?.isMarkedForReview ?? false

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
          <p className="text-sm text-gray-400">Loading exam…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">

          {/* Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500">
                Question <span className="text-gray-900 font-semibold">{currentQuestionIndex + 1}</span>
                <span className="text-gray-400"> / {totalQuestions}</span>
              </span>
              <span className="text-xs text-gray-400">{answeredCount} answered</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: '#16A34A' }}
              />
            </div>
          </div>

          {/* Timer */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-semibold shrink-0 transition-colors"
            style={isLowTime
              ? { background: '#FEE2E2', color: '#991B1B' }
              : { background: '#EFF6FF', color: '#1D4ED8' }}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? 'animate-pulse' : ''}`} />
            {formatTime(timeRemaining)}
          </div>

          {/* Submit */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[1fr_260px] gap-6">

        {/* Question + options */}
        <div className="space-y-4">

          {/* Question card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            {/* Q number + mark badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                Question {currentQuestionIndex + 1}
              </span>
              {isMarked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                  <Flag className="w-3 h-3" /> Flagged for review
                </span>
              )}
            </div>

            <p className="text-base sm:text-lg text-gray-900 leading-relaxed font-medium">
              {currentQuestion?.text}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion?.options.map((option, i) => {
              const selected = currentAnswer?.selectedOption === option.id
              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-150"
                  style={selected
                    ? { background: '#EFF6FF', borderColor: '#3B82F6', boxShadow: '0 0 0 1px #3B82F6' }
                    : { background: 'white', borderColor: '#E5E7EB' }
                  }
                >
                  {/* Label circle */}
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all"
                    style={selected
                      ? { background: '#3B82F6', color: 'white' }
                      : { background: '#F3F4F6', color: '#6B7280' }
                    }
                  >
                    {LABELS[i]}
                  </span>
                  <span className={`flex-1 text-sm sm:text-base ${selected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                    {option.text}
                  </span>
                  {selected && <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Navigation row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={handleMarkForReview}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all"
              style={isMarked
                ? { background: '#FEF9C3', borderColor: '#FDE68A', color: '#92400E' }
                : { background: 'white', borderColor: '#E5E7EB', color: '#6B7280' }}
            >
              <Flag className="w-4 h-4" />
              {isMarked ? 'Unflag' : 'Flag for review'}
            </button>

            <button
              onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Right panel: question palette ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Question map</p>

            {/* Legend */}
            <div className="flex flex-col gap-1.5 mb-4">
              {[
                { color: '#3B82F6', label: `Current` },
                { color: '#16A34A', label: `Answered (${answeredCount})` },
                { color: '#D97706', label: `Flagged (${markedCount})` },
                { color: '#E5E7EB', label: `Not answered (${totalQuestions - answeredCount})` },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: l.color }} />
                  <span className="text-xs text-gray-500">{l.label}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const ans     = answers[q.id]
                const answered = !!ans?.selectedOption
                const flagged  = !!ans?.isMarkedForReview
                const current  = i === currentQuestionIndex

                let bg = '#F3F4F6', fg = '#6B7280', ring = 'transparent'
                if (current)  { bg = '#3B82F6'; fg = 'white' }
                else if (flagged)  { bg = '#FEF3C7'; fg = '#92400E' }
                else if (answered) { bg = '#DCFCE7'; fg = '#166534' }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className="w-full aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all hover:opacity-80"
                    style={{ background: bg, color: fg }}
                    title={`Question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            {/* Submit from panel */}
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              className="w-full mt-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Submit exam
            </button>
          </div>
        </aside>
      </main>

      {/* ── Mobile palette (bottom bar) ── */}
      <div className="lg:hidden sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1.5 w-max">
            {questions.map((q, i) => {
              const ans     = answers[q.id]
              const answered = !!ans?.selectedOption
              const flagged  = !!ans?.isMarkedForReview
              const current  = i === currentQuestionIndex

              let bg = '#F3F4F6', fg = '#6B7280'
              if (current)  { bg = '#3B82F6'; fg = 'white' }
              else if (flagged)  { bg = '#FEF3C7'; fg = '#92400E' }
              else if (answered) { bg = '#DCFCE7'; fg = '#166534' }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className="w-8 h-8 rounded-lg text-xs font-semibold shrink-0 transition-all"
                  style={{ background: bg, color: fg }}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isSubmitting}
          className="shrink-0 px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          Submit
        </button>
      </div>

      {/* ── Submit confirm modal ── */}
      {showConfirm && (
        <SubmitConfirm
          total={totalQuestions}
          answered={answeredCount}
          marked={markedCount}
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirm(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
