'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, AlertCircle, Check, User, Mail, Phone, Lock } from 'lucide-react'

/* ─── Password visibility toggle ─────────────────────── */
function PasswordInput({
  id, name, value, onChange, placeholder,
}: {
  id: string; name: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        id={id} name={name}
        type={show ? 'text' : 'password'}
        value={value} onChange={onChange}
        placeholder={placeholder ?? '••••••••'}
        required minLength={6}
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

/* ─── Password strength ───────────────────────────────── */
function StrengthBar({ password }: { password: string }) {
  if (!password) return null
  const segments = [4, 6, 8, 10]
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E']
  const level = segments.filter((t) => password.length >= t).length
  return (
    <div className="flex items-center gap-2 mt-1.5">
      {segments.map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-full transition-colors duration-300"
          style={{ background: i < level ? colors[i] : '#E5E7EB' }}
        />
      ))}
      <span className="text-xs text-gray-400 shrink-0 w-16">{labels[level]}</span>
    </div>
  )
}

/* ─── Field wrapper ───────────────────────────────────── */
const inputCls = 'w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition'

function Field({ label, icon: Icon, children }: {
  label: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter()
  const authLogin = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  })

  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match')
    if (formData.password.length < 6) return setError('Password must be at least 6 characters')
    setIsLoading(true)
    try {
      const { confirmPassword, ...registerData } = formData
      const { data } = await api.post('/auth/register', registerData)
      const { user, accessToken, refreshToken } = data
      const normalizedUser = { ...user, role: String(user.role || 'student').toLowerCase() }
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      authLogin(normalizedUser, accessToken, refreshToken)
      const target = ['admin', 'school_admin', 'super_admin'].includes(normalizedUser.role) ? '/admin' : '/dashboard'
      router.push(target)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Left decorative panel (desktop) ── */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 100%)' }}
      >
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #3B82F6, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #7C3AED, transparent)' }} />

        <div className="relative z-10 text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-white/10 mx-auto mb-6">
            <Image src="/mtmkay_logo.png" alt="MTMKay" width={64} height={64} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-3">MTMKay Exam Prep</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Join thousands of students preparing for GCE, BEPC, and other national exams.
          </p>
          <div className="space-y-3 text-left">
            {[
              'Access 1,000+ past questions',
              'Practice by subject and topic',
              'Track your performance over time',
              'Science practicals with step-by-step guides',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

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

          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-400 mt-1">Start your exam preparation journey today</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 mb-5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" icon={User}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="firstName" name="firstName" type="text"
                    placeholder="Jane"
                    value={formData.firstName} onChange={set}
                    required className={inputCls}
                  />
                </div>
              </Field>
              <Field label="Last name" icon={User}>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="lastName" name="lastName" type="text"
                    placeholder="Doe"
                    value={formData.lastName} onChange={set}
                    required className={inputCls}
                  />
                </div>
              </Field>
            </div>

            {/* Email */}
            <Field label="Email address" icon={Mail}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="email" name="email" type="email"
                  placeholder="you@example.com"
                  value={formData.email} onChange={set}
                  required className={inputCls}
                />
              </div>
            </Field>

            {/* Phone */}
            <Field label="Phone number" icon={Phone}>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="phone" name="phone" type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={formData.phone} onChange={set}
                  required className={inputCls}
                />
              </div>
            </Field>

            {/* Password */}
            <Field label="Password" icon={Lock}>
              <PasswordInput
                id="password" name="password"
                value={formData.password} onChange={set}
                placeholder="At least 6 characters"
              />
              <StrengthBar password={formData.password} />
            </Field>

            {/* Confirm password */}
            <Field label="Confirm password" icon={Lock}>
              <PasswordInput
                id="confirmPassword" name="confirmPassword"
                value={formData.confirmPassword} onChange={set}
                placeholder="Repeat your password"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length > 0 && (
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </Field>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors mt-2"
            >
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>
                : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-gray-900 font-semibold hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}