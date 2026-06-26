'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StudentShell } from '@/components/shared/StudentShell'
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Beaker,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Flame,
  Lightbulb,
  PieChart,
  Plus,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { calculatePercentage, formatDate } from '@/lib/utils'

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

const colorMap = {
  blue: { text: '#2563EB', bg: '#EFF6FF', ring: '#93C5FD' },
  violet: { text: '#7048E8', bg: '#F3F0FF', ring: '#B197FC' },
  emerald: { text: '#087F5B', bg: '#E6FCF5', ring: '#63E6BE' },
  amber: { text: '#E67700', bg: '#FFF9DB', ring: '#FFD43B' },
  pink: { text: '#BE185D', bg: '#FDF2F8', ring: '#F9A8D4' },
  cyan: { text: '#1098AD', bg: '#E3FAFC', ring: '#66D9E8' },
} as const

function gradeStyle(pct: number) {
  if (pct >= 75) return { color: '#15803D', bg: '#DCFCE7', label: 'Strong' }
  if (pct >= 50) return { color: '#B45309', bg: '#FEF3C7', label: 'Steady' }
  return { color: '#B91C1C', bg: '#FEE2E2', label: 'Focus' }
}

function ScoreRing({ value, size = 104 }: { value: number; size?: number }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const fill = Math.min(Math.max(value, 0), 100) / 100 * circumference
  const { color } = gradeStyle(value)

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F5F9" strokeWidth="7" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeDasharray={`${fill} ${circumference}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

function SubscriptionBanner({ sub }: { sub?: DashboardData['subscription'] }) {
  if (!sub || sub.status === 'active') return null
  const expired = sub.status === 'expired'

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${expired ? 'border-red-100 bg-red-50 text-red-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        {expired ? 'Your subscription has expired. Renew to restore premium access.' : 'You are on the free plan. Upgrade for full access.'}
      </span>
      <Link href="/subscription" className="shrink-0 font-semibold underline underline-offset-2">
        {expired ? 'Renew' : 'Upgrade'}
      </Link>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: keyof typeof colorMap
}) {
  const c = colorMap[color]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-30" style={{ background: c.ring }} />
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: c.bg }}>
        <Icon className="h-5 w-5" style={{ color: c.text }} />
      </div>
      <p className="text-3xl font-bold tracking-tight" style={{ color: c.text }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-0.5 text-sm text-gray-500">{label}</p>
    </div>
  )
}

const quickLinks = [
  {
    href: '/exams',
    title: 'Exams',
    desc: 'Start practice or timed exam sessions',
    icon: FileText,
    addLabel: 'Start',
    accent: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    href: '/results',
    title: 'Results',
    desc: 'Review scores and completed attempts',
    icon: TrendingUp,
    accent: '#087F5B',
    bg: '#E6FCF5',
  },
  {
    href: '/practicals',
    title: 'Practicals',
    desc: 'Study lab guides and practical steps',
    icon: Beaker,
    accent: '#E67700',
    bg: '#FFF9DB',
  },
  {
    href: '/subscription',
    title: 'Subscription',
    desc: 'Manage access and payment plans',
    icon: CreditCard,
    accent: '#BE185D',
    bg: '#FDF2F8',
  },
]

