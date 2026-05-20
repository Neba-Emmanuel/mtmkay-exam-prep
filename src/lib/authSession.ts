type AuthUser = {
  role?: string | null
  [key: string]: unknown
}

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const ADMIN_ROLES = ['admin', 'school_admin', 'super_admin']

const normalizeRole = (role?: string | null) => String(role || 'student').toLowerCase()

const cookieOptions = () => {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  return `Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

const expiredCookieOptions = () => {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  return `Path=/; Max-Age=0; SameSite=Lax${secure}`
}

export const isAdminRole = (role?: string | null) => ADMIN_ROLES.includes(normalizeRole(role))

export const getDashboardForRole = (role?: string | null) => (isAdminRole(role) ? '/admin' : '/dashboard')

export function persistAuthSession<TUser extends AuthUser>(
  user: TUser,
  accessToken: string,
  refreshToken?: string | null
) {
  const normalizedUser = { ...user, role: normalizeRole(user.role) }

  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('user', JSON.stringify(normalizedUser))
  document.cookie = `accessToken=${encodeURIComponent(accessToken)}; ${cookieOptions()}`
  document.cookie = `userRole=${encodeURIComponent(normalizedUser.role)}; ${cookieOptions()}`

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
    document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; ${cookieOptions()}`
  }

  return normalizedUser
}

export function updateAccessToken(accessToken: string, role?: string | null) {
  localStorage.setItem('accessToken', accessToken)
  document.cookie = `accessToken=${encodeURIComponent(accessToken)}; ${cookieOptions()}`

  if (role) {
    document.cookie = `userRole=${encodeURIComponent(normalizeRole(role))}; ${cookieOptions()}`
  }
}

export function clearAuthSession() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  localStorage.removeItem('auth-storage')

  document.cookie = `accessToken=; ${expiredCookieOptions()}`
  document.cookie = `refreshToken=; ${expiredCookieOptions()}`
  document.cookie = `userRole=; ${expiredCookieOptions()}`
}
