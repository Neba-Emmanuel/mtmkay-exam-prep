'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StudentShell } from '@/components/shared/StudentShell'
import { Beaker, Lock, Crown, ListOrdered, ChevronRight, FlaskConical, Search } from 'lucide-react'
import api from '@/lib/api'

/* ─── Types ──────────────────────────────────────────── */
interface Practical {
  id: string
  title: string
  subject: string
  objective: string | null
  isPremium: boolean
  _count: { steps: number }
}

/* ─── Subject filters ────────────────────────────────── */
const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Biology']

const SUBJECT_STYLE: Record<string, { bg: string; text: string; strip: string }> = {
  Physics:   { bg: '#EFF6FF', text: '#1D4ED8', strip: '#3B82F6' },
  Chemistry: { bg: '#F0FDF4', text: '#15803D', strip: '#22C55E' },
  Biology:   { bg: '#FDF4FF', text: '#7E22CE', strip: '#A855F7' },
}

function subjectStyle(s: string) {
  return SUBJECT_STYLE[s] ?? { bg: '#F1F5F9', text: '#475569', strip: '#94A3B8' }
}

/* ─── Main Page ──────────────────────────────────────── */
export default function PracticalsPage() {
  const [practicals, setPracticals] = useState<Practical[]>([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const params = filter !== 'All' ? { subject: filter } : {}
    api.get('/practicals', { params })
      .then((r) => setPracticals(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [filter])

  const filtered = practicals.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.objective ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const freeCount    = practicals.filter((p) => !p.isPremium).length
  const premiumCount = practicals.filter((p) => p.isPremium).length

  return (
    <StudentShell title="Practicals">
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="border-b border-gray-100 pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Science</p>
          <h1 className="text-3xl font-bold tracking-tight text-blue-700">Practicals</h1>
          <p className="text-sm text-gray-400 mt-1">
            Step-by-step lab experiments for Physics, Chemistry, and Biology.
          </p>
        </div>

        {/* Stats row */}
        {!isLoading && practicals.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{practicals.length}</span> practicals
            <span className="text-gray-200">·</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              {freeCount} free
            </span>
            <span className="text-gray-200">·</span>
            <span className="inline-flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              {premiumCount} premium
            </span>
          </div>
        )}

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Subject pills */}
          <div className="flex gap-2 flex-wrap">
            {SUBJECTS.map((s) => {
              const active = filter === s
              const ss = subjectStyle(s)
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                  style={active
                    ? s === 'All'
                      ? { background: '#2061eb', color: 'white', borderColor: 'transparent' }
                      : { background: ss.strip, color: 'white', borderColor: 'transparent' }
                    : { background: 'white', color: '#6B7280', borderColor: '#E5E7EB' }}
                >
                  {s}
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Search practicals…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-52">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-gray-400">Loading practicals…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <FlaskConical className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium">
              {search || filter !== 'All' ? 'No practicals match your filters' : 'No practicals available yet'}
            </p>
            {(search || filter !== 'All') && (
              <button
                onClick={() => { setSearch(''); setFilter('All') }}
                className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const ss = subjectStyle(p.subject)
              return (
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 overflow-hidden flex flex-col"
                >
                  {/* Top accent strip */}
                  <div className="h-1 w-full shrink-0 bg-blue-600" />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Icon + premium badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-blue-100"
                      >
                        <Beaker className="w-4 h-4" style={{ color: ss.text }} />
                      </div>
                      {p.isPremium && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          <Crown className="w-3 h-3" /> Premium
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{p.title}</h3>

                    {/* Subject + steps */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: ss.bg, color: ss.text }}
                      >
                        {p.subject}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <ListOrdered className="w-3.5 h-3.5" />
                        {p._count.steps} step{p._count.steps !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Objective */}
                    {p.objective && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
                        {p.objective}
                      </p>
                    )}

                    {/* CTA */}
                    <div className="mt-auto">
                      <Link href={`/practicals/${p.id}`}>
                        <button
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors bg-blue-600 text-white"
                        >
                          View practical
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer count */}
        {!isLoading && filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-center">
            Showing {filtered.length} of {practicals.length} practical{practicals.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </StudentShell>
  )
}