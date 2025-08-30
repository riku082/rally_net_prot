'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { firestoreDb } from '@/utils/db';
import Image from 'next/image';
import { FiMail, FiCheck, FiRefreshCw } from 'react-icons/fi';

const VerifyCodePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const isSignUp = searchParams.get('signup') === 'true';
  const password = searchParams.get('p'); // パスワードは暗号化して渡すことを推奨

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/auth');
    }
  }, [email, router]);

  useEffect(() => {
    // カウントダウンタイマー
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // ペーストされた場合の処理
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      
      // 最後の入力欄にフォーカス
      const lastIndex = Math.min(index + pastedCode.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    } else {
      // 通常の入力
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // 次の入力欄にフォーカス
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // 現在の入力欄が空でBackspaceが押された場合、前の入力欄にフォーカス
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('6桁の認証コードを入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: verificationCode,
          ...(isSignUp && password && { password }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '認証に失敗しました');
        return;
      }

      // カスタムトークンでログイン
      await signInWithCustomToken(auth, data.customToken);

      // プロフィール確認とリダイレクト
      const hasAgreed = await firestoreDb.hasAgreedToTerms(data.uid);
      if (!hasAgreed) {
        router.push('/terms-agreement');
      } else {
        const profile = await firestoreDb.getUserProfile(data.uid);
        if (profile) {
          router.push('/');
        } else {
          router.push('/onboarding/profile');
        }
      }
    } catch (error) {
      console.error('認証エラー:', error);
      setError('認証に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setResending(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '認証コードの再送信に失敗しました');
      } else {
        setCountdown(60); // 60秒のクールダウン
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('再送信エラー:', error);
      setError('認証コードの再送信に失敗しました');
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

        {/* 認証コード入力フォーム */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <FiMail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              メール認証
            </h2>
            <p className="text-sm text-gray-600">
              {email} に送信された6桁の認証コードを入力してください
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-xs text-yellow-800">
                  開発環境：認証コードはブラウザのコンソールまたはサーバーログに表示されます
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* 認証コード入力欄 */}
            <div className="flex justify-between space-x-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-colors"
                  style={{ color: '#000000' }}
                  autoComplete="off"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* 認証ボタン */}
            <button
              onClick={handleVerifyCode}
              disabled={loading || code.join('').length !== 6}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-theme-primary-600 to-theme-primary-400 hover:from-theme-primary-700 hover:to-theme-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  認証中...
                </span>
              ) : (
                <span className="flex items-center">
                  <FiCheck className="mr-2" />
                  認証する
                </span>
              )}
            </button>

            {/* 再送信ボタン */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                認証コードが届きませんか？
              </p>
              <button
                onClick={handleResendCode}
                disabled={resending || countdown > 0}
                className="inline-flex items-center text-sm font-medium text-theme-primary-600 hover:text-theme-primary-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FiRefreshCw className={`mr-1 ${resending ? 'animate-spin' : ''}`} />
                {countdown > 0 
                  ? `再送信まで ${countdown} 秒` 
                  : '認証コードを再送信'
                }
              </button>
            </div>

            {/* 戻るリンク */}
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                onClick={() => router.push('/auth')}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                ログイン画面に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCodePage;