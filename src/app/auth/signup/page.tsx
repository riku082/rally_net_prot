'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiMail, FiLock, FiUser, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';

const SignUpPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で設定してください');
      return;
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);

    try {
      // Firebase Authでユーザー作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // メール認証を送信
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/verification-pending`,
        handleCodeInApp: false,
      });

      // ユーザーのUIDをセッションストレージに保存
      sessionStorage.setItem('pendingUserId', user.uid);
      sessionStorage.setItem('pendingUserEmail', user.email || '');

      // 一旦ログアウト（認証完了までアクセスさせない）
      await signOut(auth);

      // 認証待ち画面へ遷移
      router.push('/auth/verification-pending');
      
    } catch (error) {
      console.error('サインアップエラー:', error);
      
      // Firebaseのエラーメッセージを日本語に変換
      let errorMessage = 'アカウント作成に失敗しました';
      if ((error as any).code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています';
      } else if ((error as any).code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません';
      } else if ((error as any).code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます。6文字以上で設定してください';
      }
      
      setError(errorMessage);
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
        </div>

        {/* アカウント作成フォーム */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              アカウント作成
            </h2>
            <p className="text-sm text-gray-600 text-center">
              新しいアカウントを作成してRally Netを始めましょう
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSignUp}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-2" />
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
                  placeholder="example@email.com"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  <FiLock className="inline mr-2" />
                  パスワード
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-colors"
                  placeholder="6文字以上で入力"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  <FiLock className="inline mr-2" />
                  パスワード（確認）
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 transition-colors"
                  placeholder="パスワードを再入力"
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
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-theme-primary-600 to-theme-primary-400 hover:from-theme-primary-700 hover:to-theme-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    処理中...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FiArrowRight className="mr-2" />
                    アカウントを作成
                  </span>
                )}
              </button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                アカウント作成後、メールアドレスに確認メールを送信します
              </p>
              <p className="text-xs text-gray-500">
                ※ メール認証を完了するまでログインできません
              </p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  既にアカウントをお持ちですか？
                </p>
                <Link
                  href="/auth"
                  className="inline-flex items-center font-medium text-theme-primary-600 hover:text-theme-primary-500 transition-colors mt-2"
                >
                  <FiArrowLeft className="mr-1" />
                  ログインページへ
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;