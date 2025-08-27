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
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

export default function CommunityDetailPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const { user } = useAuth();
  const router = useRouter();
  
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
    <div>
      {/* ヘッダー画像 */}
      {community.headerImageUrl ? (
        <div className="relative h-64 md:h-80 -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
          <img
            src={community.headerImageUrl}
            alt={`${community.name}のヘッダー画像`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {community.name}
            </h1>
            {community.description && (
              <p className="text-lg opacity-90">{community.description}</p>
            )}
          </div>
          {(memberRole === 'owner' || memberRole === 'admin') && (
            <Link
              href={`/community/${communityId}/settings`}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {community.name}
              </h1>
              {community.description && (
                <p className="text-gray-600">{community.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {community.memberCount || 0} メンバー
                </span>
                <span>
                  {community.isPublic ? '公開コミュニティ' : '非公開コミュニティ'}
                </span>
                {community.location && (
                  <span>{community.location}</span>
                )}
                {community.category && (
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                    {community.category === 'beginner' ? '初心者向け' :
                     community.category === 'intermediate' ? '中級者向け' :
                     community.category === 'advanced' ? '上級者向け' :
                     community.category === 'mixed' ? 'レベル混合' :
                     community.category === 'competitive' ? '競技志向' :
                     community.category === 'casual' ? 'カジュアル' :
                     community.category === 'junior' ? 'ジュニア' :
                     community.category === 'senior' ? 'シニア' : community.category}
                  </span>
                )}
              </div>
            </div>
            
            {(memberRole === 'owner' || memberRole === 'admin') && (
              <Link
                href={`/community/${communityId}/settings`}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ナビゲーションタブ */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <Link
            href={`/community/${communityId}`}
            className="px-6 py-3 text-sm font-medium text-green-600 border-b-2 border-green-600"
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

      {/* アクションボタン */}
      <div className="mb-6">
        <Link
          href={`/community/${communityId}/events/new`}
          className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          イベントを作成
        </Link>
      </div>

      {/* 直近のイベント */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          直近の予定
        </h2>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">予定されているイベントはありません</p>
            <Link
              href={`/community/${communityId}/events/new`}
              className="mt-4 inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              最初のイベントを作成する
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
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
        )}

        {upcomingEvents.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              href={`/community/${communityId}/calendar`}
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              すべての予定を見る
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}