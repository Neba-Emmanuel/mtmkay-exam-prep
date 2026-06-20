'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, Clock3, Gift, Search, Users } from 'lucide-react'

interface ReferralUser {
  id: string
  firstName: string
  lastName: string
  email: string
  referralCode?: string | null
}

interface ReferralRow {
  id: string
  referredUser: ReferralUser
  referrer: ReferralUser | null
  joinedAt: string
  rewardGrantedAt: string | null
  rewardStatus: 'GRANTED' | 'PENDING_PURCHASE'
  accessSource: 'REFERRAL' | null
}

interface ReferralReport {
  totalReferrals: number
  rewardedReferrals: number
  pendingRewards: number
  referralAccessDaysGranted: number
  recentReferrals: ReferralRow[]
}

const emptyReport: ReferralReport = {
  totalReferrals: 0,
  rewardedReferrals: 0,
  pendingRewards: 0,
  referralAccessDaysGranted: 0,
  recentReferrals: [],
}

function fullName(user: ReferralUser | null) {
  if (!user) return 'Unknown user'
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof Users
  tone: 'blue' | 'green' | 'amber' | 'pink'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    pink: 'bg-pink-50 text-pink-700 border-pink-100',
  }[tone]

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${colors}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function RewardBadge({ row }: { row: ReferralRow }) {
  if (row.rewardStatus === 'GRANTED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Access from referral
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Pending purchase
    </span>
  )
}

export default function AdminReferralsPage() {
  const [report, setReport] = useState<ReferralReport>(emptyReport)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchReferrals = async () => {
      try {
        const response = await api.get('/admin/referrals')
        if (mounted) setReport(response.data)
      } catch (error) {
        console.error('Failed to fetch referrals:', error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchReferrals()
    return () => { mounted = false }
  }, [])

  const query = search.trim().toLowerCase()
  const rows = report.recentReferrals.filter((row) => {
    if (!query) return true
    return [
      fullName(row.referredUser),
      row.referredUser.email,
      fullName(row.referrer),
      row.referrer?.email ?? '',
      row.referrer?.referralCode ?? '',
      row.rewardStatus,
    ].some((value) => value.toLowerCase().includes(query))
  })

  return (
    <AdminShell title="Referrals" description="">
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">Referral Tracking</h1>
            <p className="mt-1 text-sm text-gray-400">Monitor referred signups and free access days granted.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-80 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-400">Loading referrals...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total referrals" value={report.totalReferrals} icon={Users} tone="blue" />
              <MetricCard label="Rewarded referrals" value={report.rewardedReferrals} icon={CheckCircle2} tone="green" />
              <MetricCard label="Pending rewards" value={report.pendingRewards} icon={Clock3} tone="amber" />
              <MetricCard label="Free days granted" value={report.referralAccessDaysGranted} icon={Gift} tone="pink" />
            </div>

            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search referrals..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Referred user</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Referrer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Joined</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Reward status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Granted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-16 text-center text-sm text-gray-400">
                          {search ? 'No referrals match your search' : 'No referrals recorded yet'}
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr key={row.id} className="transition-colors hover:bg-gray-50/60">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{fullName(row.referredUser)}</p>
                            <p className="text-xs text-gray-500">{row.referredUser.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{fullName(row.referrer)}</p>
                            <p className="text-xs text-gray-500">
                              {row.referrer?.referralCode ? `Code ${row.referrer.referralCode}` : row.referrer?.email ?? 'No referrer record'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs tabular-nums text-gray-500">{formatDate(row.joinedAt)}</td>
                          <td className="px-4 py-3"><RewardBadge row={row} /></td>
                          <td className="px-4 py-3 text-xs tabular-nums text-gray-500">
                            {row.rewardGrantedAt ? formatDate(row.rewardGrantedAt) : 'Not granted'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-3">
                <p className="text-xs text-gray-400">
                  Showing {rows.length} of {report.recentReferrals.length} referral{report.recentReferrals.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  )
}
