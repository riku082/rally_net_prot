'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  getDocs,
  doc,
  getDoc,
  orderBy,
  where
} from 'firebase/firestore';
import { 
  Community, 
  CommunityEvent,
  EventStatus,
  CommunityMember
} from '@/types/community';
import CommunityHeader from '@/components/community/CommunityHeader';
import CommunityCalendar from '@/components/community/CommunityCalendar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Filter,
  Search,
  ChevronRight
} from 'lucide-react';

type ViewMode = 'calendar' | 'list';
type FilterType = 'all' | 'upcoming' | 'past' | 'draft' | 'cancelled';

export default function EventsPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CommunityEvent[]>([]);
  const [memberRole, setMemberRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchEventsData();
  }, [user, communityId]);

  useEffect(() => {
    filterEvents();
  }, [events, filter, searchTerm]);

  const fetchEventsData = async () => {
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

      // すべてのイベントを取得
      const eventsQuery = query(
        collection(db, 'communities', communityId, 'events'),
        orderBy('startDateTime', 'desc')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityEvent[];
      
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];
    const now = new Date();

    // フィルタータイプによる絞り込み
    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(event => 
          new Date(event.startDateTime) >= now && 
          event.status === EventStatus.PUBLISHED
        );
        break;
      case 'past':
        filtered = filtered.filter(event => 
          new Date(event.startDateTime) < now &&
          event.status !== EventStatus.CANCELLED
        );
        break;
      case 'draft':
        filtered = filtered.filter(event => 
          event.status === EventStatus.DRAFT
        );
        break;
      case 'cancelled':
        filtered = filtered.filter(event => 
          event.status === EventStatus.CANCELLED
        );
        break;
    }

    // 検索語による絞り込み
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
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

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return 'bg-gray-100 text-gray-700';
      case EventStatus.PUBLISHED:
        return 'bg-green-100 text-green-700';
      case EventStatus.CANCELLED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return '下書き';
      case EventStatus.PUBLISHED:
        return '公開中';
      case EventStatus.CANCELLED:
        return '中止';
      default:
        return status;
    }
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
            currentTab="events"
          />

          {/* ヘッダーバー */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 mb-4 sm:mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm sm:text-xl font-bold text-gray-900">イベント管理</h2>
              
              <div className="flex items-center gap-2">
                {/* 表示切替ボタン */}
                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                    title="カレンダー"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                    title="リスト"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>

                {/* イベント作成ボタン */}
                <Link
                  href={`/community/${communityId}/events/new`}
                  className="p-1.5 sm:px-3 sm:py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  title="新規イベント"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1 text-sm">新規</span>
                </Link>
              </div>
            </div>

            {/* リスト表示時のフィルター */}
            {viewMode === 'list' && (
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">すべて</option>
                    <option value="upcoming">今後の予定</option>
                    <option value="past">過去のイベント</option>
                    {(memberRole === 'owner' || memberRole === 'admin') && (
                      <>
                        <option value="draft">下書き</option>
                        <option value="cancelled">中止</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="イベントを検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* コンテンツ */}
          {viewMode === 'calendar' ? (
            <CommunityCalendar communityId={communityId} events={events} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">イベントが見つかりません</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => {
                    const { date, time } = formatDateTime(event.startDateTime);
                    const now = new Date();
                    const eventDate = new Date(event.startDateTime);
                    const isPast = eventDate < now;
                    
                    return (
                      <Link
                        key={event.id}
                        href={`/community/${communityId}/events/${event.id}`}
                        className={`block p-4 border rounded-lg transition-all duration-200 ${
                          isPast ? 'border-gray-200 bg-gray-50 hover:bg-gray-100' : 'border-gray-200 hover:border-green-500 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div>
                                <h3 className={`text-sm sm:text-base font-semibold mb-1 ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                                  {event.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                    {date}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                    {time}
                                  </span>
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                    {event.location}
                                  </span>
                                  {event.maxParticipants && (
                                    <span className="flex items-center">
                                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                      定員 {event.maxParticipants}名
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(event.status)}`}>
                                    {getStatusLabel(event.status)}
                                  </span>
                                  {isPast && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs">
                                      終了
                                    </span>
                                  )}
                                  {event.practiceCardIds && event.practiceCardIds.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs">
                                      練習カード {event.practiceCardIds.length}枚
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}