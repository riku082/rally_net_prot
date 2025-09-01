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
  orderBy, 
  limit,
  doc,
  getDoc 
} from 'firebase/firestore';
import { 
  Community, 
  CommunityEvent, 
  EventStatus,
  CommunityMember 
} from '@/types/community';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  Users,
  Settings,
  ChevronRight,
  ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';
import CommunityHeader from '@/components/community/CommunityHeader';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import { usePathname } from 'next/navigation';

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityEvent[]>([]);
  const [memberRole, setMemberRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchCommunityData();
  }, [user, communityId]);

  const fetchCommunityData = async () => {
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
      
      if (memberSnapshot.empty) {
        router.push('/community');
        return;
      }

      const memberData = memberSnapshot.docs[0].data() as CommunityMember;
      setMemberRole(memberData.role);

      // 今後のイベントを取得
      // 注: 複合インデックスを避けるためシンプルなクエリに変更
      const eventsQuery = query(
        collection(db, 'communities', communityId, 'events'),
        orderBy('startDateTime', 'asc'),
        limit(20)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const allEvents = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityEvent[];
      
      // クライアント側でフィルタリング
      const now = new Date();
      const filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.startDateTime);
        return event.status === EventStatus.PUBLISHED && eventDate >= now;
      }).slice(0, 5);
      
      setUpcomingEvents(filteredEvents);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('ja-JP', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
      }),
      time: date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
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
    <div className="flex min-h-screen bg-white">
      <Sidebar activePath={pathname} />
      <MobileNav activePath={pathname} />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full">
          <CommunityHeader 
            community={community} 
            memberRole={memberRole}
            currentTab="home"
          />

          {/* アクションボタン - モバイル対応 */}
          <div className="mb-4 sm:mb-6">
            <Link
              href={`/community/${communityId}/events/new`}
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              イベントを作成
            </Link>
          </div>

          {/* 直近のイベント - モバイル対応 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              直近の予定
            </h2>

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Calendar className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500">予定されているイベントはありません</p>
                <Link
                  href={`/community/${communityId}/events/new`}
                  className="mt-3 sm:mt-4 inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm sm:text-base"
                >
                  最初のイベントを作成する
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Link>
              </div>
            ) : (
              <>
                {/* モバイル版 - リスト表示 */}
                <div className="space-y-2 sm:hidden">
                  {upcomingEvents.map((event) => {
                    const { date, time } = formatDateTime(event.startDateTime);
                    
                    return (
                      <Link
                        key={event.id}
                        href={`/community/${communityId}/events/${event.id}`}
                        className="block p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-sm transition-all duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {event.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-0.5" />
                                {date.split(' ')[0]}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-0.5" />
                                {time}
                              </span>
                            </div>
                            {event.practiceCardIds && event.practiceCardIds.length > 0 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-xs">
                                  練習カード {event.practiceCardIds.length}
                                </span>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* PC版 - 詳細表示 */}
                <div className="hidden sm:block space-y-4">
                  {upcomingEvents.map((event) => {
                    const { date, time } = formatDateTime(event.startDateTime);
                    
                    return (
                      <Link
                        key={event.id}
                        href={`/community/${communityId}/events/${event.id}`}
                        className="block p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {event.title}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {date}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {time}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location}
                              </span>
                              {event.maxParticipants && (
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  定員 {event.maxParticipants}名
                                </span>
                              )}
                            </div>
                            {event.practiceCardIds && event.practiceCardIds.length > 0 && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs">
                                  練習カード {event.practiceCardIds.length}枚
                                </span>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {upcomingEvents.length > 0 && (
              <div className="mt-4 sm:mt-6 text-center">
                <Link
                  href={`/community/${communityId}/calendar`}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm sm:text-base"
                >
                  すべての予定を見る
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}