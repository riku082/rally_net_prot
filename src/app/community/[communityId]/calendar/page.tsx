'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc 
} from 'firebase/firestore';
import { 
  Community, 
  CommunityEvent, 
  EventStatus 
} from '@/types/community';
import CommunityCalendar from '@/components/community/CommunityCalendar';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function CommunityCalendarPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchCommunityAndEvents();
  }, [user, communityId]);

  const fetchCommunityAndEvents = async () => {
    if (!user) return;

    try {
      // コミュニティ情報を取得
      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      if (!communityDoc.exists()) {
        router.push('/community');
        return;
      }

      const communityData = {
        id: communityDoc.id,
        ...communityDoc.data()
      } as Community;
      setCommunity(communityData);

      // イベントを取得
      const eventsQuery = query(
        collection(db, 'communities', communityId, 'events')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const allEvents = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityEvent[];
      
      // クライアント側でキャンセル済みイベントをフィルタリング
      const activeEvents = allEvents.filter(
        event => event.status !== EventStatus.CANCELLED
      );
      
      setEvents(activeEvents);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: CommunityEvent) => {
    router.push(`/community/${communityId}/events/${event.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!community) {
    return <div>コミュニティが見つかりません</div>;
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          href={`/community/${communityId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          {community.name}に戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">
          {community.name} カレンダー
        </h1>
        <p className="mt-2 text-gray-600">
          コミュニティの練習予定や大会の日程を確認できます
        </p>
      </div>

      {/* ナビゲーションタブ */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <Link
            href={`/community/${communityId}`}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ホーム
          </Link>
          <Link
            href={`/community/${communityId}/calendar`}
            className="px-6 py-3 text-sm font-medium text-green-600 border-b-2 border-green-600"
          >
            カレンダー
          </Link>
          <Link
            href={`/community/${communityId}/events`}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            イベント一覧
          </Link>
          <Link
            href={`/community/${communityId}/members`}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            メンバー
          </Link>
        </div>
      </div>

      {/* カレンダーコンポーネント */}
      <CommunityCalendar
        communityId={communityId}
        events={events}
        onEventClick={handleEventClick}
      />
    </div>
  );
}