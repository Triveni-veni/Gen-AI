import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  deleteUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  AuthError
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  getStoredFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  FirebaseConfigType
} from '../firebase/config';
import { ToastMessage, ToastType } from '../components/Toast';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'success' | 'warning' | 'info';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  activeConfig: FirebaseConfigType;
  isCustomConfig: boolean;
  toasts: ToastMessage[];
  auditLogs: AuditLog[];
  showToast: (title: string, message?: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string, rememberMe: boolean) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resendVerificationEmail: () => Promise<boolean>;
  refreshUserVerificationStatus: () => Promise<boolean>;
  sendResetEmail: (email: string) => Promise<void>;
  updateUserProfileData: (displayName?: string, photoURL?: string) => Promise<void>;
  updateUserPasswordData: (newPass: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateFirebaseConfig: (config: FirebaseConfigType) => void;
  resetFirebaseConfig: () => void;
  clearAuditLogs: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('authvault_audit_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { config: activeConfig, isCustom: isCustomConfig } = getStoredFirebaseConfig();

  const addAuditLog = useCallback((action: string, details: string, status: 'success' | 'warning' | 'info' = 'info') => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      action,
      details,
      status,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 50); // Keep last 50 logs
      try {
        localStorage.setItem('authvault_audit_logs', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save audit logs', e);
      }
      return updated;
    });
  }, []);

  const clearAuditLogs = useCallback(() => {
    setAuditLogs([]);
    localStorage.removeItem('authvault_audit_logs');
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto dismiss after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        addAuditLog(
          'Auth State Updated',
          `Session active for ${currentUser.email || 'user'} (Verified: ${currentUser.emailVerified ? 'Yes' : 'No'})`,
          currentUser.emailVerified ? 'success' : 'warning'
        );
      }
    });

    return () => unsubscribe();
  }, [addAuditLog]);

  const mapAuthError = (err: unknown): string => {
    const firebaseError = err as AuthError;
    if (!firebaseError?.code) {
      return firebaseError?.message || 'An unexpected authentication error occurred.';
    }

    switch (firebaseError.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please log in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in Firebase Console.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 8 characters with numbers & symbols.';
      case 'auth/user-disabled':
        return 'This account has been disabled by an administrator.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/too-many-requests':
        return 'Access blocked due to multiple failed login attempts. Please try again later or reset password.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completing.';
      case 'auth/cancelled-popup-request':
        return 'Only one popup request is allowed at a time.';
      case 'auth/requires-recent-login':
        return 'This sensitive operation requires you to re-authenticate first. Please log out and log back in.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      default:
        return firebaseError.message.replace('Firebase: ', '');
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const createdUser = userCredential.user;

      if (name) {
        await updateProfile(createdUser, { displayName: name });
      }

      // Send Verification Email
      let emailSent = false;
      try {
        await sendEmailVerification(createdUser);
        emailSent = true;
      } catch (verificationErr) {
        console.warn('Initial email verification send note:', verificationErr);
      }

      addAuditLog(
        'User Registered',
        `New account created for ${email}. Verification email ${emailSent ? 'sent' : 'pending'}.`,
        'success'
      );

      showToast(
        'Account Created Successfully!',
        emailSent
          ? `We sent an email verification link to ${email}. Please check your inbox & spam folder.`
          : 'Your account was created. You can send a verification link from your security dashboard.',
        'success'
      );
    } catch (err) {
      const msg = mapAuthError(err);
      addAuditLog('Registration Failed', `Attempted email: ${email}. Error: ${msg}`, 'warning');
      showToast('Registration Error', msg, 'error');
      throw new Error(msg);
    }
  };

  const signInWithEmail = async (email: string, pass: string, rememberMe: boolean) => {
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const loggedUser = userCredential.user;

      addAuditLog(
        'Email Sign In',
        `User ${loggedUser.email} logged in successfully (Verified: ${loggedUser.emailVerified ? 'Yes' : 'No'})`,
        'success'
      );

      showToast(
        'Welcome Back!',
        `Logged in as ${loggedUser.displayName || loggedUser.email}`,
        'success'
      );
    } catch (err) {
      const msg = mapAuthError(err);
      addAuditLog('Sign In Failed', `Email: ${email}. Error: ${msg}`, 'warning');
      showToast('Login Failed', msg, 'error');
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      addAuditLog('Google Sign In', `Signed in via Google OAuth: ${gUser.email}`, 'success');
      showToast('Signed in with Google', `Welcome ${gUser.displayName || gUser.email}`, 'success');
    } catch (err) {
      const msg = mapAuthError(err);
      addAuditLog('Google Auth Failed', `Error: ${msg}`, 'warning');
      showToast('Google Sign In Failed', msg, 'error');
      throw new Error(msg);
    }
  };

  const resendVerificationEmail = async (): Promise<boolean> => {
    if (!auth.currentUser) {
      showToast('Authentication Required', 'Please log in first to receive a verification email.', 'error');
      return false;
    }

    try {
      await sendEmailVerification(auth.currentUser);
      addAuditLog(
        'Verification Email Sent',
        `Verification email link dispatched to ${auth.currentUser.email}`,
        'info'
      );
      showToast(
        'Verification Email Sent!',
        `A new link has been sent to ${auth.currentUser.email}. Please check your inbox and spam folder.`,
        'success'
      );
      return true;
    } catch (err) {
      const msg = mapAuthError(err);
      addAuditLog('Verification Email Failed', `Error: ${msg}`, 'warning');
      showToast('Failed to Send Verification', msg, 'error');
      return false;
    }
  };

  const refreshUserVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;

    try {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setUser({ ...updatedUser } as User);

      if (updatedUser.emailVerified) {
        addAuditLog('Email Verified', `Account ${updatedUser.email} is now verified!`, 'success');
        showToast('Email Verified!', 'Your email address has been successfully verified.', 'success');
        return true;
      } else {
        showToast(
          'Email Not Yet Verified',
          'We checked your account, but the verification link hasn\'t been clicked yet. Please click the link in your email.',
          'info'
        );
        return false;
      }
    } catch (err) {
      const msg = mapAuthError(err);
      showToast('Status Check Failed', msg, 'error');
      return false;
    }
  };

  const sendResetEmail = async (email: string) => {
    if (!email) {
      showToast('Email Required', 'Please enter your email address to receive a password reset link.', 'error');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      addAuditLog('Password Reset Requested', `Reset link sent to ${email}`, 'info');
      showToast(
        'Password Reset Link Sent',
        `If an account exists for ${email}, instructions to reset your password have been sent.`,
        'success'
      );
    } catch (err) {
      const msg = mapAuthError(err);
      addAuditLog('Password Reset Failed', `Email: ${email}. Error: ${msg}`, 'warning');
      showToast('Password Reset Failed', msg, 'error');
      throw new Error(msg);
    }
  };

  const updateUserProfileData = async (displayName?: string, photoURL?: string) => {
    if (!auth.currentUser) return;

    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName ?? auth.currentUser.displayName,
        photoURL: photoURL ?? auth.currentUser.photoURL,
      });

      // Force context state update
      setUser({ ...auth.currentUser } as User);
      addAuditLog('Profile Updated', 'User updated display name or avatar', 'success');
      showToast('Profile Updated', 'Your profile details have been updated.', 'success');
    } catch (err) {
      const msg = mapAuthError(err);
      showToast('Profile Update Failed', msg, 'error');
      throw new Error(msg);
    }
  };

  const updateUserPasswordData = async (newPass: string) => {
    if (!auth.currentUser) return;

    try {
      await updatePassword(auth.currentUser, newPass);
      addAuditLog('Password Changed', 'User changed account password', 'success');
      showToast('Password Updated', 'Your password was changed successfully.', 'success');
    } catch (err) {
      const msg = mapAuthError(err);
      addAuditLog('Password Change Error', `Error: ${msg}`, 'warning');
      showToast('Password Update Failed', msg, 'error');
      throw new Error(msg);
    }
  };

  const signOutUser = async () => {
    try {
      const userEmail = auth.currentUser?.email;
      await signOut(auth);
      setUser(null);
      addAuditLog('User Signed Out', `Logged out account ${userEmail || ''}`, 'info');
      showToast('Logged Out', 'You have been safely logged out.', 'info');
    } catch (err) {
      const msg = mapAuthError(err);
      showToast('Sign Out Error', msg, 'error');
    }
  };

  const deleteAccount = async () => {
    if (!auth.currentUser) return;

    try {
      const userEmail = auth.currentUser.email;
      await deleteUser(auth.currentUser);
      setUser(null);
      addAuditLog('Account Deleted', `Permanently deleted account ${userEmail}`, 'warning');
      showToast('Account Deleted', 'Your user account has been deleted.', 'info');
    } catch (err) {
      const msg = mapAuthError(err);
      showToast('Account Deletion Failed', msg, 'error');
      throw new Error(msg);
    }
  };

  const updateFirebaseConfig = (config: FirebaseConfigType) => {
    saveCustomFirebaseConfig(config);
  };

  const resetFirebaseConfig = () => {
    clearCustomFirebaseConfig();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        activeConfig,
        isCustomConfig,
        toasts,
        auditLogs,
        showToast,
        dismissToast,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        resendVerificationEmail,
        refreshUserVerificationStatus,
        sendResetEmail,
        updateUserProfileData,
        updateUserPasswordData,
        signOutUser,
        deleteAccount,
        updateFirebaseConfig,
        resetFirebaseConfig,
        clearAuditLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
