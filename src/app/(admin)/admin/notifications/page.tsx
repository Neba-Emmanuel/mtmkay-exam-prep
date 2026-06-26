'use client'

import { useEffect, useMemo, useState } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { AlertTriangle, Bell, CheckCircle2, Info, Send, XCircle } from 'lucide-react'

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
type Audience = 'ALL' | 'STUDENTS' | 'ADMINS'

interface AdminNotification {
  id: string
  title: string
  message: string
  type: NotificationType
  actionUrl?: string | null
  readAt?: string | null
  createdAt: string
  recipient: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
  }
  createdBy?: {
    firstName: string
    lastName: string
    email: string
  } | null
}

const typeOptions: Array<{ value: NotificationType; label: string; icon: typeof Info; className: string }> = [
  { value: 'INFO', label: 'Info', icon: Info, className: 'border-blue-100 bg-blue-50 text-blue-700' },
  { value: 'SUCCESS', label: 'Success', icon: CheckCircle2, className: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
  { value: 'WARNING', label: 'Warning', icon: AlertTriangle, className: 'border-amber-100 bg-amber-50 text-amber-700' },
  { value: 'ERROR', label: 'Urgent', icon: XCircle, className: 'border-red-100 bg-red-50 text-red-700' },
]

const initialForm = {
  title: '',
  message: '',
  audience: 'ALL' as Audience,
  type: 'INFO' as NotificationType,
  actionUrl: '',
}

function fullName(user: { firstName: string; lastName: string; email: string }) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function typeStyle(type: NotificationType) {
  return typeOptions.find((option) => option.value === type) ?? typeOptions[0]
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  )

  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const response = await api.get('/notifications/admin/all')
      setNotifications(response.data ?? [])
    } catch (fetchError) {
      console.error('Failed to fetch admin notifications:', fetchError)
      setError('Could not load notifications')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchNotifications(true)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [])

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value } as typeof form))
    setError('')
    setSuccess('')
  }

  const sendNotification = async () => {
    setError('')
    setSuccess('')
    setIsSending(true)

    try {
      const response = await api.post('/notifications/admin', {
        ...form,
        actionUrl: form.actionUrl.trim() || null,
      })
      setSuccess(`Sent to ${response.data.createdCount.toLocaleString()} user${response.data.createdCount === 1 ? '' : 's'}`)
      setForm(initialForm)
      await fetchNotifications()
    } catch (sendError) {
      setError(
        (sendError as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to send notification'
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AdminShell title="Notifications" description="">
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">Notifications</h1>
            <p className="mt-1 text-sm text-gray-400">Send account updates and review recent delivery history.</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-medium text-blue-500">Unread delivered</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{unreadCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,28rem)_1fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Compose</h2>
                <p className="text-xs text-gray-400">Create a persistent in-app notification.</p>
              </div>
            </div>

            <div className="space-y-4">
              {error && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
              {success && <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</p>}

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Title</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={(event) => set('title', event.target.value)}
                  placeholder="New practicals available"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Message</label>
                <textarea
                  className="min-h-28 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.message}
                  onChange={(event) => set('message', event.target.value)}
                  placeholder="Tell learners what changed."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Audience</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.audience}
                    onChange={(event) => set('audience', event.target.value)}
                  >
                    <option value="ALL">All users</option>
                    <option value="STUDENTS">Students</option>
                    <option value="ADMINS">Admins</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.type}
                    onChange={(event) => set('type', event.target.value)}
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">Action URL</label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.actionUrl}
                  onChange={(event) => set('actionUrl', event.target.value)}
                  placeholder="/exams"
                />
              </div>

              <button
                type="button"
                onClick={sendNotification}
                disabled={isSending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isSending ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send notification
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">Recent Notifications</h2>
              <p className="text-xs text-gray-400">Latest 100 delivered notification records.</p>
            </div>

            {isLoading ? (
              <div className="flex h-80 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-20 text-center">
                <Bell className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm font-medium text-gray-700">No notifications sent yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Notification</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Recipient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {notifications.map((notification) => {
                      const style = typeStyle(notification.type)
                      const Icon = style.icon
                      return (
                        <tr key={notification.id} className="transition-colors hover:bg-gray-50/60">
                          <td className="px-4 py-3">
                            <div className="flex gap-3">
                              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${style.className}`}>
                                <Icon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900">{notification.title}</p>
                                <p className="max-w-md truncate text-xs text-gray-500">{notification.message}</p>
                                {notification.actionUrl && <p className="mt-1 text-[11px] text-blue-600">{notification.actionUrl}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{fullName(notification.recipient)}</p>
                            <p className="text-xs text-gray-500">{notification.recipient.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${notification.readAt ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {notification.readAt ? 'Read' : 'Unread'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs tabular-nums text-gray-500">{formatDate(notification.createdAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
