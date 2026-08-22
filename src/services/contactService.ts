import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { EmergencyContact } from '../types';

export const contactService = {
  async addContact(userId: string, contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const colRef = collection(db, 'users', userId, 'emergencyContacts');
    const docRef = await addDoc(colRef, {
      ...contact,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getContacts(userId: string): Promise<EmergencyContact[]> {
    const colRef = collection(db, 'users', userId, 'emergencyContacts');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EmergencyContact));
  },

  async updateContact(userId: string, contactId: string, updates: Partial<EmergencyContact>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'emergencyContacts', contactId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteContact(userId: string, contactId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'emergencyContacts', contactId);
    await deleteDoc(docRef);
  },

  subscribeContacts(userId: string, callback: (contacts: EmergencyContact[]) => void): () => void {
    const colRef = collection(db, 'users', userId, 'emergencyContacts');
    return onSnapshot(colRef, (snap) => {
      const contacts = snap.docs.map(d => ({ id: d.id, ...d.data() } as EmergencyContact));
      callback(contacts);
    }, (err) => {
      console.warn('Error subscribing to emergency contacts:', err);
    });
  }
};
