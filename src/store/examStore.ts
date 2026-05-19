import { create } from 'zustand'
import api from '@/lib/api'

interface ExamAnswer {
  questionId: string
  selectedOption: string | null
  isMarkedForReview: boolean
}

interface Question {
  id: string
  text: string
  options: Array<{ id: string; text: string }>
  explanation?: string
}

interface ExamState {
  sessionId: string | null
  examId: string | null
  currentQuestionIndex: number
  answers: Record<string, ExamAnswer>
  timeRemaining: number
  isExamStarted: boolean
  isExamSubmitted: boolean
  questions: Question[]
  isLoading: boolean
  error: string | null
  setSessionId: (sessionId: string | null) => void
  setExamId: (examId: string | null) => void
  setCurrentQuestionIndex: (index: number) => void
  setAnswer: (questionId: string, answer: Partial<ExamAnswer>) => void
  setTimeRemaining: (time: number) => void
  startExamSession: (subjectId: string, mode?: string, timeLimit?: number) => Promise<void>
  saveAnswer: (questionId: string, selectedOption: string | null) => Promise<void>
  submitExamSession: () => Promise<any>
  resetExam: () => void
}

export const useExamStore = create<ExamState>((set, get) => ({
  sessionId: null,
  examId: null,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  isExamStarted: false,
  isExamSubmitted: false,
  questions: [],
  isLoading: false,
  error: null,
  setSessionId: (sessionId) => set({ sessionId }),
  setExamId: (examId) => set({ examId }),
  setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          ...state.answers[questionId],
          questionId,
          isMarkedForReview: false,
          ...answer,
        },
      },
    })),
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  startExamSession: async (subjectId, mode = 'PRACTICE', timeLimit = 3600) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/exams/start', {
        subjectId,
        mode,
        timeLimit,
      })
      const { sessionId, id, questions, timeRemaining } = response.data
      set({
        sessionId: sessionId ?? id,
        examId: subjectId,
        questions,
        timeRemaining,
        isExamStarted: true,
        isExamSubmitted: false,
        currentQuestionIndex: 0,
        answers: {},
        isLoading: false,
      })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to start exam'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  saveAnswer: async (questionId, selectedOption) => {
    const { sessionId } = get()
    if (!sessionId) return

    try {
      await api.post(`/exams/${sessionId}/save-answer`, {
        questionId,
        selectedOption,
      })
      set((state) => ({
        answers: {
          ...state.answers,
          [questionId]: {
            ...state.answers[questionId],
            questionId,
            selectedOption,
            isMarkedForReview: false,
          },
        },
      }))
    } catch (error: any) {
      console.error('Failed to save answer:', error)
    }
  },
  submitExamSession: async () => {
    const { sessionId } = get()
    if (!sessionId) throw new Error('No active exam session')

    set({ isLoading: true, error: null })
    try {
      const response = await api.post(`/exams/${sessionId}/submit`)
      set({
        isExamSubmitted: true,
        isLoading: false,
      })
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit exam'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  resetExam: () =>
    set({
      sessionId: null,
      examId: null,
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: 0,
      isExamStarted: false,
      isExamSubmitted: false,
      questions: [],
      error: null,
    }),
}))
