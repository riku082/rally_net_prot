import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { PublicPracticeCard, PracticeCardComment } from '@/types/practice';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAdptGur4943dCe9aXqP3qCExbg2VX7Bu8",
  authDomain: "badsnsn-q2xa94.firebaseapp.com",
  projectId: "badsnsn-q2xa94",
  storageBucket: "badsnsn-q2xa94.firebasestorage.app",
  messagingSenderId: "272919113894",
  appId: "1:272919113894:web:07f0acc34a0c2f4db1c467"
};

// Initialize Firebase
const app = getApps().find(app => app.name === 'practice-card-detail-api') || initializeApp(firebaseConfig, 'practice-card-detail-api');
const db = getFirestore(app);

// 個別練習カード詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // 現在のユーザーID（お気に入り状態確認用）

    console.log('🔍 Fetching practice card details:', cardId);

    const cardRef = doc(db, 'practiceCards', cardId);
    const cardSnap = await getDoc(cardRef);

    if (!cardSnap.exists()) {
      return NextResponse.json({ error: 'カードが見つかりません' }, { status: 404 });
    }

    const cardData = cardSnap.data();

    // 公開カードまたは自分のカードのみアクセス可能
    if (!cardData.isPublic && cardData.userId !== userId && cardData.createdBy !== userId) {
      return NextResponse.json({ error: 'このカードにアクセスする権限がありません' }, { status: 403 });
    }

    // 作成者情報を取得
    let createdByName = 'Unknown User';
    if (cardData.userId || cardData.createdBy) {
      try {
        const userDocRef = doc(db, 'userProfiles', cardData.userId || cardData.createdBy);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          createdByName = userDocSnap.data().name || 'Unknown User';
        }
      } catch (error) {
        console.warn('Failed to fetch user name:', error);
      }
    }

    // ユーザーのお気に入り状態を確認
    let isFavorited = false;
    if (userId) {
      const userFavoritesRef = doc(db, 'practiceCardFavorites', `${userId}_${cardId}`);
      const userFavoritesSnap = await getDoc(userFavoritesRef);
      isFavorited = userFavoritesSnap.exists();
    }

    // コメントを取得
    const commentsQuery = query(
      collection(db, 'practiceCardComments'),
      where('cardId', '==', cardId)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    
    const comments: PracticeCardComment[] = [];
    for (const commentDoc of commentsSnapshot.docs) {
      const commentData = commentDoc.data();
      
      // コメント作成者の名前を取得
      let userName = 'Unknown User';
      try {
        const commentUserRef = doc(db, 'userProfiles', commentData.userId);
        const commentUserSnap = await getDoc(commentUserRef);
        if (commentUserSnap.exists()) {
          userName = commentUserSnap.data().name || 'Unknown User';
        }
      } catch (error) {
        console.warn('Failed to fetch comment user name:', error);
      }

      comments.push({
        id: commentDoc.id,
        userId: commentData.userId,
        userName,
        content: commentData.content,
        rating: commentData.rating,
        createdAt: commentData.createdAt,
        replies: commentData.replies || []
      });
    }

    // コメントを日付順にソート
    comments.sort((a, b) => b.createdAt - a.createdAt);

    const card: PublicPracticeCard & { isFavorited: boolean } = {
      id: cardSnap.id,
      title: cardData.title,
      description: cardData.description,
      drill: cardData.drill,
      difficulty: cardData.difficulty,
      equipment: cardData.equipment || [],
      courtInfo: cardData.courtInfo,
      visualInfo: cardData.visualInfo,
      notes: cardData.notes,
      tags: cardData.tags || [],
      isPublic: cardData.isPublic,
      sharingSettings: cardData.sharingSettings,
      rating: cardData.rating,
      userRatings: cardData.userRatings || [],
      createdAt: cardData.createdAt,
      updatedAt: cardData.updatedAt,
      createdBy: cardData.createdBy || cardData.userId,
      originalCardId: cardData.originalCardId,
      createdByName,
      downloads: cardData.downloads || 0,
      favorites: cardData.favorites || 0,
      comments,
      category: cardData.category,
      usageCount: cardData.usageCount || 0,
      lastUsed: cardData.lastUsed,
      isFavorited
    };

    console.log(`📊 Retrieved practice card: ${card.title} (${comments.length} comments)`);
    return NextResponse.json(card);

  } catch (error) {
    console.error('Practice card detail fetch error:', error);
    return NextResponse.json(
      { 
        error: '練習カード詳細の取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// 練習カードにコメントを投稿
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cardId } = await params;
    const body = await request.json();
    const { action, userId, content, rating } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    const cardRef = doc(db, 'practiceCards', cardId);
    const cardSnap = await getDoc(cardRef);

    if (!cardSnap.exists()) {
      return NextResponse.json({ error: 'カードが見つかりません' }, { status: 404 });
    }

    const cardData = cardSnap.data();

    // 公開カードのみコメント可能
    if (!cardData.isPublic) {
      return NextResponse.json({ error: 'この練習カードはコメントできません' }, { status: 403 });
    }

    // コメント許可設定を確認
    if (!cardData.sharingSettings?.allowComments) {
      return NextResponse.json({ error: 'この練習カードはコメントが許可されていません' }, { status: 403 });
    }

    if (action === 'comment') {
      if (!content || content.trim() === '') {
        return NextResponse.json({ error: 'コメント内容が必要です' }, { status: 400 });
      }

      // コメントを追加
      const commentRef = await addDoc(collection(db, 'practiceCardComments'), {
        cardId,
        userId,
        content: content.trim(),
        rating: rating || null,
        createdAt: Date.now()
      });

      // ユーザー名を取得
      let userName = 'Unknown User';
      try {
        const userRef = doc(db, 'userProfiles', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userName = userSnap.data().name || 'Unknown User';
        }
      } catch (error) {
        console.warn('Failed to fetch user name:', error);
      }

      // 練習カードの評価を更新（評価が含まれている場合）
      if (rating && cardData.sharingSettings?.allowRating) {
        const currentRatings = cardData.userRatings || [];
        const existingRatingIndex = currentRatings.findIndex((r: any) => r.userId === userId);
        
        if (existingRatingIndex >= 0) {
          // 既存の評価を更新
          currentRatings[existingRatingIndex] = {
            userId,
            rating,
            createdAt: Date.now()
          };
        } else {
          // 新しい評価を追加
          currentRatings.push({
            userId,
            rating,
            createdAt: Date.now()
          });
        }

        // 平均評価を計算
        const avgRating = currentRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / currentRatings.length;

        await updateDoc(cardRef, {
          userRatings: currentRatings,
          rating: Math.round(avgRating * 10) / 10, // 小数点1桁で四捨五入
          updatedAt: Date.now()
        });
      }

      const newComment: PracticeCardComment = {
        id: commentRef.id,
        userId,
        userName,
        content: content.trim(),
        rating: rating || undefined,
        createdAt: Date.now(),
        replies: []
      };

      console.log(`💬 Added comment to practice card: ${cardId}`);
      return NextResponse.json({ success: true, comment: newComment });
    }

    return NextResponse.json({ error: '無効なアクションです' }, { status: 400 });

  } catch (error) {
    console.error('Practice card comment error:', error);
    return NextResponse.json(
      { 
        error: 'コメントの投稿に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}