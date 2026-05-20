import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getRoleFromToken(token?: string) {
  if (!token) return undefined

  try {
    const payload = token.split('.')[1]
    if (!payload) return undefined

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '='))
    const parsed = JSON.parse(decoded) as { role?: string }

    return parsed.role?.toLowerCase()
  } catch {
    return undefined
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const role = request.cookies.get('userRole')?.value?.toLowerCase() || getRoleFromToken(token)
  const isAdmin = ['admin', 'school_admin', 'super_admin'].includes(role || '')

  // Protected routes
  const protectedRoutes = ['/dashboard', '/exams', '/results', '/practicals', '/profile', '/subscription', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isStudentRoute = isProtectedRoute && !isAdminRoute

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (token && isStudentRoute && isAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
