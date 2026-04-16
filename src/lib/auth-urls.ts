const DEFAULT_APP_REDIRECT_URL = 'https://m294-d5ns.vercel.app'

function normalizeOrigin(url: string) {
  return url.replace(/\/$/, '')
}

export function isLocalhost() {
  if (typeof window === 'undefined') return false
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

function getConfiguredAppOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL
  return normalizeOrigin(configuredOrigin || DEFAULT_APP_REDIRECT_URL)
}

export function getAppRedirectOrigin() {
  if (typeof window === 'undefined') return getConfiguredAppOrigin()

  if (isLocalhost()) {
    return getConfiguredAppOrigin()
  }

  return normalizeOrigin(window.location.origin)
}

export function getOAuthRedirectUrl() {
  return `${getAppRedirectOrigin()}/auth`
}

export function redirectToApp(path = '') {
  if (typeof window === 'undefined') return
  const normalizedPath = path.startsWith('/') || path === '' ? path : `/${path}`
  window.location.replace(`${getAppRedirectOrigin()}${normalizedPath}`)
}

export function redirectLocalCallbackToApp() {
  if (typeof window === 'undefined') return false

  if (!isLocalhost()) return false

  const targetOrigin = getConfiguredAppOrigin()
  if (normalizeOrigin(window.location.origin) === targetOrigin) return false

  const hasAuthPayload =
    window.location.search.includes('code=') ||
    window.location.search.includes('error=') ||
    window.location.hash.includes('access_token=') ||
    window.location.hash.includes('refresh_token=') ||
    window.location.hash.includes('error=')

  if (!hasAuthPayload) return false

  window.location.replace(`${targetOrigin}/auth${window.location.search}${window.location.hash}`)
  return true
}

export function redirectLocalAuthPageToApp() {
  if (!isLocalhost()) return false
  const targetOrigin = getConfiguredAppOrigin()
  if (normalizeOrigin(window.location.origin) === targetOrigin) return false

  window.location.replace(`${targetOrigin}/auth${window.location.search}${window.location.hash}`)
  return true
}
