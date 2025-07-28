import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// サービスアカウントキーファイルのパス (プロジェクトルートからの相対パス)
const serviceAccountFileName = 'badsnsn-q2xa94-firebase-adminsdk-fbsvc-21f8d57b36.json';
const serviceAccountPath = path.resolve(process.cwd(), serviceAccountFileName);

// アプリが既に初期化されているか確認し、重複初期化を防ぐ
if (!admin.apps.length) {
  try {
    console.log('Attempting to initialize Firebase Admin SDK from file...');
    // ファイルからサービスアカウントキーを読み込む
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log('Firebase Admin SDK initialized successfully from file.');
  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin SDK initialization failed from file.', error.message);
    // 初期化エラーは致命的なので、ここでエラーを再スローする
    throw new Error(`Firebase Admin SDK could not be initialized. Check the service account file at ${serviceAccountPath}. Error: ${error.message}`);
  }
}

// 初期化済みのサービスをエクスポート
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };

