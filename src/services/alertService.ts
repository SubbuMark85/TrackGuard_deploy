import { collection, doc, addDoc, getDocs, updateDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SafetyAlert } from '../types';

export const alertService = {
  async addAlert(userId: string, alert: Omit<SafetyAlert, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
    const colRef = collection(db, 'users', userId, 'alerts');
    const docRef = await addDoc(colRef, {
      ...alert,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getAlerts(userId: string): Promise<SafetyAlert[]> {
    const colRef = collection(db, 'users', userId, 'alerts');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SafetyAlert));
  },

  async markAsRead(userId: string, alertId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'alerts', alertId);
    await updateDoc(docRef, { isRead: true });
  },

  async acknowledgeAlert(userId: string, alertId: string, actorName: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'alerts', alertId);
    await updateDoc(docRef, {
      status: 'acknowledged',
      acknowledgedAt: serverTimestamp(),
      acknowledgedBy: actorName,
      isRead: true,
    });
  },

  async resolveAlert(userId: string, alertId: string, actorName: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'alerts', alertId);
    await updateDoc(docRef, {
      status: 'resolved',
      resolvedAt: serverTimestamp(),
      resolvedBy: actorName,
      isRead: true,
    });
  },

  subscribeAlerts(userId: string, callback: (alerts: SafetyAlert[]) => void): () => void {
    const colRef = collection(db, 'users', userId, 'alerts');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const alerts = snap.docs.map(d => ({ id: d.id, ...d.data() } as SafetyAlert));
      callback(alerts);
    }, (err) => {
      console.warn('Error subscribing to alerts:', err);
    });
  }
};
