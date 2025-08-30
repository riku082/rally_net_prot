import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Firebase Admin初期化
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_CLIENT_EMAIL && 
      privateKey) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      );
    }

    // Firebase Admin SDKが初期化されていない場合
    if (!getApps().length) {
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    const auth = getAuth();

    try {
      // ユーザーをメールアドレスで検索
      const user = await auth.getUserByEmail(email);
      
      // 既に認証済みの場合
      if (user.emailVerified) {
        return NextResponse.json({
          success: true,
          message: '既にメール認証が完了しています',
          verified: true,
        });
      }

      // メール認証リンクを生成して送信
      const link = await auth.generateEmailVerificationLink(email, {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth`,
      });

      // ここで実際のメール送信を行う（Resend, SendGrid等）
      // 現在はリンクのみ生成
      console.log('認証メール再送信:', email);
      console.log('認証リンク:', link);

      return NextResponse.json({
        success: true,
        message: '確認メールを再送信しました',
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('メール再送信エラー:', error);
    return NextResponse.json(
      { error: 'メールの再送信に失敗しました' },
      { status: 500 }
    );
  }
}