import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { userService } from '../services/userService';
import { AppUser } from '../types';
import { getFriendlyErrorMessage } from '../utils/firebaseErrors';

interface AuthContextType {
  firebaseUser: User | null;
  appUserProfile: AppUser | null;
  loading: boolean;
  onboardingComplete: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<AppUser>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  authError: string | null;
  setAuthError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUserProfile, setAppUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchProfile = async (uid: string) => {
    try {
      let profile = await userService.getUserProfile(uid);
      if (!profile) {
        // If user logged in via Google for the first time without doc
        profile = await userService.createUserProfile(
          uid,
          auth.currentUser?.displayName || 'Guardian User',
          auth.currentUser?.email || ''
        );
      }
      setAppUserProfile(profile);
    } catch (err: any) {
      console.warn('Error fetching user profile from Firestore:', err);
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchProfile(user.uid);
        // Real-time listener for profile updates (e.g. onboarding status change)
        unsubscribeProfile = userService.subscribeUserProfile(user.uid, (profile) => {
          if (profile) setAppUserProfile(profile);
        });
      } else {
        setAppUserProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setAuthError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await userService.createUserProfile(res.user.uid, fullName, email);
      await fetchProfile(res.user.uid);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await fetchProfile(res.user.uid);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await fetchProfile(res.user.uid);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setAppUserProfile(null);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const updateUserProfile = async (updates: Partial<AppUser>) => {
    if (!firebaseUser) return;
    try {
      await userService.updateUserProfile(firebaseUser.uid, updates);
      setAppUserProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await fetchProfile(firebaseUser.uid);
    }
  };

  const onboardingComplete = appUserProfile?.onboardingComplete ?? false;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        appUserProfile,
        loading,
        onboardingComplete,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateUserProfile,
        refreshProfile,
        authError,
        setAuthError,
      }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0F1D] text-white p-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold tracking-wide text-cyan-400">TrackGuard Safety Platform</h2>
          <p className="text-sm text-slate-400 mt-1">Initializing secure auth session...</p>
        </div>
      ) : (
        children
      )}
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
