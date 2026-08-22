import { collection, doc, addDoc, getDocs, updateDoc, onSnapshot, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FamilyMember } from '../types';

export const familyService = {
  async addFamilyMember(userId: string, member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt' | 'archived'>): Promise<string> {
    const colRef = collection(db, 'users', userId, 'familyMembers');
    const docRef = await addDoc(colRef, {
      ...member,
      archived: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getFamilyMembers(userId: string, includeArchived = false): Promise<FamilyMember[]> {
    const colRef = collection(db, 'users', userId, 'familyMembers');
    const q = includeArchived ? colRef : query(colRef, where('archived', '==', false));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FamilyMember));
  },

  async updateFamilyMember(userId: string, memberId: string, updates: Partial<FamilyMember>): Promise<void> {
    const docRef = doc(db, 'users', userId, 'familyMembers', memberId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async archiveFamilyMember(userId: string, memberId: string): Promise<void> {
    await this.updateFamilyMember(userId, memberId, { archived: true });
  },

  subscribeFamilyMembers(userId: string, callback: (members: FamilyMember[]) => void, includeArchived = false): () => void {
    const colRef = collection(db, 'users', userId, 'familyMembers');
    const q = includeArchived ? colRef : query(colRef, where('archived', '==', false));
    return onSnapshot(q, (snap) => {
      const members = snap.docs.map(d => ({ id: d.id, ...d.data() } as FamilyMember));
      callback(members);
    }, (err) => {
      console.warn('Error subscribing to family members:', err);
    });
  }
};
