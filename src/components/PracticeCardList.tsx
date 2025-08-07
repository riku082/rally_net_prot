'use client';

import React, { useState, useMemo } from 'react';
import { PracticeCard } from '@/types/practice';
import { FaClock, FaEdit, FaTrash, FaLock, FaGlobe, FaStar, FaSearch, FaFilter, FaLayerGroup, FaEye } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';
import PracticeCardViewer from './PracticeCardViewer';

interface PracticeCardListProps {
  cards: PracticeCard[];
  onEdit: (card: PracticeCard) => void;
  onDelete: (cardId: string) => void;
  isLoading?: boolean;
}

// カードアイテムコンポーネント
const PracticeCardItem: React.FC<{
  card: PracticeCard;
  onEdit: (card: PracticeCard) => void;
  onDelete: (cardId: string) => void;
  onViewDetail: (card: PracticeCard) => void;
}> = ({ card, onEdit, onDelete, onViewDetail }) => {
  const difficultyConfig = {
    beginner: { label: '軽い', color: 'bg-green-100 text-green-800', bgOpacity: 'bg-green-50' },
    intermediate: { label: '普通', color: 'bg-yellow-100 text-yellow-800', bgOpacity: 'bg-yellow-50' },
    advanced: { label: 'きつい', color: 'bg-red-100 text-red-800', bgOpacity: 'bg-red-50' }
  };

  const config = difficultyConfig[card.difficulty];

  const handleDelete = async () => {
    if (window.confirm(`「${card.title}」を削除しますか？`)) {
      onDelete(card.id);
    }
  };

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${config.bgOpacity} overflow-hidden group border border-gray-100`}>
      {/* ビジュアルプレビューセクション */}
      {card.visualInfo && card.visualInfo.playerPositions && card.visualInfo.playerPositions.length > 0 && (
        <div className="bg-gradient-to-b from-green-50 to-green-100 p-4 border-b border-green-200">
          <svg viewBox="0 0 305 670" className="w-full h-48">
            {/* コート背景 */}
            <rect x="0" y="0" width="305" height="670" fill="#4CAF50" />
            
            {/* バドミントンコートの正確なライン（簡略版） */}
            {/* 外枠 */}
            <rect x="0" y="0" width="305" height="670" fill="none" stroke="white" strokeWidth="2" />
            
            {/* ネット */}
            <line x1="0" y1="335" x2="305" y2="335" stroke="white" strokeWidth="3" />
            
            {/* ショートサービスライン */}
            <line x1="0" y1="236" x2="305" y2="236" stroke="white" strokeWidth="1.5" />
            <line x1="0" y1="434" x2="305" y2="434" stroke="white" strokeWidth="1.5" />
            
            {/* ロングサービスライン（ダブルス） */}
            <line x1="0" y1="137" x2="305" y2="137" stroke="white" strokeWidth="1.5" />
            <line x1="0" y1="533" x2="305" y2="533" stroke="white" strokeWidth="1.5" />
            
            {/* センターライン */}
            <line x1="152.5" y1="236" x2="152.5" y2="434" stroke="white" strokeWidth="1.5" />
            
            {/* シングルスサイドライン */}
            <line x1="21" y1="0" x2="21" y2="670" stroke="white" strokeWidth="1.5" />
            <line x1="284" y1="0" x2="284" y2="670" stroke="white" strokeWidth="1.5" />
            
            {/* ネット */}
            <line x1="0" y1="201" x2="183" y2="201" stroke="white" strokeWidth="3" />
            <circle cx="0" cy="201" r="3" fill="white" />
            <circle cx="183" cy="201" r="3" fill="white" />
            
            {/* エリアラベル */}
            <text x="10" y="18" fill="white" fontSize="8" fontWeight="bold" opacity="0.7">相手コート</text>
            <text x="10" y="394" fill="white" fontSize="8" fontWeight="bold" opacity="0.7">自分コート</text>
            
            {/* プレイヤー位置 */}
            {card.visualInfo.playerPositions.map((player) => (
              <g key={player.id}>
                <circle 
                  cx={player.x * 183 / 400} 
                  cy={player.y * 402 / 600} 
                  r="8" 
                  fill={player.role === 'knocker' ? '#3B82F6' : '#10B981'} 
                  stroke="white" 
                  strokeWidth="1"
                />
                <text 
                  x={player.x * 183 / 400} 
                  y={player.y * 402 / 600 + 3} 
                  textAnchor="middle" 
                  fill="white" 
                  fontSize="6" 
                  fontWeight="bold"
                >
                  {player.label}
                </text>
              </g>
            ))}
            
            {/* シャトル軌道 */}
            {card.visualInfo.shotTrajectories?.map((shot) => {
              const sourcePlayer = card.visualInfo?.playerPositions?.find(p => 
                Math.abs(p.x - shot.from.x) < 20 && Math.abs(p.y - shot.from.y) < 20
              );
              
              let shotColor = '#666666';
              if (card.practiceType === 'knock_practice' && sourcePlayer) {
                shotColor = sourcePlayer.role === 'knocker' ? '#3B82F6' : '#10B981';
              } else if (card.practiceType === 'pattern_practice') {
                const isFromOpponentCourt = shot.from.y < 201;
                shotColor = isFromOpponentCourt ? '#EF4444' : '#10B981';
              }
              
              // ショットタイプのラベル位置（軌道の中点）
              const midX = ((shot.from.x + shot.to.x) / 2) * 183 / 400;
              const midY = ((shot.from.y + shot.to.y) / 2) * 402 / 600;
              
              return (
                <g key={shot.id}>
                  <line 
                    x1={shot.from.x * 183 / 400} 
                    y1={shot.from.y * 402 / 600} 
                    x2={shot.to.x * 183 / 400} 
                    y2={shot.to.y * 402 / 600} 
                    stroke={shotColor} 
                    strokeWidth="2" 
                    strokeDasharray="3,3"
                    opacity="0.8"
                  />
                  <circle cx={shot.to.x * 183 / 400} cy={shot.to.y * 402 / 600} r="4" fill={shotColor} opacity="0.6"/>
                  {shot.shotType && (
                    <text
                      x={midX}
                      y={midY}
                      textAnchor="middle"
                      fill={shotColor}
                      fontSize="6"
                      fontWeight="bold"
                      style={{
                        filter: 'drop-shadow(0 0 2px white) drop-shadow(0 0 2px white)'
                      }}
                    >
                      {shot.shotType.split(',').join('/')}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      <div className="p-6">
        {/* カード情報 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-theme-primary-600 transition-colors">
              {card.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">{card.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} ml-3`}>
            {config.label}
          </span>
        </div>

        {/* メタ情報 */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaClock className="w-4 h-4 mr-1" />
              {card.drill.duration}分
            </div>
            {card.usageCount > 0 && (
              <div className="flex items-center">
                <FaLayerGroup className="w-4 h-4 mr-1" />
                {card.usageCount}回使用
              </div>
            )}
            {card.rating && (
              <div className="flex items-center">
                <FaStar className="w-4 h-4 mr-1 text-yellow-500" />
                {card.rating.toFixed(1)}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {card.isPublic ? (
              <FaGlobe className="w-4 h-4 text-green-500" title="公開" />
            ) : (
              <FaLock className="w-4 h-4 text-gray-400" title="非公開" />
            )}
          </div>
        </div>

        {/* タグ */}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {card.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewDetail(card)}
            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FaEye className="w-4 h-4 mr-1" />
            詳細
          </button>
          <button
            onClick={() => onEdit(card)}
            className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaEdit className="w-4 h-4 mr-1" />
            編集
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FaTrash className="w-4 h-4 mr-1" />
            削除
          </button>
        </div>
      </div>
    </div>
  );
};

// 詳細モーダルコンポーネント
const PracticeCardDetailModal: React.FC<{
  card: PracticeCard;
  onClose: () => void;
}> = ({ card, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{card.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{card.description}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 flex flex-col" style={{ height: 'calc(100% - 100px)' }}>
            {/* PracticeCardViewerを使用して詳細を表示 */}
            <div className="flex-1 min-h-0">
              <PracticeCardViewer card={card} className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// メインコンポーネント
const PracticeCardList: React.FC<PracticeCardListProps> = ({ 
  cards, 
  onEdit, 
  onDelete, 
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [selectedCard, setSelectedCard] = useState<PracticeCard | null>(null);

  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards.filter(card => {
      const matchesSearch = searchTerm === '' || 
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDifficulty = filterDifficulty === 'all' || card.difficulty === filterDifficulty;
      
      return matchesSearch && matchesDifficulty;
    });

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return b.updatedAt - a.updatedAt;
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'duration':
          return a.drill.duration - b.drill.duration;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cards, searchTerm, filterDifficulty, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 検索・フィルター */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="練習カードを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべての難易度</option>
              <option value="beginner">軽い</option>
              <option value="intermediate">普通</option>
              <option value="advanced">きつい</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updated">更新日順</option>
              <option value="usage">使用回数順</option>
              <option value="duration">練習時間順</option>
              <option value="rating">評価順</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{filteredAndSortedCards.length}件の練習カード</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-800"
            >
              検索をクリア
            </button>
          )}
        </div>
      </div>

      {/* カードグリッド */}
      {filteredAndSortedCards.length === 0 ? (
        <div className="text-center py-12">
          <FaLayerGroup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || filterDifficulty !== 'all' 
              ? '条件に一致する練習カードが見つかりません' 
              : '練習カードがまだありません'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCards.map((card) => (
            <PracticeCardItem
              key={card.id}
              card={card}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetail={setSelectedCard}
            />
          ))}
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedCard && (
        <PracticeCardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};

export default PracticeCardList;