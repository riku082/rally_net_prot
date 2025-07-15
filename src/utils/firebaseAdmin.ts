import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin SDKの初期化
let firebaseAdminConfig: any = {
  projectId: "badsnsn-q2xa94"
};

// 認証設定の優先順位: 1. Service Account Key, 2. Application Default, 3. Development fallback
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    firebaseAdminConfig.credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
  } else if (process.env.NODE_ENV === 'production') {
    firebaseAdminConfig.credential = applicationDefault();
  } else {
    // Development environment: Allow initialization without credentials
    // This will work for Firestore operations in server-side environment
    console.log('Firebase Admin: Using development configuration without explicit credentials');
  }
} catch (error) {
  console.warn('Firebase Admin credential initialization failed, falling back to default config');
}

// Admin SDKの重複初期化を防ぐ
let adminApp;
try {
  adminApp = getApps().length === 0 
    ? initializeApp(firebaseAdminConfig, 'admin') 
    : getApps().find(app => app.name === 'admin') || getApps()[0];
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
  throw error;
}

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);