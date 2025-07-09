import { NextRequest, NextResponse } from 'next/server';
import { firestoreDb } from '@/utils/db';

// MBTI診断進行状況を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    const diagnostic = await firestoreDb.getMBTIDiagnostic(userId);
    return NextResponse.json({ diagnostic });
  } catch (error) {
    console.error('MBTI診断取得エラー:', error);
    return NextResponse.json({ error: 'MBTI診断の取得に失敗しました' }, { status: 500 });
  }
}

// MBTI診断進行状況を保存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { diagnostic } = body;

    if (!diagnostic) {
      return NextResponse.json({ error: '診断データが必要です' }, { status: 400 });
    }

    await firestoreDb.saveMBTIDiagnostic(diagnostic);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MBTI診断保存エラー:', error);
    return NextResponse.json({ error: 'MBTI診断の保存に失敗しました' }, { status: 500 });
  }
} 