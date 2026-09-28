import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, AlertTriangle, CheckCircle2, Send, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmailVerificationBanner: React.FC = () => {
  const { user, resendVerificationEmail, refreshUserVerificationStatus } = useAuth();
  const [cooldown, setCooldown] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [showSpamTip, setShowSpamTip] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!user || user.emailVerified) return null;

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    const success = await resendVerificationEmail();
    setIsResending(false);
    if (success) {
      setCooldown(60);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshUserVerificationStatus();
    setIsRefreshing(false);
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Banner Content */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5 md:mt-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-amber-200">
                Email Verification Required
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {user.email}
              </span>
            </div>
            <p className="text-xs text-amber-200/80 mt-0.5">
              Please verify your email address to unlock full security privileges.
              Click the link sent to your inbox.
            </p>
          </div>
        </div>

        {/* Banner Actions */}
        <div className="flex items-center gap-2.5 flex-wrap self-end md:self-auto w-full md:w-auto justify-end">
          <button
            onClick={() => setShowSpamTip(!showSpamTip)}
            className="text-xs text-amber-300/80 hover:text-amber-200 underline underline-offset-2 flex items-center gap-1 mr-2"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Can't find email?
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            I've Clicked the Link
          </button>

          <button
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
          </button>
        </div>
      </div>

      {/* Spam Tip Accordion */}
      {showSpamTip && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-amber-500/20 text-xs text-amber-200/90 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Emails are sent from <strong>noreply@{user.email?.split('@')[1] || 'firebaseapp.com'}</strong>. Check your <strong>Spam, Junk, or Promotions</strong> folder.
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="text-amber-300 font-semibold hover:underline"
          >
            Check status now &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
