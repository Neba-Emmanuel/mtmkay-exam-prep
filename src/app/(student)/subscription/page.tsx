'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudentShell } from '@/components/shared/StudentShell'
import { Check } from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Plan {
  id: string
  name: string
  price: number
  duration: string
}

interface SubscriptionData {
  subscription: {
    plan: string
    status: string
    startsAt: string | null
    expiresAt: string | null
  }
  plans: Plan[]
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
    fetchSubscription()
  }, [])

  const sub = data?.subscription
  const isActive = sub?.status === 'ACTIVE' && sub?.plan !== 'FREE'

  return (
    <StudentShell title="Subscription">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your subscription status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {sub?.plan === 'FREE' ? 'Free' : sub?.plan}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: {sub?.status}
                    {sub?.expiresAt && isActive && (
                      <> · Expires {formatDate(sub.expiresAt)}</>
                    )}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {isActive ? 'Active' : 'Free Tier'}
                </span>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upgrade Your Plan</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.plans.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900 mb-4">
                    {plan.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">XAF</span>
                  </p>
                  <ul className="space-y-2 mb-6 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" /> Unlimited exams
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" /> All practicals
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" /> Performance analytics
                    </li>
                  </ul>
                  <Button className="w-full" disabled={sub?.plan === plan.id}>
                    {sub?.plan === plan.id ? 'Current Plan' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-6 text-center">
            Mobile money payments (MTN MoMo, Orange Money) will be available soon.
          </p>
        </>
      )}
    </StudentShell>
  )
}
