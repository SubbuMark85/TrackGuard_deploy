import { collection, addDoc, getDocs, onSnapshot, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ActivityLog } from '../types';

export const activityService = {
  async logActivity(userId: string, log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<string> {
    const colRef = collection(db, 'users', userId, 'activityLogs');
    const docRef = await addDoc(colRef, {
      ...log,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getActivityLogs(userId: string, maxResults = 50): Promise<ActivityLog[]> {
    const colRef = collection(db, 'users', userId, 'activityLogs');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog));
  },

  subscribeActivityLogs(userId: string, callback: (logs: ActivityLog[]) => void, maxResults = 50): () => void {
    const colRef = collection(db, 'users', userId, 'activityLogs');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(maxResults));
    return onSnapshot(q, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog));
      callback(logs);
    }, (err) => {
      console.warn('Error subscribing to activity logs:', err);
    });
  }
};
