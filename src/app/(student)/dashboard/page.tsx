'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StudentShell } from '@/components/shared/StudentShell'
import {
  PieChart, BookOpen, Lightbulb, Clock, Trophy,
  TrendingUp, ChevronRight, Flame, Target, Zap,
  ArrowUpRight, CheckCircle2, AlertCircle,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate, calculatePercentage, getGradeColor } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────── */
interface DashboardData {
  user: { firstName: string; lastName: string }
  recentExams: Array<{
    id: string
    examType: string
    subject: string
    score: number
    totalQuestions: number
    completedAt: string
  }>
  performance: {
    totalExams: number
    averageScore: number
    strongTopics: string[]
    weakTopics: string[]
  }
  upcoming: Array<{ id: string; title: string; date: string }>
  subscription: { status: 'free' | 'active' | 'expired'; expiresAt?: string }
}

/* ─── Helpers ────────────────────────────────────────── */
function gradeStyle(pct: number) {
  if (pct >= 75) return { color: '#15803D', bg: '#DCFCE7' }
  if (pct >= 50) return { color: '#B45309', bg: '#FEF3C7' }
  return { color: '#B91C1C', bg: '#FEE2E2' }
}

function ScoreRing({ value, size = 72 }: { value: number; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const fill = Math.min(value / 100, 1) * circ
  const { color } = gradeStyle(value)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

function StatPill({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string | number; accent: { bg: string; text: string }
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent.bg }}>
        <Icon className="w-4 h-4" style={{ color: accent.text }} />
      </div>
      <div>
        <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  )
}

