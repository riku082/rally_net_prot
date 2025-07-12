'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import { 
  FaTachometerAlt, 
  FaUser, 
  FaChartBar, 
  FaRss, 
  FaUserFriends, 
  FaBrain, 
  FaBook, 
  FaMailBulk,
  FaArrowRight,
  FaPlay,
  FaCheck,
  FaStar,
  FaVideo,
  FaChartLine,
  FaCalendar,
  FaUsers,
  FaLightbulb
} from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

const Guide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const features = [
    {
      id: 'dashboard',
      title: 'ダッシュボード',
      icon: <FaTachometerAlt className="w-8 h-8" />,
      path: '/dashboard',
      description: '総合管理画面で全体の状況を一目で把握',
      color: 'from-blue-500 to-blue-600',
      available: true,
      highlights: [
        '練習・試合の統計情報表示',
        '最近の活動履歴',
        '成長グラフとチャート',
        '今日のおすすめ練習'
      ],
      howToUse: [
        'ログイン後、最初に表示される画面です',
        '各種統計データで現在の状況を確認',
        '他の機能への入り口として活用',
        'クイックアクションで素早く操作'
      ]
    },
    {
      id: 'practice',
      title: '練習管理',
      icon: <FaBook className="w-8 h-8" />,
      path: '/practice-management',
      description: '練習記録・カード・スケジュール管理',
      color: 'from-orange-500 to-orange-600',
      available: true,
      highlights: [
        '練習カレンダー表示',
        '練習カード作成・管理',
        '練習記録の詳細入力',
        '統計データの可視化'
      ],
      howToUse: [
        'カレンダーから練習日を選択',
        '練習カードで効率的な練習プランを作成',
        '練習後に詳細な記録を入力',
        '統計データで練習効果を分析'
      ]
    },
    {
      id: 'news',
      title: 'ニュース',
      icon: <FaRss className="w-8 h-8" />,
      path: '/news',
      description: 'バドミントン関連の最新ニュース・情報',
      color: 'from-red-500 to-red-600',
      available: true,
      highlights: [
        '最新バドミントンニュース',
        '大会情報・結果',
        '技術記事・コラム',
        'ブックマーク機能'
      ],
      howToUse: [
        'トップページで最新ニュースを確認',
        '気になる記事をブックマーク',
        'カテゴリ別でニュースを絞り込み',
        '定期的にチェックして情報をキャッチアップ'
      ]
    },
    {
      id: 'friends',
      title: 'フレンド',
      icon: <FaUserFriends className="w-8 h-8" />,
      path: '/friends',
      description: '友達・パートナー管理・地域おすすめユーザー',
      color: 'from-pink-500 to-pink-600',
      available: true,
      highlights: [
        'フレンド申請・承認',
        '地域別おすすめユーザー',
        '練習相手探し',
        'ユーザー検索機能'
      ],
      howToUse: [
        'ユーザー検索でフレンド申請',
        '地域おすすめから近くのユーザーを探す',
        '練習相手を効率的に見つける',
        'フレンドと練習予定を共有'
      ]
    },
    {
      id: 'mbti',
      title: 'BPSI診断',
      icon: <FaBrain className="w-8 h-8" />,
      path: '/mbti',
      description: 'バドミントン専用プレースタイル診断システム',
      color: 'from-teal-500 to-teal-600',
      available: true,
      highlights: [
        'バドミントン特化型診断',
        '16タイプ性格分析',
        'プレイスタイル診断',
        '相性診断機能'
      ],
      howToUse: [
        '質問に回答してプレイスタイルを診断',
        '結果を基に適切な練習方法を提案',
        'パートナーとの相性をチェック',
        '定期的に診断して成長を確認'
      ]
    },
    {
      id: 'feedback',
      title: '目安箱',
      icon: <FaMailBulk className="w-8 h-8" />,
      path: '/feedback',
      description: 'フィードバック・要望・改善提案',
      color: 'from-gray-500 to-gray-600',
      available: true,
      highlights: [
        '機能改善要望',
        'バグ報告',
        '新機能提案',
        '匿名フィードバック'
      ],
      howToUse: [
        '改善要望やバグを報告',
        '新機能のアイデアを提案',
        '使いにくい点をフィードバック',
        '開発チームとの直接コミュニケーション'
      ]
    },
    {
      id: 'players',
      title: '選手管理',
      icon: <FaUser className="w-8 h-8" />,
      path: '/players',
      description: '選手情報の登録・編集・スキル管理',
      color: 'from-green-500 to-green-600',
      available: false,
      badge: 'Coming Soon',
      highlights: [
        '選手プロフィール管理',
        'スキルレベル設定',
        '成長記録の追跡',
        'レーダーチャート表示'
      ],
      howToUse: [
        '「新規選手追加」で選手を登録',
        '基本情報（名前、年齢、ポジション）を入力',
        'スキル項目ごとにレベルを設定',
        '定期的にスキルレベルを更新して成長を記録'
      ]
    },
    {
      id: 'matches',
      title: '試合記録',
      icon: <GiShuttlecock className="w-8 h-8" />,
      path: '/matches',
      description: '試合データの記録・管理・分析（ヨシダシステム）',
      color: 'from-purple-500 to-purple-600',
      available: false,
      badge: 'Coming Soon',
      highlights: [
        'シングルス・ダブルス対応',
        'リアルタイム配球記録',
        'YouTube動画連携',
        '詳細な試合分析'
      ],
      howToUse: [
        '「新規試合」で試合情報を入力',
        'コート画面でリアルタイム配球記録',
        'YouTube URLで試合動画と連携',
        '試合後に詳細分析レポートを確認'
      ]
    },
    {
      id: 'analysis',
      title: '分析',
      icon: <FaChartBar className="w-8 h-8" />,
      path: '/analysis',
      description: 'データ分析・可視化・パフォーマンス向上',
      color: 'from-indigo-500 to-indigo-600',
      available: false,
      badge: 'Coming Soon',
      highlights: [
        '配球パターン分析',
        'スキル成長グラフ',
        '弱点・強みの可視化',
        '改善提案機能'
      ],
      howToUse: [
        '試合・練習データから自動分析',
        'グラフ・チャートで傾向を確認',
        '選手別・期間別で詳細分析',
        '分析結果を次の練習に活用'
      ]
    }
  ];

  const navigation = [
    { id: 'overview', label: '概要', icon: <FaLightbulb /> },
    { id: 'features', label: '機能詳細', icon: <FaStar /> },
    { id: 'getting-started', label: '使い方', icon: <FaPlay /> },
    { id: 'tips', label: 'ヒント', icon: <FaChartLine /> }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar activePath="/guide" />
      <MobileNav activePath="/guide" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* モバイルナビゲーション */}
            <div className="lg:hidden mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">目次</h3>
                <div className="grid grid-cols-2 gap-2">
                  {navigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center justify-center px-3 py-2 rounded-lg transition-colors text-sm ${
                        activeSection === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* デスクトップサイドナビゲーション */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">目次</h3>
                  <nav className="space-y-2">
                    {navigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
                          activeSection === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* メインコンテンツ */}
              <div className="lg:col-span-3 space-y-6 sm:space-y-8">
                {/* 概要セクション */}
                {activeSection === 'overview' && (
                  <div className="space-y-6 sm:space-y-8">
                    <div className="text-center">
                      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                        Rally Net 完全ガイド
                      </h1>
                      <p className="text-sm sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                        バドミントン専用の総合管理システム ver1.0.0。練習管理からコミュニティまで、あなたのバドミントンライフをサポートします。
                      </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Rally Netとは？</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-start">
                            <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-1 mr-2 sm:mr-3 flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">総合管理システム</h3>
                              <p className="text-gray-600 text-xs sm:text-sm">選手、試合、練習を一元管理</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-1 mr-2 sm:mr-3 flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">データ分析</h3>
                              <p className="text-gray-600 text-xs sm:text-sm">詳細な統計とパフォーマンス分析</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-1 mr-2 sm:mr-3 flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">コミュニティ</h3>
                              <p className="text-gray-600 text-xs sm:text-sm">フレンド機能でつながる</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-start">
                            <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-1 mr-2 sm:mr-3 flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">リアルタイム記録</h3>
                              <p className="text-gray-600 text-xs sm:text-sm">試合中の配球をリアルタイム記録</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-1 mr-2 sm:mr-3 flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">動画連携</h3>
                              <p className="text-gray-600 text-xs sm:text-sm">YouTube動画と試合記録を同期</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <FaCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-1 mr-2 sm:mr-3 flex-shrink-0" />
                            <div>
                              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">性格診断</h3>
                              <p className="text-gray-600 text-xs sm:text-sm">バドミントン専用のBPSI診断</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 機能詳細セクション */}
                {activeSection === 'features' && (
                  <div className="space-y-6 sm:space-y-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">機能詳細</h2>
                    {features.map((feature, index) => (
                      <div key={feature.id} className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden ${!feature.available ? 'opacity-75' : ''}`}>
                        <div className={`bg-gradient-to-r ${feature.color} p-4 sm:p-6 text-white ${!feature.available ? 'opacity-80' : ''}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <div className="flex items-center min-w-0 flex-1">
                              <div className="w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0">{feature.icon}</div>
                              <h3 className="text-base sm:text-2xl font-bold ml-2 sm:ml-4 truncate">{feature.title}</h3>
                              {feature.badge && (
                                <span className={`ml-1 sm:ml-3 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded whitespace-nowrap flex-shrink-0 ${
                                  feature.badge === 'Coming Soon' 
                                    ? 'bg-orange-100/20 text-orange-200 border border-orange-200/30' 
                                    : 'bg-white/20 text-white'
                                }`}>
                                  {feature.badge}
                                </span>
                              )}
                            </div>
                            {feature.available ? (
                              <Link 
                                href={feature.path}
                                className="px-3 sm:px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm sm:text-base text-center"
                              >
                                試してみる
                              </Link>
                            ) : (
                              <div className="px-3 sm:px-4 py-2 bg-white/10 text-white/60 rounded-lg cursor-not-allowed text-sm sm:text-base text-center">
                                開発中
                              </div>
                            )}
                          </div>
                          <p className="mt-2 sm:mt-3 text-sm sm:text-lg opacity-90">{feature.description}</p>
                        </div>
                        
                        <div className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">主な機能</h4>
                              <ul className="space-y-1 sm:space-y-2">
                                {feature.highlights.map((highlight, idx) => (
                                  <li key={idx} className="flex items-center">
                                    <FaStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-2 flex-shrink-0" />
                                    <span className="text-gray-600 text-sm sm:text-base">{highlight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">使い方</h4>
                              <ol className="space-y-1 sm:space-y-2">
                                {feature.howToUse.map((step, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold mr-2 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="text-gray-600 text-sm sm:text-base">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 使い方セクション */}
                {activeSection === 'getting-started' && (
                  <div className="space-y-6 sm:space-y-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">使い方ガイド</h2>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">初期設定</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <FaUser className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">1. プロフィール設定</h4>
                          <p className="text-gray-600 text-xs sm:text-sm">基本情報とプレイスタイルを設定</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <FaUsers className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">2. 選手登録</h4>
                          <p className="text-gray-600 text-xs sm:text-sm">自分や仲間の選手情報を登録</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <FaCalendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">3. 練習・試合記録</h4>
                          <p className="text-gray-600 text-xs sm:text-sm">日々の活動を記録して分析</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">基本ワークフロー</h3>
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-start">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3 sm:mr-4 mt-1 text-sm sm:text-base flex-shrink-0">1</div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">ダッシュボードで状況確認</h4>
                            <p className="text-gray-600 text-sm sm:text-base">最新の統計データと活動状況をチェック</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3 sm:mr-4 mt-1 text-sm sm:text-base flex-shrink-0">2</div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">練習・試合を記録</h4>
                            <p className="text-gray-600 text-sm sm:text-base">リアルタイムで詳細なデータを入力</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3 sm:mr-4 mt-1 text-sm sm:text-base flex-shrink-0">3</div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">分析結果を確認</h4>
                            <p className="text-gray-600 text-sm sm:text-base">自動生成される分析レポートをチェック</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3 sm:mr-4 mt-1 text-sm sm:text-base flex-shrink-0">4</div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">改善点を実践</h4>
                            <p className="text-gray-600 text-sm sm:text-base">分析結果を基に次の練習プランを立案</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ヒントセクション */}
                {activeSection === 'tips' && (
                  <div className="space-y-6 sm:space-y-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">活用のヒント</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                        <div className="flex items-center mb-3 sm:mb-4">
                          <FaVideo className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
                          <h3 className="text-base sm:text-lg font-bold text-gray-800">動画活用術</h3>
                        </div>
                        <ul className="space-y-1 sm:space-y-2 text-black">
                          <li className="text-sm sm:text-base font-semibold">• 試合動画とデータを同期させて詳細分析</li>
                          <li className="text-sm sm:text-base font-semibold">• 練習動画で技術向上をチェック</li>
                          <li className="text-sm sm:text-base font-semibold">• スロー再生で細かい動きを確認</li>
                        </ul>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                        <div className="flex items-center mb-3 sm:mb-4">
                          <FaChartLine className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
                          <h3 className="text-base sm:text-lg font-bold text-gray-800">データ分析活用</h3>
                        </div>
                        <ul className="space-y-1 sm:space-y-2 text-black">
                          <li className="text-sm sm:text-base font-semibold">• 週次・月次でパフォーマンス推移を確認</li>
                          <li className="text-sm sm:text-base font-semibold">• 対戦相手別の戦績を分析</li>
                          <li className="text-sm sm:text-base font-semibold">• 弱点エリアを重点的に練習</li>
                        </ul>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                        <div className="flex items-center mb-3 sm:mb-4">
                          <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                          <h3 className="text-base sm:text-lg font-bold text-gray-800">チーム活用</h3>
                        </div>
                        <ul className="space-y-1 sm:space-y-2 text-black">
                          <li className="text-sm sm:text-base font-semibold">• フレンド機能でチームメンバーを管理</li>
                          <li className="text-sm sm:text-base font-semibold">• 練習予定を共有して効率化</li>
                          <li className="text-sm sm:text-base font-semibold">• 相性診断でベストパートナーを発見</li>
                        </ul>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
                        <div className="flex items-center mb-3 sm:mb-4">
                          <FaBrain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mr-2 sm:mr-3 flex-shrink-0" />
                          <h3 className="text-base sm:text-lg font-bold text-gray-800">メンタル管理</h3>
                        </div>
                        <ul className="space-y-1 sm:space-y-2 text-black">
                          <li className="text-sm sm:text-base font-semibold">• BPSI診断で自己理解を深める</li>
                          <li className="text-sm sm:text-base font-semibold">• 性格タイプに合わせた練習方法</li>
                          <li className="text-sm sm:text-base font-semibold">• ストレス管理とモチベーション維持</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl text-white p-4 sm:p-8 text-center">
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">さあ、始めましょう！</h3>
                      <p className="text-sm sm:text-lg mb-4 sm:mb-6 opacity-90">
                        Rally Netで、あなたのバドミントンライフを次のレベルへ
                      </p>
                      <Link 
                        href="/dashboard"
                        className="inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base"
                      >
                        <FaPlay className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        今すぐ始める
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Guide;