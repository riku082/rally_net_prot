'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import EmailVerificationBanner from './EmailVerificationBanner';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean; // メール認証が必須かどうか
  fallbackComponent?: React.ReactNode; // 未認証時に表示するコンポーネント
}

const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ 
  children, 
  requireVerification = false,
  fallbackComponent 
}) => {
  const { user, isEmailVerified, loading } = useAuth();

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ユーザーが存在しない場合
  if (!user) {
    return null;
  }

  // メール認証が必須で、認証されていない場合
  if (requireVerification && !isEmailVerified) {
    if (fallbackComponent) {
      return (
        <>
          <EmailVerificationBanner />
          {fallbackComponent}
        </>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <EmailVerificationBanner />
          <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              メール認証が必要です
            </h2>
            <p className="text-gray-600">
              この機能を利用するには、メールアドレスの認証が必要です。
              上記のボタンから認証メールを送信し、メールボックスを確認してください。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // メール認証が不要、または認証済みの場合
  return (
    <>
      {!isEmailVerified && <EmailVerificationBanner />}
      {children}
    </>
  );
};

export default EmailVerificationGuard;