function TopicList({ title, topics, tone }: { title: string; topics: string[]; tone: 'strong' | 'weak' }) {
  const isStrong = tone === 'strong'
  const Icon = isStrong ? CheckCircle2 : AlertCircle

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p>
      {topics.length ? (
        <div className="flex flex-wrap gap-1.5">
          {topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${isStrong ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}
            >
              <Icon className="h-3 w-3" />
              {topic}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">No topic data yet</p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api.get('/dashboard')
      .then((response) => { if (mounted) setData(response.data) })
      .catch(console.error)
      .finally(() => { if (mounted) setIsLoading(false) })
    return () => { mounted = false }
  }, [])

  const displayUser = user || data?.user
  const avg = data?.performance?.averageScore ?? 0
  const total = data?.performance?.totalExams ?? 0
  const strongTopics = data?.performance?.strongTopics ?? []
  const weakTopics = data?.performance?.weakTopics ?? []
  const avgStyle = gradeStyle(avg)

  if (isLoading) {
    return (
      <StudentShell title="Dashboard">
        <div className="flex h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
            <p className="text-sm tracking-wide text-gray-400">Loading your dashboard...</p>
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
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800"
        >
          <Zap className="h-3.5 w-3.5" />
          Start exam
        </Link>
      }
    >
      <div className="space-y-8 pb-12">
        <SubscriptionBanner sub={data?.subscription} />

        <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Student Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">
              Learning Overview
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Welcome back, {displayUser?.firstName ?? 'Student'}. Track your prep and jump back into practice.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/results">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                <BarChart3 className="h-4 w-4" />
                Results
              </button>
            </Link>
            <Link href="/exams">
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800">
                <Plus className="h-4 w-4" />
                New exam
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Average Score" value={`${avg}%`} icon={PieChart} color="blue" />
          <MetricCard label="Exams Taken" value={total} icon={BookOpen} color="emerald" />
          <MetricCard label="Strong Topics" value={strongTopics.length} icon={Flame} color="amber" />
          <MetricCard label="Focus Topics" value={weakTopics.length} icon={Target} color="pink" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-xs text-gray-400">Latest exam attempts and scoring history</p>
                </div>
                <Link href="/results" className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-700">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {data?.recentExams?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Exam Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Completed</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Open</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.recentExams.map((exam) => {
                        const pct = calculatePercentage(exam.score, exam.totalQuestions)
                        const style = gradeStyle(pct)
                        return (
                          <tr key={exam.id} className="transition-colors hover:bg-gray-50/60">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{exam.subject}</p>
                              <p className="text-xs text-gray-400">{exam.score}/{exam.totalQuestions} correct</p>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{exam.examType}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
                                {pct}% {style.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs tabular-nums text-gray-500">{formatDate(exam.completedAt)}</td>
                            <td className="px-4 py-3 text-right">
                              <Link href={`/results/${exam.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
                                <ArrowUpRight className="h-4 w-4" />
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-gray-400">
                  <BookOpen className="h-8 w-8 opacity-40" />
                  <p className="text-sm">No exams yet</p>
                  <Link href="/exams" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                    <Zap className="h-3.5 w-3.5" />
                    Start your first exam
                  </Link>
                </div>
              )}
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Quick access</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {quickLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.href}
                      className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: item.bg }}>
                          <Icon className="h-5 w-5" style={{ color: item.accent }} />
                        </div>
                        <Link href={item.href} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100">
                          <ArrowUpRight className="h-4 w-4 text-gray-500" />
                        </Link>
                      </div>
                      <p className="mb-0.5 text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="mb-5 text-xs leading-snug text-gray-400">{item.desc}</p>
                      <Link href={item.href} className="mt-auto">
                        <button
                          className="w-full rounded-lg py-2 text-sm font-medium transition-colors hover:opacity-90"
                          style={{ background: item.bg, color: item.accent }}
                        >
                          {item.addLabel ?? 'Open'}
                        </button>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <div className="mb-3 flex items-center justify-between text-left">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Performance</p>
                  <p className="text-xs text-gray-400">Overall average</p>
                </div>
                <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: avgStyle.bg, color: avgStyle.color }}>
                  {avgStyle.label}
                </span>
              </div>
              <div className="relative mb-3 inline-flex items-center justify-center">
                <ScoreRing value={avg} />
                <span className="absolute text-2xl font-bold tabular-nums" style={{ color: avgStyle.color }}>{avg}%</span>
              </div>
              <p className="text-xs text-gray-400">Average across {total} exam{total === 1 ? '' : 's'}</p>
            </div>

            <div className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <TopicList title="Strong Topics" topics={strongTopics} tone="strong" />
              <TopicList title="Focus Topics" topics={weakTopics} tone="weak" />
            </div>

            {weakTopics[0] && (
              <div className="flex items-start gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-amber-900">Recommended focus</p>
                  <p className="mt-0.5 text-sm text-amber-700">
                    Practice {weakTopics[0]} next to lift your average.
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Upcoming</p>
              {data?.upcoming?.length ? (
                <div className="space-y-2.5">
                  {data.upcoming.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Clock className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">{event.title}</p>
                        <p className="text-xs text-gray-400">{event.date ? formatDate(event.date) : '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No scheduled exams</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Achievements</p>
              <div className="space-y-3">
                {total >= 1 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                      <Trophy className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">First exam done</p>
                      <p className="text-xs text-gray-400">The journey begins</p>
                    </div>
                  </div>
                )}
                {total >= 10 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <Flame className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">10 exams completed</p>
                      <p className="text-xs text-gray-400">Momentum is building</p>
                    </div>
                  </div>
                )}
                {avg >= 75 && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                      <Target className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">High achiever</p>
                      <p className="text-xs text-gray-400">Average above 75%</p>
                    </div>
                  </div>
                )}
                {total === 0 && <p className="text-xs text-gray-400">Complete your first exam to unlock achievements.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  )
}
