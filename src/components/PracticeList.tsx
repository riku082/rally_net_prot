'use client';

import React, { useState } from 'react';
import { Practice, PracticeType } from '@/types/practice';
import { FaClock, FaCalendarAlt, FaEdit, FaTrash, FaStar, FaFilter, FaLayerGroup, FaCheckCircle } from 'react-icons/fa';
import { FiTrendingUp, FiTarget } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';

interface PracticeListProps {
  practices: Practice[];
  onEdit: (practice: Practice) => void;
  onDelete: (practiceId: string) => void;
  isLoading?: boolean;
}

const PracticeList: React.FC<PracticeListProps> = ({
  practices,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [filter, setFilter] = useState<{
    type?: PracticeType;
    dateRange?: 'week' | 'month' | 'all';
  }>({
    dateRange: 'all'
  });

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


  const filteredPractices = practices.filter(practice => {
    if (filter.type && practice.type !== filter.type) return false;
    
    if (filter.dateRange && filter.dateRange !== 'all') {
      const practiceDate = new Date(practice.date);
      const now = new Date();
      const daysAgo = filter.dateRange === 'week' ? 7 : 30;
      const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      if (practiceDate < cutoff) return false;
    }
    
    return true;
  });

  const sortedPractices = filteredPractices.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const calculateAverageRating = (practice: Practice) => {
    if (practice.skills.length === 0) return 0;
    const total = practice.skills.reduce((sum, skill) => sum + skill.rating, 0);
    return total / practice.skills.length;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      {/* ヘッダーとフィルター */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <GiShuttlecock className="w-6 h-6 mr-2 text-blue-600" />
          練習記録
        </h2>
        
        <div className="flex items-center space-x-3">
          <FaFilter className="w-4 h-4 text-gray-400" />
          <select
            value={filter.dateRange || 'all'}
            onChange={(e) => setFilter(prev => ({ 
              ...prev, 
              dateRange: e.target.value as 'week' | 'month' | 'all' 
            }))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全期間</option>
            <option value="week">1週間</option>
            <option value="month">1ヶ月</option>
          </select>
          
          <select
            value={filter.type || ''}
            onChange={(e) => setFilter(prev => ({ 
              ...prev, 
              type: e.target.value as PracticeType || undefined 
            }))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全タイプ</option>
            {Object.entries(practiceTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 統計サマリー */}
      {sortedPractices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaCalendarAlt className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600 font-medium">総練習回数</p>
                <p className="text-2xl font-bold text-blue-800">{sortedPractices.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <FaClock className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600 font-medium">総練習時間</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatDuration(sortedPractices.reduce((sum, p) => sum + p.duration, 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <FiTarget className="w-5 h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm text-purple-600 font-medium">平均時間</p>
                <p className="text-2xl font-bold text-purple-800">
                  {formatDuration(Math.round(sortedPractices.reduce((sum, p) => sum + p.duration, 0) / sortedPractices.length))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <FiTrendingUp className="w-5 h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm text-orange-600 font-medium">平均評価</p>
                <p className="text-2xl font-bold text-orange-800">
                  {(sortedPractices.reduce((sum, p) => sum + calculateAverageRating(p), 0) / sortedPractices.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 練習リスト */}
      {sortedPractices.length === 0 ? (
        <div className="text-center py-12">
          <GiShuttlecock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">練習記録がありません</h3>
          <p className="text-gray-500">最初の練習記録を追加してみましょう</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPractices.map(practice => (
            <PracticeCard
              key={practice.id}
              practice={practice}
              onEdit={() => onEdit(practice)}
              onDelete={() => onDelete(practice.id)}
              typeLabel={practiceTypeLabels[practice.type]}
              formatDate={formatDate}
              formatDuration={formatDuration}
              calculateAverageRating={calculateAverageRating}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface PracticeCardProps {
  practice: Practice;
  onEdit: () => void;
  onDelete: () => void;
  typeLabel: string;
  formatDate: (date: string) => string;
  formatDuration: (minutes: number) => string;
  calculateAverageRating: (practice: Practice) => number;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
  practice,
  onEdit,
  onDelete,
  typeLabel,
  formatDate,
  formatDuration,
  calculateAverageRating
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <span className="truncate">{practice.title}</span>
                {practice.routine && (
                  <FaLayerGroup className="w-4 h-4 ml-2 text-purple-600 flex-shrink-0" title="ルーティン練習" />
                )}
              </h3>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {typeLabel}
                </span>
                {practice.routine && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    ルーティン
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
              <span className="flex items-center">
                <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {formatDate(practice.date)}
              </span>
              <span className="flex items-center">
                <FaClock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="truncate">{practice.startTime} - {practice.endTime} ({formatDuration(practice.duration)})</span>
              </span>
              {practice.skills.length > 0 && (
                <span className="flex items-center">
                  <FaStar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
                  {calculateAverageRating(practice).toFixed(1)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('この練習記録を削除しますか？')) {
                  onDelete();
                }
              }}
              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 bg-gray-50">
          {practice.description && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">練習内容</h4>
              <p className="text-sm text-gray-600">{practice.description}</p>
            </div>
          )}

          {practice.routine && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaLayerGroup className="w-3 h-3 mr-1" />
                練習ルーティン ({practice.routine.completedCards}/{practice.routine.cards.length}種目完了)
              </h4>
              <div className="space-y-2">
                {practice.routine.cards.map((card, index) => (
                  <div key={`${card.cardId}-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-xs sm:text-sm bg-white rounded p-2">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                        {card.order}
                      </span>
                      <span className="text-gray-700 truncate">{card.cardTitle}</span>
                      {card.completed && (
                        <FaCheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 flex-shrink-0">
                      <span>{card.actualDuration || card.plannedDuration}分</span>
                      {card.rating && (
                        <div className="flex items-center">
                          <FaStar className="w-3 h-3 text-yellow-500 mr-1" />
                          <span>{card.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500 flex flex-col sm:flex-row sm:justify-between space-y-1 sm:space-y-0">
                <span>計画時間: {practice.routine.totalPlannedDuration}分</span>
                <span>実際時間: {practice.routine.totalActualDuration}分</span>
              </div>
            </div>
          )}
          
          {practice.skills.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">スキル評価</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {practice.skills.map(skill => (
                  <div key={skill.id} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 truncate mr-2">{skill.name}</span>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < skill.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {practice.notes && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">メモ・反省点</h4>
              <p className="text-sm text-gray-600">{practice.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeList;