'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { firestoreDb } from '@/utils/db';
import { FaFile, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

const TermsAgreementPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAgree = async () => {
    if (!user?.uid) {
      setError('ユーザー情報が見つかりません');
      return;
    }

    if (!agreedToTerms || !agreedToPolicy) {
      setError('利用規約とアドミッションポリシーの両方に同意してください');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 同意記録をデータベースに保存
      const agreementRecord = {
        userId: user.uid,
        termsAgreed: true,
        policyAgreed: true,
        agreedAt: Date.now(),
        version: '1.0'
      };

      await firestoreDb.recordTermsAgreement(agreementRecord);

      // プロフィール作成ページまたはダッシュボードにリダイレクト
      const profile = await firestoreDb.getUserProfile(user.uid);
      if (profile) {
        router.push('/');
      } else {
        router.push('/onboarding/profile');
      }
    } catch (error) {
      console.error('同意記録の保存に失敗しました:', error);
      setError('同意の記録に失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = agreedToTerms && agreedToPolicy;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Rally Net へようこそ</h1>
          <p className="text-gray-600">ご利用前に、以下の内容をご確認・同意いただく必要があります</p>
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          
          {/* 利用規約セクション */}
          <div className="border-2 border-theme-primary-100 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                <FaFile className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-theme-primary-600 flex-shrink-0" />
                <span className="text-sm sm:text-base">利用規約</span>
              </h2>
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-primary-600 hover:text-theme-primary-800 text-xs sm:text-sm font-medium hover:underline self-start sm:self-auto"
              >
                詳細を確認 →
              </Link>
            </div>
            <div className="bg-theme-primary-50 p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-theme-primary-800 mb-2 text-sm sm:text-base">主なポイント</h3>
              <ul className="text-theme-primary-700 text-xs sm:text-sm space-y-1">
                <li>• サービスの適正な利用</li>
                <li>• ユーザーの責任と禁止事項</li>
                <li>• プライバシー保護とデータの取り扱い</li>
                <li>• 免責事項とサービス変更について</li>
              </ul>
            </div>
            <label className="flex items-start space-x-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  agreedToTerms 
                    ? 'bg-theme-primary-600 border-theme-primary-600' 
                    : 'border-gray-300 hover:border-theme-primary-400'
                }`}>
                  {agreedToTerms && <FaCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                </div>
              </div>
              <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                <strong>利用規約</strong>を読み、理解し、同意します
              </span>
            </label>
          </div>

          {/* アドミッションポリシーセクション */}
          <div className="border-2 border-theme-primary-100 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                <FaInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-theme-primary-600 flex-shrink-0" />
                <span className="text-sm sm:text-base">アドミッションポリシー</span>
              </h2>
              <Link
                href="/admission-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-primary-600 hover:text-theme-primary-800 text-xs sm:text-sm font-medium hover:underline self-start sm:self-auto"
              >
                詳細を確認 →
              </Link>
            </div>
            <div className="bg-theme-primary-50 p-3 sm:p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-theme-primary-800 mb-2 text-sm sm:text-base">主なポイント</h3>
              <ul className="text-theme-primary-700 text-xs sm:text-sm space-y-1">
                <li>• すべてのバドミントンプレイヤーの成長支援</li>
                <li>• 初心者から上級者まで対応</li>
                <li>• 学習意欲と向上心を大切にする姿勢</li>
                <li>• コミュニティ精神とフェアプレー</li>
              </ul>
            </div>
            <label className="flex items-start space-x-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  agreedToPolicy 
                    ? 'bg-theme-primary-600 border-theme-primary-600' 
                    : 'border-gray-300 hover:border-theme-primary-400'
                }`}>
                  {agreedToPolicy && <FaCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                </div>
              </div>
              <span className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                <strong>アドミッションポリシー</strong>を読み、理解し、同意します
              </span>
            </label>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <FaExclamationTriangle className="w-5 h-5 text-red-600 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={() => router.push('/auth')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              戻る
            </button>
            <button
              onClick={handleAgree}
              disabled={!isFormValid || loading}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isFormValid && !loading
                  ? 'bg-theme-primary-600 text-white hover:bg-theme-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  処理中...
                </div>
              ) : (
                '同意してサービスを開始'
              )}
            </button>
          </div>

          {/* 注意事項 */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              同意いただくことで、Rally Net のすべての機能をご利用いただけます。<br />
              規約は今後更新される場合があります。重要な変更時には改めてお知らせいたします。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAgreementPage;