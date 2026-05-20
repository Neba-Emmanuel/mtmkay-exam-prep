'use client'

import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import {
  BookOpen, Users, CreditCard, Activity,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────── */
interface Analytics {
  examsLast30Days: number
  newUsersLast30Days: number
  verifiedPaymentsLast30Days: number
  dailyActivity: number
  // optional trend fields (% change vs previous period)
  examsTrend?: number
  usersTrend?: number
  paymentsTrend?: number
  activityTrend?: number
  // optional sparkline / daily breakdown
  dailyBreakdown?: { date: string; exams: number; users: number }[]
}

/* ─── Helpers ────────────────────────────────────────── */
function TrendBadge({ value }: { value?: number }) {
  if (value === undefined || value === null) return null
  const up = value > 0
  const flat = value === 0
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown
  const style = flat
    ? { bg: '#F1F5F9', text: '#64748B' }
    : up
    ? { bg: '#DCFCE7', text: '#166534' }
    : { bg: '#FEE2E2', text: '#991B1B' }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: style.bg, color: style.text }}
    >
      <Icon className="w-3 h-3" />
      {flat ? 'No change' : `${up ? '+' : ''}${value}%`}
    </span>
  )
}

/* Tiny bar sparkline — renders from an array of values */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (!values.length) return null
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm opacity-70 transition-all"
          style={{ height: `${Math.max(4, (v / max) * 100)}%`, background: color }}
        />
      ))}
    </div>
  )
}

/* ─── Stat Card ──────────────────────────────────────── */
interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number
  sub: string
  trend?: number
  sparkValues?: number[]
  accent: { bg: string; text: string; spark: string; ring: string }
}

function StatCard({ icon: Icon, label, value, sub, trend, sparkValues, accent }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Decorative blob */}
      <div
        className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-20 pointer-events-none"
        style={{ background: accent.ring }}
      />
      {/* Icon */}
      <div
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
        style={{ background: accent.bg }}
      >
        <Icon className="w-5 h-5" style={{ color: accent.text }} />
      </div>

      {/* Value */}
      <p className="text-3xl font-bold tracking-tight" style={{ color: accent.text }}>
        {value.toLocaleString()}
      </p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>

      {/* Trend + sparkline row */}
      <div className="flex items-end justify-between mt-4 gap-2">
        <TrendBadge value={trend} />
        {sparkValues && sparkValues.length > 0 && (
          <div className="flex-1 max-w-[80px]">
            <Sparkline values={sparkValues} color={accent.spark} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Activity Ring ──────────────────────────────────── */
function ActivityRing({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const dash = pct * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#F1F5F9" strokeWidth="6" />
          <circle
            cx="32" cy="32" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
          {Math.round(pct * 100)}%
        </span>
      </div>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  /* Build sparklines from dailyBreakdown if available */
  const examSpark = data?.dailyBreakdown?.map((d) => d.exams)
  const userSpark  = data?.dailyBreakdown?.map((d) => d.users)

  const cards: StatCardProps[] = data ? [
    {
      icon: BookOpen,
      label: 'Exams completed',
      value: data.examsLast30Days,
      sub: 'Last 30 days',
      trend: data.examsTrend,
      sparkValues: examSpark,
      accent: { bg: '#EFF6FF', text: '#1D4ED8', spark: '#3B82F6', ring: '#93C5FD' },
    },
    {
      icon: Users,
      label: 'New users',
      value: data.newUsersLast30Days,
      sub: 'Registered this month',
      trend: data.usersTrend,
      sparkValues: userSpark,
      accent: { bg: '#F0FDF4', text: '#15803D', spark: '#22C55E', ring: '#86EFAC' },
    },
    {
      icon: CreditCard,
      label: 'Verified payments',
      value: data.verifiedPaymentsLast30Days,
      sub: 'Approved transactions',
      trend: data.paymentsTrend,
      accent: { bg: '#F5F3FF', text: '#6D28D9', spark: '#8B5CF6', ring: '#C4B5FD' },
    },
    {
      icon: Activity,
      label: 'Activity records',
      value: data.dailyActivity,
      sub: 'Events tracked today',
      trend: data.activityTrend,
      accent: { bg: '#FFF7ED', text: '#C2410C', spark: '#F97316', ring: '#FCA5A5' },
    },
  ] : []

  /* Compute totals for engagement rings */
  const total = data
    ? data.examsLast30Days + data.newUsersLast30Days + data.verifiedPaymentsLast30Days
    : 0

  return (
    <AdminShell title="Analytics" description="">
      <div className="space-y-8 pb-12">

        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin Console</p>
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Platform activity overview · last 30 days</p>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-gray-400">Loading analytics…</p>
            </div>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400 gap-2">
            <Activity className="w-8 h-8 opacity-40" />
            <p className="text-sm">No analytics data available</p>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((c) => <StatCard key={c.label} {...c} />)}
            </div>

            {/* Bottom section: engagement rings + period note */}
            <div className="grid md:grid-cols-3 gap-4">

              {/* Engagement breakdown */}
              <div className="md:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-gray-800 mb-1">Activity breakdown</p>
                <p className="text-xs text-gray-400 mb-6">Share of each metric as a proportion of combined activity</p>
                <div className="flex items-center justify-around">
                  <ActivityRing
                    value={data.examsLast30Days}
                    max={total}
                    color="#3B82F6"
                    label="Exams"
                  />
                  <ActivityRing
                    value={data.newUsersLast30Days}
                    max={total}
                    color="#22C55E"
                    label="New users"
                  />
                  <ActivityRing
                    value={data.verifiedPaymentsLast30Days}
                    max={total}
                    color="#8B5CF6"
                    label="Payments"
                  />
                  <ActivityRing
                    value={data.dailyActivity}
                    max={Math.max(data.dailyActivity, total / 30)}
                    color="#F97316"
                    label="Today's activity"
                  />
                </div>
              </div>

              {/* Period summary */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Period summary</p>
                  <p className="text-xs text-gray-400 mb-5">Rolling 30-day window</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Exams / day (avg)', value: (data.examsLast30Days / 30).toFixed(1), color: '#3B82F6' },
                      { label: 'Users / day (avg)',  value: (data.newUsersLast30Days / 30).toFixed(1), color: '#22C55E' },
                      { label: 'Payments total',     value: data.verifiedPaymentsLast30Days.toLocaleString(), color: '#8B5CF6' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                          <span className="text-xs text-gray-500">{row.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 tabular-nums">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-50">
                  <p className="text-xs text-gray-400">
                    Data refreshes on page load. Trends shown when prior-period data is available from the API.
                  </p>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </AdminShell>
  )
}