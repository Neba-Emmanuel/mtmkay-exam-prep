'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { NotificationBell } from '@/components/shared/NotificationBell'
import {
  Menu, X, BarChart3, FileText, TrendingUp,
  Beaker, User, LogOut, ChevronRight, CreditCard,
} from 'lucide-react'

const studentNav = [
  { href: '/dashboard',    label: 'Dashboard',    icon: BarChart3 },
  { href: '/exams',        label: 'Exams',        icon: FileText },
  { href: '/results',      label: 'Results',      icon: TrendingUp },
  { href: '/practicals',   label: 'Practicals',   icon: Beaker },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/profile',      label: 'Profile',      icon: User },
]

interface StudentShellProps {
  title: string
  description?: string
  children: React.ReactNode
  headerAction?: React.ReactNode
  user?: { firstName: string; lastName: string; role?: string } | null
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {studentNav.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              active
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-lg transition-all',
                active ? 'bg-white/15' : 'group-hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
            </span>
            <span className="flex-1">{item.label}</span>
            {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
          </Link>
        )
      })}
    </nav>
  )
}

/* User avatar initials */
function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 border border-blue-400/20 flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-white">{initials}</span>
    </div>
  )
}

export function StudentShell({
  title,
  description,
  children,
  headerAction,
  user: userProp,
}: StudentShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)
  const storeUser = useAuthStore((state) => state.user)
  const user = userProp ?? storeUser
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (user?.role && user.role !== 'student') router.replace('/admin')
  }, [user, router])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch {}
    logout()
    router.push('/login')
  }

  const currentPage = studentNav.find((n) => n.href === pathname)?.label ?? title

  const formatRole = (role?: string) =>
    (role ?? 'student')
      .split('_')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')

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
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0">
              <Image
                src="/mtmkay_logo.png"
                alt="MTMKay"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight leading-none">MTMKay</p>
              <p className="text-xs text-slate-500 mt-0.5">Exam Prep</p>
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Menu</p>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
        </div>

        {/* User + logout */}
        <div className="p-3 border-t border-white/8 space-y-1">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
              <Avatar firstName={user.firstName} lastName={user.lastName} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500 leading-tight">{formatRole(user.role)}</p>
              </div>
            </div>
          )}
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
              aria-expanded={menuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-0.5">
                <span>MTMKay</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-600 font-medium truncate">{currentPage}</span>
              </div>
              <h1 className="text-base font-bold text-blue-700 leading-tight truncate">{title}</h1>
            </div>

            {/* Header action slot */}
            {headerAction && (
              <div className="shrink-0 flex items-center gap-2">{headerAction}</div>
            )}

            <NotificationBell />

            {/* User chip — desktop only (sidebar shows full card) */}
            {user && (
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Avatar firstName={user.firstName} lastName={user.lastName} />
                <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate">
                  {user.firstName}
                </span>
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
