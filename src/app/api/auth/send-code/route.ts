import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import crypto from 'crypto';
import { Resend } from 'resend';

// Firebase Admin初期化を試みる
let isAdminInitialized = false;
try {
  if (!getApps().length) {
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_CLIENT_EMAIL && 
        process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      isAdminInitialized = true;
    }
  } else {
    isAdminInitialized = true;
  }
} catch (error) {
  console.error('Firebase Admin SDK初期化エラー:', error);
}


function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
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

    // 6桁の認証コードを生成
    const verificationCode = generateVerificationCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10分後に期限切れ

    // Firebase Admin SDKが初期化されている場合のみFirestoreに保存
    if (isAdminInitialized) {
      try {
        const db = getFirestore();
        await db.collection('verificationCodes').doc(email).set({
          code: verificationCode,
          email,
          expiresAt,
          createdAt: Date.now(),
          verified: false,
        });
      } catch (firestoreError) {
        console.error('Firestore保存エラー:', firestoreError);
        // Firestoreエラーでも処理を続行（開発環境用）
      }
    } else {
      console.warn('Firebase Admin SDKが初期化されていません。開発モードで動作します。');
    }

    // Resendを使用してメール送信
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'Rally Net <onboarding@resend.dev>',
          to: email,
          subject: 'Rally Net - 認証コード',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; text-align: center;">Rally Net</h1>
              <h2 style="color: #555; text-align: center;">メールアドレスの確認</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Rally Netへのご登録ありがとうございます。
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                以下の6桁の認証コードを入力して、メールアドレスを確認してください：
              </p>
              
              <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
                  ${verificationCode}
                </span>
              </div>
              
              <p style="color: #999; font-size: 14px; line-height: 1.6;">
                このコードは10分間有効です。
              </p>
              
              <p style="color: #999; font-size: 14px; line-height: 1.6;">
                このメールに心当たりがない場合は、このメールを無視してください。
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                Rally Net - バドミントン分析プラットフォーム
              </p>
            </div>
          `,
        });
        
        console.log(`認証コードメールを ${email} に送信しました`);
      } catch (emailError) {
        console.error('Resendメール送信エラー:', emailError);
        // メール送信エラーでも処理を続行
      }
    } else {
      console.log('警告: RESEND_API_KEYが設定されていません。メールは送信されません。');
    }

    // 開発環境ではコンソールにも表示
    console.log(`[開発環境] 認証コード: ${verificationCode}`);

    return NextResponse.json({
      success: true,
      message: '認証コードを送信しました',
      // 開発環境またはRESEND_API_KEYが未設定の場合はコードを返す
      ...((!process.env.RESEND_API_KEY || process.env.NODE_ENV === 'development') && { code: verificationCode }),
    });
  } catch (error) {
    console.error('認証コード送信エラー:', error);
    return NextResponse.json(
      { error: '認証コードの送信に失敗しました' },
      { status: 500 }
    );
  }
}