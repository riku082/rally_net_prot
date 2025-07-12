'use client';

import React from 'react';
import { FiUserCheck, FiTarget, FiHeart, FiBookOpen, FiTrendingUp, FiUsers, FiShield, FiStar, FiX } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';
import { useRouter } from 'next/navigation';

const AdmissionPolicyPage: React.FC = () => {
  const router = useRouter();

  const handleCloseTab = () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* 閉じるボタン */}
          <div className="mb-6">
            <div className="flex justify-end">
              <button
                onClick={handleCloseTab}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="タブを閉じる"
              >
                <FiX className="w-5 h-5 mr-2" />
                閉じる
              </button>
            </div>
          </div>

          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <GiShuttlecock className="w-12 h-12 text-theme-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">アドミッションポリシー</h1>
            <p className="text-gray-600">バドミントン分析アプリケーションの利用方針</p>
            <p className="text-sm text-gray-500 mt-2">最終更新日: 2024年7月12日</p>
          </div>

          {/* コンテンツ */}
          <div className="space-y-6">
            
            {/* 基本理念 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FiHeart className="w-6 h-6 mr-3 text-red-500" />
                基本理念
              </h2>
              <div className="text-gray-700 space-y-3">
                <p className="text-lg">
                  私たちは、<strong>すべてのバドミントンプレイヤーの成長と技術向上</strong>を支援することを使命としています。
                </p>
                <p>
                  初心者から上級者まで、年齢や経験を問わず、バドミントンを愛するすべての方が、
                  データに基づいた科学的な分析を通じて、より効果的な練習と競技力向上を実現できる環境を提供します。
                </p>
              </div>
            </div>

            {/* 対象ユーザー */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FiUsers className="w-5 h-5 mr-2 text-green-600" />
                対象ユーザー
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FiTarget className="w-5 h-5 text-theme-primary-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">初心者プレイヤー</h3>
                      <p className="text-gray-600 text-sm">基礎技術の習得と効率的な練習メニューの構築を目指す方</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiTrendingUp className="w-5 h-5 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">中級・上級者</h3>
                      <p className="text-gray-600 text-sm">データ分析による弱点克服と戦術改善を求める方</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiBookOpen className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">指導者・コーチ</h3>
                      <p className="text-gray-600 text-sm">選手管理と効果的な指導法の研究を行う方</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FiUsers className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">チーム・クラブ</h3>
                      <p className="text-gray-600 text-sm">チーム全体のパフォーマンス向上と組織的な練習管理を行う団体</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiStar className="w-5 h-5 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">競技志向の方</h3>
                      <p className="text-gray-600 text-sm">大会での勝利や記録向上を目標とする競技者</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiHeart className="w-5 h-5 text-red-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">健康維持目的</h3>
                      <p className="text-gray-600 text-sm">趣味として楽しみながら健康維持を図る方</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 利用条件 */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FiUserCheck className="w-5 h-5 mr-2 text-theme-primary-600" />
                利用条件
              </h2>
              <div className="space-y-4">
                <div className="bg-theme-primary-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-theme-primary-800 mb-2">年齢制限</h3>
                  <p className="text-theme-primary-700 text-sm">
                    13歳以上の方が利用対象です。13歳未満の方は、保護者の同意のもとでご利用ください。
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">技術レベル</h3>
                  <p className="text-green-700 text-sm">
                    バドミントンの経験年数や技術レベルは問いません。初心者から上級者まで、すべてのレベルに対応しています。
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">デバイス要件</h3>
                  <p className="text-purple-700 text-sm">
                    スマートフォン、タブレット、PCのいずれかでインターネット接続が可能な環境が必要です。
                  </p>
                </div>
              </div>
            </div>

            {/* 期待される利用姿勢 */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <FiShield className="w-5 h-5 mr-2 text-purple-600" />
                期待される利用姿勢
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">学習意欲と向上心</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>データから学び、継続的な改善を目指す姿勢</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>新しい練習方法や技術に対する探求心</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-theme-primary-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>目標設定と達成に向けた計画的な取り組み</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">コミュニティ精神</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>他のユーザーとの建設的な交流</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>経験や知識の共有による相互成長</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>スポーツマンシップとフェアプレー精神</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* サポート体制 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">サポート体制</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-theme-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiBookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">学習ガイド</h3>
                  <p className="text-gray-600 text-sm">初心者向けの使い方ガイドと上達のためのヒント</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUsers className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">コミュニティ</h3>
                  <p className="text-gray-600 text-sm">ユーザー同士の情報交換とサポート</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiShield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">技術サポート</h3>
                  <p className="text-gray-600 text-sm">アプリの使用方法やトラブル対応</p>
                </div>
              </div>
            </div>

            {/* 成長への誓い */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">私たちの約束</h2>
              <p className="text-gray-600 leading-relaxed">
                本アプリケーションを通じて、あなたのバドミントンライフがより充実し、
                技術向上と楽しさの両立が実現できるよう、継続的にサービスを改善してまいります。
                <br /><br />
                <strong className="text-gray-800">
                  データの力で、あなたのバドミントンを次のレベルへ。
                </strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdmissionPolicyPage;