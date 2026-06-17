'use client'

import { useEffect, useState } from 'react'
import { Gift, Copy, CheckCheck, Users, ChevronRight } from 'lucide-react'
import api from '@/lib/api'

interface ReferralInfo {
  referralCode: string | null
  referralCount: number
  bonusWeeksEarned: number
  toNextBonus: number
  shareMessage: string
}

export function ReferralCard() {
  const [info, setInfo] = useState<ReferralInfo | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/referral')
      .then((r) => setInfo(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  const handleShareWhatsApp = () => {
    if (!info?.shareMessage) return
    const url = `https://wa.me/?text=${encodeURIComponent(info.shareMessage)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="h-24 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  if (!info) return null

  const progressToNext = ((3 - info.toNextBonus) / 3) * 100

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Green gradient strip */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Refer Friends</p>
            <p className="text-xs text-gray-500">Bring 3 friends → get 1 week free</p>
          </div>
        </div>

        {/* Referral code */}
        {info.referralCode && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1.5">Your referral code</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="font-mono font-bold text-blue-700 text-sm tracking-widest">
                  {info.referralCode}
                </span>
              </div>
              <button
                onClick={() => handleCopy(info.referralCode!)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied
                  ? <><CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> Copied</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
          </div>
        )}

        {/* Progress to next bonus */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {info.referralCount} friend{info.referralCount !== 1 ? 's' : ''} referred
            </span>
            <span className="text-emerald-700 font-medium">
              {info.toNextBonus} more for free week
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
          {info.bonusWeeksEarned > 0 && (
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              🎉 {info.bonusWeeksEarned} bonus week{info.bonusWeeksEarned > 1 ? 's' : ''} earned!
            </p>
          )}
        </div>

        {/* WhatsApp share */}
        <button
          onClick={handleShareWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: '#25D366' }}
        >
          <WhatsAppIcon />
          Share via WhatsApp
          <ChevronRight className="w-4 h-4" />
        </button>

        <p className="text-xs text-gray-400 text-center mt-2">
          WhatsApp is the fastest way to share in Cameroon
        </p>
      </div>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
