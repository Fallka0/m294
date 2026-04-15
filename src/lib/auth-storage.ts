const REMEMBER_ME_KEY = 'tournamenthub-remember-me'

function isBrowser() {
  return typeof window !== 'undefined'
}

function getRememberPreference() {
  if (!isBrowser()) return true
  return window.localStorage.getItem(REMEMBER_ME_KEY) === 'true'
}

function getActiveStorage() {
  if (!isBrowser()) return null
  return getRememberPreference() ? window.localStorage : window.sessionStorage
}

export function setRememberPreference(rememberMe: boolean) {
  if (!isBrowser()) return

  if (rememberMe) {
    window.localStorage.setItem(REMEMBER_ME_KEY, 'true')
  } else {
    window.localStorage.removeItem(REMEMBER_ME_KEY)
  }
}

export const authStorage = {
  getItem(key: string) {
    if (!isBrowser()) return null

    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
  },
  setItem(key: string, value: string) {
    const storage = getActiveStorage()
    if (!storage || !isBrowser()) return

    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
    storage.setItem(key, value)
  },
  removeItem(key: string) {
    if (!isBrowser()) return

    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
}
