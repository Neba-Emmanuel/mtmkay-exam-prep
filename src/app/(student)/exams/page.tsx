'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StudentShell } from '@/components/shared/StudentShell'
import {
  BookOpen, GraduationCap, Building2, Briefcase, FileText,
  ChevronRight, Hash, Layers, Zap, Search,
  Calendar, ArrowLeft,
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

interface PaperYear {
  year: number
  questionCount: number
  label: string
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
  { bg: '#EFF6FF', text: '#1D4ED8', active: '#2563EB', ring: '#BFDBFE', soft: '#DBEAFE' },
  { bg: '#F0F9FF', text: '#0369A1', active: '#0284C7', ring: '#BAE6FD', soft: '#E0F2FE' },
  { bg: '#EEF2FF', text: '#3730A3', active: '#4F46E5', ring: '#C7D2FE', soft: '#E0E7FF' },
  { bg: '#ECFEFF', text: '#0E7490', active: '#0891B2', ring: '#A5F3FC', soft: '#CFFAFE' },
  { bg: '#F8FAFC', text: '#1E3A8A', active: '#1E40AF', ring: '#93C5FD', soft: '#DBEAFE' },
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
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [paperYears, setPaperYears] = useState<PaperYear[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [yearsLoading, setYearsLoading] = useState(false)
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
    api.get(`/exams/categories/${selectedCategory}/subjects`)
      .then((r) => setSubjects(r.data))
      .catch(console.error)
      .finally(() => setSubjectsLoading(false))
  }, [selectedCategory])

  useEffect(() => {
    if (!selectedSubject) return
    api.get(`/exams/subjects/${selectedSubject}/years`)
      .then((r) => setPaperYears(r.data))
      .catch(console.error)
      .finally(() => setYearsLoading(false))
  }, [selectedSubject])

  const selectCategory = (categoryId: string) => {
    if (categoryId === selectedCategory) return
    setSelectedCategory(categoryId)
    setSubjectsLoading(true)
    setSelectedSubject(null)
    setPaperYears([])
    setSearch('')
  }

  const selectSubject = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setYearsLoading(true)
    setPaperYears([])
  }

  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCat = categories.find((c) => c.id === selectedCategory)
  const selectedSubjectData = subjects.find((subject) => subject.id === selectedSubject)

  return (
    <StudentShell title="Exams" description="Choose your exam type and subject">
      <div className="space-y-8 pb-12 exam-fade-in">

        {/* Header */}
        <div className="border-b border-blue-100 pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Exams</p>
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Start a session</h1>
          <p className="text-sm text-gray-400 mt-1">Pick a category, then choose a subject</p>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center h-52">
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
              <p className="text-sm text-gray-400">Loading exam types…</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Category tabs ── */}
            <div>
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">Exam type</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {categories.map((cat, index) => {
                  const Icon = getIcon(cat.icon)
                  const ac = accentFor(cat.id)
                  const active = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => selectCategory(cat.id)}
                      className="group relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg exam-rise-in exam-soft-sheen"
                      style={active
                        ? { background: ac.active, borderColor: 'transparent', color: 'white', boxShadow: `0 12px 28px ${ac.ring}` }
                        : { background: `linear-gradient(180deg, white 0%, ${ac.bg} 100%)`, borderColor: ac.soft, animationDelay: `${index * 55}ms` }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
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
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-0.5">Subject</p>
                    <h2 className="text-lg font-bold text-blue-950">
                      {selectedCat?.name} subjects
                    </h2>
                  </div>
                  {subjects.length > 4 && (
                    <div className="relative max-w-xs w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-blue-100 text-sm text-blue-950 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Filter subjects…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {subjectsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
                  </div>
                ) : filteredSubjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                    <Search className="w-7 h-7 opacity-40" />
                    <p className="text-sm">{search ? 'No subjects match your search' : 'No subjects found'}</p>
                  </div>
                ) : selectedSubject && selectedSubjectData ? (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setSelectedSubject(null)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> All subjects
                    </button>

                    <div className="rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-blue-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: accentFor(selectedCategory).bg }}
                          >
                            <BookOpen className="w-5 h-5" style={{ color: accentFor(selectedCategory).text }} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Past papers</p>
                            <h3 className="text-lg font-bold text-blue-950">{selectedSubjectData.name}</h3>
                            <p className="text-sm text-gray-400">{selectedSubjectData.questionCount} question{selectedSubjectData.questionCount !== 1 ? 's' : ''} in this subject</p>
                          </div>
                        </div>
                        <Link href={`/exams/start?subject=${selectedSubjectData.id}`} className="self-start sm:self-auto">
                          <button
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                            style={{ background: accentFor(selectedCategory).bg, color: accentFor(selectedCategory).text }}
                          >
                            <Zap className="w-4 h-4" /> Mixed practice
                          </button>
                        </Link>
                      </div>

                      {yearsLoading ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
                        </div>
                      ) : paperYears.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                          <Calendar className="w-7 h-7 opacity-40" />
                          <p className="text-sm">No past years have been uploaded for this subject yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
                          {paperYears.map((paper, index) => (
                            <Link
                              key={paper.year}
                              href={`/exams/start?subject=${selectedSubjectData.id}&year=${paper.year}`}
                              className="group rounded-xl border border-blue-50 bg-gradient-to-b from-white to-blue-50/40 p-4 hover:border-blue-200 hover:shadow-lg transition-all duration-300 exam-rise-in"
                              style={{ animationDelay: `${index * 45}ms` }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Exam year</p>
                                  <h4 className="text-2xl font-bold text-blue-950">{paper.year}</h4>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              </div>
                              <p className="mt-3 inline-flex items-center gap-1 text-xs text-gray-400">
                                <Hash className="w-3.5 h-3.5" />
                                {paper.questionCount} question{paper.questionCount !== 1 ? 's' : ''}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubjects.map((subject, index) => {
                      const ac = accentFor(selectedCategory)
                      return (
                        <div
                          key={subject.id}
                          className="group bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col exam-rise-in"
                          style={{ borderColor: ac.soft, animationDelay: `${index * 45}ms` }}
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
                              <ChevronRight className="w-4 h-4 text-blue-300 mt-2.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </div>

                            <h3 className="font-semibold text-blue-950 text-sm leading-snug mb-1">{subject.name}</h3>

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
                              <button
                                type="button"
                                onClick={() => selectSubject(subject.id)}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 46%, #0EA5E9 100%)' }}
                              >
                                <Calendar className="w-3.5 h-3.5" /> Years
                              </button>
                              <Link href={`/exams/start?subject=${subject.id}`} className="block">
                                <button
                                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5"
                                  style={{ background: ac.bg, color: ac.text }}
                                >
                                  <Zap className="w-3.5 h-3.5" /> Practice
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
