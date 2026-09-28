import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { EmailVerificationBanner } from './components/EmailVerificationBanner';
import { ToastContainer } from './components/Toast';
import { LoginCard } from './components/auth/LoginCard';
import { RegisterCard } from './components/auth/RegisterCard';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import {
  ShieldCheck,
  MailCheck,
  KeyRound,
  Lock,
  UserCheck,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  CheckCircle2
} from 'lucide-react';

function AppContent() {
  const { user, loading, toasts, dismissToast } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-slate-200">Initializing AuthVault</h3>
            <p className="text-xs text-slate-400 mt-1">Connecting to Firebase Auth...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar onOpenConfigModal={() => setConfigModalOpen(true)} />

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Main Container */}
      <main className="flex-1">
        {user ? (
          <UserDashboard onOpenConfigModal={() => setConfigModalOpen(true)} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Hero Copy & Features */}
              <div className="lg:col-span-7 space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    Enterprise Firebase Auth & Verification
                  </span>
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                    Secure User Management with{' '}
                    <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Email Verification
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                    Register and authenticate users securely using Firebase Authentication. Features automated email verification dispatches, password reset recovery, profile customization, and Google SSO.
                  </p>
                </div>

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <MailCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Email Verification</h3>
                    <p className="text-xs text-slate-400">
                      Automatic <code>sendEmailVerification</code> dispatch upon user sign-up to prevent spam accounts.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Password Recovery</h3>
                    <p className="text-xs text-slate-400">
                      Instant password reset link delivery via Firebase Auth service with rate limiting protection.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Google OAuth SSO</h3>
                    <p className="text-xs text-slate-400">
                      One-click Google Popup Authentication with seamless profile photo and email synchronization.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Session Persistence</h3>
                    <p className="text-xs text-slate-400">
                      Secure token refresh with option for browser session or local persistent login state.
                    </p>
                  </div>
                </div>

                {/* Verification Process Workflow Visualizer */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" /> Security Flow Overview
                  </h4>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        1
                      </span>
                      <span>Register Account</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                        2
                      </span>
                      <span>Verification Link Dispatched</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                        3
                      </span>
                      <span>Click Email Link & Access</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Auth Form Card */}
              <div className="lg:col-span-5">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-xl opacity-75" />

                  <div className="relative">
                    {/* Auth Mode Toggle Tabs */}
                    <div className="mb-4 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-1">
                      <button
                        onClick={() => setAuthMode('login')}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                          authMode === 'login'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setAuthMode('register')}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                          authMode === 'register'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Register Account
                      </button>
                    </div>

                    {authMode === 'login' ? (
                      <LoginCard onSwitchToRegister={() => setAuthMode('register')} />
                    ) : (
                      <RegisterCard onSwitchToLogin={() => setAuthMode('login')} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>AuthVault — Powered by Firebase Authentication SDK</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setConfigModalOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Firebase Config
            </button>
            <span>•</span>
            <span className="text-slate-500">Project ID: gen-ai-3fe58</span>
          </div>
        </div>
      </footer>

      {/* Config Settings Modal */}
      <FirebaseConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
