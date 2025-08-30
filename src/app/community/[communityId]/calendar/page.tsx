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
import CommunityHeader from '@/components/community/CommunityHeader';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { usePathname } from 'next/navigation';
import { CommunityMember } from '@/types/community';

export default function CommunityCalendarPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [memberRole, setMemberRole] = useState<string>('');
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

      // ユーザーのロールを確認
      const memberQuery = query(
        collection(db, 'community_members'),
        where('communityId', '==', communityId),
        where('userId', '==', user.uid),
        where('isActive', '==', true)
      );
      const memberSnapshot = await getDocs(memberQuery);
      
      if (!memberSnapshot.empty) {
        const memberData = memberSnapshot.docs[0].data() as CommunityMember;
        setMemberRole(memberData.role);
      }

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
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Sidebar activePath={pathname} />
      <MobileNav activePath={pathname} />
      <div className="flex-1 lg:ml-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* コミュニティヘッダー */}
          <CommunityHeader 
            community={community} 
            memberRole={memberRole}
            currentTab="calendar"
          />

      {/* カレンダーコンポーネント */}
      <CommunityCalendar
        communityId={communityId}
        events={events}
        onEventClick={handleEventClick}
      />
        </div>
      </div>
    </div>
  );
}