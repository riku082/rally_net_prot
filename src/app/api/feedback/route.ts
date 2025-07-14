import { NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

// CORS対応
export const runtime = 'nodejs';

interface FeedbackData {
  id?: string;
  appearanceRating: number;
  contentRating: number;
  usabilityRating: number;
  overallRating: number;
  comment: string;
  userId?: string | null; // ユーザーID（識別用）
  userEmail?: string | null; // 投稿者メールアドレス（識別用）
  submittedAt: string;
  status: 'new' | 'reviewed' | 'resolved';
  mbtiAccuracyRating?: number | null; // BPSI診断精度評価
  bugReport?: string; // バグ報告
}

export async function POST(request: Request) {
  console.log('Feedback POST API called');
  
  try {
    const { 
      appearanceRating, 
      contentRating, 
      usabilityRating, 
      mbtiAccuracyRating, 
      overallRating, 
      comment, 
      bugReport,
      userEmail,
      userId 
    } = await request.json();
    console.log('Feedback data received:', { 
      appearanceRating, 
      contentRating, 
      usabilityRating, 
      mbtiAccuracyRating, 
      overallRating, 
      comment, 
      bugReport,
      userEmail,
      userId 
    });

    // バリデーション
    const ratings = [appearanceRating, contentRating, usabilityRating, mbtiAccuracyRating, overallRating];
    for (const rating of ratings) {
      if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'すべての評価項目で1〜5の範囲で選択してください'
          },
          { status: 400 }
        );
      }
    }

    if (comment && comment.length > 200) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'コメントは200文字以内で入力してください'
        },
        { status: 400 }
      );
    }

    if (bugReport && bugReport.length > 500) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'バグ報告は500文字以内で入力してください'
        },
        { status: 400 }
      );
    }

    const feedbackData: Omit<FeedbackData, 'id'> = {
      appearanceRating,
      contentRating,
      usabilityRating,
      overallRating,
      comment: comment || '',
      userId: userId || null,
      userEmail: userEmail || null,
      submittedAt: new Date().toISOString(),
      status: 'new',
      // 追加フィールド
      mbtiAccuracyRating: mbtiAccuracyRating || null,
      bugReport: bugReport || ''
    };

    console.log('Saving feedback to Firestore:', feedbackData);
    
    // Firestoreに保存（セキュリティルールでサーバーサイドアクセスを許可済み）
    const docRef = await addDoc(collection(db, 'user_feedback'), feedbackData);
    console.log('Feedback saved successfully with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      message: '評価ありがとうございました',
      id: docRef.id
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    // 開発環境では詳細なエラーを返す
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        success: false, 
        error: '評価の送信中にエラーが発生しました',
        details: isDev ? (error instanceof Error ? error.message : 'Unknown error') : undefined,
        stack: isDev && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 管理者用：フィードバック一覧取得
    // 実際の実装では認証チェックが必要
    
    // Firestoreからフィードバックデータを取得（セキュリティルールでサーバーサイドアクセスを許可済み）
    const feedbackQuery = query(
      collection(db, 'user_feedback'),
      orderBy('submittedAt', 'desc')
    );
    const querySnapshot = await getDocs(feedbackQuery);
    
    const feedbackList: FeedbackData[] = [];
    querySnapshot.forEach((doc) => {
      feedbackList.push({
        id: doc.id,
        ...doc.data()
      } as FeedbackData);
    });

    // 平均評価を計算
    const averageRatings = {
      appearance: feedbackList.length > 0 ? 
        feedbackList.reduce((sum, item) => sum + item.appearanceRating, 0) / feedbackList.length : 0,
      content: feedbackList.length > 0 ? 
        feedbackList.reduce((sum, item) => sum + item.contentRating, 0) / feedbackList.length : 0,
      usability: feedbackList.length > 0 ? 
        feedbackList.reduce((sum, item) => sum + item.usabilityRating, 0) / feedbackList.length : 0,
      overall: feedbackList.length > 0 ? 
        feedbackList.reduce((sum, item) => sum + item.overallRating, 0) / feedbackList.length : 0
    };

    return NextResponse.json({
      success: true,
      feedback: feedbackList,
      total: feedbackList.length,
      averageRatings
    });

  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'フィードバックの取得に失敗しました'
      },
      { status: 500 }
    );
  }
}