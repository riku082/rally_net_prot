'use client';

import React from 'react';
import { RallyAnalysisResult } from '@/utils/rallyAnalyzer';
import { FiBarChart, FiTrendingUp, FiTarget, FiActivity, FiClock, FiZap } from 'react-icons/fi';

interface RallyAnalysisPanelProps {
  analysis: RallyAnalysisResult;
  playerName?: string;
}

const RallyAnalysisPanel: React.FC<RallyAnalysisPanelProps> = ({ analysis, playerName }) => {
  // ラリー数分布の上位5位
  const topRallyCounts = Array.from(analysis.rallyCountDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 勝率が高いラリー数の上位3位
  const topWinRateRallies = Array.from(analysis.winRateByRallyCount.entries())
    .filter(([, stats]) => stats.total >= 3) // 最低3回以上のラリー
    .sort((a, b) => b[1].rate - a[1].rate)
    .slice(0, 3);

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDecimal = (value: number): string => {
    return value.toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <FiBarChart className="w-6 h-6 text-purple-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">
          ラリー数分析{playerName ? ` - ${playerName}` : ''}
        </h3>
      </div>

      {analysis.totalRallies === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiActivity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>分析可能なラリーデータがありません</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 基本統計 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <FiActivity className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-700">
                  {formatDecimal(analysis.averageRallyCount)}
                </span>
              </div>
              <p className="text-purple-600 font-medium mt-1 text-sm">平均ラリー数</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <FiTrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">
                  {analysis.maxRallyCount}
                </span>
              </div>
              <p className="text-green-600 font-medium mt-1 text-sm">最大ラリー数</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <FiClock className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-700">
                  {formatDecimal(analysis.medianRallyCount)}
                </span>
              </div>
              <p className="text-blue-600 font-medium mt-1 text-sm">中央値</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <FiZap className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-orange-700">
                  {analysis.totalRallies}
                </span>
              </div>
              <p className="text-orange-600 font-medium mt-1 text-sm">総ラリー数</p>
            </div>
          </div>

          {/* ラリー範囲別分析 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">短いラリー</h4>
              <p className="text-sm text-red-600 mb-2">{analysis.rallyRangeAnalysis.short.range}</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-red-700 text-sm">勝率:</span>
                  <span className="text-red-700 font-medium">
                    {formatPercentage(analysis.rallyRangeAnalysis.short.winRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700 text-sm">回数:</span>
                  <span className="text-red-700 font-medium">
                    {analysis.rallyRangeAnalysis.short.count}回
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">中程度のラリー</h4>
              <p className="text-sm text-yellow-600 mb-2">{analysis.rallyRangeAnalysis.medium.range}</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-yellow-700 text-sm">勝率:</span>
                  <span className="text-yellow-700 font-medium">
                    {formatPercentage(analysis.rallyRangeAnalysis.medium.winRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700 text-sm">回数:</span>
                  <span className="text-yellow-700 font-medium">
                    {analysis.rallyRangeAnalysis.medium.count}回
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">長いラリー</h4>
              <p className="text-sm text-green-600 mb-2">{analysis.rallyRangeAnalysis.long.range}</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-700 text-sm">勝率:</span>
                  <span className="text-green-700 font-medium">
                    {formatPercentage(analysis.rallyRangeAnalysis.long.winRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700 text-sm">回数:</span>
                  <span className="text-green-700 font-medium">
                    {analysis.rallyRangeAnalysis.long.count}回
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* サーブ分析 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FiTarget className="w-4 h-4 mr-2" />
                サーブタイプ別分析
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded border">
                  <div>
                    <p className="font-medium text-gray-800">ショートサーブ</p>
                    <p className="text-sm text-gray-600">
                      平均: {formatDecimal(analysis.serveAnalysis.shortServe.avgRally)}打
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">
                      {formatPercentage(analysis.serveAnalysis.shortServe.winRate)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {analysis.serveAnalysis.shortServe.count}回
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded border">
                  <div>
                    <p className="font-medium text-gray-800">ロングサーブ</p>
                    <p className="text-sm text-gray-600">
                      平均: {formatDecimal(analysis.serveAnalysis.longServe.avgRally)}打
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      {formatPercentage(analysis.serveAnalysis.longServe.winRate)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {analysis.serveAnalysis.longServe.count}回
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-4">よく出るラリー数</h4>
              <div className="space-y-2">
                {topRallyCounts.map(([rallyCount, frequency], index) => (
                  <div key={rallyCount} className="flex justify-between items-center p-2 bg-white rounded">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-2">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-800">{rallyCount}打</span>
                    </div>
                    <div className="text-right">
                      <span className="text-purple-600 font-medium">{frequency}回</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({formatPercentage(frequency / analysis.totalRallies)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 勝率の高いラリー数 */}
          {topWinRateRallies.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                <FiTrendingUp className="w-4 h-4 mr-2" />
                勝率の高いラリー数（3回以上）
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topWinRateRallies.map(([rallyCount, stats]) => (
                  <div key={rallyCount} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">{rallyCount}打</span>
                      <span className="text-green-600 font-bold">
                        {formatPercentage(stats.rate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {stats.wins}勝 / {stats.total}回
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RallyAnalysisPanel;