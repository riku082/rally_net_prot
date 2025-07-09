'use client';

import React from 'react';
import { MBTIResult, MBTIType } from '@/types/mbti';
import { badmintonMBTITypes } from '@/data/badmintonMBTITypes';
import { FaShare, FaUser, FaChartBar, FaLightbulb, FaExclamationTriangle, FaUsers, FaTrophy, FaShieldAlt, FaEye, FaCog, FaPercent } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';
import RadarChart from './RadarChart';
import AnimatedProgressBar from './AnimatedProgressBar';
import MBTIAvatar from './MBTIAvatar';
import PersonalizedTraining from './PersonalizedTraining';
import GrowthTracker from './GrowthTracker';

interface MBTIResultProps {
  result: MBTIResult;
  onRestart: () => void;
  previousResults?: MBTIResult[];
}

const MBTIResult: React.FC<MBTIResultProps> = ({ result, onRestart, previousResults }) => {
  const typeData = badmintonMBTITypes[result.result];
  

  const totalAnswers = Object.values(result.scores).reduce((a, b) => a + b, 0);

  const handleShare = async () => {
    const shareText = `バドミントン・プレースタイル診断（BPSI）の結果: ${result.result} - ${typeData.title}\n\n${typeData.description}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'バドミントン・プレースタイル診断（BPSI）結果',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.error('共有エラー:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('結果をクリップボードにコピーしました！');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <GiShuttlecock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">診断結果</h1>
        <p className="text-gray-600">あなたのバドミントンプレイヤータイプが判明しました！</p>
      </div>

      {/* メインタイプカード */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200 p-8 mb-6">
        <div className="text-center mb-6">
          <div className="mb-4">
            <MBTIAvatar type={result.result as MBTIType} size="xl" animated={true} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{typeData.title}</h2>
          <p className="text-lg text-gray-600 leading-relaxed">{typeData.description}</p>
        </div>

        {/* スコア表示 */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <FaChartBar className="w-5 h-5 mr-2 text-blue-600" />
            詳細スコア
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* レーダーチャート */}
            <div className="flex justify-center">
              <RadarChart data={result.scores} maxValue={totalAnswers / 4} />
            </div>
            
            {/* アニメーション付きプログレスバー */}
            <div className="space-y-4">
              <AnimatedProgressBar
                label="外向性 (E)"
                value={result.scores.E}
                maxValue={totalAnswers / 4}
                color="bg-blue-500"
                delay={100}
              />
              <AnimatedProgressBar
                label="感覚 (S)"
                value={result.scores.S}
                maxValue={totalAnswers / 4}
                color="bg-green-500"
                delay={200}
              />
              <AnimatedProgressBar
                label="思考 (T)"
                value={result.scores.T}
                maxValue={totalAnswers / 4}
                color="bg-purple-500"
                delay={300}
              />
              <AnimatedProgressBar
                label="判断 (J)"
                value={result.scores.J}
                maxValue={totalAnswers / 4}
                color="bg-orange-500"
                delay={400}
              />
            </div>
          </div>
        </div>

        {/* プレースタイル */}
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FaTrophy className="w-5 h-5 mr-2 text-yellow-600" />
            プレースタイル
          </h3>
          <p className="text-gray-700 leading-relaxed">{typeData.playStyle}</p>
        </div>
      </div>

      {/* 詳細分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 強み */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FaLightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            あなたの強み
          </h3>
          <ul className="space-y-3">
            {typeData.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 改善点 */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FaExclamationTriangle className="w-5 h-5 mr-2 text-orange-600" />
            改善できる点
          </h3>
          <ul className="space-y-3">
            {typeData.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 推奨事項 */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaUser className="w-5 h-5 mr-2 text-blue-600" />
          上達のための推奨事項
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {typeData.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <span className="text-gray-700">{recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 高度な分析結果 */}
      {result.analysis && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <FaEye className="w-5 h-5 mr-2 text-indigo-600" />
            高度な分析結果
          </h3>
          
          {/* 分析メトリクス */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-500 rounded-full mb-2">
                <FaShieldAlt className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-indigo-600 font-medium">信頼度スコア</p>
              <p className="text-2xl font-bold text-indigo-800">{result.analysis.confidenceScore}%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-2">
                <FaCog className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-green-600 font-medium">回答の一貫性</p>
              <p className="text-2xl font-bold text-green-800">{result.analysis.consistency}%</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-full mb-2">
                <FaPercent className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-orange-600 font-medium">サブタイプ</p>
              <p className="text-xl font-bold text-orange-800">{result.analysis.subType}</p>
            </div>
          </div>

          {/* 境界線上の特性 */}
          {result.analysis.borderlineTraits.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
              <h4 className="font-bold text-yellow-800 mb-2">境界線上の特性</h4>
              <p className="text-sm text-yellow-700 mb-2">
                以下の特性で僅差の結果が出ています。状況によって異なる傾向を示す可能性があります。
              </p>
              <div className="flex flex-wrap gap-2">
                {result.analysis.borderlineTraits.map((trait, index) => (
                  <span key={index} className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 主要な心理機能 */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-blue-800 mb-2">主要な心理機能</h4>
            <div className="space-y-2">
              {result.analysis.dominantFunctions.map((func, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-sm text-blue-700">{func}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 代替タイプの可能性 */}
          {result.analysis.alternativeTypes.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-2">他の可能性のあるタイプ</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.analysis.alternativeTypes.map((alt, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-500 rounded-full mb-2">
                      <span className="text-white font-bold text-sm">{alt.type}</span>
                    </div>
                    <p className="text-xs text-gray-600">{alt.probability}%の可能性</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* パートナー推奨 */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaUsers className="w-5 h-5 mr-2 text-purple-600" />
          相性の良いパートナータイプ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {typeData.partnerRecommendations.map((partner, index) => {
            const [type, description] = partner.split(': ');
            return (
              <div key={index} className="bg-purple-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 rounded-full mb-2">
                    <span className="text-white font-bold">{type}</span>
                  </div>
                  <p className="text-sm text-gray-700">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* パーソナライズされた機能 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PersonalizedTraining result={result} />
        <GrowthTracker currentResult={result} previousResults={previousResults} />
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleShare}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <FaShare className="w-4 h-4 mr-2" />
          結果を共有
        </button>
        <button
          onClick={onRestart}
          className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
        >
          <GiShuttlecock className="w-4 h-4 mr-2" />
          もう一度診断する
        </button>
      </div>
    </div>
  );
};


export default MBTIResult;