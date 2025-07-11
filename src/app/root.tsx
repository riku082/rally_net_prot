'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RootPage() {
  const { user, profile, loading, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profileLoading) {
      if (user) {
        // ユーザーがログインしており、プロフィール情報が読み込まれた後
        if (profile === null) {
          // プロフィールが存在しない場合、プロフィール作成ページへリダイレクト
          router.push('/onboarding/profile');
        } else {
          // プロフィールが存在する場合、ダッシュボードへリダイレクト
          router.push('/dashboard');
        }
      } else {
        // ユーザーがログインしていない場合、認証選択ページへリダイレクト
        router.push('/auth');
      }
    }
  }, [user, profile, loading, profileLoading, router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
      </div>
    </div>
  );
}
