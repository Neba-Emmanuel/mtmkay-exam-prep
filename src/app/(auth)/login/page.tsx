'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, AlertCircle, Mail, Lock, BookOpen, TrendingUp, Beaker, BarChart3 } from 'lucide-react'

/* ─── Password input ─────────────────────────────────── */
function PasswordInput({ value, onChange }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        id="password" name="password"
        type={show ? 'text' : 'password'}
        placeholder="••••••••"
        value={value} onChange={onChange}
        required
        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

const inputCls = 'w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition'

/* ─── Main Page ──────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter()
  const authLogin = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', formData)
      const { user, accessToken, refreshToken } = data
      const normalizedUser = { ...user, role: String(user.role || 'student').toLowerCase() }
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      authLogin(normalizedUser, accessToken, refreshToken)
      const target = ['admin', 'school_admin', 'super_admin'].includes(normalizedUser.role) ? '/admin' : '/dashboard'
      router.push(target)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid email or password')
    } finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Left decorative panel ── */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)' }}
      >
        {/* Background glows */}
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #3B82F6, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-52 h-52 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent)' }} />

        <div className="relative z-10 text-center max-w-xs">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-white/10 mx-auto mb-6">
            <Image src="/mtmkay_logo.png" alt="MTMKay" width={64} height={64} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Welcome back</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Continue where you left off. Your progress is waiting.
          </p>

          {/* Quick stat cards */}
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { icon: BookOpen,   label: 'Subjects',    value: '20+',  bg: '#1D4ED820', color: '#60A5FA' },
              { icon: TrendingUp, label: 'Questions',   value: '1k+',  bg: '#16803420', color: '#4ADE80' },
              { icon: Beaker,     label: 'Practicals',  value: '50+',  bg: '#7C3AED20', color: '#A78BFA' },
              { icon: BarChart3,  label: 'Exam types',  value: '4',    bg: '#C2410C20', color: '#FB923C' },
            ].map(({ icon: Icon, label, value, bg, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/5"
                style={{ background: bg }}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                <div>
                  <p className="text-sm font-bold text-white leading-none">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-gray-200 shrink-0">
              <Image src="/mtmkay_logo.png" alt="MTMKay" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">MTMKay</p>
              <p className="text-xs text-gray-400">Exam Prep</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sign in</h1>
            <p className="text-sm text-gray-400 mt-1">Continue your exam preparation</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 mb-5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email" name="email" type="email"
                  placeholder="you@example.com"
                  value={formData.email} onChange={set}
                  required className={inputCls}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-500">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput value={formData.password} onChange={set} />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors mt-1"
            >
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
                : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-gray-900 font-semibold hover:underline underline-offset-2">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}