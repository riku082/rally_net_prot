'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  orderBy,
  doc,
  getDoc
} from 'firebase/firestore';
import { 
  Community, 
  CommunityEvent, 
  EventParticipation,
  AttendanceStatus,
  EventStatus
} from '@/types/community';

interface CommunityContextType {
  // 現在のコミュニティ
  currentCommunity: Community | null;
  
  // イベント関連
  events: CommunityEvent[];
  upcomingEvents: CommunityEvent[];
  myEvents: CommunityEvent[];
  
  // 参加状態
  participations: Map<string, EventParticipation>;
  
  // アクション
  setCurrentCommunity: (communityId: string) => Promise<void>;
  updateAttendance: (eventId: string, status: AttendanceStatus) => Promise<void>;
  syncCalendar: () => Promise<void>;
  
  // ローディング状態
  isLoading: boolean;
  error: Error | null;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}

interface CommunityProviderProps {
  children: ReactNode;
}

export function CommunityProvider({ children }: CommunityProviderProps) {
  const { user } = useAuth();
  const [currentCommunity, setCurrentCommunityState] = useState<Community | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [participations, setParticipations] = useState<Map<string, EventParticipation>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 今後のイベントを取得
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.startDateTime);
    return eventDate >= new Date() && event.status === EventStatus.PUBLISHED;
  }).sort((a, b) => 
    new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
  );

  // 自分が参加するイベントを取得
  const myEvents = events.filter(event => {
    const participation = participations.get(event.id);
    return participation?.status === AttendanceStatus.ATTENDING;
  });

  // コミュニティを設定
  const setCurrentCommunity = async (communityId: string): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // コミュニティ情報を取得
      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      if (!communityDoc.exists()) {
        throw new Error('Community not found');
      }

      const community = {
        id: communityDoc.id,
        ...communityDoc.data()
      } as Community;
      
      setCurrentCommunityState(community);

      // イベントを監視
      // 注: 複合インデックスを避けるため、シンプルなクエリに変更
      const eventsQuery = query(
        collection(db, 'communities', communityId, 'events'),
        orderBy('startDateTime', 'desc')
      );

      const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CommunityEvent[];
        
        // クライアント側でキャンセルされたイベントをフィルタリング
        const activeEvents = eventsData.filter(
          event => event.status !== EventStatus.CANCELLED
        );
        setEvents(activeEvents);
      });

      // 参加情報を監視
      const participationsQuery = query(
        collection(db, 'event_participations'),
        where('userId', '==', user.uid)
      );

      const unsubscribeParticipations = onSnapshot(participationsQuery, (snapshot) => {
        const participationsMap = new Map<string, EventParticipation>();
        snapshot.docs.forEach(doc => {
          const participation = {
            id: doc.id,
            ...doc.data()
          } as EventParticipation;
          participationsMap.set(participation.eventId, participation);
        });
        setParticipations(participationsMap);
      });

      // Note: クリーンアップ関数は別途管理する必要があります
      // React Contextの外側で管理するか、useEffectで処理します

    } catch (err) {
      console.error('Error setting community:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // 出欠を更新
  const updateAttendance = async (eventId: string, status: AttendanceStatus) => {
    if (!user) return;

    try {
      // AttendanceManagerコンポーネントで処理されるため、
      // ここでは同期のトリガーのみ
      if (status === AttendanceStatus.ATTENDING) {
        await syncCalendar();
      }
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError(err as Error);
    }
  };

  // カレンダー同期
  const syncCalendar = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync calendar');
      }

      const result = await response.json();
      console.log('Calendar sync result:', result);
    } catch (err) {
      console.error('Error syncing calendar:', err);
      setError(err as Error);
    }
  };

  useEffect(() => {
    // 定期的な自動同期（5分ごと）
    if (user) {
      const interval = setInterval(() => {
        syncCalendar();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const value: CommunityContextType = {
    currentCommunity,
    events,
    upcomingEvents,
    myEvents,
    participations,
    setCurrentCommunity,
    updateAttendance,
    syncCalendar,
    isLoading,
    error,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}