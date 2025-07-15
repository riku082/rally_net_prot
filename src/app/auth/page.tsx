'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmailVerification, signInWithGoogle } from '@/utils/auth';
import { firestoreDb } from '@/utils/db';
import Image from 'next/image';

const AuthPage: React.FC = () => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checkProfileAndRedirect = async (userId: string) => {
    try {
      // 利用規約同意確認
      const hasAgreed = await firestoreDb.hasAgreedToTerms(userId);
      if (!hasAgreed) {
        router.push('/terms-agreement');
        return;
      }

      // プロフィール確認
      const profile = await firestoreDb.getUserProfile(userId);
      if (profile) {
        router.push('/');
      } else {
        router.push('/onboarding/profile');
      }
    } catch (error) {
      console.error('プロフィールチェックエラー:', error);
      router.push('/terms-agreement');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user, error: authError } = isSignUp 
        ? await signUpWithEmailVerification(email, password)
        : await signInWithEmail(email, password);

      if (authError) {
        setError(authError);
      } else if (user) {
        if (isSignUp) {
          // 新規登録の場合、メール認証の案内を表示
          setError('');
          alert('アカウントを作成しました！認証メールを送信しましたので、メールボックスをご確認ください。メール認証後にログインしてください。');
          setIsSignUp(false);
        } else {
          // ログインの場合、メール認証チェック
          if (!user.emailVerified) {
            setError('メールアドレスが認証されていません。メールボックスをご確認ください。');
            return;
          }
          await checkProfileAndRedirect(user.uid);
        }
      }
    } catch {
      setError('認証に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const { user, error: authError } = await signInWithGoogle();
      
      if (authError) {
        setError(authError);
      } else if (user) {
        await checkProfileAndRedirect(user.uid);
      }
    } catch {
      setError('Google認証に失敗しました');
    } finally {
      setLoading(false);
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
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'アカウント作成' : 'ログイン'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {isSignUp ? '既にアカウントをお持ちですか？' : 'アカウントをお持ちでないですか？'}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-medium text-theme-primary-600 hover:text-theme-primary-500 ml-1 transition-colors"
              >
                {isSignUp ? 'ログイン' : 'アカウント作成'}
              </button>
            </p>
          </div>
        </div>

        {/* 認証フォーム */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div>

            <form className="space-y-6" onSubmit={handleEmailAuth}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-colors"
                    placeholder="メールアドレスを入力"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    パスワード
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-colors"
                    placeholder="パスワードを入力"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-theme-primary-600 to-theme-primary-400 hover:from-theme-primary-700 hover:to-theme-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? '処理中...' : (isSignUp ? 'アカウント作成' : 'ログイン')}
                </button>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">または</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Googleで{isSignUp ? 'アカウント作成' : 'ログイン'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 