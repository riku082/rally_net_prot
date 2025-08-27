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
import EventForm from '@/components/community/EventForm';
import Link from 'next/link';
import { ChevronLeft, AlertCircle } from 'lucide-react';

export default function EditEventPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const eventId = params.eventId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<CommunityEvent | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchEventAndCheckPermission();
  }, [user, communityId, eventId]);

  const fetchEventAndCheckPermission = async () => {
    if (!user) return;

    try {
      // イベント情報を取得
      const eventDoc = await getDoc(doc(db, 'communities', communityId, 'events', eventId));
      if (!eventDoc.exists()) {
        router.push(`/community/${communityId}/events`);
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

      // 編集権限を確認
      // 1. イベント作成者である
      // 2. コミュニティのオーナーまたは管理者である
      if (eventData.createdBy === user.uid) {
        setHasPermission(true);
      } else {
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
          if (memberData.role === CommunityRole.OWNER || memberData.role === CommunityRole.ADMIN) {
            setHasPermission(true);
          }
        }
      }

    } catch (error) {
      console.error('Error fetching event data:', error);
      router.push(`/community/${communityId}/events`);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push(`/community/${communityId}/events/${eventId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/community/${communityId}/events/${eventId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            イベント詳細に戻る
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-red-900">
                編集権限がありません
              </h2>
              <p className="mt-1 text-sm text-red-700">
                このイベントを編集する権限がありません。イベント作成者またはコミュニティ管理者にお問い合わせください。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/community/${communityId}/events/${eventId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          イベント詳細に戻る
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">イベントを編集</h1>
        <p className="mt-2 text-gray-600">
          {community?.name} - {event?.title}
        </p>
      </div>

      {event && (
        <EventForm
          communityId={communityId}
          event={event}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}