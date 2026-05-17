'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StudentShell } from '@/components/shared/StudentShell'
import {
  BookOpen, GraduationCap, Building2, Briefcase, FileText,
  ChevronRight, Hash, Layers, Zap, ClipboardList, Search,
} from 'lucide-react'
import api from '@/lib/api'

/* ─── Types ──────────────────────────────────────────── */
interface ExamCategory {
  id: string
  name: string
  description: string
  subjectCount: number
  icon: string
}

interface Subject {
  id: string
  name: string
  topicCount: number
  questionCount: number
}

/* ─── Icon map ───────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, GraduationCap, Building2, Briefcase, FileText,
}

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? FileText
}

/* ─── Accent palette (hashed per category) ───────────── */
const ACCENTS = [
  { bg: '#EFF6FF', text: '#1D4ED8', active: '#2563EB', ring: '#BFDBFE' },
  { bg: '#F0FDF4', text: '#15803D', active: '#16A34A', ring: '#BBF7D0' },
  { bg: '#F5F3FF', text: '#6D28D9', active: '#7C3AED', ring: '#DDD6FE' },
  { bg: '#FFF7ED', text: '#C2410C', active: '#EA580C', ring: '#FED7AA' },
  { bg: '#FDF4FF', text: '#7E22CE', active: '#9333EA', ring: '#E9D5FF' },
]
function accentFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff
  return ACCENTS[h % ACCENTS.length]
}

/* ─── Empty / prompt state ───────────────────────────── */
function PromptState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
        <FileText className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-base font-semibold text-gray-700">Pick an exam type above</p>
      <p className="text-sm text-gray-400">Then choose a subject to start practising or sit an exam.</p>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function ExamsPage() {
  const [categories, setCategories] = useState<ExamCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/exams/categories')
      .then((r) => setCategories(r.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedCategory) return
    setSubjectsLoading(true)
    setSearch('')
    api.get(`/exams/categories/${selectedCategory}/subjects`)
      .then((r) => setSubjects(r.data))
      .catch(console.error)
      .finally(() => setSubjectsLoading(false))
  }, [selectedCategory])

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCat = categories.find((c) => c.id === selectedCategory)

  return (
    <StudentShell title="Exams" description="Choose your exam type and subject">
      <div className="space-y-8 pb-12">

        {/* Header */}
        <div className="border-b border-gray-100 pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Exams</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Start a session</h1>
          <p className="text-sm text-gray-400 mt-1">Pick a category, then choose a subject</p>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-52">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
              <p className="text-sm text-gray-400">Loading exam types…</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Category tabs ── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Exam type</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {categories.map((cat) => {
                  const Icon = getIcon(cat.icon)
                  const ac = accentFor(cat.id)
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="group relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                      style={active
                        ? { background: ac.active, borderColor: 'transparent', color: 'white', boxShadow: `0 4px 14px ${ac.ring}` }
                        : { background: 'white', borderColor: '#E5E7EB' }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors"
                        style={active
                          ? { background: 'rgba(255,255,255,0.2)' }
                          : { background: ac.bg }}
                      >
                        <Icon className="w-4.5 h-4.5" style={active ? { color: 'white' } : { color: ac.text }} />
                      </div>
                      <p className={`text-sm font-semibold leading-tight ${active ? 'text-white' : 'text-gray-900'}`}>
                        {cat.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${active ? 'text-white/70' : 'text-gray-400'}`}>
                        {cat.subjectCount} subject{cat.subjectCount !== 1 ? 's' : ''}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Subjects ── */}
            {selectedCategory && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Subject</p>
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedCat?.name} subjects
                    </h2>
                  </div>
                  {subjects.length > 4 && (
                    <div className="relative max-w-xs w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                        placeholder="Filter subjects…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {subjectsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
                  </div>
                ) : filteredSubjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                    <Search className="w-7 h-7 opacity-40" />
                    <p className="text-sm">{search ? 'No subjects match your search' : 'No subjects found'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubjects.map((subject) => {
                      const ac = accentFor(selectedCategory)
                      return (
                        <div
                          key={subject.id}
                          className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 overflow-hidden flex flex-col"
                        >
                          {/* Top accent strip */}
                          <div className="h-1 w-full" style={{ background: ac.active }} />

                          <div className="p-5 flex flex-col flex-1">
                            {/* Subject name */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: ac.bg }}
                              >
                                <BookOpen className="w-4 h-4" style={{ color: ac.text }} />
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-300 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">{subject.name}</h3>

                            {/* Stats */}
                            <div className="flex items-center gap-3 mb-4">
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <Layers className="w-3.5 h-3.5" />
                                {subject.topicCount} topic{subject.topicCount !== 1 ? 's' : ''}
                              </span>
                              <span className="text-gray-200">·</span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <Hash className="w-3.5 h-3.5" />
                                {subject.questionCount} question{subject.questionCount !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* CTAs */}
                            <div className="mt-auto grid grid-cols-2 gap-2">
                              <Link href={`/exams/start?subject=${subject.id}`} className="block">
                                <button
                                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
                                  style={{ background: ac.bg, color: ac.text }}
                                >
                                  <Zap className="w-3.5 h-3.5" /> Practice
                                </button>
                              </Link>
                              <Link href={`/exams/start?subject=${subject.id}&mode=exam`} className="block">
                                <button
                                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                                >
                                  <ClipboardList className="w-3.5 h-3.5" /> Exam
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* No category selected yet */}
            {!selectedCategory && <PromptState />}
          </>
        )}
      </div>
    </StudentShell>
  )
}