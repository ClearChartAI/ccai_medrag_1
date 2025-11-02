import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { IDENTITY_PLATFORM_CONFIG } from '../config/identityPlatform'

const Login = () => {
  const { login, loading, error, googleReady, clearError } = useAuth()
  const [localError, setLocalError] = useState('')

  const handleLogin = () => {
    if (!googleReady || typeof window === 'undefined') {
      setLocalError('Identity services are not ready. Please refresh the page and try again.')
      return
    }

    clearError()
    setLocalError('')

    if (!window.google?.accounts?.oauth2?.initTokenClient) {
      setLocalError('Google OAuth client unavailable. Check browser console for details.')
      return
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: IDENTITY_PLATFORM_CONFIG.clientId,
      scope: 'openid email profile',
      callback: async (response) => {
        if (response.error) {
          setLocalError('Sign-in was cancelled or failed. Please try again.')
          return
        }

        try {
          await login(response)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to sign in. Please try again.'
          setLocalError(message)
        }
      },
    })

    client.requestAccessToken()
  }

  const isDisabled = loading || !googleReady
  const displayError = error || localError

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-10 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
          <Loader2 className={loading ? 'animate-spin' : ''} size={26} />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Sign in to ClearChartAI</h1>
        <p className="mt-3 text-sm text-slate-500">
          Use your organization-approved Google account to access patient records.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleLogin}
            disabled={isDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:bg-brand-blue/60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
          {!googleReady && !loading && (
            <p className="text-xs text-amber-600">Loading identity services…</p>
          )}
        </div>

        {displayError && (
          <div className="mt-6 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-left text-sm text-amber-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Authentication issue</p>
              <p>{displayError}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
