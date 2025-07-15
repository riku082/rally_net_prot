import { NextRequest, NextResponse } from 'next/server';
import { MBTIResult } from '@/types/mbti';

// Firebase imports for development
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, orderBy, limit } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAdptGur4943dCe9aXqP3qCExbg2VX7Bu8",
  authDomain: "badsnsn-q2xa94.firebaseapp.com",
  projectId: "badsnsn-q2xa94",
  storageBucket: "badsnsn-q2xa94.firebasestorage.app",
  messagingSenderId: "272919113894",
  appId: "1:272919113894:web:07f0acc34a0c2f4db1c467"
};

// Initialize Firebase for API routes
const app = getApps().find(app => app.name === 'api') || initializeApp(firebaseConfig, 'api');
const db = getFirestore(app);

// CORS対応
export const runtime = 'nodejs';

// Authentication helper (simplified for development)
async function validateAuth(request: NextRequest): Promise<{ uid: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No Bearer token found');
      return null;
    }
    
    const token = authHeader.substring(7);
    console.log('Token received:', token.substring(0, 20) + '...');
    
    // For development: skip token validation and extract userId from request
    // In production, this should use Firebase Admin SDK
    return { uid: 'development-user' };
  } catch (error) {
    console.error('Authentication validation failed:', error);
    return null;
  }
}

// MBTI診断結果を取得
export async function GET(request: NextRequest) {
  console.log('MBTI GET API called');
  
  try {
    // Authentication validation
    const auth = await validateAuth(request);
    if (!auth) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('Request userId:', userId, 'Auth UID:', auth.uid);

    // For development: allow access with any userId
    if (!userId) {
      console.error('Missing userId');
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    console.log('Calling Firestore to get MBTI result for userId:', userId);
    
    // Firebase クライアントSDKを使用してデータを取得
    const mbtiCollection = collection(db, 'mbtiResults');
    console.log('Collection reference created');
    
    const q = query(
      mbtiCollection,
      where('userId', '==', userId)
    );
    console.log('Query created');
    
    const querySnapshot = await getDocs(q);
    console.log('Query executed, empty:', querySnapshot.empty, 'size:', querySnapshot.size);
    
    const results: MBTIResult[] = [];
    if (!querySnapshot.empty) {
      // すべての結果を取得
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        results.push({ id: doc.id, ...data } as MBTIResult);
      });
      
      // クライアント側でソート（createdAtの降順）
      results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      console.log(`Found ${results.length} MBTI results for user:`, userId);
    } else {
      console.log('No MBTI results found for user:', userId);
    }
    
    return NextResponse.json({ 
      result: results.length > 0 ? results[0] : null,  // 最新の結果（後方互換性のため）
      results: results  // すべての結果
    });
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
    // Authentication validation
    const auth = await validateAuth(request);
    if (!auth) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { result, userId } = body;
    
    console.log('Request body received:', { resultId: result?.id, userId, authUid: auth.uid });

    // For development: allow saving with any valid data
    if (!result || !userId) {
      console.error('Missing result or userId');
      return NextResponse.json({ error: '診断結果とユーザーIDが必要です' }, { status: 400 });
    }

    console.log('Saving MBTI result to Firestore:', result.id);
    
    // Firebase クライアントSDKを使用してデータを保存
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