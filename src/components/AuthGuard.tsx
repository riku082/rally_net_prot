'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { firestoreDb } from '@/utils/db';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, profile, loading, profileLoading } = useAuth();
  const router = useRouter();

  // State to track if a redirect has been initiated
  const [hasRedirected, setHasRedirected] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  useEffect(() => {
    const checkTermsAndRedirect = async () => {
      if (!user?.uid) return;

      try {
        const hasAgreed = await firestoreDb.hasAgreedToTerms(user.uid);
        if (!hasAgreed && !hasRedirected) {
          router.push('/terms-agreement');
          setHasRedirected(true);
          return;
        }
        setTermsChecked(true);
      } catch (error) {
        console.error('利用規約同意確認エラー:', error);
        if (!hasRedirected) {
          router.push('/terms-agreement');
          setHasRedirected(true);
        }
      }
    };

    // 認証状態とプロフィール情報の読み込みが完了した場合のみロジックを実行
    if (!loading && !profileLoading) {
      if (!user) {
        // ユーザーが認証されていない場合、認証ページへリダイレクト
        if (!hasRedirected) {
          router.push('/auth');
          setHasRedirected(true);
        }
      } else if (!termsChecked) {
        // 利用規約同意確認
        checkTermsAndRedirect();
      } else if (!profile) {
        // ユーザーは認証済みだがプロフィールが未作成の場合、オンボーディングページへリダイレクト
        if (!hasRedirected) {
          router.push('/onboarding/profile');
          setHasRedirected(true);
        }
      } else {
        // ユーザーが認証済みでプロフィールも存在する場合、リダイレクトは不要
        setHasRedirected(false);
      }
    }
  }, [user, profile, loading, profileLoading, router, hasRedirected, termsChecked]);

  // リダイレクトが開始された場合、またはデータがまだ読み込み中の場合はローディングインジケーターを表示
  if (hasRedirected || loading || profileLoading || (user && !termsChecked)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  // すべての条件が満たされた場合のみ子コンポーネントをレンダリング
  return <>{children}</>;
};

export default AuthGuard;
