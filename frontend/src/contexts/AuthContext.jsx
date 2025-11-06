import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Handle redirect result from Google OAuth
    const checkRedirectResult = async () => {
      try {
        console.log('[AUTH] Checking for redirect result...');
        const result = await getRedirectResult(auth);

        if (result?.user && mounted) {
          console.log('[AUTH] ✓ Redirect sign-in successful:', result.user.email);

          // Call backend to ensure profile exists
          try {
            const api = (await import('../utils/api.js')).default;
            await api.get('/profile');
            console.log('[AUTH] ✓ Profile verified');
          } catch (error) {
            console.error('[AUTH] Profile check failed:', error);
            if (mounted) {
              setAuthError('Failed to create profile. Please try again.');
            }
          }
        } else {
          console.log('[AUTH] No redirect result (normal page load)');
        }
      } catch (error) {
        console.error('[AUTH] Redirect result error:', error);
        if (mounted) {
          setAuthError(error.message);
        }
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (mounted) {
        console.log('[AUTH] Auth state changed:', user?.email || 'No user');
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);

    // Use popup for local development, redirect for production
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      console.log('[AUTH] Local development: Using popup sign-in');
      return signInWithPopup(auth, googleProvider);
    } else {
      console.log('[AUTH] Production: Using redirect sign-in');
      return signInWithRedirect(auth, googleProvider);
    }
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    setAuthError(null);
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const registerWithEmail = useCallback(async (email, password, displayName) => {
    setAuthError(null);
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }

    return credential;
  }, []);

  const logout = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const getIdToken = useCallback(async (forceRefresh = false) => {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  }, []);

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
  );

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