/* ─── Subscription banner ────────────────────────────── */
function SubscriptionBanner({ sub }: { sub?: DashboardData['subscription'] }) {
  if (!sub || sub.status === 'active') return null
  const expired = sub.status === 'expired'
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm"
      style={expired
        ? { background: '#FEF2F2', borderColor: '#FECACA', color: '#991B1B' }
        : { background: '#FFF7ED', borderColor: '#FED7AA', color: '#9A3412' }}
    >
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="flex-1">
        {expired
          ? 'Your subscription has expired. Renew to access premium content.'
          : 'You\'re on the free plan. Upgrade for full access.'}
      </span>
      <Link
        href="/payments"
        className="font-medium underline underline-offset-2 shrink-0"
      >
        {expired ? 'Renew' : 'Upgrade'}
      </Link>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api.get('/dashboard')
      .then((r) => { if (mounted) setData(r.data) })
      .catch(console.error)
      .finally(() => { if (mounted) setIsLoading(false) })
    return () => { mounted = false }
  }, [])

  const displayUser = user || data?.user
  const avg = data?.performance?.averageScore ?? 0
  const total = data?.performance?.totalExams ?? 0
  const { color: avgColor } = gradeStyle(avg)

  if (isLoading) {
    return (
      <StudentShell title="Dashboard">
        <div className="flex items-center justify-center h-72">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
            <p className="text-sm text-gray-400">Loading your dashboard…</p>
          </div>
        </div>
      </StudentShell>
    )
  }

  return (
    <StudentShell
      title="Dashboard"
      user={displayUser}
      headerAction={
        <Link
          href="/exams"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" /> Start exam
        </Link>
      }
    >
      <div className="space-y-6 pb-12">

        {/* Subscription alert */}
        <SubscriptionBanner sub={data?.subscription} />

        {/* Welcome strip */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-gray-100 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Overview</p>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome back, {displayUser?.firstName ?? 'Student'} 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1">Here's how your prep is going</p>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors self-start sm:self-auto"
          >
            Edit profile <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Stat pills row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatPill icon={PieChart}   label="Average score"   value={`${avg}%`}   accent={{ bg: '#EFF6FF', text: '#1D4ED8' }} />
          <StatPill icon={BookOpen}   label="Exams taken"     value={total}        accent={{ bg: '#F0FDF4', text: '#15803D' }} />
          <StatPill icon={Flame}      label="Strong topics"   value={data?.performance?.strongTopics?.length ?? 0}  accent={{ bg: '#FFF7ED', text: '#C2410C' }} />
          <StatPill icon={Target}     label="Weak topics"     value={data?.performance?.weakTopics?.length ?? 0}    accent={{ bg: '#FDF4FF', text: '#7E22CE' }} />
        </div>

        {/* Main 3-col grid */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* ── Left sidebar ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Score ring card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-center">
              <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Overall performance</p>
              <div className="relative inline-flex items-center justify-center mb-2">
                <ScoreRing value={avg} size={88} />
                <span
                  className="absolute text-xl font-bold tabular-nums"
                  style={{ color: avgColor }}
                >
                  {avg}%
                </span>
              </div>
              <p className="text-xs text-gray-400">Average across {total} exam{total !== 1 ? 's' : ''}</p>
            </div>

            {/* Topics */}
            {(data?.performance?.strongTopics?.length || data?.performance?.weakTopics?.length) ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
                {data?.performance?.strongTopics?.length ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Strong</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.performance.strongTopics.slice(0, 4).map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" /> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {data?.performance?.weakTopics?.length ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Needs work</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.performance.weakTopics.slice(0, 4).map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          <AlertCircle className="w-3 h-3" /> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Upcoming */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming</p>
              {data?.upcoming?.length ? (
                <div className="space-y-2.5">
                  {data.upcoming.map((e) => (
                    <div key={e.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                        <p className="text-xs text-gray-400">{e.date ? formatDate(e.date) : '—'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No scheduled exams</p>
              )}
            </div>
          </div>

          {/* ── Centre: recent activity ── */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Recent activity</p>
                  <p className="text-xs text-gray-400">Latest exam attempts</p>
                </div>
                <Link
                  href="/results"
                  className="text-xs text-gray-400 hover:text-gray-700 inline-flex items-center gap-0.5 transition-colors"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data?.recentExams?.length ? (
                <div className="divide-y divide-gray-50">
                  {data.recentExams.map((exam) => {
                    const pct = calculatePercentage(exam.score, exam.totalQuestions)
                    const gs = gradeStyle(pct)
                    return (
                      <Link
                        key={exam.id}
                        href={`/results/${exam.id}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: gs.bg }}
                        >
                          <TrendingUp className="w-4 h-4" style={{ color: gs.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{exam.subject}</p>
                          <p className="text-xs text-gray-400">{exam.examType} · {formatDate(exam.completedAt)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold tabular-nums" style={{ color: gs.color }}>{pct}%</p>
                          <p className="text-xs text-gray-400">{exam.score}/{exam.totalQuestions}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
                  <BookOpen className="w-8 h-8 opacity-40" />
                  <p className="text-sm">No exams yet</p>
                  <Link
                    href="/exams"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" /> Start your first exam
                  </Link>
                </div>
              )}
            </div>

            {/* Recommended */}
            {data?.performance?.weakTopics?.[0] && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">Recommended focus</p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    You should work on <span className="font-semibold">{data.performance.weakTopics[0]}</span> — your scores here are lower than other topics.
                  </p>
                </div>
                <Link
                  href="/exams"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors"
                >
                  Practice
                </Link>
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Achievements */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Achievements</p>
              <div className="space-y-3">
                {total >= 1 && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">First exam done</p>
                      <p className="text-xs text-gray-400">The journey begins</p>
                    </div>
                  </div>
                )}
                {total >= 10 && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">10 exams completed</p>
                      <p className="text-xs text-gray-400">Keep the momentum going</p>
                    </div>
                  </div>
                )}
                {avg >= 75 && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">High achiever</p>
                      <p className="text-xs text-gray-400">Avg above 75%</p>
                    </div>
                  </div>
                )}
                {total === 0 && (
                  <p className="text-xs text-gray-400">Complete your first exam to earn badges.</p>
                )}
              </div>
            </div>

            {/* Study tips */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Study tips</p>
              <ul className="space-y-2.5">
                {[
                  'Break sessions into focused 25-minute blocks.',
                  'Review weak topics first each session.',
                  'Practice under timed conditions for stamina.',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-400 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick links</p>
              <div className="space-y-1">
                {[
                  { href: '/exams',      label: 'Browse exams',     icon: BookOpen },
                  { href: '/results',    label: 'My results',       icon: TrendingUp },
                  { href: '/practicals', label: 'Practicals',       icon: Zap },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </StudentShell>
  )
}