'use client'

import { useRouter } from 'next/navigation'
import { Lock, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  title?: string
  message: string
  onClose?: () => void
  /** If true, renders as a full-page overlay. Otherwise renders inline. */
  overlay?: boolean
}

export function UpgradePrompt({
  title = 'Upgrade to continue',
  message,
  onClose,
  overlay = false,
}: Props) {
  const router = useRouter()

  const content = (
    <div className="flex flex-col items-center text-center gap-4 p-6 max-w-sm w-full">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Lock className="w-7 h-7 text-blue-600" />
      </div>

      {/* Text */}
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>
      </div>

      {/* Pricing hint */}
      <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 text-left">
        <p className="text-xs font-semibold text-blue-700 mb-2">Plans from just 200 XAF</p>
        <div className="space-y-1.5 text-xs text-blue-600">
          <div className="flex justify-between">
            <span>Daily Pass</span>
            <span className="font-semibold">200 XAF</span>
          </div>
          <div className="flex justify-between">
            <span>Weekly Booster</span>
            <span className="font-semibold">1,000 XAF</span>
          </div>
          <div className="flex justify-between">
            <span>Monthly Scholar</span>
            <span className="font-semibold text-blue-800">3,000 XAF</span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-2 w-full">
        <Button
          className="w-full font-semibold gap-2"
          onClick={() => router.push('/subscription')}
        >
          <Zap className="w-4 h-4" /> View Plans & Pay
        </Button>
        {onClose && (
          <Button variant="ghost" className="w-full text-gray-500" onClick={onClose}>
            Maybe later
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Pay via MTN MoMo or Orange Money — no card needed
      </p>
    </div>
  )

  if (!overlay) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {content}
      </div>
    </div>
  )
}
