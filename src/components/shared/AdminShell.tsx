'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { clearAuthSession } from '@/lib/authSession'
import api from '@/lib/api'
import {
  Menu, X, LayoutDashboard, Users, FileQuestion,
  BookOpen, Beaker, CreditCard, BarChart3, LogOut, ChevronRight, Hash,
} from 'lucide-react'

interface AdminShellProps {
  title: string
  description?: string
  children: React.ReactNode
}

const adminNav = [
  { href: '/admin',             label: 'Overview',   icon: LayoutDashboard },
  { href: '/admin/users',       label: 'Users',      icon: Users },
  { href: '/admin/questions',   label: 'Questions',  icon: FileQuestion },
  { href: '/admin/subjects',    label: 'Subjects',   icon: BookOpen },
  { href: '/admin/exam-types',  label: 'Exam Types', icon: Hash },
  { href: '/admin/practicals',  label: 'Practicals', icon: Beaker },
  { href: '/admin/payments',    label: 'Payments',   icon: CreditCard },
  { href: '/admin/analytics',   label: 'Analytics',  icon: BarChart3 },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {adminNav.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-lg transition-all',
                isActive ? 'bg-white/15' : 'group-hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
            </span>
            <span className="flex-1">{item.label}</span>
            {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminShell({ title, description, children }: AdminShellProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    clearAuthSession()
    window.location.href = '/login'
  }

  /* Current page label for breadcrumb */
  const currentPage = adminNav.find((n) => n.href === pathname)?.label ?? title

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/8">
          <Link
            href="/admin"
            className="flex items-center gap-3 group"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0">
              <Image src="/mtmkay_logo.png" alt="MTMKay" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight leading-none">MTMKay</p>
              <p className="text-xs text-slate-500 mt-0.5">Admin Console</p>
            </div>
          </Link>
          <button
            type="button"
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/8 hover:text-white transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section label */}
        <div className="px-6 pt-5 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Navigation</p>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-all"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </span>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main column ───────────────────────────────────── */}
      <div className="lg:pl-64 min-h-screen flex flex-col">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5">

            {/* Mobile hamburger */}
            <button
              type="button"
              className="lg:hidden w-8 h-8 -ml-1 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
                <span>Admin</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-600 font-medium truncate">{currentPage}</span>
              </div>
              <h1 className="text-base font-bold text-blue-700 leading-tight truncate">{title}</h1>
            </div>

            {/* Logout — desktop */}
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>

            {/* Logout — mobile icon */}
            <button
              onClick={handleLogout}
              className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
