import { NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';

interface FeedbackData {
  id?: string;
  appearanceRating: number;
  contentRating: number;
  usabilityRating: number;
  overallRating: number;
  comment: string;
  userId?: string; // データベース側での識別用（匿名表示でも記録）
  userEmail?: string; // 投稿者メールアドレス（識別用）
  submittedAt: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export async function POST(request: Request) {
  try {
    const { appearanceRating, contentRating, usabilityRating, overallRating, comment } = await request.json();

    // バリデーション
    const ratings = [appearanceRating, contentRating, usabilityRating, overallRating];
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

    // 実際の実装では、認証情報から userId と userEmail を取得
    // 現在は仮の値を設定（実装時は認証コンテキストから取得）
    const mockUserId = `user-${Math.random().toString(36).substr(2, 9)}`;
    const mockUserEmail = `user${Date.now()}@example.com`;

    const feedbackData: Omit<FeedbackData, 'id'> = {
      appearanceRating,
      contentRating,
      usabilityRating,
      overallRating,
      comment: comment || '',
      userId: mockUserId, // データベース側で投稿者識別用
      userEmail: mockUserEmail, // データベース側で投稿者識別用
      submittedAt: new Date().toISOString(),
      status: 'new'
    };

    // Firestoreに保存
    const docRef = await addDoc(collection(db, 'user_feedback'), feedbackData);

    return NextResponse.json({
      success: true,
      message: '評価ありがとうございました',
      id: docRef.id
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '評価の送信中にエラーが発生しました'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 管理者用：フィードバック一覧取得
    // 実際の実装では認証チェックが必要
    
    // Firestoreからフィードバックデータを取得
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