import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SafetyBand } from '../types';

export const bandService = {
  async addBand(userId: string, band: Omit<SafetyBand, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const colRef = collection(db, 'users', userId, 'bands');
    const docRef = await addDoc(colRef, {
      ...band,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastSyncAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getBands(userId: string): Promise<SafetyBand[]> {
    const colRef = collection(db, 'users', userId, 'bands');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SafetyBand));
  },

  async updateBand(userId: string, bandId: string, updates: Partial<SafetyBand>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'bands', bandId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteBand(userId: string, bandId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'bands', bandId);
    await deleteDoc(docRef);
  },

  subscribeBands(userId: string, callback: (bands: SafetyBand[]) => void): () => void {
    const colRef = collection(db, 'users', userId, 'bands');
    return onSnapshot(colRef, (snap) => {
      const bands = snap.docs.map(d => ({ id: d.id, ...d.data() } as SafetyBand));
      callback(bands);
    }, (err) => {
      console.warn('Error subscribing to bands:', err);
    });
  },

  async requestElectronicUnlock(guardianId: string) {
    return { success: true, message: 'Unlock request initiated by guardian.' };
  },

  async confirmUnlockByGuardian() {
    return { success: true, message: 'Band disengaged.' };
  }
};

export const BandService = bandService;


