'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import { FiMail, FiMessageSquare, FiSend, FiAlertCircle, FiCheck } from 'react-icons/fi';

const FeedbackPage: React.FC = () => {
  const [formData, setFormData] = useState({
    appearanceRating: 5,
    contentRating: 5,
    usabilityRating: 5,
    overallRating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        // フォームをリセット
        setFormData({
          appearanceRating: 5,
          contentRating: 5,
          usabilityRating: 5,
          overallRating: 5,
          comment: ''
        });
      } else {
        alert('送信に失敗しました: ' + data.error);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('送信中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, size = "text-2xl" }: { 
    rating: number; 
    onRatingChange: (rating: number) => void;
    size?: string;
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${size} transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = (rating: number) => {
    switch(rating) {
      case 1: return "大変不満";
      case 2: return "不満";
      case 3: return "普通";
      case 4: return "満足";
      case 5: return "大変満足";
      default: return "";
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/feedback" />
        <MobileNav activePath="/feedback" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">ご意見ありがとうございました！</h1>
                  <p className="text-gray-600">
                    貴重なご意見をお寄せいただき、ありがとうございます。<br />
                    いただいたご意見は今後のサービス改善に活用させていただきます。
                  </p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  他のご意見を送る
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePath="/feedback" />
      <MobileNav activePath="/feedback" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* ヘッダー */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <FiMail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">目安箱</h1>
                  <p className="text-gray-600">皆様のご意見をお聞かせください</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FiAlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">限定公開について</p>
                    <p>この目安箱は現在限定公開中です。いただいたご意見は開発チームが確認し、サービス改善に活用させていただきます。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* フィードバックフォーム */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">サービス評価をお聞かせください</h2>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 見た目・デザイン */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <label className="block text-lg font-medium text-gray-700 mb-4">
                    🎨 見た目・デザイン
                  </label>
                  <div className="flex items-center justify-between">
                    <StarRating 
                      rating={formData.appearanceRating} 
                      onRatingChange={(rating) => setFormData({ ...formData, appearanceRating: rating })} 
                    />
                    <span className="text-sm text-gray-600 min-w-[80px] text-right">
                      {getRatingText(formData.appearanceRating)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    画面の見やすさ、色使い、レイアウトなど
                  </p>
                </div>

                {/* コンテンツ・内容 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <label className="block text-lg font-medium text-gray-700 mb-4">
                    📄 コンテンツ・内容
                  </label>
                  <div className="flex items-center justify-between">
                    <StarRating 
                      rating={formData.contentRating} 
                      onRatingChange={(rating) => setFormData({ ...formData, contentRating: rating })} 
                    />
                    <span className="text-sm text-gray-600 min-w-[80px] text-right">
                      {getRatingText(formData.contentRating)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    記事の質、情報の有用性、コンテンツの充実度など
                  </p>
                </div>

                {/* 使いやすさ */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <label className="block text-lg font-medium text-gray-700 mb-4">
                    🖱️ 使いやすさ
                  </label>
                  <div className="flex items-center justify-between">
                    <StarRating 
                      rating={formData.usabilityRating} 
                      onRatingChange={(rating) => setFormData({ ...formData, usabilityRating: rating })} 
                    />
                    <span className="text-sm text-gray-600 min-w-[80px] text-right">
                      {getRatingText(formData.usabilityRating)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    操作の分かりやすさ、ナビゲーション、機能の見つけやすさなど
                  </p>
                </div>

                {/* 総合評価 */}
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                  <label className="block text-lg font-medium text-gray-700 mb-4">
                    ⭐ 総合評価
                  </label>
                  <div className="flex items-center justify-between">
                    <StarRating 
                      rating={formData.overallRating} 
                      onRatingChange={(rating) => setFormData({ ...formData, overallRating: rating })}
                      size="text-3xl"
                    />
                    <span className="text-base text-gray-700 font-medium min-w-[80px] text-right">
                      {getRatingText(formData.overallRating)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    サービス全体に対する満足度
                  </p>
                </div>

                {/* コメント */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    一言コメント（任意）
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="サービスについて一言お聞かせください（任意）"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.comment.length}/200文字</p>
                </div>

                {/* 匿名投稿の説明 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">プライバシーについて</p>
                      <p>すべての評価は匿名で処理されます。</p>
                    </div>
                  </div>
                </div>

                {/* 送信ボタン */}
                <div className="pt-4 text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        送信中...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4 mr-2" />
                        評価を送信
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* フッター情報 */}
            <div className="bg-gray-50 rounded-xl p-6 mt-8">
              <h3 className="font-medium text-gray-800 mb-3">評価について</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• いただいた評価は、サービス改善の参考とさせていただきます</li>
                <li>• 匿名での投稿も可能です</li>
                <li>• 評価は統計的に処理され、品質向上に活用されます</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FeedbackPage;