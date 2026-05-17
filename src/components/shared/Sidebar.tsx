'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  FileText,
  TrendingUp,
  Beaker,
  User,
  ChevronRight,
  LogOut,
  ChevronLeft,
} from 'lucide-react'

interface SidebarProps {
  user?: {
    firstName: string
    lastName: string
  } | null
  onLogout: () => void
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/exams', label: 'Exams', icon: FileText },
    { href: '/results', label: 'Results', icon: TrendingUp },
    { href: '/practicals', label: 'Practicals', icon: Beaker },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <aside
      className={cn(
        'bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className={cn('flex-shrink-0', isCollapsed ? 'w-10 h-10' : 'w-12 h-12')}>
            <Image
              src="/mtmkay_logo.png"
              alt="MTMKay Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold">MTMKay</h1>
              <p className="text-xs text-slate-400">Exam Prep</p>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  'w-full px-4 py-3 rounded-lg transition-colors flex items-center gap-3',
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                )}
              >
                <Icon size={20} />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="px-4 py-6 border-t border-slate-700 space-y-4">
        {!isCollapsed && user && (
          <div className="px-4 py-3 bg-slate-700 bg-opacity-50 rounded-lg">
            <p className="text-sm font-medium text-white truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-slate-400">Student</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn('text-slate-300 hover:text-white w-full', isCollapsed && 'px-0')}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className={cn('text-slate-300 hover:text-red-400 flex-1', isCollapsed && 'px-0')}
            title="Logout"
          >
            {!isCollapsed && <span>Logout</span>}
            {isCollapsed && <LogOut size={18} />}
          </Button>
        </div>
      </div>
    </aside>
  )
}
