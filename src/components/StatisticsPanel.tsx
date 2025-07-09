'use client';

import React, { useState, useEffect } from 'react';
import { MBTIType } from '@/types/mbti';
import { FaChartPie, FaChartBar, FaArrowUp, FaGlobe, FaUsers, FaClock } from 'react-icons/fa';

interface StatisticsData {
  totalUsers: number;
  typeDistribution: { [key in MBTIType]: number };
  averageConfidence: number;
  monthlyTrends: { month: string; count: number }[];
  popularTypes: { type: MBTIType; percentage: number }[];
  demographicData: {
    skillLevels: { [key: string]: number };
    playStyles: { [key: string]: number };
    regions: { [key: string]: number };
  };
}

const StatisticsPanel: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [selectedView, setSelectedView] = useState<'types' | 'trends' | 'demographics'>('types');
  const [isLoading, setIsLoading] = useState(true);

  // サンプルデータの生成
  const generateSampleStatistics = (): StatisticsData => {
    const typeDistribution = {
      'ESTJ': 180, 'ESTP': 165, 'ESFJ': 145, 'ESFP': 120,
      'ENTJ': 135, 'ENTP': 155, 'ENFJ': 140, 'ENFP': 170,
      'ISTJ': 160, 'ISTP': 125, 'ISFJ': 150, 'ISFP': 135,
      'INTJ': 110, 'INTP': 95, 'INFJ': 105, 'INFP': 130
    } as { [key in MBTIType]: number };

    const totalUsers = Object.values(typeDistribution).reduce((sum, count) => sum + count, 0);

    const popularTypes = Object.entries(typeDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({
        type: type as MBTIType,
        percentage: Math.round((count / totalUsers) * 100)
      }));

    const monthlyTrends = [
      { month: '1月', count: 45 },
      { month: '2月', count: 52 },
      { month: '3月', count: 68 },
      { month: '4月', count: 75 },
      { month: '5月', count: 89 },
      { month: '6月', count: 92 },
      { month: '7月', count: 105 },
      { month: '8月', count: 98 },
      { month: '9月', count: 112 },
      { month: '10月', count: 126 },
      { month: '11月', count: 134 },
      { month: '12月', count: 145 }
    ];

    const demographicData = {
      skillLevels: {
        '初級': 35,
        '中級': 45,
        '上級': 15,
        'エキスパート': 5
      },
      playStyles: {
        '攻撃的': 40,
        '守備的': 30,
        'バランス型': 30
      },
      regions: {
        '東京': 25,
        '神奈川': 18,
        '埼玉': 15,
        '千葉': 12,
        'その他': 30
      }
    };

    return {
      totalUsers,
      typeDistribution,
      averageConfidence: 76,
      monthlyTrends,
      popularTypes,
      demographicData
    };
  };

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setStatistics(generateSampleStatistics());
      setIsLoading(false);
    }, 1000);
  }, []);

  const getTypeColor = (type: MBTIType): string => {
    const colors = {
      'ESTJ': '#ef4444', 'ESTP': '#f97316', 'ESFJ': '#10b981', 'ESFP': '#eab308',
      'ENTJ': '#8b5cf6', 'ENTP': '#ec4899', 'ENFJ': '#3b82f6', 'ENFP': '#6366f1',
      'ISTJ': '#6b7280', 'ISTP': '#64748b', 'ISFJ': '#059669', 'ISFP': '#0d9488',
      'INTJ': '#7c3aed', 'INTP': '#0891b2', 'INFJ': '#0284c7', 'INFP': '#e11d48'
    };
    return colors[type] || '#6b7280';
  };

  const renderTypeDistribution = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 円グラフ風の表示 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-bold text-gray-800 mb-4">タイプ分布</h4>
        <div className="space-y-3">
          {statistics?.popularTypes.map((item, index) => (
            <div key={item.type} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: getTypeColor(item.type) }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.type}</span>
                  <span className="text-sm text-gray-600">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: getTypeColor(item.type)
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 全タイプのヒートマップ */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-bold text-gray-800 mb-4">16タイプ全体分布</h4>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(statistics?.typeDistribution || {}).map(([type, count]) => {
            const percentage = (count / (statistics?.totalUsers || 1)) * 100;
            return (
              <div
                key={type}
                className="aspect-square rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold relative"
                style={{ backgroundColor: getTypeColor(type as MBTIType) }}
              >
                <div>{type}</div>
                <div className="text-xs opacity-90">{Math.round(percentage)}%</div>
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity rounded-lg" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="font-bold text-gray-800 mb-4">月別診断数トレンド</h4>
      <div className="space-y-3">
        {statistics?.monthlyTrends.map((item, index) => {
          const maxCount = Math.max(...(statistics?.monthlyTrends.map(t => t.count) || [0]));
          const percentage = (item.count / maxCount) * 100;
          return (
            <div key={item.month} className="flex items-center">
              <div className="w-12 text-sm text-gray-600 mr-4">{item.month}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full flex items-center justify-center"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 20 && (
                        <span className="text-white text-xs font-medium">{item.count}</span>
                      )}
                    </div>
                  </div>
                  {percentage <= 20 && (
                    <span className="text-sm text-gray-600 ml-2">{item.count}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDemographics = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-bold text-gray-800 mb-4">スキルレベル</h4>
        <div className="space-y-3">
          {Object.entries(statistics?.demographicData.skillLevels || {}).map(([level, percentage]) => (
            <div key={level} className="flex items-center">
              <div className="w-16 text-sm text-gray-600 mr-4">{level}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-sm text-gray-600 ml-4 text-right">{percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-bold text-gray-800 mb-4">プレースタイル</h4>
        <div className="space-y-3">
          {Object.entries(statistics?.demographicData.playStyles || {}).map(([style, percentage]) => (
            <div key={style} className="flex items-center">
              <div className="w-16 text-sm text-gray-600 mr-4">{style}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-sm text-gray-600 ml-4 text-right">{percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-bold text-gray-800 mb-4">地域分布</h4>
        <div className="space-y-3">
          {Object.entries(statistics?.demographicData.regions || {}).map(([region, percentage]) => (
            <div key={region} className="flex items-center">
              <div className="w-16 text-sm text-gray-600 mr-4">{region}</div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-sm text-gray-600 ml-4 text-right">{percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">統計データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <FaChartPie className="w-5 h-5 mr-2 text-indigo-600" />
        統計情報
      </h3>

      {/* 統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <FaUsers className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-600 font-medium">総ユーザー数</p>
          <p className="text-2xl font-bold text-blue-900">{statistics?.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <FaArrowUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-green-600 font-medium">平均信頼度</p>
          <p className="text-2xl font-bold text-green-900">{statistics?.averageConfidence}%</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <FaChartBar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-purple-600 font-medium">人気タイプ</p>
          <p className="text-2xl font-bold text-purple-900">{statistics?.popularTypes[0]?.type}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <FaClock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-sm text-orange-600 font-medium">今月の診断数</p>
          <p className="text-2xl font-bold text-orange-900">{statistics?.monthlyTrends[statistics.monthlyTrends.length - 1]?.count}</p>
        </div>
      </div>

      {/* ビュー切り替え */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setSelectedView('types')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedView === 'types'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaChartPie className="w-4 h-4 mr-2" />
          タイプ分布
        </button>
        <button
          onClick={() => setSelectedView('trends')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedView === 'trends'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaArrowUp className="w-4 h-4 mr-2" />
          トレンド
        </button>
        <button
          onClick={() => setSelectedView('demographics')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedView === 'demographics'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FaGlobe className="w-4 h-4 mr-2" />
          デモグラフィック
        </button>
      </div>

      {/* 選択されたビューの表示 */}
      {selectedView === 'types' && renderTypeDistribution()}
      {selectedView === 'trends' && renderTrends()}
      {selectedView === 'demographics' && renderDemographics()}
    </div>
  );
};

export default StatisticsPanel;