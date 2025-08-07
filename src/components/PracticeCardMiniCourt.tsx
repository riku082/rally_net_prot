'use client';

import React from 'react';
import { ShotTrajectory, PlayerPosition } from '@/types/practice';

interface PracticeCardMiniCourtProps {
  shotTrajectories?: ShotTrajectory[];
  playerPositions?: PlayerPosition[];
  width?: number;
  height?: number;
}

const PracticeCardMiniCourt: React.FC<PracticeCardMiniCourtProps> = ({
  shotTrajectories = [],
  playerPositions = [],
  width = 120,
  height = 210
}) => {
  // コート寸法（実際のコートの比率を維持）
  const COURT_WIDTH = 122; // 6.1m
  const COURT_HEIGHT = 268; // 13.4m
  const scale = Math.min(width / COURT_WIDTH, height / COURT_HEIGHT);
  const scaledWidth = COURT_WIDTH * scale;
  const scaledHeight = COURT_HEIGHT * scale;
  
  // ライン位置の計算
  const HALF_COURT_HEIGHT = scaledHeight / 2;
  const SERVICE_LINE = scaledHeight * 0.24; // 前から24%の位置
  const BACK_SERVICE_LINE = scaledHeight * 0.76; // 前から76%の位置
  const SIDE_ALLEY_WIDTH = scaledWidth * 0.15; // 両サイド15%
  const CENTER_LINE = scaledWidth / 2;

  // 色の定義
  const SHOT_TYPES = [
    { id: 'clear', color: '#3B82F6' }, // 青
    { id: 'smash', color: '#EF4444' }, // 赤
    { id: 'drop', color: '#10B981' }, // 緑
    { id: 'hairpin', color: '#F59E0B' }, // オレンジ
    { id: 'drive', color: '#8B5CF6' }, // 紫
    { id: 'push', color: '#EC4899' }, // ピンク
    { id: 'lob', color: '#14B8A6' }, // ティール
    { id: 'receive', color: '#6366F1' }, // インディゴ
    { id: 'other', color: '#6B7280' } // グレー
  ];

  // エリア定義（18エリア）
  const COURT_AREAS = [
    // 相手側コート（上半分）
    { id: 'opp_fl', x: 0, y: 0, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_fc', x: scaledWidth/3, y: 0, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_fr', x: scaledWidth*2/3, y: 0, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_ml', x: 0, y: HALF_COURT_HEIGHT/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_mc', x: scaledWidth/3, y: HALF_COURT_HEIGHT/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_mr', x: scaledWidth*2/3, y: HALF_COURT_HEIGHT/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_bl', x: 0, y: HALF_COURT_HEIGHT*2/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_bc', x: scaledWidth/3, y: HALF_COURT_HEIGHT*2/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_br', x: scaledWidth*2/3, y: HALF_COURT_HEIGHT*2/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    // 自分側コート（下半分）
    { id: 'own_fl', x: 0, y: HALF_COURT_HEIGHT, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'own_fc', x: scaledWidth/3, y: HALF_COURT_HEIGHT, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'own_fr', x: scaledWidth*2/3, y: HALF_COURT_HEIGHT, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'own_ml', x: 0, y: HALF_COURT_HEIGHT + HALF_COURT_HEIGHT/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'own_mc', x: scaledWidth/3, y: HALF_COURT_HEIGHT + HALF_COURT_HEIGHT/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'own_mr', x: scaledWidth*2/3, y: HALF_COURT_HEIGHT + HALF_COURT_HEIGHT/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'own_bl', x: 0, y: HALF_COURT_HEIGHT + HALF_COURT_HEIGHT*2/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'own_bc', x: scaledWidth/3, y: HALF_COURT_HEIGHT + HALF_COURT_HEIGHT*2/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'own_br', x: scaledWidth*2/3, y: HALF_COURT_HEIGHT + HALF_COURT_HEIGHT*2/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 }
  ];

  return (
    <div className="relative" style={{ width: scaledWidth, height: scaledHeight }}>
      <svg
        width={scaledWidth}
        height={scaledHeight}
        className="bg-green-600 rounded"
      >
        {/* コートライン */}
        <g stroke="white" strokeWidth="1" fill="none">
          {/* 外枠 */}
          <rect x="0" y="0" width={scaledWidth} height={scaledHeight} />
          
          {/* ネット（センターライン） */}
          <line x1="0" y1={HALF_COURT_HEIGHT} x2={scaledWidth} y2={HALF_COURT_HEIGHT} strokeWidth="2" />
          
          {/* 前サービスライン */}
          <line x1="0" y1={SERVICE_LINE} x2={scaledWidth} y2={SERVICE_LINE} />
          <line x1="0" y1={scaledHeight - SERVICE_LINE} x2={scaledWidth} y2={scaledHeight - SERVICE_LINE} />
          
          {/* 後サービスライン（ダブルス） */}
          <line x1="0" y1={BACK_SERVICE_LINE} x2={scaledWidth} y2={BACK_SERVICE_LINE} strokeDasharray="2,2" />
          <line x1="0" y1={scaledHeight - BACK_SERVICE_LINE} x2={scaledWidth} y2={scaledHeight - BACK_SERVICE_LINE} strokeDasharray="2,2" />
          
          {/* センターライン */}
          <line x1={CENTER_LINE} y1="0" x2={CENTER_LINE} y2={scaledHeight} />
          
          {/* サイドライン */}
          <line x1={SIDE_ALLEY_WIDTH} y1="0" x2={SIDE_ALLEY_WIDTH} y2={scaledHeight} strokeDasharray="2,2" />
          <line x1={scaledWidth - SIDE_ALLEY_WIDTH} y1="0" x2={scaledWidth - SIDE_ALLEY_WIDTH} y2={scaledHeight} strokeDasharray="2,2" />
        </g>

        {/* ショット軌道 */}
        {shotTrajectories.map((shot, index) => {
          const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
          const color = shot.shotBy === 'knocker' ? '#000000' : (shotType?.color || '#10B981');
          const fromX = (shot.from.x / COURT_WIDTH) * scaledWidth;
          const fromY = (shot.from.y / COURT_HEIGHT) * scaledHeight;
          const toX = (shot.to.x / COURT_WIDTH) * scaledWidth;
          const toY = (shot.to.y / COURT_HEIGHT) * scaledHeight;
          
          // エリアターゲットの場合、エリアを塗りつぶす
          const targetAreaIds = shot.targetArea ? shot.targetArea.split(',') : [];
          
          return (
            <g key={shot.id}>
              {/* エリアを塗りつぶす */}
              {targetAreaIds.map(areaId => {
                const area = COURT_AREAS.find(a => a.id === areaId);
                if (area) {
                  return (
                    <rect
                      key={areaId}
                      x={area.x}
                      y={area.y}
                      width={area.w}
                      height={area.h}
                      fill={color}
                      fillOpacity={0.3}
                      stroke={color}
                      strokeWidth="1"
                    />
                  );
                }
                return null;
              })}
              
              <defs>
                <marker
                  id={`arrow-mini-${index}`}
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="2"
                  orient="auto"
                >
                  <path d="M0,0 L0,4 L6,2 z" fill={color} />
                </marker>
              </defs>
              
              <line
                x1={fromX}
                y1={fromY}
                x2={toX}
                y2={toY}
                stroke={color}
                strokeWidth="1.5"
                markerEnd={`url(#arrow-mini-${index})`}
              />
            </g>
          );
        })}

        {/* プレイヤー位置 */}
        {playerPositions.map((player) => {
          const x = (player.x / COURT_WIDTH) * scaledWidth;
          const y = (player.y / COURT_HEIGHT) * scaledHeight;
          
          return (
            <circle
              key={player.id}
              cx={x}
              cy={y}
              r="4"
              fill={player.color || '#10B981'}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default PracticeCardMiniCourt;