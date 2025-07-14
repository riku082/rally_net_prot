import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
import { collection, getDocs, query, where, setDoc, doc, updateDoc } from 'firebase/firestore';
import { MBTIResult } from '@/types/mbti';

// CORS対応
export const runtime = 'nodejs';

// MBTI診断結果を取得
export async function GET(request: NextRequest) {
  console.log('MBTI GET API called');
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('Request userId:', userId);

    if (!userId) {
      console.error('Missing userId in GET request');
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    console.log('Calling Firestore to get MBTI result for userId:', userId);
    
    // Firestoreから直接取得（セキュリティルールでサーバーサイドアクセスを許可済み）
    const mbtiQuery = query(collection(db, 'mbtiResults'), where('userId', '==', userId));
    const querySnapshot = await getDocs(mbtiQuery);
    
    let result: MBTIResult | null = null;
    if (!querySnapshot.empty) {
      // 最新の結果を取得（createdAtでソート）
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MBTIResult));
      result = results.sort((a, b) => b.createdAt - a.createdAt)[0];
      console.log('MBTI result found:', result.id);
    } else {
      console.log('No MBTI results found for user:', userId);
    }
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error('MBTI結果取得エラー:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    // 開発環境では詳細なエラーを返す
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json({ 
      error: 'MBTI結果の取得に失敗しました',
      details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      stack: isDev && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// MBTI診断結果を保存
export async function POST(request: NextRequest) {
  console.log('MBTI POST API called');
  
  try {
    const body = await request.json();
    const { result, userId } = body;
    
    console.log('Request body received:', { resultId: result?.id, userId });

    if (!result || !userId) {
      console.error('Missing result or userId in POST request');
      return NextResponse.json({ error: '診断結果とユーザーIDが必要です' }, { status: 400 });
    }

    console.log('Saving MBTI result to Firestore:', result.id);
    
    // Firestoreに直接保存（セキュリティルールでサーバーサイドアクセスを許可済み）
    const mbtiDocRef = doc(db, 'mbtiResults', result.id);
    await setDoc(mbtiDocRef, result);
    console.log('MBTI result saved successfully');

    console.log('Updating user profile with MBTI result:', userId, 'mbtiResult:', result.result);
    // ユーザープロフィールを更新
    const userProfileRef = doc(db, 'userProfiles', userId);
    await updateDoc(userProfileRef, {
      mbtiResult: result.result,
      mbtiCompletedAt: Date.now()
    });
    console.log('User profile MBTI updated successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MBTI結果保存エラー:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    // 開発環境では詳細なエラーを返す
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json({ 
      error: 'MBTI結果の保存に失敗しました',
      details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      stack: isDev && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 