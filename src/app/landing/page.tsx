'use client';

import React from 'react';
import Link from 'next/link';
import { FaBrain, FaUsers, FaChartLine, FaPlay, FaUserCircle, FaStar } from 'react-icons/fa';
import { FiCalendar, FiTarget, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ナビゲーション */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GiShuttlecock className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-800">RallyNet</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth" 
                className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                ログイン
              </Link>
              <Link 
                href="/auth" 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                始める
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <GiShuttlecock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                バドミントンを
              </span>
              <br />
              科学する
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              データ分析とAIでバドミントンの上達をサポート。<br />
              試合動画の分析から性格診断まで、あなたのプレイを次のレベルへ。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
              >
                無料で始める
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="inline-flex items-center px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 font-medium text-lg">
                <FaPlay className="mr-2 w-4 h-4" />
                デモを見る
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 主要機能セクション */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              RallyNetの主要機能
            </h2>
            <p className="text-xl text-gray-600">
              最新テクノロジーでバドミントンの上達をサポート
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 試合分析 */}
            <FeatureCard
              icon={<FaChartLine className="w-8 h-8" />}
              title="試合分析"
              description="動画をアップロードするだけで、AIがラリーパターンやショット精度を自動分析。弱点と強みを明確に把握できます。"
              color="blue"
            />

            {/* BPSI診断 */}
            <FeatureCard
              icon={<FaBrain className="w-8 h-8" />}
              title="BPSI診断"
              description="バドミントン専用の性格診断で、あなたのプレイスタイルを分析。最適な戦術とトレーニング方法を提案します。"
              color="purple"
            />

            {/* プレイヤー管理 */}
            <FeatureCard
              icon={<FaUsers className="w-8 h-8" />}
              title="プレイヤー管理"
              description="フレンドとの試合記録やチーム分析機能で、コミュニティ全体の成長をサポート。相性の良いパートナーも見つけられます。"
              color="green"
            />

            {/* 成長追跡 */}
            <FeatureCard
              icon={<FiTrendingUp className="w-8 h-8" />}
              title="成長追跡"
              description="統計データとグラフで上達度を可視化。目標設定から達成まで、継続的な成長をサポートします。"
              color="orange"
            />

            {/* ニュース */}
            <FeatureCard
              icon={<FiCalendar className="w-8 h-8" />}
              title="最新ニュース"
              description="バドミントン界の最新ニュースや大会情報を自動収集。トレンドを把握して競技への理解を深められます。"
              color="red"
            />

            {/* パーソナライズ */}
            <FeatureCard
              icon={<FiTarget className="w-8 h-8" />}
              title="個別指導"
              description="あなたのレベルとプレイスタイルに合わせたパーソナライズされたトレーニングメニューを提供します。"
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* 使用の流れ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              簡単3ステップで始める
            </h2>
            <p className="text-xl text-gray-600">
              アカウント作成から分析まで、すぐに利用開始
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="プロフィール作成"
              description="スキルレベルやプレイスタイルを設定してアカウントを作成"
              icon={<FaUserCircle className="w-6 h-6" />}
            />
            <StepCard
              step="2"
              title="試合動画アップロード"
              description="スマートフォンで撮影した試合動画をアップロード"
              icon={<FaPlay className="w-6 h-6" />}
            />
            <StepCard
              step="3"
              title="分析結果を確認"
              description="AIによる詳細な分析結果と上達のためのアドバイスを確認"
              icon={<FaChartLine className="w-6 h-6" />}
            />
          </div>
        </div>
      </section>

      {/* 特徴・メリット */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              なぜRallyNetを選ぶのか？
            </h2>
            <p className="text-xl opacity-90">
              他にはない独自の機能と分析力
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard
              icon={<FaStar className="w-6 h-6" />}
              title="AI分析"
              description="最新のAI技術による精密な試合分析"
            />
            <BenefitCard
              icon={<FaBrain className="w-6 h-6" />}
              title="科学的アプローチ"
              description="データに基づいた科学的な上達メソッド"
            />
            <BenefitCard
              icon={<FaUsers className="w-6 h-6" />}
              title="コミュニティ"
              description="同じ目標を持つプレイヤーとのつながり"
            />
            <BenefitCard
              icon={<FiTarget className="w-6 h-6" />}
              title="個別最適化"
              description="一人一人に合わせたカスタマイズ"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 lg:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              今すぐバドミントンの上達を始めよう
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              無料アカウント作成で、すべての機能をお試しいただけます
            </p>
            <Link 
              href="/auth"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
            >
              無料で始める
              <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <GiShuttlecock className="w-8 h-8 text-blue-400 mr-2" />
              <span className="text-xl font-bold">RallyNet</span>
            </div>
            <div className="text-gray-400">
              © 2024 RallyNet. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 機能カードコンポーネント
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg mb-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// ステップカードコンポーネント
interface StepCardProps {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ step, title, description, icon }) => {
  return (
    <div className="text-center">
      <div className="relative mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-2xl font-bold mb-4">
          {step}
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="text-blue-600">{icon}</div>
          </div>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// メリットカードコンポーネント
interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, description }) => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4">
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="opacity-90">{description}</p>
    </div>
  );
};