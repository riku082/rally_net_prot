'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import EventForm from '@/components/community/EventForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function NewEventPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSuccess = () => {
    router.push(`/community/${communityId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/community/${communityId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          コミュニティに戻る
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">イベントを作成</h1>
        <p className="mt-2 text-gray-600">
          練習会や試合など、コミュニティメンバーが参加できるイベントを作成します
        </p>
      </div>

      <EventForm
        communityId={communityId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}