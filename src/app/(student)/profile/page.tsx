'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { StudentShell } from '@/components/shared/StudentShell'
import {
  Camera, Lock, User, Mail, Phone, Calendar,
  Shield, Check, AlertCircle, Info, Eye, EyeOff, KeyRound,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'

/* ─── Types ──────────────────────────────────────────── */
interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  profilePhoto: string | null
  createdAt: string
  role: string
}

type MsgType = 'success' | 'error' | 'info' | ''

/* ─── Toast banner ───────────────────────────────────── */
function Banner({ type, text, onDismiss }: { type: MsgType; text: string; onDismiss: () => void }) {
  if (!text) return null
  const cfg = {
    success: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', icon: Check },
    error:   { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: AlertCircle },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: Info },
    '':      { bg: '#F9FAFB', border: '#E5E7EB', text: '#374151', icon: Info },
  }[type]
  const Icon = cfg.icon
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm"
      style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.text }}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span className="flex-1">{text}</span>
      <button onClick={onDismiss} className="text-current opacity-40 hover:opacity-70 transition-opacity text-xs">✕</button>
    </div>
  )
}

/* ─── Input ──────────────────────────────────────────── */
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition'
const inputDisabledCls = 'w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed'

/* ─── Section wrapper ────────────────────────────────── */
function Section({ icon: Icon, title, sub, children }: {
  icon: React.ElementType; title: string; sub: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

/* ─── Password input ─────────────────────────────────── */
function PasswordInput({ name, value, onChange, placeholder }: {
  name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputCls} pr-10`}
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────── */
export default function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: MsgType; text: string }>({ type: '', text: '' })

  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    api.get('/users/profile')
      .then((r) => {
        setProfile(r.data)
        setFormData({ firstName: r.data.firstName, lastName: r.data.lastName, phone: r.data.phone ?? '' })
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile' }))
      .finally(() => setIsLoading(false))
  }, [])

  const setMsg = (type: MsgType, text: string) => setMessage({ type, text })
  const clearMsg = () => setMessage({ type: '', text: '' })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true); clearMsg()
    try {
      const { data } = await api.put('/users/profile', formData)
      setProfile(data)
      setMsg('success', 'Profile updated successfully')
    } catch (err: unknown) {
      setMsg('error', (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update profile')
    } finally { setIsSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); clearMsg()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setMsg('error', 'Passwords do not match')
    if (passwordForm.newPassword.length < 8) return setMsg('error', 'Password must be at least 8 characters')
    setIsSaving(true)
    try {
      await api.post('/users/profile/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsChangingPassword(false)
      setMsg('success', 'Password changed successfully')
    } catch (err: unknown) {
      setMsg('error', (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password')
    } finally { setIsSaving(false) }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setMsg('error', 'Please select an image file')
    if (file.size > 5 * 1024 * 1024) return setMsg('error', 'File size must be less than 5MB')
    setMsg('info', 'Photo upload coming soon')
  }

  const initials = `${profile?.firstName?.[0] ?? ''}${profile?.lastName?.[0] ?? ''}`.toUpperCase()

  if (isLoading) {
    return (
      <StudentShell title="Profile" user={user}>
        <div className="flex items-center justify-center h-60">
          <div className="w-9 h-9 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
        </div>
      </StudentShell>
    )
  }

  return (
    <StudentShell title="Profile" user={user}>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">

        {/* Header */}
        <div className="border-b border-gray-100 pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Account</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your personal details and security settings</p>
        </div>

        {/* Banner */}
        <Banner type={message.type} text={message.text} onDismiss={clearMsg} />

        {/* ── Avatar ── */}
        <Section icon={Camera} title="Profile photo" sub="JPG, PNG or GIF · max 5 MB">
          <div className="flex items-center gap-5">
            {/* Avatar circle */}
            <div
              className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 group cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              {profile?.profilePhoto ? (
                <Image src={profile.profilePhoto} alt="Profile" width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
                  {initials}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{profile?.firstName} {profile?.lastName}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role ?? 'Student'}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" /> Upload photo
                </button>
              </div>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </Section>

        {/* ── Personal info ── */}
        <Section icon={User} title="Personal information" sub="Update your name and contact details">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name">
                <input
                  className={inputCls}
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </Field>
              <Field label="Last name">
                <input
                  className={inputCls}
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </Field>
            </div>

            <Field label="Phone number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  className={`${inputCls} pl-9`}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
            </Field>

            <Field label="Email address" hint="Email cannot be changed">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                <input className={`${inputDisabledCls} pl-9`} type="email" value={profile?.email ?? ''} disabled />
              </div>
            </Field>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {isSaving
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Check className="w-4 h-4" />}
                Save changes
              </button>
            </div>
          </form>
        </Section>

        {/* ── Security ── */}
        <Section icon={KeyRound} title="Security" sub="Manage your password">
          {!isChangingPassword ? (
            <button
              onClick={() => { setIsChangingPassword(true); clearMsg() }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Lock className="w-4 h-4" /> Change password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Field label="Current password">
                <PasswordInput
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Your current password"
                />
              </Field>
              <Field label="New password" hint="At least 8 characters">
                <PasswordInput
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="New password"
                />
              </Field>
              <Field label="Confirm new password">
                <PasswordInput
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                />
              </Field>

              {/* Strength hint */}
              {passwordForm.newPassword.length > 0 && (
                <div className="flex items-center gap-2">
                  {[4, 6, 8, 10].map((thresh, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-colors"
                      style={{
                        background: passwordForm.newPassword.length >= thresh
                          ? ['#EF4444', '#F97316', '#EAB308', '#22C55E'][i]
                          : '#E5E7EB',
                      }}
                    />
                  ))}
                  <span className="text-xs text-gray-400 shrink-0">
                    {passwordForm.newPassword.length < 4 ? 'Too short'
                      : passwordForm.newPassword.length < 6 ? 'Weak'
                      : passwordForm.newPassword.length < 8 ? 'Fair'
                      : passwordForm.newPassword.length < 10 ? 'Good'
                      : 'Strong'}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Check className="w-4 h-4" />}
                  Update password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    clearMsg()
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Section>

        {/* ── Account info ── */}
        <Section icon={Shield} title="Account information" sub="Your account details and status">
          <div className="divide-y divide-gray-50 space-y-0">
            {[
              {
                icon: Calendar,
                label: 'Member since',
                value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—',
              },
              {
                icon: User,
                label: 'Role',
                value: <span className="capitalize">{profile?.role ?? '—'}</span>,
              },
              {
                icon: Shield,
                label: 'Status',
                value: (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                ),
              },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon className="w-4 h-4 text-gray-400" />
                  {label}
                </div>
                <span className="text-sm text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </StudentShell>
  )
}