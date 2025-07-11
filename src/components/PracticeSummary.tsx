'use client';

import React from 'react';
import Link from 'next/link';
import { Practice } from '@/types/practice';
import { FaBook, FaClock, FaStar, FaPlus } from 'react-icons/fa';
import { FiTrendingUp } from 'react-icons/fi';

interface PracticeSummaryProps {
  practices: Practice[];
  isLoading?: boolean;
}

const PracticeSummary: React.FC<PracticeSummaryProps> = ({ practices, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const recentPractices = practices.slice(0, 3);
  const totalThisWeek = practices.filter(practice => {
    const practiceDate = new Date(practice.date);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return practiceDate >= weekAgo;
  }).length;

  const totalDuration = practices.reduce((sum, p) => sum + p.duration, 0);
  const averageRating = practices.length > 0 
    ? practices.reduce((sum, p) => {
        const practiceAvg = p.skills.length > 0 
          ? p.skills.reduce((skillSum, skill) => skillSum + skill.rating, 0) / p.skills.length 
          : 0;
        return sum + practiceAvg;
      }, 0) / practices.length 
    : 0;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const practiceTypeLabels = {
    'basic_practice': '基礎練習',
    'game_practice': 'ゲーム練習',
    'physical_training': 'フィジカル',
    'technical_drill': 'テクニカル',
    'strategy_practice': '戦術練習',
    'match_simulation': '試合形式',
    'individual_practice': '個人練習',
    'group_practice': 'グループ練習',
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
          <FaBook className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
          練習記録
        </h3>
        <Link href="/practice" className="text-blue-600 hover:text-blue-800 transition-colors text-xs sm:text-sm font-medium">
          すべて表示 →
        </Link>
      </div>

      {practices.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="text-gray-400 mb-3 sm:mb-4 flex justify-center">
            <FaBook className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h4 className="text-base sm:text-lg font-medium text-gray-600 mb-2">練習記録なし</h4>
          <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">まだ練習が記録されていません</p>
          <Link href="/practice" className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium">
            <FaPlus className="w-3 h-3 mr-1" />
            練習を記録
          </Link>
        </div>
      ) : (
        <>
          {/* 統計サマリー */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center">
              <p className="text-xs text-blue-600 font-medium">今週</p>
              <p className="text-lg sm:text-xl font-bold text-blue-800">{totalThisWeek}</p>
              <p className="text-xs text-blue-600">回</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center">
              <p className="text-xs text-green-600 font-medium">総時間</p>
              <p className="text-lg sm:text-xl font-bold text-green-800">
                {Math.round(totalDuration / 60)}
              </p>
              <p className="text-xs text-green-600">時間</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2 sm:p-3 text-center">
              <p className="text-xs text-orange-600 font-medium">平均評価</p>
              <p className="text-lg sm:text-xl font-bold text-orange-800">
                {averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-orange-600">★</p>
            </div>
          </div>

          {/* 最近の練習 */}
          <div className="space-y-3 sm:space-y-4">
            {recentPractices.map(practice => (
              <div key={practice.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
                        {practice.title}
                      </p>
                      <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                        <span className="text-xs text-gray-500">
                          {formatDate(practice.date)}
                        </span>
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {practiceTypeLabels[practice.type]}
                        </span>
                        <div className="flex items-center">
                          <FaClock className="w-3 h-3 mr-0.5" />
                          <span className="text-xs">{formatDuration(practice.duration)}</span>
                        </div>
                        {practice.skills.length > 0 && (
                          <div className="flex items-center text-yellow-600">
                            <FaStar className="w-3 h-3 mr-0.5" />
                            <span className="text-xs">
                              {(practice.skills.reduce((sum, skill) => sum + skill.rating, 0) / practice.skills.length).toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link 
                    href="/practice" 
                    className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-md sm:rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    詳細
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* アクションボタン */}
          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link 
                href="/practice" 
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <FaPlus className="w-3 h-3 mr-1" />
                新しい記録
              </Link>
              <Link 
                href="/practice" 
                className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <FiTrendingUp className="w-3 h-3 mr-1" />
                統計を見る
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PracticeSummary;