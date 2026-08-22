import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppUser } from '../types';

export const userService = {
  async createUserProfile(uid: string, fullName: string, email: string): Promise<AppUser> {
    const userRef = doc(db, 'users', uid);
    const newProfile: Omit<AppUser, 'createdAt' | 'updatedAt'> = {
      uid,
      fullName,
      email,
      photoURL: null,
      role: 'guardian',
      onboardingComplete: false,
      notificationPreferences: {
        pushEnabled: true,
        emailEnabled: true,
        emergencyAlerts: true,
        geofenceAlerts: true,
        deviceAlerts: true,
      },
      privacySettings: {
        locationSharingEnabled: false,
        dataRetentionDays: 30,
      },
      emergencyContactsCount: 0,
      accountStatus: 'active',
    };

    await setDoc(userRef, {
      ...newProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      ...newProfile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async getUserProfile(uid: string): Promise<AppUser | null> {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as AppUser;
  },

  async updateUserProfile(uid: string, updates: Partial<AppUser>): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  subscribeUserProfile(uid: string, callback: (profile: AppUser | null) => void): () => void {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as AppUser);
      } else {
        callback(null);
      }
    }, (error) => {
      console.warn('Error subscribing to user profile:', error);
    });
  }
};
