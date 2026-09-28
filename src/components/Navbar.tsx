import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, LogOut, Settings, User as UserIcon, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenConfigModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConfigModal }) => {
  const { user, isCustomConfig, activeConfig, signOutUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                AuthVault
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                Firebase Auth
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Secure User Management & Email Verification
            </p>
          </div>
        </div>

        {/* Status Badges & Controls */}
        <div className="flex items-center gap-3">
          {/* Active Firebase Config Indicator */}
          <button
            onClick={onOpenConfigModal}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isCustomConfig
                ? 'bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/40'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
            title="Click to view or update Firebase config"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="opacity-80">Project:</span>
            <span className="font-mono text-[11px] text-cyan-300">{activeConfig.projectId}</span>
            {isCustomConfig && (
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Custom
              </span>
            )}
          </button>

          {/* Config Settings Icon Button (Mobile/Desktop) */}
          <button
            onClick={onOpenConfigModal}
            className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
            title="Firebase Credentials & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Pill / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all text-left"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="text-xs font-medium text-slate-200 leading-none truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {user.emailVerified ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                        <ShieldAlert className="w-2.5 h-2.5" /> Unverified
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-800/80">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {user.email}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Email Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <ShieldAlert className="w-3 h-3" /> Verification Needed
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenConfigModal();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800/60 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      Firebase Config Details
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOutUser();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 border-t border-slate-800/80 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Secure Portal
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
