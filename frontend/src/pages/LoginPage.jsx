import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../utils/api.js';
import logo from '../assets/ClearChartAI Word Mark 1.png';

const AUTH_ERROR_MESSAGES = {
  'auth/user-not-found': 'No account found with this email. Please sign in to create one.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, loginWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      await api.get('/profile');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google login failed:', err);
      setError('Failed to log in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setLoading(true);
      await loginWithEmail(email, password);
      await api.get('/profile');
      navigate('/dashboard');
    } catch (err) {
      console.error('Email login failed:', err);
      const message = AUTH_ERROR_MESSAGES[err?.code] || 'Failed to log in. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#fdf6ff] via-[#f9e8ff] to-[#f0d4ff] items-center justify-center p-12">
        <div className="max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src={logo} alt="ClearChartAI Logo" className="w-64 h-auto object-contain" />
          </div>

          <p className="text-lg text-slate-600 mb-12">Understand Your Health Own Your Future</p>

          {/* Features List */}
          <div className="space-y-4 text-center">
            <p className="text-slate-600">Unified medical records</p>
            <p className="text-slate-600">AI-powered explanations</p>
            <p className="text-slate-600">HIPAA-compliant security</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-700 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to access your medical insights</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
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
          <form onSubmit={handleEmailLogin} className="space-y-5">
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-purple-400 focus:ring-purple-400"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-slate-600 hover:text-purple-600">
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#f0d4ff] to-[#e6c0ff] py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:from-[#e6c0ff] hover:to-[#d9a6ff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Create Account Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signin" className="font-semibold text-slate-900 underline hover:text-purple-600">
              Create Account
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
