'use client';

import React from 'react';
import { FaMedal, FaTrophy, FaAward, FaStar, FaCrown, FaGem } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'gold' | 'silver' | 'bronze' | 'special' | 'tournament' | 'practice';
  icon?: string;
  earnedAt: string;
  category: 'tournament' | 'practice' | 'streak' | 'skill' | 'milestone';
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  maxDisplay?: number;
  showDetails?: boolean;
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ 
  achievements, 
  maxDisplay = 6,
  showDetails = true 
}) => {
  // 実績を重要度でソート（金→銀→銅→特別）
  const sortedAchievements = achievements.sort((a, b) => {
    const typeOrder = { 'gold': 0, 'silver': 1, 'bronze': 2, 'special': 3, 'tournament': 4, 'practice': 5 };
    return typeOrder[a.type] - typeOrder[b.type];
  });

  const displayedAchievements = sortedAchievements.slice(0, maxDisplay);
  const hiddenCount = achievements.length - maxDisplay;

  const getAchievementIcon = (achievement: Achievement) => {
    switch (achievement.type) {
      case 'gold':
        return <FaTrophy className="w-4 h-4 text-yellow-500" />;
      case 'silver':
        return <FaMedal className="w-4 h-4 text-gray-400" />;
      case 'bronze':
        return <FaAward className="w-4 h-4 text-orange-600" />;
      case 'special':
        return <FaCrown className="w-4 h-4 text-purple-600" />;
      case 'tournament':
        return <GiShuttlecock className="w-4 h-4 text-blue-600" />;
      case 'practice':
        return <FaStar className="w-4 h-4 text-green-600" />;
      default:
        return <FaGem className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getAchievementColor = (type: Achievement['type']) => {
    switch (type) {
      case 'gold':
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500';
      case 'silver':
        return 'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-400';
      case 'bronze':
        return 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-500';
      case 'special':
        return 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-500';
      case 'tournament':
        return 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500';
      case 'practice':
        return 'bg-gradient-to-br from-green-400 to-green-600 border-green-500';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-500';
    }
  };

  const getCategoryLabel = (category: Achievement['category']) => {
    switch (category) {
      case 'tournament': return '大会';
      case 'practice': return '練習';
      case 'streak': return '継続';
      case 'skill': return 'スキル';
      case 'milestone': return 'マイルストーン';
      default: return '';
    }
  };

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTrophy className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">まだ実績がありません</p>
        <p className="text-gray-400 text-sm">練習や大会に参加して実績を獲得しましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 実績統計 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <FaTrophy className="w-4 h-4 text-yellow-600 mr-1" />
            <span className="text-lg font-bold text-yellow-700">
              {achievements.filter(a => a.type === 'gold').length}
            </span>
          </div>
          <span className="text-xs text-yellow-600">金メダル</span>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <FaMedal className="w-4 h-4 text-gray-500 mr-1" />
            <span className="text-lg font-bold text-gray-600">
              {achievements.filter(a => a.type === 'silver').length}
            </span>
          </div>
          <span className="text-xs text-gray-500">銀メダル</span>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <FaAward className="w-4 h-4 text-orange-600 mr-1" />
            <span className="text-lg font-bold text-orange-700">
              {achievements.filter(a => a.type === 'bronze').length}
            </span>
          </div>
          <span className="text-xs text-orange-600">銅メダル</span>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <FaCrown className="w-4 h-4 text-purple-600 mr-1" />
            <span className="text-lg font-bold text-purple-700">
              {achievements.filter(a => a.type === 'special').length}
            </span>
          </div>
          <span className="text-xs text-purple-600">特別賞</span>
        </div>
      </div>

      {/* 実績バッジ一覧 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {displayedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="group relative cursor-pointer"
            title={showDetails ? `${achievement.title}: ${achievement.description}` : achievement.title}
          >
            <div className={`
              relative p-3 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
              ${getAchievementColor(achievement.type)}
            `}>
              {/* メダル/バッジのアイコン */}
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  {getAchievementIcon(achievement)}
                </div>
              </div>

              {/* タイトル */}
              <div className="text-center">
                <p className="text-xs font-bold text-white truncate" title={achievement.title}>
                  {achievement.title}
                </p>
                <p className="text-xs text-white text-opacity-80 mt-1">
                  {getCategoryLabel(achievement.category)}
                </p>
              </div>

              {/* 獲得日時 */}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5">
                <span className="text-xs text-gray-600">
                  {new Date(achievement.earnedAt).getFullYear()}
                </span>
              </div>
            </div>

            {/* ホバー時の詳細情報 */}
            {showDetails && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <div className="bg-black bg-opacity-90 text-white text-xs rounded-lg p-3 max-w-48 text-center">
                  <p className="font-semibold mb-1">{achievement.title}</p>
                  <p className="text-gray-300 mb-2">{achievement.description}</p>
                  <p className="text-gray-400">
                    {new Date(achievement.earnedAt).toLocaleDateString('ja-JP')}
                  </p>
                  {/* 三角形の矢印 */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black border-opacity-90"></div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 非表示の実績数 */}
        {hiddenCount > 0 && (
          <div className="flex items-center justify-center p-3 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-center">
              <FaGem className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-600">+{hiddenCount}</p>
              <p className="text-xs text-gray-500">その他</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementBadges;