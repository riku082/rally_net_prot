import { NextRequest, NextResponse } from 'next/server';

// Firebase imports
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';

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
const app = getApps().find(app => app.name === 'sync-api') || initializeApp(firebaseConfig, 'sync-api');
const db = getFirestore(app);

// MBTI結果をuserProfilesに同期する
export async function POST(request: NextRequest) {
  console.log('🔧 MBTI同期API called');
  
  try {
    const body = await request.json();
    const { userId } = body;
    
    console.log('🔧 Syncing MBTI result for user:', userId);

    if (!userId) {
      console.error('Missing userId in sync request');
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    // mbtiResultsコレクションから最新の結果を取得
    const mbtiCollection = collection(db, 'mbtiResults');
    const q = query(
      mbtiCollection,
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'MBTI結果が見つかりません' }, { status: 404 });
    }
    
    // 最新の結果を取得（createdAtでソート）
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    const latestResult = results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0];
    
    console.log('🔧 Latest MBTI result found:', latestResult.result, 'created at:', new Date(latestResult.createdAt));

    // userProfilesコレクションを更新
    const userProfileRef = doc(db, 'userProfiles', userId);
    console.log('🔧 Updating userProfile document:', userId);
    
    try {
      await updateDoc(userProfileRef, {
        mbtiResult: latestResult.result,
        mbtiCompletedAt: latestResult.createdAt
      });
      console.log('🔧 User profile updated successfully with updateDoc');
    } catch (updateError) {
      console.log('🔧 updateDoc failed, trying setDoc with merge...', updateError);
      // updateDocが失敗した場合（ドキュメントが存在しない）、setDocを使用
      await setDoc(userProfileRef, {
        mbtiResult: latestResult.result,
        mbtiCompletedAt: latestResult.createdAt
      }, { merge: true });
      console.log('🔧 User profile updated successfully with setDoc merge');
    }

    return NextResponse.json({ 
      success: true, 
      result: latestResult.result,
      syncedAt: Date.now()
    });
  } catch (error) {
    console.error('MBTI同期エラー:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json({ 
      error: 'MBTI結果の同期に失敗しました',
      details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
      stack: isDev && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}