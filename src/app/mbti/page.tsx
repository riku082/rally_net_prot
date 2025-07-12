'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import AuthGuard from '@/components/AuthGuard';
import MBTIDiagnostic from '@/components/MBTIDiagnostic';
import MBTIResult from '@/components/MBTIResult';
import { MBTIResult as MBTIResultType, MBTIType } from '@/types/mbti';
import { useAuth } from '@/context/AuthContext';
import { FaBrain, FaPlay, FaHistory, FaChartBar } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

enum DiagnosticState {
  WELCOME = 'welcome',
  DIAGNOSTIC = 'diagnostic',
  RESULT = 'result',
  HISTORY = 'history'
}

export default function MBTIPage() {
  const { user } = useAuth();
  const [currentState, setCurrentState] = useState<DiagnosticState>(DiagnosticState.WELCOME);
  const [currentResult, setCurrentResult] = useState<MBTIResultType | null>(null);
  const [previousResults, setPreviousResults] = useState<MBTIResultType[]>([]);
  const [, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreviousResults();
    }
  }, [user]);

  const loadPreviousResults = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/mbti?userId=${user.uid}`);
      const data = await response.json();
      if (data.result) {
        setPreviousResults([data.result]);
      }
    } catch (error) {
      console.error('過去の結果の読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDiagnostic = () => {
    setCurrentState(DiagnosticState.DIAGNOSTIC);
  };

  const handleDiagnosticComplete = (result: MBTIResultType) => {
    setCurrentResult(result);
    setCurrentState(DiagnosticState.RESULT);
    setPreviousResults([result, ...previousResults]);
  };

  const handleRestartDiagnostic = () => {
    setCurrentResult(null);
    setCurrentState(DiagnosticState.WELCOME);
  };

  const handleShowHistory = () => {
    setCurrentState(DiagnosticState.HISTORY);
  };

  const handleShowResult = (result: MBTIResultType) => {
    setCurrentResult(result);
    setCurrentState(DiagnosticState.RESULT);
  };

  const renderContent = () => {
    switch (currentState) {
      case DiagnosticState.WELCOME:
        return <WelcomeScreen 
          onStart={handleStartDiagnostic} 
          onShowHistory={handleShowHistory}
          hasPreviousResults={previousResults.length > 0}
        />;
      case DiagnosticState.DIAGNOSTIC:
        return <MBTIDiagnostic onComplete={handleDiagnosticComplete} />;
      case DiagnosticState.RESULT:
        return currentResult ? <MBTIResult result={currentResult} onRestart={handleRestartDiagnostic} previousResults={previousResults} /> : null;
      case DiagnosticState.HISTORY:
        return <HistoryScreen 
          results={previousResults} 
          onShowResult={handleShowResult}
          onBackToWelcome={() => setCurrentState(DiagnosticState.WELCOME)}
          onNewDiagnostic={handleStartDiagnostic}
        />;
      default:
        return null;
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar activePath="/mbti" />
        <MobileNav activePath="/mbti" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

// ウェルカムスクリーン
interface WelcomeScreenProps {
  onStart: () => void;
  onShowHistory: () => void;
  hasPreviousResults: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onShowHistory, hasPreviousResults }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
          <GiShuttlecock className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          バドミントン・プレースタイル診断（BPSI）
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
          あなたのバドミントンプレイスタイルを分析し、16のプレイヤータイプに分類します。
          自分の強みと改善点を発見して、より効果的な練習方法を見つけましょう。
        </p>
      </div>

      {/* 特徴説明 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-theme-primary-100 rounded-full mb-4">
            <FaBrain className="w-6 h-6 text-theme-primary-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">科学的分析</h3>
          <p className="text-gray-600">心理学理論をベースにしたバドミントン特化の診断</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <FaChartBar className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">詳細な結果</h3>
          <p className="text-gray-600">強み・弱み・改善提案を具体的に提示</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <GiShuttlecock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">実践的アドバイス</h3>
          <p className="text-gray-600">あなたに最適な練習法とパートナー選びのコツ</p>
        </div>
      </div>

      {/* 診断の流れ */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">診断の流れ</h2>
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-theme-primary-500 rounded-full mb-2">
              <span className="text-white font-bold">1</span>
            </div>
            <p className="text-sm text-gray-600">16の質問に回答</p>
          </div>
          <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-theme-primary-500 rounded-full mb-2">
              <span className="text-white font-bold">2</span>
            </div>
            <p className="text-sm text-gray-600">自動分析・診断</p>
          </div>
          <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-theme-primary-500 rounded-full mb-2">
              <span className="text-white font-bold">3</span>
            </div>
            <p className="text-sm text-gray-600">結果確認・共有</p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="space-y-6">
        {/* メインアクション */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onStart}
            className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-lg font-medium shadow-lg hover:shadow-xl"
          >
            <FaPlay className="w-5 h-5 mr-2" />
            診断を開始する
          </button>
          {hasPreviousResults && (
            <button
              onClick={onShowHistory}
              className="flex items-center justify-center px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors text-lg font-medium"
            >
              <FaHistory className="w-5 h-5 mr-2" />
              過去の結果を見る
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

// 履歴スクリーン
interface HistoryScreenProps {
  results: MBTIResultType[];
  onShowResult: (result: MBTIResultType) => void;
  onBackToWelcome: () => void;
  onNewDiagnostic: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ 
  results, 
  onShowResult, 
  onBackToWelcome, 
  onNewDiagnostic 
}) => {
  if (results.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <FaHistory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">診断履歴がありません</h2>
          <p className="text-gray-600 mb-6">まずは診断を受けてみましょう。</p>
          <button
            onClick={onNewDiagnostic}
            className="px-6 py-3 bg-theme-primary-600 text-white rounded-xl hover:bg-theme-primary-700 transition-colors"
          >
            診断を開始する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">診断履歴</h1>
        <div className="flex gap-4">
          <button
            onClick={onBackToWelcome}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            戻る
          </button>
          <button
            onClick={onNewDiagnostic}
            className="px-4 py-2 bg-theme-primary-600 text-white rounded-lg hover:bg-theme-primary-700 transition-colors"
          >
            新しい診断
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => onShowResult(result)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-4">
                  <span className="text-white font-bold">{result.result}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {result.result} - タイプ名
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(result.createdAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-theme-primary-600 hover:text-theme-primary-800">
                詳細を見る →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};