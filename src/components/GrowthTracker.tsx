'use client';

import React, { useState, useEffect } from 'react';
import { MBTIResult } from '@/types/mbti';
import { FaChartLine, FaTrophy, FaCalendarAlt, FaArrowUp, FaArrowDown, FaStar } from 'react-icons/fa';

interface GrowthTrackerProps {
  currentResult: MBTIResult;
  previousResults?: MBTIResult[];
}

interface GrowthMetric {
  label: string;
  current: number;
  previous?: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  date?: string;
}

const GrowthTracker: React.FC<GrowthTrackerProps> = ({ currentResult, previousResults = [] }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // 成長メトリクスの計算
  const calculateGrowthMetrics = (): GrowthMetric[] => {
    if (previousResults.length === 0) {
      return [
        { label: '信頼度スコア', current: currentResult.analysis?.confidenceScore || 0, change: 0, trend: 'stable' },
        { label: '一貫性', current: currentResult.analysis?.consistency || 0, change: 0, trend: 'stable' },
        { label: '外向性', current: currentResult.scores.E, change: 0, trend: 'stable' },
        { label: '感覚', current: currentResult.scores.S, change: 0, trend: 'stable' },
        { label: '思考', current: currentResult.scores.T, change: 0, trend: 'stable' },
        { label: '判断', current: currentResult.scores.J, change: 0, trend: 'stable' }
      ];
    }

    const previousResult = previousResults[0];
    const metrics: GrowthMetric[] = [];

    // 信頼度スコアの変化
    if (currentResult.analysis && previousResult.analysis) {
      const confidenceChange = currentResult.analysis.confidenceScore - previousResult.analysis.confidenceScore;
      metrics.push({
        label: '信頼度スコア',
        current: currentResult.analysis.confidenceScore,
        previous: previousResult.analysis.confidenceScore,
        change: confidenceChange,
        trend: confidenceChange > 0 ? 'up' : confidenceChange < 0 ? 'down' : 'stable'
      });

      const consistencyChange = currentResult.analysis.consistency - previousResult.analysis.consistency;
      metrics.push({
        label: '一貫性',
        current: currentResult.analysis.consistency,
        previous: previousResult.analysis.consistency,
        change: consistencyChange,
        trend: consistencyChange > 0 ? 'up' : consistencyChange < 0 ? 'down' : 'stable'
      });
    }

    // 各軸の変化
    const scoreChanges = [
      { key: 'E', label: '外向性' },
      { key: 'S', label: '感覚' },
      { key: 'T', label: '思考' },
      { key: 'J', label: '判断' }
    ];

    scoreChanges.forEach(({ key, label }) => {
      const current = currentResult.scores[key as keyof typeof currentResult.scores];
      const previous = previousResult.scores[key as keyof typeof previousResult.scores];
      const change = current - previous;
      
      metrics.push({
        label,
        current,
        previous,
        change,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      });
    });

    return metrics;
  };

  // 実績の生成
  const generateAchievements = (): Achievement[] => {
    const baseAchievements: Achievement[] = [
      {
        id: 'first-diagnosis',
        title: '初回診断完了',
        description: '初めてMBTI診断を受けました',
        icon: '🎯',
        earned: true,
        date: new Date(currentResult.createdAt).toLocaleDateString('ja-JP')
      },
      {
        id: 'high-confidence',
        title: '高信頼度達成',
        description: '信頼度スコア80%以上を達成',
        icon: '🏆',
        earned: (currentResult.analysis?.confidenceScore || 0) >= 80
      },
      {
        id: 'consistent-answers',
        title: '一貫性マスター',
        description: '回答の一貫性90%以上を達成',
        icon: '⭐',
        earned: (currentResult.analysis?.consistency || 0) >= 90
      },
      {
        id: 'multiple-diagnoses',
        title: '継続的な学習者',
        description: '複数回の診断を受けて成長を追跡',
        icon: '📈',
        earned: previousResults.length > 0
      },
      {
        id: 'improvement-streak',
        title: '成長の軌跡',
        description: '前回より信頼度スコアが向上',
        icon: '🚀',
        earned: previousResults.length > 0 && 
                 currentResult.analysis && 
                 previousResults[0].analysis &&
                 currentResult.analysis.confidenceScore > previousResults[0].analysis.confidenceScore
      }
    ];

    return baseAchievements;
  };

  const growthMetrics = calculateGrowthMetrics();

  useEffect(() => {
    setAchievements(generateAchievements());
  }, [currentResult, previousResults]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <FaArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <FaArrowDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <FaChartLine className="w-5 h-5 mr-2 text-green-600" />
        成長追跡
      </h3>

      {/* 期間選択 */}
      <div className="flex space-x-2 mb-6">
        {(['week', 'month', 'all'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {period === 'week' ? '1週間' : period === 'month' ? '1ヶ月' : '全期間'}
          </button>
        ))}
      </div>

      {/* 成長メトリクス */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {growthMetrics.map((metric, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{metric.label}</span>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">{metric.current}</span>
              {metric.previous !== undefined && (
                <span className={`ml-2 text-sm ${getTrendColor(metric.trend)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}
                </span>
              )}
            </div>
            {metric.previous !== undefined && (
              <div className="text-xs text-gray-500 mt-1">
                前回: {metric.previous}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 実績 */}
      <div>
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaTrophy className="w-5 h-5 mr-2 text-yellow-500" />
          実績
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                achievement.earned
                  ? 'border-yellow-300 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start">
                <div className="text-2xl mr-3">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-gray-800">{achievement.title}</h5>
                    {achievement.earned && (
                      <FaStar className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  {achievement.earned && achievement.date && (
                    <div className="flex items-center text-xs text-gray-500">
                      <FaCalendarAlt className="w-3 h-3 mr-1" />
                      {achievement.date}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 成長のヒント */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">成長のヒント</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 定期的に診断を受けて変化を追跡しましょう</li>
          <li>• 一貫性を高めるため、質問に正直に答えましょう</li>
          <li>• 推奨される練習プランを実践してみましょう</li>
          <li>• 他のプレイヤーとの交流で新しい発見をしましょう</li>
        </ul>
      </div>
    </div>
  );
};

export default GrowthTracker;