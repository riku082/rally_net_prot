'use client';

import React, { useState } from 'react';
import { PracticeCard, PracticeCardFilter, PracticeDifficulty, CourtZone } from '@/types/practice';
import { FaClock, FaEdit, FaTrash, FaStar, FaTag, FaTools, FaBullseye, FaFilter, FaSearch, FaMapMarkerAlt, FaTimes, FaCheck, FaEye } from 'react-icons/fa';
import { FiTrendingUp, FiUsers } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';
import PracticeCardMiniCourt from './PracticeCardMiniCourt';

interface PracticeCardListProps {
  cards: PracticeCard[];
  onEdit: (card: PracticeCard) => void;
  onDelete: (cardId: string) => void;
  isLoading?: boolean;
}

const PracticeCardList: React.FC<PracticeCardListProps> = ({
  cards,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [filter, setFilter] = useState<PracticeCardFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PracticeCard | null>(null);
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set());

  const handleEditMode = () => {
    setEditMode(!editMode);
    setSelectedForDeletion(new Set());
  };
  
  const handleCardClick = (card: PracticeCard) => {
    if (!editMode) {
      setSelectedCard(card);
    }
  };
  
  const handleDeleteSelection = (cardId: string) => {
    const newSelected = new Set(selectedForDeletion);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedForDeletion(newSelected);
  };
  
  const handleConfirmDeletion = () => {
    if (selectedForDeletion.size === 0) return;
    
    const count = selectedForDeletion.size;
    if (confirm(`選択した${count}件の練習カードを削除しますか？`)) {
      selectedForDeletion.forEach(cardId => {
        onDelete(cardId);
      });
      setSelectedForDeletion(new Set());
      setEditMode(false);
    }
  };

  const difficultyLabels = {
    'beginner': '軽い',
    'intermediate': '普通',
    'advanced': 'きつい',
  };

  const difficultyColors = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-yellow-100 text-yellow-800',
    'advanced': 'bg-red-100 text-red-800',
  };


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

    // 時間フィルター
    if (filter.maxDuration && card.drill.duration > filter.maxDuration) {
      return false;
    }

    if (filter.minDuration && card.drill.duration < filter.minDuration) {
      return false;
    }

    return true;
  });

  // 並び替え
  const sortedCards = filteredCards.sort((a, b) => {
    // 使用回数の多い順
    if (filter.sortBy === 'usage') {
      return b.usageCount - a.usageCount;
    }
    // 時間の短い順
    if (filter.sortBy === 'duration') {
      return a.drill.duration - b.drill.duration;
    }
    // 最新更新順（デフォルト）
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return '今日使用';
    if (diffInDays === 1) return '昨日使用';
    if (diffInDays < 7) return `${diffInDays}日前に使用`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}週間前に使用`;
    return `${Math.floor(diffInDays / 30)}ヶ月前に使用`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6">
      {/* ヘッダー */}
      <div className="flex flex-col justify-between items-start mb-4 sm:mb-6 space-y-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            <GiShuttlecock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-1 sm:mr-2 text-theme-primary-600" />
            練習カード
          </h2>
          <div className="flex items-center space-x-2">
            {editMode ? (
              <>
                <button
                  onClick={handleConfirmDeletion}
                  disabled={selectedForDeletion.size === 0}
                  className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  <FaTrash className="w-3 h-3 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">削除</span> ({selectedForDeletion.size})
                </button>
                <button
                  onClick={handleEditMode}
                  className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm"
                >
                  <FaTimes className="w-3 h-3 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">キャンセル</span>
                  <span className="sm:hidden">×</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEditMode}
                className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
              >
                <FaEdit className="w-3 h-3 mr-1 sm:mr-2" />
                編集
              </button>
            )}
          </div>
        </div>
        
        <div className="w-full space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="練習カードを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
              style={{ color: '#000000' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-theme-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaFilter className="w-4 h-4 mr-2" />
            フィルター
          </button>
        </div>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">練習強度</label>
              <select
                value={filter.difficulty || ''}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value as PracticeDifficulty || undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
              >
                <option value="">すべて</option>
                <option value="beginner">軽い</option>
                <option value="intermediate">普通</option>
                <option value="advanced">きつい</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">練習時間（分）</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="最短"
                  value={filter.minDuration || ''}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    minDuration: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                  style={{ color: '#000000' }}
                />
                <input
                  type="number"
                  placeholder="最長"
                  value={filter.maxDuration || ''}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    maxDuration: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">並び順</label>
              <select
                value={filter.sortBy || 'updated'}
                onChange={(e) => setFilter(prev => ({ 
                  ...prev, 
                  sortBy: e.target.value as 'updated' | 'usage' | 'duration' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
              >
                <option value="updated">更新日順</option>
                <option value="usage">使用回数順</option>
                <option value="duration">時間順</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setFilter({})}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              フィルターをクリア
            </button>
          </div>
        </div>
      )}

      {/* 統計サマリー */}
      {sortedCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-theme-primary-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <GiShuttlecock className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary-600 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-theme-primary-600 font-medium">総カード数</p>
                <p className="text-lg sm:text-2xl font-bold text-theme-primary-800">{cards.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-green-600 font-medium">平均時間</p>
                <p className="text-lg sm:text-2xl font-bold text-green-800">
                  {Math.round(cards.reduce((sum, c) => sum + c.drill.duration, 0) / cards.length)}分
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-purple-600 font-medium">総使用回数</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-800">
                  {cards.reduce((sum, c) => sum + c.usageCount, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <FiTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-orange-600 font-medium">人気カード</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-800">
                  {Math.max(...cards.map(c => c.usageCount), 0)}回
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* カード一覧 */}
      {sortedCards.length === 0 ? (
        <div className="text-center py-12">
          <GiShuttlecock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchTerm || Object.keys(filter).length > 0 ? '条件に合うカードが見つかりません' : '練習カードがありません'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || Object.keys(filter).length > 0 ? '検索条件やフィルターを変更してみてください' : '最初の練習カードを作成してみませんか？'}
          </p>
        </div>
      ) : (
        <div>
          {/* カード数の表示 */}
          <div className="mb-4">
            <div className="text-sm text-gray-500">
              {sortedCards.length}件のカード
            </div>
          </div>
          
          {/* レスポンシブグリッドレイアウト */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedCards.map(card => (
              <div key={card.id} className="w-full">
                <PracticeCardItem
                  card={card}
                  editMode={editMode}
                  isSelected={selectedForDeletion.has(card.id)}
                  onCardClick={() => handleCardClick(card)}
                  onEdit={() => onEdit(card)}
                  onDelete={() => onDelete(card.id)}
                  onDeleteSelection={() => handleDeleteSelection(card.id)}
                  difficultyLabel={difficultyLabels[card.difficulty]}
                  difficultyColor={difficultyColors[card.difficulty]}
                  formatDuration={formatDuration}
                  formatLastUsed={formatLastUsed}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 詳細モーダル */}
      {selectedCard && (
        <div className="fixed inset-0 bg-gray-100/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-auto max-w-fit max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">練習カード詳細</h3>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg p-2 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto min-w-[350px] max-w-[900px]">
              {/* カード基本情報 */}
              <div className="mb-4">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{selectedCard.title}</h4>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[selectedCard.difficulty]}`}>
                    {difficultyLabels[selectedCard.difficulty]}
                  </span>
                  <span className="flex items-center text-xs sm:text-sm text-gray-600">
                    <FaClock className="w-3 h-3 mr-1" />
                    {formatDuration(selectedCard.drill.duration)}
                  </span>
                  {selectedCard.rating && (
                    <span className="flex items-center text-xs sm:text-sm text-yellow-600">
                      <FaStar className="w-3 h-3 mr-1" />
                      {selectedCard.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">{selectedCard.description}</p>
              </div>

              {/* ビジュアル情報 */}
              {selectedCard.visualInfo && ((selectedCard.visualInfo.shotTrajectories && selectedCard.visualInfo.shotTrajectories.length > 0) || (selectedCard.visualInfo.playerPositions && selectedCard.visualInfo.playerPositions.length > 0)) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3">練習パターン</h5>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* コートシート */}
                    <div className="flex-shrink-0">
                      <div className="flex justify-center bg-white rounded-lg p-2">
                        <PracticeCardMiniCourt
                          shotTrajectories={selectedCard.visualInfo.shotTrajectories || []}
                          playerPositions={selectedCard.visualInfo.playerPositions || []}
                          width={220}
                          height={385}
                        />
                      </div>
                    </div>
                    
                    {/* ショット詳細 */}
                    {selectedCard.visualInfo.shotTrajectories && selectedCard.visualInfo.shotTrajectories.length > 0 && (
                      <div className="flex-1 min-w-[250px]">
                        <h6 className="text-xs font-semibold text-gray-700 mb-2">ショット詳細</h6>
                        <div className="space-y-1 max-h-[350px] overflow-y-auto bg-white rounded-lg p-2">
                        {selectedCard.visualInfo.shotTrajectories.map((shot, index) => {
                          // ショットタイプの定義（色情報付き）
                          const SHOT_TYPES = [
                            { id: 'clear', name: 'クリア', color: '#3B82F6' },
                            { id: 'smash', name: 'スマッシュ', color: '#EF4444' },
                            { id: 'drop', name: 'ドロップ', color: '#10B981' },
                            { id: 'hairpin', name: 'ヘアピン', color: '#8B5CF6' },
                            { id: 'drive', name: 'ドライブ', color: '#F59E0B' },
                            { id: 'push', name: 'プッシュ', color: '#EC4899' },
                            { id: 'lob', name: 'ロブ', color: '#14B8A6' },
                            { id: 'receive', name: 'レシーブ', color: '#06B6D4' },
                            { id: 'other', name: 'その他', color: '#6B7280' }
                          ];
                          
                          const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
                          const bgColor = shot.shotBy === 'knocker' ? 'bg-gray-50' : 'bg-green-50';
                          const borderColor = shot.shotBy === 'knocker' ? 'border-gray-200' : 'border-green-200';
                          
                          return (
                            <div key={shot.id} className={`px-2 py-1 rounded border ${bgColor} ${borderColor}`}>
                              <div className="flex items-center gap-2">
                                <span 
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                  style={{ 
                                    backgroundColor: shot.shotBy === 'knocker' ? '#000000' : (shotType?.color || '#10B981')
                                  }}
                                >
                                  {shot.order || index + 1}
                                </span>
                                <span className="text-xs flex-shrink-0">
                                  {shot.shotBy === 'knocker' ? 'ノック' : 'プレイヤー'}
                                </span>
                                {shotType && (
                                  <span 
                                    className="text-xs px-1.5 py-0.5 rounded text-white flex-shrink-0"
                                    style={{ backgroundColor: shotType.color }}
                                  >
                                    {shotType.name}
                                  </span>
                                )}
                              </div>
                              {shot.memo && (
                                <div className="text-[10px] text-gray-600 mt-1 pl-7">{shot.memo}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}

              {/* コート情報 */}
              {selectedCard.courtInfo && selectedCard.courtInfo.targetAreas && selectedCard.courtInfo.targetAreas.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">ターゲットエリア</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-600">
                      {selectedCard.courtInfo.courtType === 'singles' ? 'シングルス' : 'ダブルス'}コート
                    </span>
                    {selectedCard.courtInfo.focusArea && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium border border-yellow-200">
                        🎯 メインエリア
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedCard.courtInfo.targetAreas.map((area, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs border border-blue-200">
                        {area}
                      </span>
                    ))}
                  </div>
                  {selectedCard.courtInfo.notes && (
                    <p className="mt-2 text-xs text-gray-600">{selectedCard.courtInfo.notes}</p>
                  )}
                </div>
              )}

              {/* タグと装備 */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {selectedCard.tags && selectedCard.tags.length > 0 && (
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">タグ</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedCard.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedCard.equipment && selectedCard.equipment.length > 0 && (
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">必要な装備</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedCard.equipment.map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ドリル情報 */}
              {selectedCard.drill && (
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">ドリル詳細</h5>
                  <div className="space-y-1 text-xs sm:text-sm text-blue-800">
                    <p><span className="font-medium">名前:</span> {selectedCard.drill.name}</p>
                    {selectedCard.drill.sets && (
                      <p><span className="font-medium">セット数:</span> {selectedCard.drill.sets}セット</p>
                    )}
                    {selectedCard.drill.reps && (
                      <p><span className="font-medium">回数:</span> {selectedCard.drill.reps}回</p>
                    )}
                    {selectedCard.drill.description && (
                      <p className="mt-2">{selectedCard.drill.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* 統計情報 */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">使用統計</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <p className="text-xs text-gray-500">使用回数</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedCard.usageCount}回</p>
                  </div>
                  {selectedCard.lastUsed && (
                    <div>
                      <p className="text-xs text-gray-500">最終使用</p>
                      <p className="text-sm font-medium text-gray-900">{formatLastUsed(selectedCard.lastUsed)}</p>
                    </div>
                  )}
                  {selectedCard.rating && (
                    <div>
                      <p className="text-xs text-gray-500">評価</p>
                      <div className="flex items-center">
                        <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-lg font-semibold text-gray-900">{selectedCard.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PracticeCardItemProps {
  card: PracticeCard;
  editMode: boolean;
  isSelected: boolean;
  onCardClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeleteSelection: () => void;
  difficultyLabel: string;
  difficultyColor: string;
  formatDuration: (minutes: number) => string;
  formatLastUsed: (dateString?: string) => string;
}

const PracticeCardItem: React.FC<PracticeCardItemProps> = ({
  card,
  editMode,
  isSelected,
  onCardClick,
  onEdit,
  onDelete,
  onDeleteSelection,
  difficultyLabel,
  difficultyColor,
  formatDuration,
  formatLastUsed
}) => {

  const getCourtZoneLabel = (zone: CourtZone) => {
    const zoneLabels: Record<CourtZone, string> = {
      // 相手側コート
      'frontcourt_left': '前衛左',
      'frontcourt_center': '前衛中央',
      'frontcourt_right': '前衛右',
      'midcourt_left': '中衛左',
      'midcourt_center': '中衛中央',
      'midcourt_right': '中衛右',
      'backcourt_left': '後衛左',
      'backcourt_center': '後衛中央',
      'backcourt_right': '後衛右',
      'service_box_left': '左サービスボックス',
      'service_box_right': '右サービスボックス',
      
      // 自分側コート
      'frontcourt_left_own': '前衛左（自分側）',
      'frontcourt_center_own': '前衛中央（自分側）',
      'frontcourt_right_own': '前衛右（自分側）',
      'midcourt_left_own': '中衛左（自分側）',
      'midcourt_center_own': '中衛中央（自分側）',
      'midcourt_right_own': '中衛右（自分側）',
      'backcourt_left_own': '後衛左（自分側）',
      'backcourt_center_own': '後衛中央（自分側）',
      'backcourt_right_own': '後衛右（自分側）',
      'service_box_left_own': '左サービスボックス（自分側）',
      'service_box_right_own': '右サービスボックス（自分側）',
      
      // 廃止されたエリア（後方互換性）
      'net_left': 'ネット際左',
      'net_center': 'ネット際中央',
      'net_right': 'ネット際右',
      'baseline': 'ベースライン',
      'sideline_left': '左サイドライン',
      'sideline_right': '右サイドライン',
      
      // 全体
      'full_court': 'コート全体',
    };
    return zoneLabels[zone] || zone;
  };

  const getCourtZoneColor = (zone: CourtZone) => {
    // 相手側コート（攻撃対象）
    if (zone.includes('frontcourt') && !zone.includes('own')) {
      return 'bg-red-100 text-red-800 border-red-200'; // 前衛（攻撃エリア）
    }
    if (zone.includes('midcourt') && !zone.includes('own')) {
      return 'bg-orange-100 text-orange-800 border-orange-200'; // 中衛
    }
    if (zone.includes('backcourt') && !zone.includes('own')) {
      return 'bg-purple-100 text-purple-800 border-purple-200'; // 後衛
    }
    if (zone.includes('service_box') && !zone.includes('own')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // サービスボックス
    }
    
    // 自分側コート（守備エリア）
    if (zone.includes('own')) {
      return 'bg-theme-primary-100 text-theme-primary-800 border-theme-primary-200'; // 自分側エリア
    }
    
    // 特殊エリア
    if (zone.includes('net')) {
      return 'bg-green-100 text-green-800 border-green-200'; // ネット際
    }
    
    if (zone === 'full_court') {
      return 'bg-gray-100 text-gray-800 border-gray-200'; // コート全体
    }
    
    // その他
    return 'bg-teal-100 text-teal-800 border-teal-200'; // デフォルト
  };

  return (
    <div 
      className={`border rounded-xl transition-all duration-200 overflow-hidden cursor-pointer h-full flex flex-col ${
        editMode 
          ? isSelected 
            ? 'border-red-300 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
          : 'border-gray-200 hover:shadow-lg'
      }`}
      onClick={editMode ? onDeleteSelection : onCardClick}
    >
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            {editMode && (
              <div className="flex items-center pt-1 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{card.title}</h3>
              <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
                  {difficultyLabel}
                </span>
                <span className="flex items-center text-xs sm:text-sm text-gray-600">
                  <FaClock className="w-3 h-3 mr-1" />
                  {formatDuration(card.drill.duration)}
                </span>
              </div>
            </div>
          </div>
          
          {!editMode && (
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 sm:p-1.5 text-theme-primary-600 hover:bg-theme-primary-50 rounded-lg transition-colors"
              >
                <FaEdit className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* 説明 */}
        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{card.description}</p>

        {/* ビジュアル情報（ミニコート） */}
        {card.visualInfo && (
          <div className="mb-2 flex justify-center flex-1">
            <PracticeCardMiniCourt
              shotTrajectories={card.visualInfo.shotTrajectories}
              playerPositions={card.visualInfo.playerPositions}
              width={80}
              height={140}
            />
          </div>
        )}

        {/* コート情報 */}
        {card.courtInfo && card.courtInfo.targetAreas.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center space-x-1 mb-1">
              <FaMapMarkerAlt className="w-3 h-3 text-green-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700">
                {card.courtInfo.courtType === 'singles' ? 'シングルス' : 'ダブルス'}
              </span>
              {card.courtInfo.focusArea && (
                <span className={`px-1 py-0.5 rounded text-xs font-medium border ${getCourtZoneColor(card.courtInfo.focusArea)} truncate`}>
                  🎯 {getCourtZoneLabel(card.courtInfo.focusArea)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {card.courtInfo.targetAreas.slice(0, 2).map(area => (
                <span key={area} className={`px-1 py-0.5 rounded text-xs border ${getCourtZoneColor(area)} truncate`}>
                  {getCourtZoneLabel(area)}
                </span>
              ))}
              {card.courtInfo.targetAreas.length > 2 && (
                <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
                  +{card.courtInfo.targetAreas.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 統計情報 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <FiUsers className="w-3 h-3 mr-0.5" />
              {card.usageCount}回
            </span>
            {card.rating && (
              <span className="flex items-center">
                <FaStar className="w-3 h-3 mr-0.5 text-yellow-500" />
                {card.rating.toFixed(1)}
              </span>
            )}
          </div>
          <span className="text-xs">{formatLastUsed(card.lastUsed)}</span>
        </div>

      </div>
    </div>
  );
};

export default PracticeCardList;