'use client'

import { formatDate } from '@/lib/utils'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { SubscriptionInfo } from '@/app/(student)/subscription/page'

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  DAILY: 'Daily Pass',
  WEEKLY: 'Weekly Booster',
  MONTHLY: 'Monthly Scholar',
  SEASON: 'Exam Season Pass',
  SCHOOL: 'School Plan',
}

interface Props {
  subscription: SubscriptionInfo
}

export function CurrentPlanBanner({ subscription }: Props) {
  const { plan, status, expiresAt } = subscription
  const isActive = status === 'ACTIVE' && plan !== 'FREE'
  const isExpired = status === 'EXPIRED'
  const isFree = plan === 'FREE' || (!isActive && !isExpired)

  const planLabel = PLAN_LABELS[plan] ?? plan

  if (isFree) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">Free Plan</p>
          <p className="text-sm text-gray-500">Limited access — upgrade to unlock everything</p>
        </div>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 shrink-0">
          Free Tier
        </span>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl border border-orange-200 bg-orange-50">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{planLabel} — Expired</p>
          <p className="text-sm text-orange-600">
            {expiresAt ? `Expired ${formatDate(expiresAt)}` : 'Your plan has expired'} — renew to continue
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 shrink-0">
          Expired
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-green-200 bg-green-50">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{planLabel}</p>
        <p className="text-sm text-green-700">
          Active{expiresAt ? ` · Expires ${formatDate(expiresAt)}` : ''}
        </p>
      </div>
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 shrink-0">
        Active
      </span>
    </div>
  )
}
