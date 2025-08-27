'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  Community, 
  CommunityEvent,
  CommunityMember,
  CommunityRole
} from '@/types/community';
import { PracticeCard } from '@/types/practice';
import AttendanceManager from '@/components/community/AttendanceManager';
import EventComments from '@/components/community/EventComments';
import Link from 'next/link';
import { 
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Edit,
  Trash2,
  Users,
  Tag,
  Dumbbell
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const eventId = params.eventId as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [practiceCards, setPracticeCards] = useState<PracticeCard[]>([]);
  const [memberRole, setMemberRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creatorName, setCreatorName] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchEventData();
  }, [user, communityId, eventId]);

  const fetchEventData = async () => {
    if (!user) return;

    try {
      // イベント情報を取得
      const eventDoc = await getDoc(doc(db, 'communities', communityId, 'events', eventId));
      if (!eventDoc.exists()) {
        router.push(`/community/${communityId}`);
        return;
      }

      const eventData = {
        id: eventDoc.id,
        ...eventDoc.data()
      } as CommunityEvent;
      setEvent(eventData);

      // コミュニティ情報を取得
      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      if (communityDoc.exists()) {
        const communityData = {
          id: communityDoc.id,
          ...communityDoc.data()
        } as Community;
        setCommunity(communityData);
      }

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

      // イベント作成者の名前を取得
      const creatorDoc = await getDocs(
        query(collection(db, 'users'), where('__name__', '==', eventData.createdBy))
      );
      if (!creatorDoc.empty) {
        const creatorData = creatorDoc.docs[0].data();
        setCreatorName(creatorData.displayName || creatorData.name || 'ユーザー');
      }

      // 練習カードを取得
      if (eventData.practiceCardIds && eventData.practiceCardIds.length > 0) {
        const cardsData: PracticeCard[] = [];
        for (const cardId of eventData.practiceCardIds) {
          const cardDoc = await getDoc(doc(db, 'practiceCards', cardId));
          if (cardDoc.exists()) {
            cardsData.push({
              id: cardDoc.id,
              ...cardDoc.data()
            } as PracticeCard);
          }
        }
        setPracticeCards(cardsData);
      }

    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/community/${communityId}/events/${eventId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('このイベントを削除してもよろしいですか？')) return;
    
    // TODO: イベント削除処理
    router.push(`/community/${communityId}`);
  };

  const canEdit = user && (
    event?.createdBy === user.uid ||
    memberRole === CommunityRole.OWNER ||
    memberRole === CommunityRole.ADMIN
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!event || !community) {
    return <div>イベントが見つかりません</div>;
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('ja-JP', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      }),
      time: date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const startDateTime = formatDateTime(event.startDateTime);
  const endDateTime = formatDateTime(event.endDateTime);

  // 練習時間を計算
  const duration = (() => {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}時間${minutes}分`;
    } else if (hours > 0) {
      return `${hours}時間`;
    } else {
      return `${minutes}分`;
    }
  })();

  return (
    <div className="max-w-5xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          href={`/community/${communityId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          {community.name}に戻る
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* イベント情報 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  <span>作成者: {creatorName}</span>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(event.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
              
              {canEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {event.description && (
              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">
                    {startDateTime.date}
                  </div>
                  <div className="text-sm text-gray-600">
                    {startDateTime.time} - {endDateTime.time} ({duration})
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">
                    {event.location}
                  </div>
                </div>
              </div>

              {(event.minParticipants || event.maxParticipants) && (
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">
                      参加人数
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.minParticipants && `最小: ${event.minParticipants}名`}
                      {event.minParticipants && event.maxParticipants && ' / '}
                      {event.maxParticipants && `定員: ${event.maxParticipants}名`}
                    </div>
                  </div>
                </div>
              )}

              {event.difficulty && (
                <div className="flex items-start">
                  <Dumbbell className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      event.difficulty === 'beginner' ? 'bg-blue-100 text-blue-800' :
                      event.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {event.difficulty === 'beginner' ? '初級' :
                       event.difficulty === 'intermediate' ? '中級' : '上級'}
                    </span>
                  </div>
                </div>
              )}

              {event.equipment && event.equipment.length > 0 && (
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">
                      必要な用具
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.equipment.map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {event.tags && event.tags.length > 0 && (
                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.notes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-800 mb-1">
                        メモ
                      </div>
                      <p className="text-sm text-yellow-700 whitespace-pre-wrap">
                        {event.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 練習カード */}
          {practiceCards.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                練習メニュー ({practiceCards.length}枚)
              </h3>
              <div className="space-y-3">
                {practiceCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {card.title}
                        </h4>
                        {card.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {card.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            <Clock className="inline h-4 w-4 mr-1" />
                            {card.drill.duration}分
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            card.difficulty === 'beginner' ? 'bg-blue-100 text-blue-700' :
                            card.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {card.difficulty === 'beginner' ? '初級' :
                             card.difficulty === 'intermediate' ? '中級' : '上級'}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/practice-cards/${card.id}`}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        詳細 →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  合計練習時間: {practiceCards.reduce((sum, card) => sum + card.drill.duration, 0)}分
                </div>
              </div>
            </div>
          )}

          {/* コメント */}
          <EventComments
            eventId={eventId}
            communityId={communityId}
          />
        </div>

        {/* サイドバー */}
        <div className="lg:col-span-1">
          {/* 出欠管理 */}
          <div className="sticky top-4">
            <AttendanceManager
              event={event}
              communityId={communityId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}