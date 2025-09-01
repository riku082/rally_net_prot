'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { 
  EventParticipation, 
  AttendanceStatus,
  CommunityEvent 
} from '@/types/community';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Clock,
  Users,
  User
} from 'lucide-react';

interface AttendanceManagerProps {
  event: CommunityEvent;
  communityId: string;
}

interface ParticipantInfo {
  participation: EventParticipation;
  userName?: string;
  userPhotoURL?: string;
}

export default function AttendanceManager({ event, communityId }: AttendanceManagerProps) {
  const { user } = useAuth();
  const [myParticipation, setMyParticipation] = useState<EventParticipation | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showParticipantsList, setShowParticipantsList] = useState(false);

  useEffect(() => {
    if (!user || !event) return;

    const unsubscribe = subscribeToParticipations();
    return () => unsubscribe();
  }, [user, event]);

  const subscribeToParticipations = () => {
    const participationsQuery = query(
      collection(db, 'event_participations'),
      where('eventId', '==', event.id)
    );

    return onSnapshot(participationsQuery, async (snapshot) => {
      const participations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventParticipation[];

      // 現在のユーザーの参加情報を取得
      const myPart = participations.find(p => p.userId === user?.uid);
      setMyParticipation(myPart || null);

      // 参加者情報を取得
      const participantInfos: ParticipantInfo[] = [];
      for (const participation of participations) {
        try {
          // usersコレクションから取得
          const userDoc = await getDocs(
            query(collection(db, 'users'), where('__name__', '==', participation.userId))
          );
          
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            participantInfos.push({
              participation,
              userName: userData.displayName || userData.name || 'ユーザー',
              userPhotoURL: userData.avatarUrl || userData.avatar || userData.photoURL
            });
          } else {
            // userProfilesコレクションからも試す
            const profileDoc = await getDocs(
              query(collection(db, 'userProfiles'), where('__name__', '==', participation.userId))
            );
            
            if (!profileDoc.empty) {
              const profileData = profileDoc.docs[0].data();
              participantInfos.push({
                participation,
                userName: profileData.displayName || profileData.name || 'ユーザー',
                userPhotoURL: profileData.avatarUrl || profileData.avatar || profileData.photoURL
              });
            } else {
              participantInfos.push({
                participation,
                userName: 'ユーザー'
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          participantInfos.push({
            participation,
            userName: 'ユーザー'
          });
        }
      }

      setParticipants(participantInfos);
    });
  };

  const updateAttendance = async (status: AttendanceStatus) => {
    if (!user || updating) return;

    setUpdating(true);

    try {
      if (myParticipation) {
        // 既存の参加情報を更新
        await updateDoc(doc(db, 'event_participations', myParticipation.id), {
          status,
          updatedAt: Date.now()
        });
      } else {
        // 新規参加登録
        const newParticipation: Omit<EventParticipation, 'id'> = {
          eventId: event.id,
          userId: user.uid,
          status,
          registeredAt: Date.now(),
          syncedToCalendar: false,
          notificationSettings: {
            reminder24h: true,
            reminder1h: true,
            changesNotification: true
          }
        };
        
        await addDoc(collection(db, 'event_participations'), newParticipation);
      }

      // カレンダー同期をトリガー（APIエンドポイントが実装されたら）
      if (status === AttendanceStatus.ATTENDING) {
        // TODO: カレンダー同期API呼び出し
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('出欠登録に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const cancelAttendance = async () => {
    if (!user || !myParticipation || updating) return;

    setUpdating(true);

    try {
      await deleteDoc(doc(db, 'event_participations', myParticipation.id));
    } catch (error) {
      console.error('Error cancelling attendance:', error);
      alert('出欠キャンセルに失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusCount = (status: AttendanceStatus) => {
    return participants.filter(p => p.participation.status === status).length;
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.ATTENDING:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case AttendanceStatus.NOT_ATTENDING:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case AttendanceStatus.MAYBE:
        return <HelpCircle className="h-5 w-5 text-yellow-600" />;
      case AttendanceStatus.WAITING:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.ATTENDING:
        return '参加';
      case AttendanceStatus.NOT_ATTENDING:
        return '不参加';
      case AttendanceStatus.MAYBE:
        return '未定';
      case AttendanceStatus.WAITING:
        return 'キャンセル待ち';
    }
  };

  const attendingCount = getStatusCount(AttendanceStatus.ATTENDING);
  const waitingCount = getStatusCount(AttendanceStatus.WAITING);
  const isEventFull = event.maxParticipants ? attendingCount >= event.maxParticipants : false;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">出欠管理</h3>

      {/* 参加状況サマリー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-700">
            <Users className="h-5 w-5 mr-2" />
            <span className="font-medium">参加状況</span>
          </div>
          <button
            onClick={() => setShowParticipantsList(!showParticipantsList)}
            className="text-sm text-green-600 hover:text-green-700"
          >
            {showParticipantsList ? '閉じる' : '詳細を見る'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              {getStatusIcon(AttendanceStatus.ATTENDING)}
            </div>
            <div className="text-2xl font-bold text-gray-900">{attendingCount}</div>
            <div className="text-xs text-gray-500">参加</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              {getStatusIcon(AttendanceStatus.NOT_ATTENDING)}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getStatusCount(AttendanceStatus.NOT_ATTENDING)}
            </div>
            <div className="text-xs text-gray-500">不参加</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              {getStatusIcon(AttendanceStatus.MAYBE)}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getStatusCount(AttendanceStatus.MAYBE)}
            </div>
            <div className="text-xs text-gray-500">未定</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              {getStatusIcon(AttendanceStatus.WAITING)}
            </div>
            <div className="text-2xl font-bold text-gray-900">{waitingCount}</div>
            <div className="text-xs text-gray-500">待機</div>
          </div>
        </div>

        {event.maxParticipants && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>定員</span>
              <span className={isEventFull ? 'text-red-600 font-semibold' : ''}>
                {attendingCount} / {event.maxParticipants}名
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  isEventFull ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min((attendingCount / event.maxParticipants) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 参加者リスト */}
      {showParticipantsList && participants.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">参加者リスト</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {participants.map((participant) => (
              <div
                key={participant.participation.id}
                className="flex items-center justify-between py-2 px-3 bg-white rounded"
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    {getStatusIcon(participant.participation.status)}
                  </div>
                  <div className="flex items-center">
                    {participant.userPhotoURL ? (
                      <img
                        src={participant.userPhotoURL}
                        alt={participant.userName}
                        className="h-8 w-8 rounded-full mr-2"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {participant.userName}
                      {participant.participation.userId === user?.uid && ' (自分)'}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {getStatusLabel(participant.participation.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 出欠ボタン */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">あなたの出欠</h4>
        
        {myParticipation && (
          <div className="mb-3 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">
                現在のステータス: <strong>{getStatusLabel(myParticipation.status)}</strong>
              </span>
              {myParticipation.syncedToCalendar && (
                <span className="text-xs text-green-600">
                  カレンダー同期済み
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => updateAttendance(AttendanceStatus.ATTENDING)}
            disabled={updating || (isEventFull && myParticipation?.status !== AttendanceStatus.ATTENDING)}
            className={`
              py-3 px-4 rounded-lg font-medium transition-all
              ${myParticipation?.status === AttendanceStatus.ATTENDING
                ? 'bg-green-600 text-white'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-500'
              }
              ${(updating || (isEventFull && myParticipation?.status !== AttendanceStatus.ATTENDING))
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-md'
              }
            `}
          >
            <CheckCircle className="h-5 w-5 mx-auto mb-1" />
            参加
          </button>

          <button
            onClick={() => updateAttendance(AttendanceStatus.NOT_ATTENDING)}
            disabled={updating}
            className={`
              py-3 px-4 rounded-lg font-medium transition-all
              ${myParticipation?.status === AttendanceStatus.NOT_ATTENDING
                ? 'bg-red-600 text-white'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-500'
              }
              ${updating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
            `}
          >
            <XCircle className="h-5 w-5 mx-auto mb-1" />
            不参加
          </button>

          <button
            onClick={() => updateAttendance(AttendanceStatus.MAYBE)}
            disabled={updating}
            className={`
              py-3 px-4 rounded-lg font-medium transition-all
              ${myParticipation?.status === AttendanceStatus.MAYBE
                ? 'bg-yellow-600 text-white'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-yellow-500'
              }
              ${updating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
            `}
          >
            <HelpCircle className="h-5 w-5 mx-auto mb-1" />
            未定
          </button>
        </div>

        {isEventFull && myParticipation?.status !== AttendanceStatus.ATTENDING && (
          <button
            onClick={() => updateAttendance(AttendanceStatus.WAITING)}
            disabled={updating}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all
              ${myParticipation?.status === AttendanceStatus.WAITING
                ? 'bg-gray-600 text-white'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-500'
              }
              ${updating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
            `}
          >
            <Clock className="h-5 w-5 inline mr-2" />
            キャンセル待ちに登録
          </button>
        )}

        {myParticipation && (
          <button
            onClick={cancelAttendance}
            disabled={updating}
            className="w-full py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            出欠登録を取り消す
          </button>
        )}
      </div>

      {/* 出欠コメント */}
      {myParticipation?.comment && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">
            <strong>コメント:</strong> {myParticipation.comment}
          </p>
        </div>
      )}
    </div>
  );
}