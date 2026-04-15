export const APP_REDIRECT_URL = 'https://m294-d5ns.vercel.app'
export const OAUTH_REDIRECT_URL = `${APP_REDIRECT_URL}/auth`

export function redirectToApp(path = '') {
  if (typeof window === 'undefined') return
  const normalizedPath = path.startsWith('/') || path === '' ? path : `/${path}`
  window.location.replace(`${APP_REDIRECT_URL}${normalizedPath}`)
}

export function redirectLocalCallbackToApp() {
  if (typeof window === 'undefined') return false

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (!isLocalhost) return false

  const hasAuthPayload =
    window.location.search.includes('code=') ||
    window.location.search.includes('error=') ||
    window.location.hash.includes('access_token=') ||
    window.location.hash.includes('refresh_token=') ||
    window.location.hash.includes('error=')

  if (!hasAuthPayload) return false

  window.location.replace(`${OAUTH_REDIRECT_URL}${window.location.search}${window.location.hash}`)
  return true
}
