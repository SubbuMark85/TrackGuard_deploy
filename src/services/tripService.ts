import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trip } from '../types';

export const tripService = {
  async addTrip(userId: string, trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const colRef = collection(db, 'users', userId, 'trips');
    const docRef = await addDoc(colRef, {
      ...trip,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getTrips(userId: string): Promise<Trip[]> {
    const colRef = collection(db, 'users', userId, 'trips');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip));
  },

  async updateTrip(userId: string, tripId: string, updates: Partial<Trip>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'trips', tripId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteTrip(userId: string, tripId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'trips', tripId);
    await deleteDoc(docRef);
  },

  subscribeTrips(userId: string, callback: (trips: Trip[]) => void): () => void {
    const colRef = collection(db, 'users', userId, 'trips');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const trips = snap.docs.map(d => ({ id: d.id, ...d.data() } as Trip));
      callback(trips);
    }, (err) => {
      console.warn('Error subscribing to trips:', err);
    });
  }
};
