'use client';

import React from 'react';
import { PracticeCard } from '@/types/practice';
import { FaClock, FaTags, FaBullseye, FaStar, FaLayerGroup, FaTools } from 'react-icons/fa';
import { MdSportsBaseball, MdPerson } from 'react-icons/md';
import { GiShuttlecock } from 'react-icons/gi';

interface PracticeCardViewerProps {
  card: PracticeCard;
  className?: string;
}

// ショットタイプ定義（エディターと同じ）
const SHOT_TYPES = [
  { id: 'clear', name: 'クリア', color: '#3B82F6' },
  { id: 'smash', name: 'スマッシュ', color: '#EF4444' },
  { id: 'drop', name: 'ドロップ', color: '#10B981' },
  { id: 'hairpin', name: 'ヘアピン', color: '#8B5CF6' },
  { id: 'drive', name: 'ドライブ', color: '#F59E0B' },
  { id: 'push', name: 'プッシュ', color: '#EC4899' },
  { id: 'receive', name: 'レシーブ', color: '#06B6D4' },
  { id: 'other', name: 'その他', color: '#6B7280' },
];

// コートエリアの9分割定義
const COURT_AREAS = [
  { id: 'fl', name: '前左' },
  { id: 'fc', name: '前中' },
  { id: 'fr', name: '前右' },
  { id: 'ml', name: '中左' },
  { id: 'mc', name: '中央' },
  { id: 'mr', name: '中右' },
  { id: 'bl', name: '後左' },
  { id: 'bc', name: '後中' },
  { id: 'br', name: '後右' },
];

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

  // ショット情報を順番でソート
  const sortedShots = card.visualInfo?.shotTrajectories?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  return (
    <div className={`bg-white rounded-lg ${className} flex flex-col lg:flex-row gap-6`}>
      {/* 左側：コート図 */}
      <div className="lg:w-2/5">
        {card.visualInfo && (card.visualInfo.playerPositions?.length > 0 || card.visualInfo.shotTrajectories?.length > 0) && (
          <div className="p-6 bg-gradient-to-b from-green-50 to-green-100 rounded-lg h-full">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">練習配置</h4>
            <div className="bg-white rounded-lg p-4 shadow-inner">
              <svg viewBox="0 0 244 536" className="w-full h-auto">
                {/* コート背景 */}
                <rect x="0" y="0" width="244" height="536" fill="#00897B" />
                
                {/* コートライン */}
                <rect x="0" y="0" width="244" height="536" fill="none" stroke="white" strokeWidth="2" />
                
                {/* ネット */}
                <line x1="0" y1="268" x2="244" y2="268" stroke="#424242" strokeWidth="3" />
                
                {/* サービスライン */}
                <line x1="0" y1="189" x2="244" y2="189" stroke="white" strokeWidth="1.5" />
                <line x1="0" y1="347" x2="244" y2="347" stroke="white" strokeWidth="1.5" />
                
                {/* バックバウンダリーライン */}
                <line x1="0" y1="30" x2="244" y2="30" stroke="white" strokeWidth="1.5" />
                <line x1="0" y1="506" x2="244" y2="506" stroke="white" strokeWidth="1.5" />
                
                {/* センターライン */}
                <line x1="122" y1="0" x2="122" y2="536" stroke="white" strokeWidth="1.5" />
                
                {/* サイドライン */}
                <line x1="17" y1="0" x2="17" y2="536" stroke="white" strokeWidth="1.5" strokeDasharray="5,5" />
                <line x1="227" y1="0" x2="227" y2="536" stroke="white" strokeWidth="1.5" strokeDasharray="5,5" />
                
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
                    {player.role === 'knocker' ? (
                      <MdSportsBaseball x={player.x - 10} y={player.y - 10} className="w-5 h-5" fill="white" />
                    ) : (
                      <MdPerson x={player.x - 10} y={player.y - 10} className="w-5 h-5" fill="white" />
                    )}
                    <text 
                      x={player.x} 
                      y={player.y + 25} 
                      textAnchor="middle" 
                      fill="black" 
                      fontSize="10" 
                      fontWeight="bold"
                    >
                      {player.label}
                    </text>
                  </g>
                ))}
                
                {/* ショット軌道 */}
                {sortedShots.map((shot) => {
                  const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
                  const color = shot.shotBy === 'knocker' ? '#3B82F6' : (shotType?.color || '#10B981');
                  
                  return (
                    <g key={shot.id}>
                      <defs>
                        <marker
                          id={`arrow-${shot.id}`}
                          markerWidth="10"
                          markerHeight="10"
                          refX="8"
                          refY="3"
                          orient="auto"
                        >
                          <path d="M0,0 L0,6 L9,3 z" fill={color} />
                        </marker>
                      </defs>
                      <line 
                        x1={shot.from.x} 
                        y1={shot.from.y} 
                        x2={shot.to.x} 
                        y2={shot.to.y} 
                        stroke={color} 
                        strokeWidth="2" 
                        markerEnd={`url(#arrow-${shot.id})`}
                      />
                      {/* ショット番号 */}
                      <circle
                        cx={shot.from.x + (shot.to.x - shot.from.x) / 2}
                        cy={shot.from.y + (shot.to.y - shot.from.y) / 2}
                        r="10"
                        fill="white"
                        stroke={color}
                        strokeWidth="2"
                      />
                      <text
                        x={shot.from.x + (shot.to.x - shot.from.x) / 2}
                        y={shot.from.y + (shot.to.y - shot.from.y) / 2 + 3}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill={color}
                      >
                        {shot.order}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 右側：詳細情報 */}
      <div className="lg:flex-1">
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
            {card.equipment?.length > 0 && (
              <div className="flex items-center">
                <FaTools className="w-4 h-4 mr-1" />
                {card.equipment.join('、')}
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

        {/* 練習手順 */}
        {sortedShots.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <GiShuttlecock className="w-5 h-5 mr-2" />
              練習手順
            </h4>
            <div className="space-y-2">
              {sortedShots.map((shot, index) => {
                const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
                const area = shot.targetArea ? COURT_AREAS.find(a => a.id === shot.targetArea) : null;
                return (
                  <div key={shot.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: shot.shotBy === 'knocker' ? '#3B82F6' : (shotType?.color || '#10B981') }}
                    >
                      {shot.order}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {shot.shotBy === 'knocker' ? 'ノック' : shot.shotBy === 'opponent' ? '相手' : 'プレイヤー'}
                        {shotType && ` - ${shotType.name}`}
                      </div>
                      {area && (
                        <div className="text-sm text-gray-600">
                          ターゲットエリア: {area.name}
                        </div>
                      )}
                      {shot.description && (
                        <div className="text-sm text-gray-600 mt-1">
                          {shot.description}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* タグ */}
        {card.tags.length > 0 && (
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
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
          <div className="p-6 pt-0">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">備考</h4>
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