import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  Mail,
  KeyRound,
  History,
  Code2,
  Send,
  RefreshCw,
  LogOut,
  Edit2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  Trash2,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  Clock,
  Layers,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
];

interface UserDashboardProps {
  onOpenConfigModal: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onOpenConfigModal }) => {
  const {
    user,
    activeConfig,
    auditLogs,
    signOutUser,
    resendVerificationEmail,
    refreshUserVerificationStatus,
    updateUserProfileData,
    updateUserPasswordData,
    deleteAccount,
    clearAuditLogs,
    showToast,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'activity' | 'code'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '');
  const [customPhotoURL, setCustomPhotoURL] = useState(user?.photoURL || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Email verification action timers
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Code snippet copied state
  const [copiedCode, setCopiedCode] = useState(false);

  if (!user) return null;

  // Security score calculation
  const calculateSecurityScore = () => {
    let score = 30; // base for authenticated
    if (user.emailVerified) score += 40;
    if (user.displayName) score += 15;
    if (user.providerData.some((p) => p.providerId === 'google.com')) score += 15;
    return Math.min(score, 100);
  };

  const securityScore = calculateSecurityScore();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const finalAvatar = customPhotoURL || selectedAvatar;
      await updateUserProfileData(displayName, finalAvatar);
      setIsEditingProfile(false);
    } catch {
      // Error handled by Toast
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    const ok = await resendVerificationEmail();
    setResending(false);
    if (ok) setResendCooldown(60);
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    await refreshUserVerificationStatus();
    setRefreshing(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast('Weak Password', 'Password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('Password Mismatch', 'New passwords do not match.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await updateUserPasswordData(newPassword);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch {
      // Handled in Toast
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch {
      setDeleting(false);
    }
  };

  const codeSnippet = `// Complete Firebase Auth Integration Example
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "${activeConfig.apiKey}",
  authDomain: "${activeConfig.authDomain}",
  projectId: "${activeConfig.projectId}",
  appId: "${activeConfig.appId}"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 1. Create User & Trigger Email Verification
export async function registerUser(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Send verification email link
  await sendEmailVerification(user);
  return user;
}

// 2. Listen to Auth State & Check Email Verification
onAuthStateChanged(auth, async (currentUser) => {
  if (currentUser) {
    console.log("Logged in:", currentUser.email);
    console.log("Is Email Verified?", currentUser.emailVerified);
    
    if (!currentUser.emailVerified) {
      console.warn("User needs to verify email address!");
    }
  }
});`;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-gradient-to-bl from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* User Details */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-indigo-500/30 shadow-xl">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              {user.emailVerified ? (
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-lg"
                  title="Email Verified"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-lg"
                  title="Email Not Verified"
                >
                  <ShieldAlert className="w-4 h-4" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {user.displayName || 'User Profile'}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    user.emailVerified
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {user.emailVerified ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" /> Email Verified
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" /> Verification Pending
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  UID: {user.uid.slice(0, 10)}...
                </span>
              </div>

              {/* Provider Info */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Provider:</span>
                {user.providerData.map((p) => (
                  <span
                    key={p.providerId}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/80 uppercase"
                  >
                    {p.providerId === 'password' ? 'Email & Password' : p.providerId}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Security Score Gauge & Logout */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800/80 pt-4 md:pt-0">
            <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      securityScore === 100
                        ? 'text-emerald-400'
                        : securityScore >= 70
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    }
                    strokeDasharray={`${securityScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-white">
                  {securityScore}%
                </span>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Account Health</p>
                <p className="text-xs font-semibold text-slate-200">
                  {securityScore === 100 ? 'Fully Shielded' : 'Action Suggested'}
                </p>
              </div>
            </div>

            <button
              onClick={signOutUser}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          User Profile
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Security & Verification
          {!user.emailVerified && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          Audit & Sessions
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'code'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Firebase SDK Integration
        </button>
      </div>

      {/* Tab Content */}

      {/* TAB 1: OVERVIEW & PROFILE EDIT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details Card */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Profile Details</h3>
                <p className="text-xs text-slate-400">
                  Update your display name and personal avatar stored in Firebase Auth.
                </p>
              </div>

              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Preset Avatars */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Choose an Avatar Preset
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(url);
                          setCustomPhotoURL('');
                        }}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedAvatar === url
                            ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-105'
                            : 'border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Photo URL */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Or Image URL
                  </label>
                  <input
                    type="url"
                    value={customPhotoURL}
                    onChange={(e) => {
                      setCustomPhotoURL(e.target.value);
                      setSelectedAvatar('');
                    }}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500">Full Name</span>
                  <p className="text-sm font-semibold text-slate-200">
                    {user.displayName || 'Not Set'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500">Email Address</span>
                  <p className="text-sm font-semibold text-slate-200 truncate">
                    {user.email}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500">
                    Account Created
                  </span>
                  <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    {user.metadata.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500">
                    Last Sign In
                  </span>
                  <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {user.metadata.lastSignInTime
                      ? new Date(user.metadata.lastSignInTime).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Side Info Box */}
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Firebase Auth Features
              </h4>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Email Verification:</strong> High-security link dispatch using Firebase Auth SDK.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Password Recovery:</strong> Automated email reset links via <code>sendPasswordResetEmail</code>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>OAuth Providers:</strong> Native Google Login popup integration.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/20 rounded-2xl p-6 text-xs text-slate-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Firebase Credentials
                </span>
                <button
                  onClick={onOpenConfigModal}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Manage
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Connected to Firebase Project:
              </p>
              <div className="mt-2 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-cyan-300 truncate">
                {activeConfig.projectId}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & VERIFICATION */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          {/* Email Verification Box */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 space-y-4 ${
              user.emailVerified
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-amber-950/20 border-amber-500/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-2xl border ${
                    user.emailVerified
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}
                >
                  {user.emailVerified ? (
                    <ShieldCheck className="w-8 h-8" />
                  ) : (
                    <ShieldAlert className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Email Verification Status
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        user.emailVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {user.emailVerified
                      ? 'Your email address has been successfully verified with Firebase Auth. Your account is fully secured.'
                      : `A verification link has been sent to ${user.email}. Check your inbox and click the link.`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {!user.emailVerified && (
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleRefreshStatus}
                    disabled={refreshing}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    Check Verification
                  </button>

                  <button
                    onClick={handleResendEmail}
                    disabled={resendCooldown > 0 || resending}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                Change Password
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your account password. Requires a strong password of at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword || !newPassword}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {changingPassword ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 sm:p-8 space-y-4 max-w-2xl">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              Danger Zone
            </h3>
            <p className="text-xs text-rose-200/80">
              Permanently delete your account from Firebase Auth. This action cannot be undone.
            </p>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all shadow-lg shadow-rose-600/20"
            >
              Delete User Account
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'activity' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Security & Session Audit Trail
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live record of authentication activities, sign-in attempts, and verification dispatches.
              </p>
            </div>

            {auditLogs.length > 0 && (
              <button
                onClick={clearAuditLogs}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Clear Audit History
              </button>
            )}
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No audit logs recorded yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.status === 'success'
                            ? 'bg-emerald-400'
                            : log.status === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-indigo-400'
                        }`}
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 pl-4">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CODE INTEGRATION */}
      {activeTab === 'code' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                Firebase Auth Integration Code
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Copy and paste this production-ready TypeScript snippet for Firebase Email Verification into your project.
              </p>
            </div>

            <button
              onClick={copyCodeToClipboard}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Copied Code!' : 'Copy Code Snippet'}
            </button>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto">
            <pre>{codeSnippet}</pre>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Confirm Account Deletion</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete account <strong>{user.email}</strong>? This will permanently erase your user profile from Firebase Auth.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
