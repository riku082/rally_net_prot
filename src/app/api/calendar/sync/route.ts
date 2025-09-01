import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { 
  EventParticipation, 
  AttendanceStatus,
  CommunityEvent,
  CalendarSync,
  SyncStatus
} from '@/types/community';

// カレンダー同期処理
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // ユーザーの参加情報を取得
    const participationsQuery = query(
      collection(db, 'event_participations'),
      where('userId', '==', userId),
      where('status', '==', AttendanceStatus.ATTENDING)
    );
    const participationsSnapshot = await getDocs(participationsQuery);
    const participations = participationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as EventParticipation[];

    // バッチ処理で個人カレンダーを更新
    const batch = writeBatch(db);
    const syncResults: CalendarSync[] = [];

    for (const participation of participations) {
      // イベント情報を取得
      const eventQuery = query(
        collection(db, 'communities'),
        where('__name__', '==', participation.eventId)
      );
      
      // サブコレクションのイベントを検索
      const communitiesSnapshot = await getDocs(collection(db, 'communities'));
      let eventData: CommunityEvent | null = null;
      
      for (const communityDoc of communitiesSnapshot.docs) {
        const eventDoc = await getDocs(
          query(
            collection(db, 'communities', communityDoc.id, 'events'),
            where('__name__', '==', participation.eventId)
          )
        );
        
        if (!eventDoc.empty) {
          eventData = {
            id: eventDoc.docs[0].id,
            ...eventDoc.docs[0].data()
          } as CommunityEvent;
          break;
        }
      }

      if (!eventData) continue;

      // 個人カレンダーに追加
      const personalCalendarRef = doc(
        db, 
        'users', 
        userId, 
        'personal_calendar', 
        participation.eventId
      );

      const calendarEntry = {
        eventId: participation.eventId,
        communityId: eventData.communityId,
        title: eventData.title,
        description: eventData.description,
        startDateTime: eventData.startDateTime,
        endDateTime: eventData.endDateTime,
        location: eventData.location,
        practiceCardIds: eventData.practiceCardIds,
        syncedAt: Date.now(),
        source: 'community'
      };

      batch.set(personalCalendarRef, calendarEntry);

      // 参加情報を更新
      const participationRef = doc(db, 'event_participations', participation.id);
      batch.update(participationRef, {
        syncedToCalendar: true,
        personalCalendarId: participation.eventId,
        lastSyncAt: Date.now()
      });

      // 同期ログを記録
      const syncLog: CalendarSync = {
        id: `${userId}_${participation.eventId}_${Date.now()}`,
        userId,
        eventId: participation.eventId,
        syncStatus: SyncStatus.SYNCED,
        lastSyncAt: Date.now(),
        retryCount: 0
      };
      
      const syncRef = doc(
        db, 
        'calendar_syncs', 
        userId, 
        'syncs', 
        syncLog.id
      );
      batch.set(syncRef, syncLog);
      
      syncResults.push(syncLog);
    }

    // 不参加のイベントを個人カレンダーから削除
    const notAttendingQuery = query(
      collection(db, 'event_participations'),
      where('userId', '==', userId),
      where('status', '==', AttendanceStatus.NOT_ATTENDING)
    );
    const notAttendingSnapshot = await getDocs(notAttendingQuery);
    
    for (const docSnapshot of notAttendingSnapshot.docs) {
      const participation = docSnapshot.data() as EventParticipation;
      if (participation.syncedToCalendar) {
        const personalCalendarRef = doc(
          db, 
          'users', 
          userId, 
          'personal_calendar', 
          participation.eventId
        );
        batch.delete(personalCalendarRef);
        
        // 参加情報を更新
        const participationRef = doc(db, 'event_participations', docSnapshot.id);
        batch.update(participationRef, {
          syncedToCalendar: false,
          personalCalendarId: null,
          lastSyncAt: Date.now()
        });
      }
    }

    // バッチ実行
    await batch.commit();

    return NextResponse.json({
      success: true,
      synced: syncResults.length,
      results: syncResults
    });

  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    );
  }
}

// 同期ステータス確認
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // 同期ログを取得
    const syncLogsQuery = query(
      collection(db, 'calendar_syncs', userId, 'syncs'),
      where('syncStatus', '==', SyncStatus.SYNCED)
    );
    const syncLogsSnapshot = await getDocs(syncLogsQuery);
    const syncLogs = syncLogsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CalendarSync[];

    // 最新の同期時刻を取得
    const lastSyncAt = syncLogs.length > 0
      ? Math.max(...syncLogs.map(log => log.lastSyncAt))
      : null;

    // 個人カレンダーのイベント数を取得
    const personalCalendarSnapshot = await getDocs(
      collection(db, 'users', userId, 'personal_calendar')
    );
    const eventCount = personalCalendarSnapshot.size;

    return NextResponse.json({
      success: true,
      lastSyncAt,
      eventCount,
      syncLogs: syncLogs.slice(0, 10) // 最新10件のログ
    });

  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}