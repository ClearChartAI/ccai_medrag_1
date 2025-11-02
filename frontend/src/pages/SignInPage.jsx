import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import logo from '../assets/ClearChartAI_Logo_Transparent saturate.png';

const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'This email is already registered. Please log in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/weak-password': 'Password must be at least 8 characters.',
};

const getPasswordStrength = (password = '') => {
  if (!password) return { label: 'Enter a password to see strength', color: 'text-slate-400' };
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (password.length >= 12 && hasNumber && hasSymbol) {
    return { label: 'Strong password', color: 'text-green-600' };
  }
  if (password.length >= 8 && (hasNumber || hasSymbol)) {
    return { label: 'Medium strength', color: 'text-amber-500' };
  }
  return { label: 'Too weak - add more characters & symbols', color: 'text-red-500' };
};

export default function SignInPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, registerWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (event) => {
    event.preventDefault();

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service to continue.');
      return;
    }

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await registerWithEmail(email, password, displayName.trim());

      await api.get('/profile');
      console.log('✓ Registration complete, redirecting to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err?.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in instead.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Password must be at least 8 characters.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        const message = AUTH_ERROR_MESSAGES[err?.code] || 'Failed to create account. Please try again.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300 items-center justify-center p-12">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src={logo} alt="ClearChartAI Logo" className="w-24 h-24 object-contain" />
          </div>

          {/* Brand Name */}
          <h1 className="text-4xl font-bold text-slate-700 mb-4">ClearChartAI</h1>
          <p className="text-lg text-slate-600 mb-12">Understand Your Health Own Your Future</p>

          {/* Features List */}
          <div className="space-y-4 text-left">
            <p className="text-slate-600">Unified medical records</p>
            <p className="text-slate-600">AI-powered explanations</p>
            <p className="text-slate-600">HIPAA-compliant security</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-700 mb-2">Create your account</h2>
            <p className="text-slate-500">Start your journey to better health understanding</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60 mb-6"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            <span>{loading ? 'Processing...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 lg:bg-white px-4 text-slate-500">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="displayName">
                Full Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
              <p className={`text-xs mt-1 ${passwordStrength.color}`}>{passwordStrength.label}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-purple-400 focus:ring-purple-400"
              />
              <span>
                I agree to the{' '}
                <a href="#" className="font-semibold text-slate-900 hover:text-purple-600">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-semibold text-slate-900 hover:text-purple-600">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-300 to-pink-300 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:from-purple-400 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 underline hover:text-purple-600">
              Sign In
            </Link>
          </p>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-purple-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
