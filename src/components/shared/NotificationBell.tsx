'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, Info, Trash2, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: NotificationType
  actionUrl?: string | null
  readAt?: string | null
  createdAt: string
}

const typeStyles: Record<NotificationType, { icon: typeof Info; className: string }> = {
  INFO: { icon: Info, className: 'bg-blue-50 text-blue-700 border-blue-100' },
  SUCCESS: { icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  WARNING: { icon: AlertTriangle, className: 'bg-amber-50 text-amber-700 border-amber-100' },
  ERROR: { icon: XCircle, className: 'bg-red-50 text-red-700 border-red-100' },
}

function formatNotificationDate(value: string) {
  const date = new Date(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const hasUnread = unreadCount > 0
  const badgeLabel = useMemo(() => (unreadCount > 9 ? '9+' : unreadCount.toString()), [unreadCount])

  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data.notifications ?? [])
      setUnreadCount(response.data.unreadCount ?? 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchNotifications(true)
    }, 0)
    const interval = window.setInterval(() => {
      void fetchNotifications()
    }, 60000)
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const timeout = window.setTimeout(() => {
      void fetchNotifications()
    }, 0)
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    return () => {
      window.clearTimeout(timeout)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const markRead = async (notification: NotificationItem) => {
    if (notification.readAt) return
    setNotifications((items) =>
      items.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item)
    )
    setUnreadCount((count) => Math.max(count - 1, 0))
    try {
      await api.patch(`/notifications/${notification.id}/read`)
    } catch (error) {
      console.error('Failed to mark notification read:', error)
      fetchNotifications()
    }
  }

  const markAllRead = async () => {
    setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })))
    setUnreadCount(0)
    try {
      const response = await api.patch('/notifications/read-all')
      setNotifications(response.data.notifications ?? [])
      setUnreadCount(response.data.unreadCount ?? 0)
    } catch (error) {
      console.error('Failed to mark notifications read:', error)
      fetchNotifications()
    }
  }

  const deleteNotification = async (notificationId: string) => {
    const deleted = notifications.find((item) => item.id === notificationId)
    setNotifications((items) => items.filter((item) => item.id !== notificationId))
    if (deleted && !deleted.readAt) setUnreadCount((count) => Math.max(count - 1, 0))

    try {
      await api.delete(`/notifications/${notificationId}`)
    } catch (error) {
      console.error('Failed to delete notification:', error)
      fetchNotifications()
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-400">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={!hasUnread}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Read all
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && notifications.length === 0 ? (
              <div className="flex h-28 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell className="mx-auto h-7 w-7 text-gray-300" />
                <p className="mt-2 text-sm font-medium text-gray-700">No notifications yet</p>
                <p className="mt-1 text-xs text-gray-400">New account updates will appear here.</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const style = typeStyles[notification.type] ?? typeStyles.INFO
                const Icon = style.icon
                const unread = !notification.readAt
                const content = (
                  <div
                    className={cn(
                      'flex gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                      unread && 'bg-blue-50/40'
                    )}
                    onClick={() => markRead(notification)}
                  >
                    <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border', style.className)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">{notification.title}</span>
                        {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">{notification.message}</span>
                      <span className="mt-2 block text-[11px] text-gray-400">{formatNotificationDate(notification.createdAt)}</span>
                    </span>
                  </div>
                )

                return (
                  <div key={notification.id} className="group relative border-b border-gray-50 last:border-b-0">
                    {notification.actionUrl ? (
                      <Link href={notification.actionUrl} onClick={() => setOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      <button type="button" className="w-full">{content}</button>
                    )}
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 hidden h-6 w-6 items-center justify-center rounded-md text-gray-300 transition hover:bg-red-50 hover:text-red-600 group-hover:flex"
                      onClick={() => deleteNotification(notification.id)}
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
