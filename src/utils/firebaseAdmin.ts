import * as admin from 'firebase-admin';

// アプリが既に初期化されているか確認し、重複初期化を防ぐ
if (!admin.apps.length) {
  try {
    // 環境変数から設定を読み込む
    const projectId = process.env.FIREBASE_PROJECT_ID || 'badsnsn-q2xa94';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    // 完全な認証情報がある場合のみ、cert認証を使用
    if (projectId && privateKey && clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert({
          project_id: projectId,
          client_email: clientEmail,
          private_key: privateKey,
        } as any),
        databaseURL: `https://${projectId}.firebaseio.com`
      });
      console.log('Firebase Admin SDK initialized with service account.');
    } else {
      // 認証情報が不完全な場合は、プロジェクトIDのみで初期化（読み取り専用）
      console.warn('Firebase Admin credentials not found, initializing with limited functionality.');
      admin.initializeApp({
        projectId: projectId,
      });
    }
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // エラーが発生した場合でも、最小限の初期化を試みる
    try {
      admin.initializeApp({
        projectId: 'badsnsn-q2xa94',
      });
    } catch (fallbackError: any) {
      console.error('Fallback initialization also failed:', fallbackError.message);
    }
  }
}

// 初期化済みのサービスをエクスポート
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };

