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
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { 
  Community, 
  CommunityEvent,
  CommunityMember,
  CommunityRole
} from '@/types/community';
import { PracticeCard, Practice } from '@/types/practice';
import AttendanceManager from '@/components/community/AttendanceManager';
import EventComments from '@/components/community/EventComments';
import PracticeCardDetailModal from '@/components/community/PracticeCardDetailModal';
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
  Dumbbell,
  Check
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
  const [relatedPractices, setRelatedPractices] = useState<Practice[]>([]);
  const [memberRole, setMemberRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<{ name: string; photoURL?: string }>({ name: '' });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);

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

      // イベント作成者の情報を取得
      try {
        const creatorDoc = await getDocs(
          query(collection(db, 'users'), where('__name__', '==', eventData.createdBy))
        );
        if (!creatorDoc.empty) {
          const creatorData = creatorDoc.docs[0].data();
          setCreatorInfo({
            name: creatorData.displayName || creatorData.name || 'ユーザー',
            photoURL: creatorData.avatarUrl || creatorData.avatar || creatorData.photoURL
          });
        } else {
          // userProfilesコレクションからも試す
          const profileDoc = await getDocs(
            query(collection(db, 'userProfiles'), where('__name__', '==', eventData.createdBy))
          );
          if (!profileDoc.empty) {
            const profileData = profileDoc.docs[0].data();
            setCreatorInfo({
              name: profileData.displayName || profileData.name || 'ユーザー',
              photoURL: profileData.avatarUrl || profileData.avatar || profileData.photoURL
            });
          }
        }
      } catch (error) {
        console.error('Error fetching creator info:', error);
        setCreatorInfo({ name: 'ユーザー' });
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
      
      // 関連する練習記録を取得
      const practicesQuery = query(
        collection(db, 'practices'),
        where('communityEventId', '==', eventId)
      );
      const practicesSnapshot = await getDocs(practicesQuery);
      const practicesData = practicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Practice[];
      setRelatedPractices(practicesData);

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
    console.log('Delete button clicked for event:', eventId);
    console.log('canEdit:', canEdit);
    
    if (deleting) return; // 既に削除中の場合は何もしない
    
    if (!confirm('このイベントを削除してもよろしいですか？')) return;
    
    setDeleting(true); // 削除処理開始
    
    try {
      console.log('Starting deletion process for event:', eventId);
      
      // イベントを削除（サブコレクションから）
      await deleteDoc(doc(db, 'communities', communityId, 'events', eventId));
      console.log('Event deleted successfully from subcollection');
      
      // 関連する参加情報も削除
      try {
        const participationsQuery = query(
          collection(db, 'event_participations'),
          where('eventId', '==', eventId)
        );
        const participationsSnapshot = await getDocs(participationsQuery);
        console.log(`Found ${participationsSnapshot.docs.length} participations to delete`);
        
        for (const docSnapshot of participationsSnapshot.docs) {
          await deleteDoc(docSnapshot.ref);
        }
      } catch (error) {
        console.error('Error deleting participations:', error);
      }
      
      // 関連するコメントも削除
      try {
        const commentsQuery = query(
          collection(db, 'event_comments'),
          where('eventId', '==', eventId)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        console.log(`Found ${commentsSnapshot.docs.length} comments to delete`);
        
        for (const docSnapshot of commentsSnapshot.docs) {
          await deleteDoc(docSnapshot.ref);
        }
      } catch (error) {
        console.error('Error deleting comments:', error);
      }
      
      // 関連する練習記録も削除（communityEventIdで紐づいているもの）
      try {
        const practicesQuery = query(
          collection(db, 'practices'),
          where('communityEventId', '==', eventId)
        );
        const practicesSnapshot = await getDocs(practicesQuery);
        console.log(`Found ${practicesSnapshot.docs.length} practices to delete`);
        
        for (const docSnapshot of practicesSnapshot.docs) {
          await deleteDoc(docSnapshot.ref);
        }
      } catch (error) {
        console.error('Error deleting practices:', error);
      }
      
      // 削除成功
      console.log('All related data deleted, redirecting...');
      
      // 削除されたページから確実に離れる
      // window.location.hrefを使用して強制的にページをリロード
      window.location.href = `/community/${communityId}`;
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`イベントの削除に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
      setDeleting(false); // エラー時は削除状態をリセット
    }
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
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          前の画面に戻る
        </button>
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
                  <div className="flex items-center mr-3">
                    {creatorInfo.photoURL ? (
                      <img
                        src={creatorInfo.photoURL}
                        alt={creatorInfo.name}
                        className="h-6 w-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                    )}
                    <span>作成者: {creatorInfo.name}</span>
                  </div>
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={deleting}
                    className={`p-2 rounded-lg transition-colors ${
                      deleting 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    }`}
                    title={deleting ? '削除中...' : 'イベントを削除'}
                  >
                    {deleting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
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
          
          {/* 関連する練習記録 */}
          {relatedPractices.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                練習記録 ({relatedPractices.length}件)
              </h3>
              <div className="space-y-4">
                {relatedPractices.map((practice) => (
                  <div
                    key={practice.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {practice.title}
                          </h4>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              <Calendar className="inline h-4 w-4 mr-1" />
                              {practice.date}
                            </span>
                            <span>
                              <Clock className="inline h-4 w-4 mr-1" />
                              {practice.startTime} - {practice.endTime}
                            </span>
                            <span>
                              {practice.duration}分
                            </span>
                          </div>
                          {practice.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              {practice.description}
                            </p>
                          )}
                          {practice.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-600">
                                <strong>メモ:</strong> {practice.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/practice-management?tab=records&date=${practice.date}`}
                          className="text-sm text-green-600 hover:text-green-700 ml-4"
                        >
                          詳細 →
                        </Link>
                      </div>
                    </div>
                    
                    {/* 練習カード（ルーティン） */}
                    {practice.routine && practice.routine.cards && practice.routine.cards.length > 0 && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          練習メニュー ({practice.routine.cards.length}枚)
                        </h5>
                        <div className="space-y-2">
                          {practice.routine.cards.map((card, index) => (
                            <div
                              key={`${practice.id}-card-${index}`}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 cursor-pointer transition-colors"
                              onClick={() => {
                                if (card.cardId) {
                                  setSelectedCardId(card.cardId);
                                  setShowCardModal(true);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-semibold">
                                  {card.order}
                                </span>
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {card.cardTitle}
                                  </span>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {card.plannedDuration}分
                                    </span>
                                    {card.completed && (
                                      <span className="text-green-600 flex items-center">
                                        <Check className="h-3 w-3 mr-1" />
                                        完了
                                      </span>
                                    )}
                                    {card.notes && (
                                      <span className="text-gray-500">
                                        {card.notes}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {card.rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`text-sm ${
                                        i < card.rating! ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        {practice.routine.totalPlannedDuration && (
                          <div className="mt-3 text-sm text-gray-600 text-right">
                            合計練習時間: {practice.routine.totalPlannedDuration}分
                            {practice.routine.completedCards > 0 && (
                              <span className="ml-2">
                                ({practice.routine.completedCards}/{practice.routine.cards.length}枚完了)
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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

      {/* 練習カード詳細モーダル */}
      {selectedCardId && (
        <PracticeCardDetailModal
          cardId={selectedCardId}
          isOpen={showCardModal}
          onClose={() => {
            setShowCardModal(false);
            setSelectedCardId(null);
          }}
        />
      )}
    </div>
  );
}