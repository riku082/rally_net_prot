import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin SDKの初期化
const firebaseAdminConfig = {
  projectId: "badsnsn-q2xa94",
  // Vercelで環境変数を使用、ローカルではサービスアカウントキーを使用
  credential: process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
    ? cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
    : undefined
};

// Admin SDKの重複初期化を防ぐ
const adminApp = getApps().length === 0 
  ? initializeApp(firebaseAdminConfig, 'admin') 
  : getApps().find(app => app.name === 'admin') || getApps()[0];

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);