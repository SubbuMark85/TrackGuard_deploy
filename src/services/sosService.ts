import { collection, doc, addDoc, getDocs, updateDoc, onSnapshot, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SOSIncident } from '../types';

export const sosService = {
  async createSOSIncident(userId: string, incident: Omit<SOSIncident, 'id' | 'startedAt' | 'status'>): Promise<string> {
    const colRef = collection(db, 'users', userId, 'sosIncidents');
    const docRef = await addDoc(colRef, {
      ...incident,
      status: 'active',
      startedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async cancelSOSIncident(userId: string, incidentId: string, notes?: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'sosIncidents', incidentId);
    await updateDoc(docRef, {
      status: 'cancelled',
      endedAt: serverTimestamp(),
      ...(notes ? { notes } : {}),
    });
  },

  async resolveSOSIncident(userId: string, incidentId: string, notes?: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'sosIncidents', incidentId);
    await updateDoc(docRef, {
      status: 'resolved',
      endedAt: serverTimestamp(),
      ...(notes ? { notes } : {}),
    });
  },

  subscribeActiveSOSIncidents(userId: string, callback: (incidents: SOSIncident[]) => void): () => void {
    const colRef = collection(db, 'users', userId, 'sosIncidents');
    const q = query(colRef, where('status', '==', 'active'));
    return onSnapshot(q, (snap) => {
      const incidents = snap.docs.map(d => ({ id: d.id, ...d.data() } as SOSIncident));
      callback(incidents);
    }, (err) => {
      console.warn('Error subscribing to active SOS incidents:', err);
    });
  },

  subscribeSOSIncidents(userId: string, callback: (incidents: SOSIncident[]) => void): () => void {
    const colRef = collection(db, 'users', userId, 'sosIncidents');
    const q = query(colRef, orderBy('startedAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const incidents = snap.docs.map(d => ({ id: d.id, ...d.data() } as SOSIncident));
      callback(incidents);
    }, (err) => {
      console.warn('Error subscribing to all SOS incidents:', err);
    });
  }
};
