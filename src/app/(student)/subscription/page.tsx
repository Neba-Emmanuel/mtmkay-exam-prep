'use client'

import { useEffect, useState } from 'react'
import { StudentShell } from '@/components/shared/StudentShell'
import { PaymentModal } from '@/components/subscription/PaymentModal'
import { PlanCard } from '@/components/subscription/PlanCard'
import { CurrentPlanBanner } from '@/components/subscription/CurrentPlanBanner'
import { BookOpen, ShieldCheck } from 'lucide-react'
import api from '@/lib/api'

export interface Plan {
  id: string
  name: string
  price: number
  durationDays: number
  description: string
  features: string[]
  badge: string | null
}

export interface SubscriptionInfo {
  plan: string
  status: string
  startsAt: string | null
  expiresAt: string | null
  examTypes: Array<{
    id: string
    name: string
    description: string | null
    startsAt: string
    expiresAt: string | null
    status: string
  }>
}

export interface ExamTypeOption {
  id: string
  name: string
  description: string | null
}

export interface SubscriptionData {
  subscription: SubscriptionInfo
  plans: Plan[]
  examTypes: ExamTypeOption[]
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('')
  const [requestedExamTypeId] = useState(() =>
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('examTypeId') ?? ''
      : ''
  )

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/me')
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    api.get('/subscriptions/me')
      .then((response) => {
        if (!cancelled) setData(response.data)
      })
      .catch((error) => {
        console.error('Failed to fetch subscription:', error)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handlePaymentSuccess = () => {
    setSelectedPlan(null)
    fetchSubscription()
  }

  const sub = data?.subscription
  const isActive = sub?.status === 'ACTIVE' && sub?.plan !== 'FREE'
  const currentPlanId = isActive ? sub?.plan : null
  const examTypes = data?.examTypes ?? []
  const subscriptionExamTypes = sub?.examTypes ?? []
  const defaultExamTypeId =
    examTypes.some((examType) => examType.id === requestedExamTypeId)
      ? requestedExamTypeId
      : examTypes[0]?.id ?? ''
  const resolvedExamTypeId = selectedExamTypeId || defaultExamTypeId
  const selectedExamType = examTypes.find((examType) => examType.id === resolvedExamTypeId) ?? null
  const activeExamTypeIds = new Set(
    subscriptionExamTypes.filter((examType) => examType.status === 'ACTIVE').map((examType) => examType.id)
  )

  return (
    <StudentShell title="Subscription">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          {/* Current plan status */}
          {sub && <CurrentPlanBanner subscription={sub} />}

          {/* Plan grid */}
          <div className="mt-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Exam Access</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Pick an exam type, then pay for the access duration you need.
              </p>
            </div>

            {subscriptionExamTypes.some((examType) => examType.status === 'ACTIVE') && (
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-900">Active exam access</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {subscriptionExamTypes
                    .filter((examType) => examType.status === 'ACTIVE')
                    .map((examType) => (
                      <span
                        key={examType.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {examType.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {examTypes.length ? (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-3">Exam type to unlock</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {examTypes.map((examType) => {
                    const active = resolvedExamTypeId === examType.id
                    const hasAccess = activeExamTypeIds.has(examType.id)
                    return (
                      <button
                        key={examType.id}
                        type="button"
                        onClick={() => setSelectedExamTypeId(examType.id)}
                        className={`text-left rounded-xl border p-4 transition-all ${
                          active
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-200 bg-white hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{examType.name}</p>
                            {examType.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{examType.description}</p>
                            )}
                          </div>
                          {hasAccess && (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Active
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={currentPlanId === plan.id}
                  onSelect={() => selectedExamType && setSelectedPlan(plan)}
                />
              ))}
            </div>

            {/* No Speco Pledge banner */}
            <div className="mt-6 p-4 bg-blue-950 rounded-xl border border-blue-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Practice &gt; Predictions</p>
                <p className="text-xs text-blue-300 mt-0.5 leading-relaxed">
                  MTMKay only hosts verified past questions and teacher-written mocks — no current-year papers, no speco.
                  We make leaked papers useless by building real mastery. Students who understand patterns do not need shortcuts.
                </p>
              </div>
            </div>

            {/* Free tier reminder */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Exam access:</span> you can browse all exam types, but taking questions requires active access for that exam type.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          examType={selectedExamType!}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </StudentShell>
  )
}
