'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiMail, FiRefreshCw, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const VerificationPendingPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    // セッションストレージから情報を取得
    const pendingEmail = sessionStorage.getItem('pendingUserEmail');
    if (!pendingEmail) {
      router.push('/auth/signup');
      return;
    }
    setEmail(pendingEmail);
  }, [router]);

  useEffect(() => {
    // クールダウンタイマー
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);


  const resendVerificationEmail = async () => {
    if (cooldown > 0) return;

    setResending(true);
    setError('');
    setSuccess('');

    try {
      // メール再送信のAPIを呼び出す
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('確認メールを再送信しました');
        setCooldown(60); // 60秒のクールダウン
      } else {
        setError(data.error || 'メールの再送信に失敗しました');
      }
    } catch (error) {
      console.error('再送信エラー:', error);
      setError('メールの再送信に失敗しました');
    } finally {
      setResending(false);
    }
  };

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

        {/* メール認証待ち */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FiMail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              メール認証待ち
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              <strong>{email}</strong> に確認メールを送信しました
            </p>
            <p className="text-xs text-gray-500">
              メール内のリンクをクリックして認証を完了してください
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                認証完了後、<a href="/auth" className="font-medium underline">ログインページ</a>からログインしてください
              </p>
            </div>
          </div>

          <div className="space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start">
                <FiCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}


            {/* 再送信ボタン */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                メールが届きませんか？
              </p>
              <button
                onClick={resendVerificationEmail}
                disabled={resending || cooldown > 0}
                className="inline-flex items-center text-sm font-medium text-theme-primary-600 hover:text-theme-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FiRefreshCw className={`mr-1 ${resending ? 'animate-spin' : ''}`} />
                {cooldown > 0 
                  ? `再送信まで ${cooldown} 秒` 
                  : 'メールを再送信'
                }
              </button>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">確認手順：</h3>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>メールボックスを確認</li>
                  <li>「Rally Net - メールアドレスの確認」という件名のメールを開く</li>
                  <li>メール内の確認リンクをクリック</li>
                  <li>認証完了後、ログインページからログイン</li>
                </ol>
                <p className="text-xs text-gray-500 mt-2">
                  ※ 迷惑メールフォルダもご確認ください
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPendingPage;