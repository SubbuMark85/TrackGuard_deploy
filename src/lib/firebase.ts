import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo_api_key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'trackguard-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'trackguard-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'trackguard-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:demo',
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
