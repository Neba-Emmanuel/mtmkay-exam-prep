'use client'

import { useEffect, useMemo, useState } from 'react'
import { AdminShell } from '@/components/shared/AdminShell'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Check, Mail, Search, Send, XCircle } from 'lucide-react'

type Audience = 'ALL' | 'STUDENTS' | 'ADMINS' | 'SELECTED'

interface Recipient {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
}

interface EmailLog {
  id: string
  recipientEmail: string
  recipientName?: string | null
  subject: string
  type: string
  status: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED'
  error?: string | null
  createdAt: string
  user?: Recipient | null
}

const initialForm = {
  audience: 'SELECTED' as Audience,
  subject: '',
  message: '',
  ctaLabel: '',
  ctaUrl: '',
}

function fullName(user: Pick<Recipient, 'firstName' | 'lastName' | 'email'>) {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function logRecipientName(log: EmailLog) {
  if (log.recipientName) return log.recipientName
  if (log.user) return fullName(log.user)
  return log.recipientEmail
}

function statusClass(status: EmailLog['status']) {
  if (status === 'SENT') return 'bg-emerald-50 text-emerald-700'
  if (status === 'FAILED') return 'bg-red-50 text-red-700'
  if (status === 'SKIPPED') return 'bg-amber-50 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

export default function AdminEmailsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initialForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const filteredRecipients = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return recipients
    return recipients.filter((recipient) =>
      [
        fullName(recipient),
        recipient.email,
        recipient.role,
      ].some((value) => value.toLowerCase().includes(query))
    )
  }, [recipients, search])

  const targetCount = form.audience === 'SELECTED'
    ? selectedIds.length
    : recipients.filter((recipient) => {
        if (form.audience === 'STUDENTS') return recipient.role.toUpperCase() === 'STUDENT'
        if (form.audience === 'ADMINS') return ['ADMIN', 'SUPER_ADMIN'].includes(recipient.role.toUpperCase())
        return true
      }).length

  const fetchData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const [recipientResponse, logResponse] = await Promise.all([
        api.get('/emails/admin/recipients'),
        api.get('/emails/admin/logs'),
      ])
      setRecipients(recipientResponse.data ?? [])
      setLogs(logResponse.data ?? [])
    } catch (fetchError) {
      console.error('Failed to load email console:', fetchError)
      setError('Could not load email console')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchData(true)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [])

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value } as typeof form))
    setError('')
    setSuccess('')
  }

  const toggleRecipient = (recipientId: string) => {
    setSelectedIds((current) =>
      current.includes(recipientId)
        ? current.filter((id) => id !== recipientId)
        : [...current, recipientId]
    )
  }

  const selectVisible = () => {
    const visibleIds = filteredRecipients.map((recipient) => recipient.id)
    setSelectedIds((current) => Array.from(new Set([...current, ...visibleIds])))
  }

  const clearSelected = () => setSelectedIds([])

  const sendEmail = async () => {
    setError('')
    setSuccess('')

    if (form.audience === 'SELECTED' && selectedIds.length === 0) {
      setError('Select at least one recipient')
      return
    }

    setIsSending(true)
    try {
      const response = await api.post('/emails/admin/custom', {
        audience: form.audience === 'SELECTED' ? 'ALL' : form.audience,
        recipientIds: form.audience === 'SELECTED' ? selectedIds : [],
        subject: form.subject,
        message: form.message,
        ctaLabel: form.ctaLabel.trim() || null,
        ctaUrl: form.ctaUrl.trim() || null,
      })
      const { sentCount, skippedCount, failedCount, attemptedCount } = response.data
      setSuccess(`Processed ${attemptedCount} email${attemptedCount === 1 ? '' : 's'}: ${sentCount} sent, ${skippedCount} skipped, ${failedCount} failed`)
      setForm(initialForm)
      setSelectedIds([])
      await fetchData()
    } catch (sendError) {
      setError(
        (sendError as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to send email'
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AdminShell title="Emails" description="">
      <div className="space-y-6 pb-12">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">Admin Console</p>
            <h1 className="text-3xl font-bold tracking-tight text-blue-700">Email Center</h1>
            <p className="mt-1 text-sm text-gray-400">Send polished emails to one user, selected users, or full audiences.</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-medium text-blue-500">Current target</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{targetCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,28rem)_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Compose Email</h2>
                  <p className="text-xs text-gray-400">HTML and plain text versions are generated automatically.</p>
                </div>
              </div>

              <div className="space-y-4">
                {error && <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
                {success && <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</p>}

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Audience</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.audience}
                    onChange={(event) => set('audience', event.target.value)}
                  >
                    <option value="SELECTED">Selected users</option>
                    <option value="ALL">All active users</option>
                    <option value="STUDENTS">Students</option>
                    <option value="ADMINS">Admins</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Subject</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.subject}
                    onChange={(event) => set('subject', event.target.value)}
                    placeholder="Important update for your account"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Message</label>
                  <textarea
                    className="min-h-40 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.message}
                    onChange={(event) => set('message', event.target.value)}
                    placeholder="Write the email body here."
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Button label</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.ctaLabel}
                      onChange={(event) => set('ctaLabel', event.target.value)}
                      placeholder="Open dashboard"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Button URL</label>
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.ctaUrl}
                      onChange={(event) => set('ctaUrl', event.target.value)}
                      placeholder="https://exam.mtmkay.com/dashboard"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={sendEmail}
                  disabled={isSending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send email
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">Recipients</h2>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={selectVisible} className="text-xs font-medium text-blue-700 hover:text-blue-800">Select visible</button>
                  <button type="button" onClick={clearSelected} className="text-xs font-medium text-gray-400 hover:text-gray-600">Clear</button>
                </div>
              </div>

              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search users..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="flex h-36 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
                  </div>
                ) : filteredRecipients.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-400">No recipients found</p>
                ) : (
                  filteredRecipients.map((recipient) => {
                    const selected = selectedIds.includes(recipient.id)
                    return (
                      <button
                        type="button"
                        key={recipient.id}
                        onClick={() => toggleRecipient(recipient.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <span className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white text-transparent'}`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">{fullName(recipient)}</span>
                          <span className="block truncate text-xs text-gray-400">{recipient.email}</span>
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                          {recipient.role.toLowerCase()}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">Recent Email Activity</h2>
              <p className="text-xs text-gray-400">Latest 100 delivery records, including skipped sends when email is not configured.</p>
            </div>

            {isLoading ? (
              <div className="flex h-80 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
              </div>
            ) : logs.length === 0 ? (
              <div className="px-5 py-20 text-center">
                <XCircle className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm font-medium text-gray-700">No email activity yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Recipient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="transition-colors hover:bg-gray-50/60">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{log.subject}</p>
                          <p className="text-xs text-gray-400">{log.type.replace(/_/g, ' ').toLowerCase()}</p>
                          {log.error && <p className="mt-1 max-w-sm truncate text-[11px] text-red-500">{log.error}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{logRecipientName(log)}</p>
                          <p className="text-xs text-gray-500">{log.recipientEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(log.status)}`}>
                            {log.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs tabular-nums text-gray-500">{formatDate(log.createdAt)}</td>
                      </tr>
                    ))}
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
