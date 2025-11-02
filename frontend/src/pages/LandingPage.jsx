import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext.jsx';

const features = [
  {
    title: 'Secure Document Storage',
    description: 'Encrypted at rest and in transit with full HIPAA compliance.',
  },
  {
    title: 'AI-Powered Insights',
    description: 'Summaries, explanations, and action items tailored to each patient.',
  },
  {
    title: 'Team Collaboration',
    description: 'Share curated notes safely with care teams and specialists.',
  },
  {
    title: 'Audit-Ready Activity Logs',
    description: 'Every action is tracked for compliance and accountability.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full text-center space-y-12">
        <div className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            Secure Medical AI Copilot
          </span>
          <h1 className="text-5xl font-bold text-slate-900">ClearChartAI</h1>
          <p className="text-xl text-slate-600">
            Your Medical Records, Intelligent Insights. Centralize patient data, surface insights, and keep every interaction compliant.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/signin')}
            className="w-full sm:w-auto rounded-xl bg-blue-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto rounded-xl border-2 border-blue-600 px-10 py-4 text-lg font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Log In
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
          <span className="rounded-full border border-slate-200 px-4 py-2">HIPAA Compliant</span>
          <span className="rounded-full border border-slate-200 px-4 py-2">SOC 2 Ready</span>
          <span className="rounded-full border border-slate-200 px-4 py-2">Vertex AI Secured</span>
        </div>
      </div>
    </div>
  );
}
