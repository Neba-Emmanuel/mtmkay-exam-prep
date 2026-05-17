'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminShell } from '@/components/shared/AdminShell'
import { Users, FileQuestion, Beaker, CreditCard, BarChart3, ShieldCheck, ArrowUpRight, Plus } from 'lucide-react'
import api from '@/lib/api'

interface Stats {
  totalUsers: number
  totalQuestions: number
  totalExams: number
  totalResults: number
  activeSubscriptions?: number
}

const statCards = (stats: Stats) => [
  {
    label: 'Total Users',
    value: stats.totalUsers,
    icon: Users,
    color: 'blue',
  },
  {
    label: 'Questions',
    value: stats.totalQuestions,
    icon: FileQuestion,
    color: 'violet',
  },
  {
    label: 'Active Exams',
    value: stats.totalExams,
    icon: Beaker,
    color: 'emerald',
  },
  {
    label: 'Total Results',
    value: stats.totalResults,
    icon: ShieldCheck,
    color: 'amber',
  },
]

const quickLinks = [
  {
    href: '/admin/users',
    title: 'Users',
    desc: 'View and manage student accounts',
    icon: Users,
    addHref: '/admin/users?mode=add',
    addLabel: 'Add User',
    accent: '#3B5BDB',
    bg: '#EDF2FF',
    dot: '#748FFC',
  },
  {
    href: '/admin/questions',
    title: 'Question Bank',
    desc: 'Add, edit, or review questions',
    icon: FileQuestion,
    addHref: '/admin/questions?mode=add',
    addLabel: 'Add Question',
    accent: '#7048E8',
    bg: '#F3F0FF',
    dot: '#9775FA',
  },
  {
    href: '/admin/subjects',
    title: 'Content',
    desc: 'Manage subjects and topics',
    icon: BarChart3,
    addHref: '/admin/subjects?mode=add',
    addLabel: 'Add Subject',
    accent: '#0CA678',
    bg: '#E6FCF5',
    dot: '#38D9A9',
  },
  {
    href: '/admin/practicals',
    title: 'Practicals',
    desc: 'Manage science practicals',
    icon: Beaker,
    addHref: '/admin/practicals?mode=add',
    addLabel: 'Add Practical',
    accent: '#E67700',
    bg: '#FFF9DB',
    dot: '#FFD43B',
  },
  {
    href: '/admin/payments',
    title: 'Payments',
    desc: 'Verify payments & subscriptions',
    icon: CreditCard,
    accent: '#C2255C',
    bg: '#FFF0F6',
    dot: '#F783AC',
  },
  {
    href: '/admin/analytics',
    title: 'Analytics',
    desc: 'Platform insights & reporting',
    icon: BarChart3,
    accent: '#1098AD',
    bg: '#E3FAFC',
    dot: '#66D9E8',
  },
]

const colorMap: Record<string, { text: string; bg: string; ring: string }> = {
  blue:    { text: '#1C7ED6', bg: '#E7F5FF', ring: '#74C0FC' },
  violet:  { text: '#7048E8', bg: '#F3F0FF', ring: '#B197FC' },
  emerald: { text: '#087F5B', bg: '#E6FCF5', ring: '#63E6BE' },
  amber:   { text: '#E67700', bg: '#FFF9DB', ring: '#FFD43B' },
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalQuestions: 0, totalExams: 0, totalResults: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats')
        if (mounted) setStats(response.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    fetchStats()
    return () => { mounted = false }
  }, [])

  if (isLoading) {
    return (
      <AdminShell title="Overview" description="">
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
            <p className="text-sm text-gray-400 tracking-wide">Loading platform data…</p>
          </div>
        </div>
      </AdminShell>
    )
  }

  const cards = statCards(stats)

  return (
    <AdminShell title="Overview" description="">
      <div className="space-y-8 pb-12">

        {/* Header strip */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-600">Platform Overview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/analytics">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </Link>
            <Link href="/admin/settings">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                Settings
              </button>
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ label, value, icon: Icon, color }) => {
            const c = colorMap[color]
            return (
              <div
                key={label}
                className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Decorative circle */}
                <div
                  className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-30"
                  style={{ background: c.ring }}
                />
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4"
                  style={{ background: c.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: c.text }} />
                </div>
                <p className="text-3xl font-bold tracking-tight" style={{ color: c.text }}>
                  {value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            )
          })}
        </div>

        {/* Section label */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Quick access</p>

          {/* Quick link grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.href}
                  className="group relative flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  {/* Icon + title row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
                      style={{ background: item.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.accent }} />
                    </div>
                    <Link
                      href={item.href}
                      className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100"
                    >
                      <ArrowUpRight className="w-4 h-4 text-gray-500" />
                    </Link>
                  </div>

                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{item.title}</p>
                  <p className="text-xs text-gray-400 leading-snug mb-5">{item.desc}</p>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2">
                    <Link href={item.href} className="flex-1">
                      <button
                        className="w-full py-2 rounded-lg text-sm font-medium border transition-colors hover:opacity-90"
                        style={{
                          background: item.bg,
                          color: item.accent,
                          borderColor: 'transparent',
                        }}
                      >
                        Open
                      </button>
                    </Link>
                    {item.addHref && (
                      <Link href={item.addHref}>
                        <button
                          className="inline-flex items-center gap-1 py-2 px-3 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {item.addLabel}
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </AdminShell>
  )
}