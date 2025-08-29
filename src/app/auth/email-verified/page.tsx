'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { FiCheckCircle, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

const EmailVerifiedPage: React.FC = () => {
  const router = useRouter();
  const { user, refreshEmailVerification } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!user) {
        router.push('/auth');
        return;
      }

      try {
        // メール認証状態を更新
        await refreshEmailVerification();
        
        // 認証成功
        setVerified(true);
        
        // 3秒後に自動的にリダイレクト
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (err) {
        console.error('メール認証エラー:', err);
        setError('メール認証の確認に失敗しました');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [user, refreshEmailVerification, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ロゴとサイト名セクション */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Image 
              src="/logo.png" 
              alt="Rally Net" 
              width={64}
              height={64}
              className="mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-theme-primary-600 to-theme-primary-400 bg-clip-text text-transparent">
                Rally Net
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                バドミントン分析プラットフォーム
              </p>
            </div>
          </div>
        </div>

        {/* メール認証結果 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-theme-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  メールアドレスを確認中...
                </h2>
              </>
            ) : verified ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <FiCheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  メール認証が完了しました！
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  まもなくホーム画面に移動します...
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center px-4 py-2 bg-theme-primary-600 text-white rounded-lg hover:bg-theme-primary-700 transition-colors"
                >
                  <FiArrowRight className="mr-2" />
                  今すぐ開始
                </button>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <FiAlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  認証エラー
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  {error || 'メール認証の確認に失敗しました'}
                </p>
                <button
                  onClick={() => router.push('/auth')}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ログイン画面へ戻る
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;