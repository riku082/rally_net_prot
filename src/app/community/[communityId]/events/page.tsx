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
  orderBy
} from 'firebase/firestore';
import { 
  Community, 
  CommunityEvent,
  EventStatus 
} from '@/types/community';
import Link from 'next/link';
import { 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Filter,
  Search
} from 'lucide-react';

type FilterType = 'all' | 'upcoming' | 'past' | 'draft' | 'cancelled';

export default function EventsListPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
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
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      );
    }

    setFilteredEvents(filtered);
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('ja-JP', { 
        year: 'numeric',
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

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">下書き</span>;
      case EventStatus.PUBLISHED:
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">公開中</span>;
      case EventStatus.IN_PROGRESS:
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">開催中</span>;
      case EventStatus.COMPLETED:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">終了</span>;
      case EventStatus.CANCELLED:
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">中止</span>;
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

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              イベント一覧
            </h1>
            <p className="mt-2 text-gray-600">
              {community.name}のすべてのイベント
            </p>
          </div>

          <Link
            href={`/community/${communityId}/events/new`}
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            イベント作成
          </Link>
        </div>
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
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            カレンダー
          </Link>
          <Link
            href={`/community/${communityId}/events`}
            className="px-6 py-3 text-sm font-medium text-green-600 border-b-2 border-green-600"
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

      {/* フィルターと検索 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 検索ボックス */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="イベントを検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* フィルターボタン */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて ({events.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              今後
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              過去
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'cancelled'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              中止
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {filteredEvents.length}件のイベントが見つかりました
        </div>
      </div>

      {/* イベントリスト */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            イベントが見つかりません
          </h3>
          <p className="text-gray-500">
            検索条件を変更するか、新しいイベントを作成してください
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const { date, time } = formatDateTime(event.startDateTime);
            const isPast = new Date(event.startDateTime) < new Date();
            
            return (
              <Link
                key={event.id}
                href={`/community/${communityId}/events/${event.id}`}
                className={`block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
                  isPast ? 'opacity-75' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        {getStatusBadge(event.status)}
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 line-clamp-2 mb-3">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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

                      <div className="mt-3 flex flex-wrap gap-2">
                        {event.difficulty && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.difficulty === 'beginner' ? 'bg-blue-100 text-blue-700' :
                            event.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {event.difficulty === 'beginner' ? '初級' :
                             event.difficulty === 'intermediate' ? '中級' : '上級'}
                          </span>
                        )}
                        
                        {event.practiceCardIds && event.practiceCardIds.length > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            練習カード {event.practiceCardIds.length}枚
                          </span>
                        )}

                        {event.tags && event.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}