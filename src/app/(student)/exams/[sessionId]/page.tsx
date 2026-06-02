'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { useExamStore } from '@/store/examStore'
import { formatTime } from '@/lib/utils'
import {
  ChevronLeft, ChevronRight, Flag, Send,
  Clock, CheckCircle2,
  AlertTriangle, Image as ImageIcon, ScrollText,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────── */
interface Option {
  id: string
  text: string
}

interface Question {
  id: string
  groupId?: string | null
  text: string
  passageTitle?: string | null
  passageText?: string | null
  imageUrls?: string[]
  options: Option[]
}

interface QuestionSet {
  id: string
  title: string
  passageTitle?: string | null
  passageText?: string | null
  imageUrls: string[]
  questions: Question[]
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
            className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-1.5"
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

  const handleAnswerSelect = (question: Question, optionId: string) => {
    setAnswer(question.id, {
      selectedOption: optionId,
      isMarkedForReview: answers[question.id]?.isMarkedForReview ?? false,
    })
    api.post(`/exams/${sessionId}/save-answer`, { questionId: question.id, selectedOption: optionId }).catch(() => {})
  }

  const handleMarkForReview = (question: Question) => {
    setAnswer(question.id, {
      selectedOption: answers[question.id]?.selectedOption ?? null,
      isMarkedForReview: !answers[question.id]?.isMarkedForReview,
    })
  }

  const handleSubmit = useCallback(async () => {
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
  }, [resetExam, router, submitExamSession])

  /* Auto-submit on timeout */
  useEffect(() => {
    if (timeRemaining !== 0 || !isExamStarted || isExamSubmitted) return
    const timeout = window.setTimeout(() => { handleSubmit() }, 0)
    return () => window.clearTimeout(timeout)
  }, [timeRemaining, isExamStarted, isExamSubmitted, handleSubmit])

  /* ── Derived ── */
  const questionSets = useMemo<QuestionSet[]>(() => {
    const sets: QuestionSet[] = []
    const setIndexById = new Map<string, number>()

    questions.forEach((question) => {
      const hasSharedSource = !!question.groupId && (!!question.passageText || (question.imageUrls?.length ?? 0) > 0)
      const setId = hasSharedSource ? question.groupId! : question.id
      const existingIndex = setIndexById.get(setId)

      if (existingIndex !== undefined) {
        sets[existingIndex].questions.push(question)
        return
      }

      setIndexById.set(setId, sets.length)
      sets.push({
        id: setId,
        title: hasSharedSource ? 'Question set' : 'Question',
        passageTitle: question.passageTitle,
        passageText: question.passageText,
        imageUrls: question.imageUrls ?? [],
        questions: [question],
      })
    })

    return sets
  }, [questions])

  const currentSet = questionSets[currentQuestionIndex]
  const totalQuestions  = questions.length
  const totalSets       = questionSets.length
  const answeredCount   = Object.values(answers).filter((a) => a.selectedOption).length
  const markedCount     = Object.values(answers).filter((a) => a.isMarkedForReview).length
  const progress        = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
  const isLowTime       = timeRemaining < 300

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center exam-blue-grid">
        <div className="flex flex-col items-center gap-3 exam-rise-in">
          <div className="w-12 h-12 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
          <p className="text-sm text-blue-500">Loading exam…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen exam-blue-grid flex flex-col exam-fade-in">

      {/* ── Top bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm shadow-blue-100/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">

          {/* Progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-blue-500">
                Set <span className="text-blue-950 font-semibold">{currentQuestionIndex + 1}</span>
                <span className="text-blue-300"> / {totalSets}</span>
              </span>
              <span className="text-xs text-sky-500">{answeredCount} answered</span>
            </div>
            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #1D4ED8 0%, #2563EB 48%, #38BDF8 100%)' }}
              />
            </div>
          </div>

          {/* Timer */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-semibold shrink-0 transition-colors"
            style={isLowTime
              ? { background: '#FEE2E2', color: '#991B1B' }
              : { background: '#DBEAFE', color: '#1D4ED8' }}
          >
            <Clock className={`w-4 h-4 ${isLowTime ? 'animate-pulse' : ''}`} />
            {formatTime(timeRemaining)}
          </div>

          {/* Submit */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-medium disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 52%, #0284C7 100%)' }}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[1fr_260px] gap-6">

        {/* Question set + options */}
        <div className="space-y-4">
          {currentSet && (
            <div key={currentSet.id} className="space-y-4 exam-rise-in">
              {(currentSet.passageText || currentSet.imageUrls.length > 0) && (
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm shadow-blue-100/50 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                      <ScrollText className="w-3.5 h-3.5" />
                      Source for {currentSet.questions.length} question{currentSet.questions.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-slate-400">
                      Set {currentQuestionIndex + 1} of {totalSets}
                    </span>
                  </div>

                  {currentSet.passageText && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                      <div className="flex items-center gap-2 mb-2 text-indigo-700">
                        <ScrollText className="w-4 h-4" />
                        <p className="text-sm font-semibold">{currentSet.passageTitle || 'Reading passage'}</p>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                        {currentSet.passageText}
                      </p>
                    </div>
                  )}

                  {currentSet.imageUrls.length > 0 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {currentSet.imageUrls.map((url, i) => (
                        <figure key={`${url}-${i}`} className="rounded-xl border border-blue-100 bg-blue-50/40 overflow-hidden">
                          <img
                            src={url}
                            alt={`Question set ${currentQuestionIndex + 1} image ${i + 1}`}
                            className="w-full max-h-80 object-contain bg-white"
                          />
                          <figcaption className="flex items-center gap-1.5 px-3 py-2 text-xs text-blue-600">
                            <ImageIcon className="w-3.5 h-3.5" />
                            Image {i + 1}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {currentSet.questions.map((question) => {
                  const questionNumber = questions.findIndex((q) => q.id === question.id) + 1
                  const currentAnswer = answers[question.id]
                  const isMarked = currentAnswer?.isMarkedForReview ?? false

                  return (
                    <div key={question.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm shadow-blue-100/50 p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          Question {questionNumber}
                        </span>
                        <button
                          onClick={() => handleMarkForReview(question)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all"
                          style={isMarked
                            ? { background: '#FEF9C3', borderColor: '#FDE68A', color: '#92400E' }
                            : { background: 'white', borderColor: '#BFDBFE', color: '#1D4ED8' }}
                        >
                          <Flag className="w-3.5 h-3.5" />
                          {isMarked ? 'Unflag' : 'Flag'}
                        </button>
                      </div>

                      <p className="text-base sm:text-lg text-blue-950 leading-relaxed font-medium mb-4">
                        {question.text}
                      </p>

                      <div className="space-y-3">
                        {question.options.map((option, i) => {
                          const selected = currentAnswer?.selectedOption === option.id
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleAnswerSelect(question, option.id)}
                              className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md exam-pop-in"
                              style={{
                                ...(selected
                                  ? { background: '#EFF6FF', borderColor: '#3B82F6', boxShadow: '0 10px 22px rgba(37,99,235,0.14), 0 0 0 1px #3B82F6' }
                                  : { background: 'white', borderColor: '#DBEAFE' }),
                                animationDelay: `${i * 45}ms`,
                              }}
                            >
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all"
                                style={selected
                                  ? { background: 'linear-gradient(135deg, #1D4ED8 0%, #38BDF8 100%)', color: 'white' }
                                  : { background: '#EFF6FF', color: '#1D4ED8' }
                                }
                              >
                                {LABELS[i]}
                              </span>
                              <span className={`flex-1 text-sm sm:text-base ${selected ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>
                                {option.text}
                              </span>
                              {selected && <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Navigation row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-100 text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-white border border-blue-100 text-xs font-medium text-slate-500">
              {currentSet?.questions.filter((question) => answers[question.id]?.selectedOption).length ?? 0}
              {' / '}
              {currentSet?.questions.length ?? 0} answered in this set
            </span>

            <button
              onClick={() => setCurrentQuestionIndex(Math.min(totalSets - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === totalSets - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-100 text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Right panel: question palette ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 bg-white rounded-2xl border border-blue-100 shadow-sm shadow-blue-100/50 p-5 exam-rise-in">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">Question sets</p>

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
              {questionSets.map((set, i) => {
                const answered = set.questions.every((question) => !!answers[question.id]?.selectedOption)
                const partiallyAnswered = !answered && set.questions.some((question) => !!answers[question.id]?.selectedOption)
                const flagged  = set.questions.some((question) => !!answers[question.id]?.isMarkedForReview)
                const current  = i === currentQuestionIndex

                let bg = '#F3F4F6', fg = '#6B7280'
                if (current)  { bg = '#3B82F6'; fg = 'white' }
                else if (flagged)  { bg = '#FEF3C7'; fg = '#92400E' }
                else if (answered) { bg = '#DCFCE7'; fg = '#166534' }
                else if (partiallyAnswered) { bg = '#DBEAFE'; fg = '#1D4ED8' }

                return (
                  <button
                    key={set.id}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className="relative w-full aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
                    style={{ background: bg, color: fg }}
                    title={set.questions.length > 1 ? `Set ${i + 1}: ${set.questions.length} questions` : `Question ${questions.findIndex((q) => q.id === set.questions[0].id) + 1}`}
                  >
                    {i + 1}
                    {set.questions.length > 1 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-white text-[10px] leading-4 text-blue-600 shadow-sm">
                        {set.questions.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Submit from panel */}
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isSubmitting}
              className="w-full mt-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg inline-flex items-center justify-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 58%, #0EA5E9 100%)' }}
            >
              <Send className="w-4 h-4" /> Submit exam
            </button>
          </div>
        </aside>
      </main>

      {/* ── Mobile palette (bottom bar) ── */}
      <div className="lg:hidden sticky bottom-0 bg-white/95 backdrop-blur border-t border-blue-100 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1.5 w-max">
            {questionSets.map((set, i) => {
              const answered = set.questions.every((question) => !!answers[question.id]?.selectedOption)
              const partiallyAnswered = !answered && set.questions.some((question) => !!answers[question.id]?.selectedOption)
              const flagged  = set.questions.some((question) => !!answers[question.id]?.isMarkedForReview)
              const current  = i === currentQuestionIndex

              let bg = '#F3F4F6', fg = '#6B7280'
              if (current)  { bg = '#3B82F6'; fg = 'white' }
              else if (flagged)  { bg = '#FEF3C7'; fg = '#92400E' }
              else if (answered) { bg = '#DCFCE7'; fg = '#166534' }
              else if (partiallyAnswered) { bg = '#DBEAFE'; fg = '#1D4ED8' }

              return (
                <button
                  key={set.id}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className="relative w-8 h-8 rounded-lg text-xs font-semibold shrink-0 transition-all duration-300"
                  style={{ background: bg, color: fg }}
                >
                  {i + 1}
                  {set.questions.length > 1 && (
                    <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-white text-[9px] leading-3.5 text-blue-600 shadow-sm">
                      {set.questions.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isSubmitting}
          className="shrink-0 px-3 py-2 rounded-xl text-white text-xs font-medium disabled:opacity-50 transition-all duration-300"
          style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #0284C7 100%)' }}
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
