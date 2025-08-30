import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
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

// 既存ユーザーを全員認証済みにする管理者用エンドポイント
export async function POST(request: NextRequest) {
  try {
    // 管理者認証（本番環境では適切な認証を実装）
    const { adminKey } = await request.json();
    
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    let updatedCount = 0;
    let nextPageToken: string | undefined;

    // 全ユーザーを取得して emailVerified を true に設定
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      const updatePromises = listUsersResult.users
        .filter(user => !user.emailVerified && user.email)
        .map(async (user) => {
          try {
            await auth.updateUser(user.uid, {
              emailVerified: true,
            });
            updatedCount++;
            console.log(`ユーザー ${user.email} を認証済みに更新`);
          } catch (error) {
            console.error(`ユーザー ${user.uid} の更新に失敗:`, error);
          }
        });

      await Promise.all(updatePromises);
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    return NextResponse.json({
      success: true,
      message: `${updatedCount} 人のユーザーを認証済みに更新しました`,
      updatedCount,
    });
  } catch (error) {
    console.error('既存ユーザーの認証済み設定エラー:', error);
    return NextResponse.json(
      { error: '処理に失敗しました' },
      { status: 500 }
    );
  }
}