'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaBrain, FaTimes, FaArrowRight, FaUserCheck } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

interface BPSIIntroCardProps {
  onSkip: () => void;
  onDismiss: () => void;
}

const BPSIIntroCard: React.FC<BPSIIntroCardProps> = ({ onSkip, onDismiss }) => {
  const router = useRouter();

  const handleStartDiagnostic = () => {
    router.push('/mbti');
    onDismiss();
  };

  const handleSkip = () => {
    onSkip();
    onDismiss();
  };

  return (
    <div className="bg-gradient-to-br from-theme-primary-50 to-purple-50 rounded-2xl shadow-xl border border-theme-primary-200 p-6 mb-6 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 opacity-10">
        <GiShuttlecock className="w-32 h-32 text-theme-primary-600" />
      </div>
      
      {/* 閉じるボタン */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <FaTimes className="w-4 h-4" />
      </button>

      <div className="relative z-10">
        {/* ヘッダー */}
        <div className="flex items-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-theme-primary-500 to-purple-600 rounded-full mr-4">
            <FaBrain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              Rally Netへようこそ！
            </h3>
            <div className="flex items-center text-sm text-theme-primary-600">
              <FaUserCheck className="w-4 h-4 mr-1" />
              <span>新規登録完了</span>
            </div>
          </div>
        </div>

        {/* メッセージ */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            あなたのバドミントンプレースタイルを診断してみませんか？
          </h4>
          <p className="text-gray-600 mb-4 leading-relaxed">
            <strong className="text-theme-primary-600">BPSI診断</strong>は、あなたのプレースタイルを16タイプに分類し、
            最適な練習方法やパートナー選びのアドバイスを提供します。
          </p>
          
          {/* 特徴 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm font-medium text-gray-800">🎯 個別診断</div>
              <div className="text-xs text-gray-600">あなただけの結果</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm font-medium text-gray-800">⚡ 約5分</div>
              <div className="text-xs text-gray-600">簡単な質問に回答</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-sm font-medium text-gray-800">📊 詳細分析</div>
              <div className="text-xs text-gray-600">強み・弱みを把握</div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStartDiagnostic}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-theme-primary-600 to-purple-600 text-white rounded-xl hover:from-theme-primary-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex-1"
          >
            <FaBrain className="w-4 h-4 mr-2" />
            診断を受ける
            <FaArrowRight className="w-4 h-4 ml-2" />
          </button>
          
          <button
            onClick={handleSkip}
            className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium sm:w-auto"
          >
            後で診断する
          </button>
        </div>

        {/* 補足情報 */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          ※ 診断結果はいつでも確認・再診断できます
        </div>
      </div>
    </div>
  );
};

export default BPSIIntroCard;