import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // Storageをインポート

const firebaseConfig = {
  apiKey: "AIzaSyAdptGur4943dCe9aXqP3qCExbg2VX7Bu8",
  authDomain: "badsnsn-q2xa94.firebaseapp.com",
  projectId: "badsnsn-q2xa94",
  storageBucket: "badsnsn-q2xa94.firebasestorage.app",
  messagingSenderId: "272919113894",
  appId: "1:272919113894:web:07f0acc34a0c2f4db1c467"
};

// Firebaseアプリの重複初期化を防ぐ
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Storageをエクスポート