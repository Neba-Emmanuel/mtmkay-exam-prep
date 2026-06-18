'use client'

import { useEffect, useState, useCallback } from 'react'
import { StudentShell } from '@/components/shared/StudentShell'
import { PaymentModal } from '@/components/subscription/PaymentModal'
import { PlanCard } from '@/components/subscription/PlanCard'
import { CurrentPlanBanner } from '@/components/subscription/CurrentPlanBanner'
import { ShieldCheck } from 'lucide-react'
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
}

export interface SubscriptionData {
  subscription: SubscriptionInfo
  plans: Plan[]
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await api.get('/subscriptions/me')
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const handlePaymentSuccess = () => {
    setSelectedPlan(null)
    fetchSubscription()
  }

  const sub = data?.subscription
  const isActive = sub?.status === 'ACTIVE' && sub?.plan !== 'FREE'
  const currentPlanId = isActive ? sub?.plan : null

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
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Pay via MTN MoMo or Orange Money — no account needed
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={currentPlanId === plan.id}
                  onSelect={() => setSelectedPlan(plan)}
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
                  We make leaked papers useless by building real mastery. Students who understand patterns don't need shortcuts.
                </p>
              </div>
            </div>

            {/* Free tier reminder */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Free tier:</span> 1 past paper per subject + 5 science premuim practicals —{' '}
                <span className="text-blue-600 font-medium">always free, no payment needed.</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </StudentShell>
  )
}
