'use client';

import React from 'react';
import { PracticeCard } from '@/types/practice';
import { FaClock, FaTags, FaBullseye, FaStar, FaLayerGroup } from 'react-icons/fa';
import { MdSportsBaseball } from 'react-icons/md';

interface PracticeCardViewerProps {
  card: PracticeCard;
  className?: string;
}

const PracticeCardViewer: React.FC<PracticeCardViewerProps> = ({ card, className = '' }) => {
  const difficultyConfig = {
    beginner: { label: '軽い', color: 'bg-green-100 text-green-800 border-green-200' },
    intermediate: { label: '普通', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    advanced: { label: 'きつい', color: 'bg-red-100 text-red-800 border-red-200' }
  };

  const practiceTypeConfig = {
    knock_practice: { label: 'ノック練習', icon: <MdSportsBaseball className="w-5 h-5" /> },
    pattern_practice: { label: 'パターン練習', icon: <FaBullseye className="w-5 h-5" /> },
    footwork_practice: { label: 'フットワーク練習', icon: <FaLayerGroup className="w-5 h-5" /> }
  };

  const config = difficultyConfig[card.difficulty];
  const practiceType = card.practiceType && practiceTypeConfig[card.practiceType];

  return (
    <div className={`bg-white rounded-lg ${className}`}>
      {/* ヘッダー情報 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.title}</h3>
            <p className="text-gray-600">{card.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
              {config.label}
            </span>
            {practiceType && (
              <div className="flex items-center text-sm text-gray-600">
                {practiceType.icon}
                <span className="ml-1">{practiceType.label}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
      </div>

      {/* ビジュアル情報 */}
      {card.visualInfo && (card.visualInfo.playerPositions?.length > 0 || card.visualInfo.shotTrajectories?.length > 0) && (
        <div className="p-6 bg-gradient-to-b from-green-50 to-green-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">コート図</h4>
          <div className="bg-white rounded-lg p-4 shadow-inner">
            <svg viewBox="0 0 305 670" className="w-full h-auto max-h-96">
              {/* コート背景 */}
              <rect x="0" y="0" width="305" height="670" fill="#00897B" />
              
              {/* バドミントンコートの正確なライン */}
              {/* 外枠（ダブルスコート） */}
              <rect x="0" y="0" width="305" height="670" fill="none" stroke="white" strokeWidth="3" />
              
              {/* ネット */}
              <line x1="0" y1="335" x2="305" y2="335" stroke="white" strokeWidth="4" />
              
              {/* ショートサービスライン（前サービスライン） */}
              <line x1="0" y1="236" x2="305" y2="236" stroke="white" strokeWidth="2" />
              <line x1="0" y1="434" x2="305" y2="434" stroke="white" strokeWidth="2" />
              
              {/* ロングサービスライン（ダブルス） */}
              <line x1="0" y1="137" x2="305" y2="137" stroke="white" strokeWidth="2" />
              <line x1="0" y1="533" x2="305" y2="533" stroke="white" strokeWidth="2" />
              
              {/* バックバウンダリーライン（シングルス） */}
              <line x1="0" y1="38" x2="305" y2="38" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
              <line x1="0" y1="632" x2="305" y2="632" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
              
              {/* センターライン（サービスコートのみ） */}
              <line x1="152.5" y1="236" x2="152.5" y2="335" stroke="white" strokeWidth="2" />
              <line x1="152.5" y1="335" x2="152.5" y2="434" stroke="white" strokeWidth="2" />
              
              {/* サイドライン（シングルス） */}
              <line x1="21" y1="0" x2="21" y2="670" stroke="white" strokeWidth="2" />
              <line x1="284" y1="0" x2="284" y2="670" stroke="white" strokeWidth="2" />
              
              {/* プレイヤー位置 */}
              {card.visualInfo.playerPositions?.map((player) => (
                <g key={player.id}>
                  <circle 
                    cx={player.x} 
                    cy={player.y} 
                    r="15" 
                    fill={player.color || '#10B981'} 
                    stroke="white" 
                    strokeWidth="2"
                  />
                  <text 
                    x={player.x} 
                    y={player.y + 5} 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="12" 
                    fontWeight="bold"
                  >
                    {player.label}
                  </text>
                </g>
              ))}
              
              {/* ショット軌道 */}
              {card.visualInfo.shotTrajectories?.map((shot) => (
                <g key={shot.id}>
                  <defs>
                    <marker
                      id={`arrow-${shot.id}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,6 L9,3 z" fill="#FF5722" />
                    </marker>
                  </defs>
                  <line 
                    x1={shot.from.x} 
                    y1={shot.from.y} 
                    x2={shot.to.x} 
                    y2={shot.to.y} 
                    stroke="#FF5722" 
                    strokeWidth="3" 
                    strokeDasharray="5,5"
                    markerEnd={`url(#arrow-${shot.id})`}
                  />
                  <circle cx={shot.from.x} cy={shot.from.y} r="8" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                  {shot.shotType && (
                    <text
                      x={(shot.from.x + shot.to.x) / 2}
                      y={(shot.from.y + shot.to.y) / 2 - 10}
                      fill="#D84315"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {shot.shotType}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* 練習詳細 */}
      <div className="p-6 space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">練習内容</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">{card.drill.description}</p>
            {card.drill.sets && card.drill.reps && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">{card.drill.sets}セット × {card.drill.reps}回</span>
              </div>
            )}
          </div>
        </div>

        {/* コート情報 */}
        {card.courtInfo && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">練習エリア</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                {card.courtInfo.courtType === 'singles' ? 'シングルス' : 'ダブルス'}コート
              </p>
              {card.courtInfo.notes && (
                <p className="text-sm text-gray-600">{card.courtInfo.notes}</p>
              )}
            </div>
          </div>
        )}

        {/* タグ */}
        {card.tags.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
              <FaTags className="w-4 h-4 mr-2" />
              タグ
            </h4>
            <div className="flex flex-wrap gap-2">
              {card.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 備考 */}
        {card.notes && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">備考</h4>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{card.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeCardViewer;