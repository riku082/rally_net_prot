import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'メールアドレスと認証コードが必要です' },
        { status: 400 }
      );
    }

    // Firestoreから認証コードを取得
    const codeDoc = await db.collection('verificationCodes').doc(email).get();
    
    if (!codeDoc.exists) {
      return NextResponse.json(
        { error: '認証コードが見つかりません' },
        { status: 404 }
      );
    }

    const codeData = codeDoc.data();
    
    // 期限切れチェック
    if (codeData?.expiresAt < Date.now()) {
      await db.collection('verificationCodes').doc(email).delete();
      return NextResponse.json(
        { error: '認証コードの有効期限が切れています' },
        { status: 400 }
      );
    }

    // コードの検証
    if (codeData?.code !== code) {
      return NextResponse.json(
        { error: '認証コードが正しくありません' },
        { status: 400 }
      );
    }

    // 認証コードが正しい場合、Firebaseユーザーを作成または取得
    let userRecord;
    try {
      // 既存ユーザーの確認
      userRecord = await auth.getUserByEmail(email);
      
      // 既存ユーザーのメール認証を完了に設定
      await auth.updateUser(userRecord.uid, {
        emailVerified: true,
      });
    } catch (error) {
      if ((error as {code?: string}).code === 'auth/user-not-found' && password) {
        // 新規ユーザーの作成
        userRecord = await auth.createUser({
          email,
          password,
          emailVerified: true, // 認証コード確認済みなので、メール認証済みとして作成
        });
      } else {
        throw error;
      }
    }

    // 認証コードを削除
    await db.collection('verificationCodes').doc(email).delete();

    // カスタムトークンを生成
    const customToken = await auth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      success: true,
      customToken,
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error('認証コード検証エラー:', error);
    return NextResponse.json(
      { error: '認証コードの検証に失敗しました' },
      { status: 500 }
    );
  }
}