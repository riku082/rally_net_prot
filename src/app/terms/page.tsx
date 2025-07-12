'use client';

import React from 'react';
import { FiFileText, FiShield, FiUsers, FiGlobe, FiLock, FiAlertTriangle, FiArrowLeft, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TermsOfServicePage: React.FC = () => {
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
                  <FiFileText className="w-12 h-12 text-theme-primary-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">利用規約</h1>
                <p className="text-gray-600">バドミントン分析アプリケーションの利用規約</p>
                <p className="text-sm text-gray-500 mt-2">最終更新日: 2024年7月12日</p>
              </div>

              {/* コンテンツ */}
              <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
                
                {/* 第1条 */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FiUsers className="w-5 h-5 mr-2 text-theme-primary-600" />
                    第1条（総則）
                  </h2>
                  <div className="text-gray-600 space-y-3">
                    <p>
                      本利用規約（以下「本規約」といいます）は、当アプリケーション（以下「本サービス」といいます）の利用に関する条件を定めるものです。
                    </p>
                    <p>
                      利用者（以下「ユーザー」といいます）は、本サービスを利用することにより、本規約に同意したものとみなされます。
                    </p>
                  </div>
                </section>

                {/* 第2条 */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FiGlobe className="w-5 h-5 mr-2 text-green-600" />
                    第2条（サービス内容）
                  </h2>
                  <div className="text-gray-600 space-y-3">
                    <p>本サービスは、バドミントンの練習記録、技術分析、選手管理等の機能を提供します。</p>
                    <p>具体的な機能は以下の通りです：</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>練習記録の作成・管理</li>
                      <li>練習カードによるメニュー管理</li>
                      <li>試合データの記録・分析</li>
                      <li>選手・フレンド管理</li>
                      <li>技術向上のための診断・アドバイス機能</li>
                    </ul>
                  </div>
                </section>

                {/* 第3条 */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FiShield className="w-5 h-5 mr-2 text-purple-600" />
                    第3条（ユーザーの責任）
                  </h2>
                  <div className="text-gray-600 space-y-3">
                    <p>ユーザーは、以下の事項を遵守するものとします：</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>正確な情報の入力</li>
                      <li>アカウント情報の適切な管理</li>
                      <li>他のユーザーのプライバシーの尊重</li>
                      <li>法令および公序良俗に反する行為の禁止</li>
                      <li>本サービスの適正な利用</li>
                    </ul>
                  </div>
                </section>

                {/* 第4条 */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FiLock className="w-5 h-5 mr-2 text-red-600" />
                    第4条（プライバシーとデータ保護）
                  </h2>
                  <div className="text-gray-600 space-y-3">
                    <p>
                      ユーザーの個人情報は、プライバシーポリシーに従って適切に保護されます。
                    </p>
                    <p>
                      ユーザーが入力したデータは、サービス提供の目的でのみ使用され、第三者に無断で提供されることはありません。
                    </p>
                    <p>
                      ユーザーは、プライバシー設定により、自身のデータの公開範囲を制御することができます。
                    </p>
                  </div>
                </section>

                {/* 第5条 */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <FiAlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                    第5条（禁止事項）
                  </h2>
                  <div className="text-gray-600 space-y-3">
                    <p>ユーザーは、以下の行為を行ってはならないものとします：</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>虚偽の情報の登録・投稿</li>
                      <li>他のユーザーへの迷惑行為・嫌がらせ</li>
                      <li>本サービスの運営を妨害する行為</li>
                      <li>不正アクセスやシステムへの攻撃</li>
                      <li>商用目的での無断利用</li>
                      <li>著作権、肖像権その他の権利を侵害する行為</li>
                    </ul>
                  </div>
                </section>

                {/* 第6条 */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">第6条（サービスの変更・停止）</h2>
                  <div className="text-gray-600 space-y-3">
                    <p>
                      運営者は、事前の通知なしに本サービスの内容を変更、追加、停止することができるものとします。
                    </p>
                    <p>
                      システムメンテナンス、障害対応等により、一時的にサービスを停止する場合があります。
                    </p>
                  </div>
                </section>

                {/* 第7条 */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">第7条（免責事項）</h2>
                  <div className="text-gray-600 space-y-3">
                    <p>
                      運営者は、本サービスの利用によって生じた損害について、一切の責任を負わないものとします。
                    </p>
                    <p>
                      本サービスの技術的助言や分析結果は参考情報であり、その正確性や有効性を保証するものではありません。
                    </p>
                  </div>
                </section>

                {/* 第8条 */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">第8条（規約の変更）</h2>
                  <div className="text-gray-600 space-y-3">
                    <p>
                      運営者は、必要に応じて本規約を変更することができるものとします。
                    </p>
                    <p>
                      規約変更の場合は、本サービス内で事前に通知いたします。
                    </p>
                    <p>
                      変更後の規約は、本サービス内に掲載された時点で効力を生じるものとします。
                    </p>
                  </div>
                </section>

                {/* 第9条 */}
                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">第9条（準拠法・管轄裁判所）</h2>
                  <div className="text-gray-600 space-y-3">
                    <p>本規約は日本法に準拠するものとします。</p>
                    <p>
                      本サービスに関して紛争が生じた場合は、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
                    </p>
                  </div>
                </section>

                {/* お問い合わせ */}
                <section className="bg-blue-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">お問い合わせ</h2>
                  <div className="text-gray-600 space-y-2">
                    <p>本規約に関するご質問・お問い合わせは、アプリ内のフィードバック機能をご利用ください。</p>
                    <p className="text-sm">
                      適切なバドミントンライフを送るため、ルールを守って本サービスをご利用ください。
                    </p>
                  </div>
                </section>
            </div>
          </div>
        </main>
      </div>
    );
};

export default TermsOfServicePage;