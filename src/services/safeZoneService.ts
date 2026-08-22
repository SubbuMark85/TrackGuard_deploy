import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SafeZone } from '../types';

export const safeZoneService = {
  async addSafeZone(userId: string, safeZone: Omit<SafeZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const colRef = collection(db, 'users', userId, 'safeZones');
    const docRef = await addDoc(colRef, {
      ...safeZone,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getSafeZones(userId: string): Promise<SafeZone[]> {
    const colRef = collection(db, 'users', userId, 'safeZones');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SafeZone));
  },

  async updateSafeZone(userId: string, safeZoneId: string, updates: Partial<SafeZone>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'safeZones', safeZoneId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteSafeZone(userId: string, safeZoneId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'safeZones', safeZoneId);
    await deleteDoc(docRef);
  },

  subscribeSafeZones(userId: string, callback: (zones: SafeZone[]) => void): () => void {
    const colRef = collection(db, 'users', userId, 'safeZones');
    return onSnapshot(colRef, (snap) => {
      const zones = snap.docs.map(d => ({ id: d.id, ...d.data() } as SafeZone));
      callback(zones);
    }, (err) => {
      console.warn('Error subscribing to safe zones:', err);
    });
  }
};
