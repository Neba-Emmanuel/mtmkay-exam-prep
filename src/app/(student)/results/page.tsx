'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StudentShell } from '@/components/shared/StudentShell'
import api from '@/lib/api'
import { formatDate, calculatePercentage, getGradeColor } from '@/lib/utils'
import {
  TrendingUp, BookOpen, ChevronRight, Search,
  Zap, BarChart3, Trophy, Target, ChevronsUpDown,
  ChevronUp, ChevronDown,
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────────── */
interface ResultItem {
  id: string
  examType: string
  subject: string
  score: number
  totalQuestions: number
  completedAt: string
}

type SortKey = 'date' | 'score' | 'subject'
type SortDir = 'asc' | 'desc'

/* ─── Grade style ────────────────────────────────────── */
function gradeStyle(pct: number) {
  if (pct >= 75) return { color: '#15803D', bg: '#DCFCE7', label: 'Pass' }
  if (pct >= 50) return { color: '#B45309', bg: '#FEF3C7', label: 'Average' }
  return { color: '#B91C1C', bg: '#FEE2E2', label: 'Fail' }
}

/* ─── Mini bar chart ─────────────────────────────────── */
function ScoreBar({ pct }: { pct: number }) {
  const { color } = gradeStyle(pct)
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

/* ─── Stat card ──────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string | number
  accent: { bg: string; text: string; ring: string }
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20" style={{ background: accent.ring }} />
      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: accent.bg }}>
        <Icon className="w-4 h-4" style={{ color: accent.text }} />
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: accent.text }}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function ResultsListPage() {
  const [results, setResults] = useState<ResultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'date', dir: 'desc' })

  useEffect(() => {
    api.get('/results/me')
      .then((r) => setResults(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const toggleSort = (key: SortKey) =>
    setSort((s) => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })

  /* ── Stats ── */
  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + calculatePercentage(r.score, r.totalQuestions), 0) / results.length)
    : 0
  const best = results.length
    ? Math.max(...results.map((r) => calculatePercentage(r.score, r.totalQuestions)))
    : 0
  const passed = results.filter((r) => calculatePercentage(r.score, r.totalQuestions) >= 50).length

  /* ── Filtering + sorting ── */
  const examTypes = Array.from(new Set(results.map((r) => r.examType).filter(Boolean)))

  const filtered = results
    .filter((r) => {
      const q = search.toLowerCase()
      const matchQ = r.subject.toLowerCase().includes(q) || r.examType.toLowerCase().includes(q)
      const matchT = !filterType || r.examType === filterType
      return matchQ && matchT
    })
    .sort((a, b) => {
      let cmp = 0
      if (sort.key === 'date')    cmp = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      if (sort.key === 'score')   cmp = calculatePercentage(a.score, a.totalQuestions) - calculatePercentage(b.score, b.totalQuestions)
      if (sort.key === 'subject') cmp = a.subject.localeCompare(b.subject)
      return sort.dir === 'asc' ? cmp : -cmp
    })

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => {
    const active = sort.key === k
    return (
      <button
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
        style={{ color: active ? '#111827' : '#9CA3AF' }}
      >
        {label}
        {active
          ? sort.dir === 'asc'
            ? <ChevronUp className="w-3 h-3" />
            : <ChevronDown className="w-3 h-3" />
          : <ChevronsUpDown className="w-3 h-3" />}
      </button>
    )
  }

  return (
    <StudentShell
      title="Results"
      headerAction={
        <Link
          href="/exams"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-700 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" /> Take exam
        </Link>
      }
    >
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="border-b border-gray-100 pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">History</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Results</h1>
          <p className="text-sm text-gray-400 mt-1">
            {results.length} exam{results.length !== 1 ? 's' : ''} completed
          </p>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-52">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
              <p className="text-sm text-gray-400">Loading results…</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
            <BookOpen className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium">No exam results yet</p>
            <Link
              href="/exams"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <Zap className="w-4 h-4" /> Start your first exam
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={BarChart3} label="Average score"  value={`${avg}%`}             accent={{ bg: '#EFF6FF', text: '#1D4ED8', ring: '#93C5FD' }} />
              <StatCard icon={Trophy}   label="Best score"     value={`${best}%`}             accent={{ bg: '#FEF9C3', text: '#854D0E', ring: '#FDE68A' }} />
              <StatCard icon={Target}   label="Exams passed"   value={`${passed}/${results.length}`} accent={{ bg: '#DCFCE7', text: '#166534', ring: '#86EFAC' }} />
              <StatCard icon={TrendingUp} label="Exams taken"  value={results.length}         accent={{ bg: '#F5F3FF', text: '#6D28D9', ring: '#DDD6FE' }} />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="Search by subject or exam type…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {examTypes.length > 1 && (
                <select
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white transition"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All exam types</option>
                  {examTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="flex items-center gap-3">
                  <SortBtn k="subject" label="Subject" />
                </div>
                <div className="w-24 text-right"><SortBtn k="score" label="Score" /></div>
                <div className="w-20 text-center">Grade</div>
                <div className="w-28 text-right"><SortBtn k="date" label="Date" /></div>
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2 text-gray-400">
                  <Search className="w-7 h-7 opacity-40" />
                  <p className="text-sm">No results match your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map((result) => {
                    const pct = calculatePercentage(result.score, result.totalQuestions)
                    const gs = gradeStyle(pct)
                    return (
                      <Link
                        key={result.id}
                        href={`/results/${result.id}`}
                        className="group flex sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4 items-center px-5 py-4 hover:bg-gray-50/60 transition-colors"
                      >
                        {/* Subject */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: gs.bg }}>
                            <TrendingUp className="w-4 h-4" style={{ color: gs.color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{result.subject}</p>
                            <p className="text-xs text-gray-400 truncate">{result.examType}</p>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="hidden sm:block w-24 text-right">
                          <p className="text-base font-bold tabular-nums" style={{ color: gs.color }}>{pct}%</p>
                          <p className="text-xs text-gray-400">{result.score}/{result.totalQuestions}</p>
                          <ScoreBar pct={pct} />
                        </div>

                        {/* Grade pill — desktop */}
                        <div className="hidden sm:flex w-20 justify-center">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{ background: gs.bg, color: gs.color }}
                          >
                            {gs.label}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="hidden sm:block w-28 text-right text-xs text-gray-400 tabular-nums">
                          {formatDate(result.completedAt)}
                        </div>

                        {/* Mobile: score inline */}
                        <div className="sm:hidden ml-auto text-right shrink-0">
                          <p className="text-base font-bold tabular-nums" style={{ color: gs.color }}>{pct}%</p>
                          <p className="text-xs text-gray-400">{formatDate(result.completedAt)}</p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Footer */}
              {filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                  <p className="text-xs text-gray-400">
                    Showing {filtered.length} of {results.length} result{results.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StudentShell>
  )
}