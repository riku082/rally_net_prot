import { NextRequest, NextResponse } from 'next/server';
import { firestoreDb } from '@/utils/db';

// MBTI診断結果を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    const result = await firestoreDb.getMBTIResult(userId);
    return NextResponse.json({ result });
  } catch (error) {
    console.error('MBTI結果取得エラー:', error);
    return NextResponse.json({ error: 'MBTI結果の取得に失敗しました' }, { status: 500 });
  }
}

// MBTI診断結果を保存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { result, userId } = body;

    if (!result || !userId) {
      return NextResponse.json({ error: '診断結果とユーザーIDが必要です' }, { status: 400 });
    }

    // MBTI結果を保存
    await firestoreDb.saveMBTIResult(result);

    // ユーザープロフィールを更新
    await firestoreDb.updateUserProfileMBTI(userId, result.result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MBTI結果保存エラー:', error);
    return NextResponse.json({ error: 'MBTI結果の保存に失敗しました' }, { status: 500 });
  }
} 