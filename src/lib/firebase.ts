import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo_api_key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'trackguard-dd2d4.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'trackguard-dd2d4',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'trackguard-dd2d4.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '636727047806',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:636727047806:web:896c765fe387a7447bca2f',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://trackguard-dd2d4-default-rtdb.firebaseio.com',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const rtdb: Database = getDatabase(app, firebaseConfig.databaseURL);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

let analytics: Analytics | null = null;
isSupported().then((supported) => {
  if (supported && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn('Firebase Analytics not supported in this environment:', err);
});

export { app, analytics };
