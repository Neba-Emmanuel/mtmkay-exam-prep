'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Plan } from '@/app/(student)/subscription/page'

interface Props {
  plan: Plan
  isCurrent: boolean
  onSelect: () => void
}

export function PlanCard({ plan, isCurrent, onSelect }: Props) {
  const isPopular = plan.badge === 'Most Popular'
  const isBestValue = plan.badge === 'Best Value'
  const highlighted = isPopular || isBestValue

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border bg-white transition-shadow duration-200',
        highlighted
          ? 'border-blue-500 shadow-lg shadow-blue-100 ring-1 ring-blue-500'
          : 'border-gray-200 hover:shadow-md',
        isCurrent && 'border-green-400 ring-1 ring-green-400'
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={cn(
              'px-3 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap',
              isPopular
                ? 'bg-blue-600 text-white'
                : 'bg-amber-500 text-white'
            )}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 text-base">{plan.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-gray-900">
              {plan.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 font-medium">XAF</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{plan.durationDays} day{plan.durationDays > 1 ? 's' : ''} access</p>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-6 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          className={cn(
            'w-full font-semibold',
            isCurrent
              ? 'bg-green-600 hover:bg-green-700'
              : highlighted
              ? 'bg-blue-600 hover:bg-blue-700'
              : ''
          )}
          variant={highlighted || isCurrent ? 'default' : 'outline'}
          onClick={onSelect}
        >
          {isCurrent ? '✓ Current Plan' : `Pay ${plan.price.toLocaleString()} XAF`}
        </Button>
      </div>
    </div>
  )
}
