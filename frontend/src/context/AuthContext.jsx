import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'

import { auth, googleProvider } from '../config/firebase'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    return signInWithPopup(auth, googleProvider)
  }, [])

  const loginWithEmail = useCallback(async (email, password) => {
    setAuthError(null)
    return signInWithEmailAndPassword(auth, email, password)
  }, [])

  const registerWithEmail = useCallback(async (email, password, displayName) => {
    setAuthError(null)
    const credential = await createUserWithEmailAndPassword(auth, email, password)

    if (displayName) {
      await updateProfile(credential.user, { displayName })
    }

    return credential
  }, [])

  const logout = useCallback(async () => {
    setAuthError(null)
    await signOut(auth)
  }, [])

  const getIdToken = useCallback(async (forceRefresh = false) => {
    const user = auth.currentUser
    if (!user) return null
    return user.getIdToken(forceRefresh)
  }, [])

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      authError,
      setAuthError,
      signInWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      getIdToken,
    }),
    [currentUser, loading, authError, signInWithGoogle, loginWithEmail, registerWithEmail, logout, getIdToken]
  )

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
