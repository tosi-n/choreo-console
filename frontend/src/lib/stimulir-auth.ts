const TOKEN_KEY = 'choreo_console_stimulir_auth_token'

export function getInitialStimulirToken(): string {
  const envToken = import.meta.env.VITE_STIMULIR_AUTH_TOKEN ?? ''

  if (typeof window === 'undefined') {
    return envToken
  }

  const saved = window.localStorage.getItem(TOKEN_KEY)
  if (saved && saved.trim().length > 0) {
    return saved
  }

  return envToken
}

export function persistStimulirToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const trimmed = token.trim()
  if (trimmed.length === 0) {
    window.localStorage.removeItem(TOKEN_KEY)
    return
  }

  window.localStorage.setItem(TOKEN_KEY, trimmed)
}

export { TOKEN_KEY }
