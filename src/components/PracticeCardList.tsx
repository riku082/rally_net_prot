'use client';

import React, { useState } from 'react';
import { PracticeCard, PracticeCardFilter, PracticeDifficulty, SkillCategory, CourtZone } from '@/types/practice';
import { FaClock, FaEdit, FaTrash, FaStar, FaTag, FaTools, FaBullseye, FaPlay, FaFilter, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { FiTrendingUp, FiUsers } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';

interface PracticeCardListProps {
  cards: PracticeCard[];
  onEdit: (card: PracticeCard) => void;
  onDelete: (cardId: string) => void;
  onUse: (card: PracticeCard) => void;
  isLoading?: boolean;
}

const PracticeCardList: React.FC<PracticeCardListProps> = ({
  cards,
  onEdit,
  onDelete,
  onUse,
  isLoading = false
}) => {
  const [filter, setFilter] = useState<PracticeCardFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const difficultyLabels = {
    'beginner': '初級',
    'intermediate': '中級',
    'advanced': '上級',
  };

  const difficultyColors = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-yellow-100 text-yellow-800',
    'advanced': 'bg-red-100 text-red-800',
  };

  const skillCategories = [
    { value: 'serve', label: 'サーブ' },
    { value: 'receive', label: 'レシーブ' },
    { value: 'clear', label: 'クリア' },
    { value: 'drop', label: 'ドロップ' },
    { value: 'smash', label: 'スマッシュ' },
    { value: 'net_play', label: 'ネットプレイ' },
    { value: 'drive', label: 'ドライブ' },
    { value: 'footwork', label: 'フットワーク' },
    { value: 'defense', label: '守備' },
    { value: 'strategy', label: '戦術' },
    { value: 'physical', label: 'フィジカル' },
    { value: 'mental', label: 'メンタル' },
  ];

  const filteredCards = cards.filter(card => {
    // 検索条件
    if (searchTerm && !card.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !card.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false;
    }

    // 難易度フィルター
    if (filter.difficulty && card.difficulty !== filter.difficulty) {
      return false;
    }

    // スキルカテゴリフィルター
    if (filter.skillCategories && filter.skillCategories.length > 0) {
      const hasMatchingSkill = filter.skillCategories.some(skill => 
        card.skillCategories.includes(skill)
      );
      if (!hasMatchingSkill) return false;
    }

    // 時間フィルター
    if (filter.maxDuration && card.estimatedDuration > filter.maxDuration) {
      return false;
    }
    if (filter.minDuration && card.estimatedDuration < filter.minDuration) {
      return false;
    }

    return true;
  });

  const sortedCards = filteredCards.sort((a, b) => {
    // 使用回数、最終使用日、作成日順でソート
    if (a.usageCount !== b.usageCount) {
      return b.usageCount - a.usageCount;
    }
    if (a.lastUsed && b.lastUsed) {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    }
    return b.createdAt - a.createdAt;
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const formatLastUsed = (dateString?: string) => {
    if (!dateString) return '未使用';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  const handleSkillCategoryFilterChange = (category: SkillCategory, checked: boolean) => {
    setFilter(prev => ({
      ...prev,
      skillCategories: checked 
        ? [...(prev.skillCategories || []), category]
        : (prev.skillCategories || []).filter(cat => cat !== category)
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      {/* ヘッダー */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <GiShuttlecock className="w-6 h-6 mr-2 text-blue-600" />
          練習カード
        </h2>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="カードを検索..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaFilter className="w-4 h-4 mr-2" />
            フィルター
          </button>
        </div>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">難易度</label>
              <select
                value={filter.difficulty || ''}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value as PracticeDifficulty || undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全て</option>
                <option value="beginner">初級</option>
                <option value="intermediate">中級</option>
                <option value="advanced">上級</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最小時間</label>
              <input
                type="number"
                value={filter.minDuration || ''}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  minDuration: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                placeholder="分"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最大時間</label>
              <input
                type="number"
                value={filter.maxDuration || ''}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  maxDuration: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                placeholder="分"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">スキルカテゴリ</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {skillCategories.map(skill => (
                <label key={skill.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(filter.skillCategories || []).includes(skill.value as SkillCategory)}
                    onChange={(e) => handleSkillCategoryFilterChange(skill.value as SkillCategory, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{skill.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => {
                setFilter({});
                setSearchTerm('');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              フィルターをクリア
            </button>
          </div>
        </div>
      )}

      {/* 統計サマリー */}
      {sortedCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <GiShuttlecock className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600 font-medium">総カード数</p>
                <p className="text-2xl font-bold text-blue-800">{cards.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaClock className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600 font-medium">平均時間</p>
                <p className="text-2xl font-bold text-green-800">
                  {Math.round(cards.reduce((sum, c) => sum + c.estimatedDuration, 0) / cards.length)}分
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <FiTrendingUp className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600 font-medium">最多使用</p>
                <p className="text-2xl font-bold text-purple-800">
                  {Math.max(...cards.map(c => c.usageCount), 0)}回
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaStar className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-orange-600 font-medium">平均評価</p>
                <p className="text-2xl font-bold text-orange-800">
                  {cards.filter(c => c.rating).length > 0 
                    ? (cards.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / cards.filter(c => c.rating).length).toFixed(1)
                    : '未評価'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* カードリスト */}
      {sortedCards.length === 0 ? (
        <div className="text-center py-12">
          <GiShuttlecock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchTerm || Object.keys(filter).length > 0 ? '条件に一致するカードがありません' : '練習カードがありません'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || Object.keys(filter).length > 0 ? '検索条件を変更してみてください' : '最初の練習カードを作成してみましょう'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCards.map(card => (
            <PracticeCardItem
              key={card.id}
              card={card}
              onEdit={() => onEdit(card)}
              onDelete={() => onDelete(card.id)}
              onUse={() => onUse(card)}
              difficultyLabel={difficultyLabels[card.difficulty]}
              difficultyColor={difficultyColors[card.difficulty]}
              formatDuration={formatDuration}
              formatLastUsed={formatLastUsed}
              skillCategories={skillCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface PracticeCardItemProps {
  card: PracticeCard;
  onEdit: () => void;
  onDelete: () => void;
  onUse: () => void;
  difficultyLabel: string;
  difficultyColor: string;
  formatDuration: (minutes: number) => string;
  formatLastUsed: (dateString?: string) => string;
  skillCategories: Array<{ value: string; label: string }>;
}

const PracticeCardItem: React.FC<PracticeCardItemProps> = ({
  card,
  onEdit,
  onDelete,
  onUse,
  difficultyLabel,
  difficultyColor,
  formatDuration,
  formatLastUsed,
  skillCategories
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getSkillCategoryLabel = (category: SkillCategory) => {
    return skillCategories.find(skill => skill.value === category)?.label || category;
  };

  const getCourtZoneLabel = (zone: CourtZone) => {
    const zoneLabels: Record<CourtZone, string> = {
      'frontcourt_left': '前衛左',
      'frontcourt_center': '前衛中央',
      'frontcourt_right': '前衛右',
      'midcourt_left': '中衛左',
      'midcourt_center': '中衛中央',
      'midcourt_right': '中衛右',
      'backcourt_left': '後衛左',
      'backcourt_center': '後衛中央',
      'backcourt_right': '後衛右',
      'net_left': 'ネット際左',
      'net_center': 'ネット際中央',
      'net_right': 'ネット際右',
      'service_box_right': '右サービスボックス',
      'service_box_left': '左サービスボックス',
      'baseline': 'ベースライン',
      'sideline_left': '左サイドライン',
      'sideline_right': '右サイドライン',
      'full_court': 'コート全体',
    };
    return zoneLabels[zone] || zone;
  };

  return (
    <div className="border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="p-4">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
                {difficultyLabel}
              </span>
              <span className="flex items-center text-sm text-gray-600">
                <FaClock className="w-3 h-3 mr-1" />
                {formatDuration(card.estimatedDuration)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={onUse}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="この練習を開始"
            >
              <FaPlay className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm('この練習カードを削除しますか？')) {
                  onDelete();
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 説明 */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.description}</p>

        {/* スキルカテゴリ */}
        {card.skillCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.skillCategories.slice(0, 3).map(category => (
              <span key={category} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {getSkillCategoryLabel(category)}
              </span>
            ))}
            {card.skillCategories.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{card.skillCategories.length - 3}
              </span>
            )}
          </div>
        )}

        {/* コート情報 */}
        {card.courtInfo && card.courtInfo.targetAreas.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-1">
              <FaMapMarkerAlt className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-gray-700">
                {card.courtInfo.courtType === 'singles' ? 'シングルス' : 'ダブルス'}
              </span>
              {card.courtInfo.focusArea && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                  メイン: {getCourtZoneLabel(card.courtInfo.focusArea)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {card.courtInfo.targetAreas.slice(0, 3).map(area => (
                <span key={area} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  {getCourtZoneLabel(area)}
                </span>
              ))}
              {card.courtInfo.targetAreas.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{card.courtInfo.targetAreas.length - 3}エリア
                </span>
              )}
            </div>
          </div>
        )}

        {/* 統計情報 */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <FiUsers className="w-3 h-3 mr-1" />
              {card.usageCount}回使用
            </span>
            {card.rating && (
              <span className="flex items-center">
                <FaStar className="w-3 h-3 mr-1 text-yellow-500" />
                {card.rating.toFixed(1)}
              </span>
            )}
          </div>
          <span>{formatLastUsed(card.lastUsed)}</span>
        </div>

        {/* 詳細表示ボタン */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showDetails ? '詳細を閉じる' : '詳細を見る'}
        </button>
      </div>

      {/* 詳細情報 */}
      {showDetails && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 space-y-3">
          {/* 練習目標 */}
          {card.objectives.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaBullseye className="w-3 h-3 mr-1" />
                練習目標
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {card.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 練習メニュー */}
          {card.drills.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">練習メニュー ({card.drills.length}個)</h4>
              <div className="space-y-2">
                {card.drills.slice(0, 3).map((drill) => (
                  <div key={drill.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{drill.name}</span>
                      <span className="text-gray-500">{drill.duration}分</span>
                    </div>
                    {drill.description && (
                      <p className="text-gray-600 text-xs mt-1">{drill.description}</p>
                    )}
                  </div>
                ))}
                {card.drills.length > 3 && (
                  <p className="text-xs text-gray-500">他 {card.drills.length - 3} 個のメニュー</p>
                )}
              </div>
            </div>
          )}

          {/* 必要な用具 */}
          {card.equipment.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaTools className="w-3 h-3 mr-1" />
                必要な用具
              </h4>
              <div className="flex flex-wrap gap-1">
                {card.equipment.map((item, itemIndex) => (
                  <span key={itemIndex} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* タグ */}
          {card.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaTag className="w-3 h-3 mr-1" />
                タグ
              </h4>
              <div className="flex flex-wrap gap-1">
                {card.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* メモ */}
          {card.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">メモ</h4>
              <p className="text-sm text-gray-600">{card.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeCardList;