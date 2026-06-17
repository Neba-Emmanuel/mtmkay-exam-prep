'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Smartphone, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import type { Plan } from '@/app/(student)/subscription/page'

type Medium = 'mobile money' | 'orange money'
type Step = 'form' | 'processing' | 'success' | 'failed'

interface Props {
  plan: Plan
  onClose: () => void
  onSuccess: () => void
}

const POLL_INTERVAL_MS = 4000
const MAX_POLLS = 30 // 2 min total

export function PaymentModal({ plan, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('form')
  const [phone, setPhone] = useState('')
  const [medium, setMedium] = useState<Medium>('mobile money')
  const [phoneError, setPhoneError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [fapshiStatus, setFapshiStatus] = useState<string>('PENDING')
  const [errorMsg, setErrorMsg] = useState('')

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  // Start polling when we have a paymentId and are in processing state
  useEffect(() => {
    if (step !== 'processing' || !paymentId) return

    const poll = async () => {
      setPollCount((c) => {
        if (c >= MAX_POLLS) {
          clearInterval(pollRef.current!)
          setStep('failed')
          setErrorMsg('Payment timed out. Please try again.')
          return c
        }
        return c + 1
      })

      try {
        const res = await api.get(`/subscriptions/payment/${paymentId}/status`)
        const { status } = res.data

        setFapshiStatus(status)

        if (status === 'SUCCESSFUL') {
          clearInterval(pollRef.current!)
          setStep('success')
          setTimeout(() => onSuccess(), 2000)
        } else if (status === 'FAILED' || status === 'EXPIRED') {
          clearInterval(pollRef.current!)
          setStep('failed')
          setErrorMsg(
            status === 'FAILED'
              ? 'Payment was declined. Check your balance and try again.'
              : 'Payment request expired. Please try again.'
          )
        }
      } catch {
        // Network error — keep polling
      }
    }

    pollRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [step, paymentId, onSuccess])

  const validatePhone = (value: string) => {
    const clean = value.replace(/\s+/g, '')
    if (!/^6\d{8}$/.test(clean)) {
      return 'Enter a valid Cameroonian number (e.g. 670000000)'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validatePhone(phone)
    if (err) { setPhoneError(err); return }
    setPhoneError('')
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await api.post('/subscriptions/pay', {
        planId: plan.id,
        phone: phone.replace(/\s+/g, ''),
        medium,
      })

      setPaymentId(res.data.paymentId)
      setPollCount(0)
      setStep('processing')
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Could not initiate payment. Please try again.'
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setStep('form')
    setPaymentId(null)
    setPollCount(0)
    setFapshiStatus('PENDING')
    setErrorMsg('')
    if (pollRef.current) clearInterval(pollRef.current)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step !== 'processing' ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 id="payment-modal-title" className="font-bold text-gray-900 text-base">
              {step === 'success' ? 'Payment Successful!' : step === 'failed' ? 'Payment Failed' : `Pay for ${plan.name}`}
            </h2>
            {step === 'form' && (
              <p className="text-xs text-gray-500 mt-0.5">
                {plan.price.toLocaleString()} XAF · {plan.durationDays} day{plan.durationDays > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          {/* ── FORM STEP ─────────────────────────────── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Operator selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['mobile money', 'orange money'] as Medium[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMedium(m)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all',
                        medium === m
                          ? m === 'mobile money'
                            ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                            : 'border-orange-400 bg-orange-50 text-orange-800'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      <OperatorLogo medium={m} />
                      {m === 'mobile money' ? 'MTN MoMo' : 'Orange Money'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium select-none">
                    +237
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="670 000 000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      if (phoneError) setPhoneError('')
                    }}
                    className={cn('pl-14', phoneError && 'border-red-400 focus-visible:ring-red-400')}
                    maxLength={12}
                    autoFocus
                    autoComplete="tel"
                  />
                </div>
                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  You will receive a payment prompt on this number.
                </p>
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              {/* Summary */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Plan</span>
                  <span className="font-medium text-gray-900">{plan.name}</span>
                </div>
                <div className="flex justify-between text-gray-600 mt-1">
                  <span>Access</span>
                  <span className="font-medium text-gray-900">
                    {plan.durationDays} day{plan.durationDays > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{plan.price.toLocaleString()} XAF</span>
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending request…
                  </>
                ) : (
                  `Pay ${plan.price.toLocaleString()} XAF`
                )}
              </Button>

              <p className="text-xs text-center text-gray-400">
                Secure payment via Fapshi · No card needed
              </p>
            </form>
          )}

          {/* ── PROCESSING STEP ───────────────────────── */}
          {step === 'processing' && (
            <div className="py-4 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>

              <div>
                <p className="font-semibold text-gray-900">Check your phone</p>
                <p className="text-sm text-gray-500 mt-1">
                  A payment prompt has been sent to{' '}
                  <span className="font-medium text-gray-700">+237 {phone}</span>.
                  Approve it to complete your subscription.
                </p>
              </div>

              <div className="w-full p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Waiting for confirmation…</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Request will expire in {Math.max(0, MAX_POLLS - pollCount) * (POLL_INTERVAL_MS / 1000)}s</span>
              </div>

              <p className="text-xs text-gray-400 max-w-xs">
                Do not close this window. Once you approve the prompt on your phone, your account will be activated automatically.
              </p>
            </div>
          )}

          {/* ── SUCCESS STEP ──────────────────────────── */}
          {step === 'success' && (
            <div className="py-4 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">You&apos;re all set!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your <span className="font-medium">{plan.name}</span> is now active.
                  Enjoy full access!
                </p>
              </div>
              <p className="text-xs text-gray-400">Redirecting…</p>
            </div>
          )}

          {/* ── FAILED STEP ───────────────────────────── */}
          {step === 'failed' && (
            <div className="py-4 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Payment not completed</p>
                <p className="text-sm text-gray-500 mt-1">{errorMsg}</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleRetry}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OperatorLogo({ medium }: { medium: Medium }) {
  if (medium === 'mobile money') {
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
        <span className="text-black font-black text-[10px] leading-none">MTN</span>
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
      <span className="text-white font-black text-[9px] leading-none">OM</span>
    </div>
  )
}
