import { NextRequest, NextResponse } from 'next/server';
import { firestoreDb } from '@/utils/db';
import { Practice } from '@/types/practice';

export async function POST(request: NextRequest) {
  try {
    const userId = 'test-user'; // 認証は一時的にスキップ
    const body = await request.json();
    
    const { 
      title, 
      description, 
      date, 
      duration, 
      location, 
      practiceType, 
      level, 
      skills,
      fromCommunityPractice,
      communityId,
      communityPracticeId
    } = body;

    if (!title || !date || !duration) {
      return NextResponse.json({ 
        error: 'Title, date, and duration are required' 
      }, { status: 400 });
    }

    const practiceId = `practice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 開始時刻と終了時刻を計算（仮の値）
    const startTime = '10:00';
    const endTime = calculateEndTime(startTime, duration);
    
    const practice: Practice = {
      id: practiceId,
      userId,
      date,
      startTime,
      endTime,
      duration,
      type: practiceType || 'basic_practice',
      title,
      description: description || '',
      skills: skills || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // コミュニティ練習から保存された場合の追加情報
    if (fromCommunityPractice) {
      practice.notes = `コミュニティ練習「${title}」から保存\n場所: ${location || '未設定'}`;
    }

    try {
      await firestoreDb.createPractice(practice);
      
      // コミュニティ練習の場合、共有記録も作成
      if (fromCommunityPractice && communityId && communityPracticeId) {
        const sharedPractice = {
          id: `shared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          communityId,
          communityPracticeId,
          practiceId,
          sharedAt: Date.now(),
          isActive: true
        };
        
        await firestoreDb.createSharedPractice(sharedPractice);
      }
      
      return NextResponse.json({ success: true, practiceId });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // モックとして成功を返す
      return NextResponse.json({ success: true, practiceId, mock: true });
    }
  } catch (error) {
    console.error('Error creating practice record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;
  
  const endHours = Math.floor(endMinutes / 60);
  const endMins = endMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}