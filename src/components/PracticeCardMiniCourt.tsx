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
  // コート寸法（PracticeCardVisualEditorと同じ値を使用）
  const COURT_WIDTH = 244; // 6.1m
  const COURT_HEIGHT = 536; // 13.4m
  const scale = Math.min(width / COURT_WIDTH, height / COURT_HEIGHT);
  const scaledWidth = COURT_WIDTH * scale;
  const scaledHeight = COURT_HEIGHT * scale;
  
  // ライン位置の計算（編集モードと同じ値を使用）
  const NET_POSITION = scaledHeight / 2;
  const SHORT_SERVICE_LINE = 79 * scale; // ネットから1.98m
  const LONG_SERVICE_LINE = 53 * scale; // エンドラインから1.32m内側（ダブルス用）
  const BACK_BOUNDARY_LINE_SINGLES = 30 * scale; // エンドラインから0.76m内側
  const SIDE_ALLEY_WIDTH = 17 * scale; // サイドアレー幅0.42m
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

  // エリア定義（18エリア）- 編集モードと同じ定義を使用
  const HALF_COURT_HEIGHT = scaledHeight / 2;
  const COURT_AREAS = [
    // 上側コート（相手側）
    { id: 'opp_fl', x: 0, y: 0, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_fc', x: scaledWidth/3, y: 0, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_fr', x: scaledWidth*2/3, y: 0, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_ml', x: 0, y: HALF_COURT_HEIGHT/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_mc', x: scaledWidth/3, y: HALF_COURT_HEIGHT/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_mr', x: scaledWidth*2/3, y: HALF_COURT_HEIGHT/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_bl', x: 0, y: HALF_COURT_HEIGHT*2/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_bc', x: scaledWidth/3, y: HALF_COURT_HEIGHT*2/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    { id: 'opp_br', x: scaledWidth*2/3, y: HALF_COURT_HEIGHT*2/3, w: scaledWidth/3, h: HALF_COURT_HEIGHT/3 },
    // 下側コート（自分側）
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

  const padding = 10 * scale;
  const totalWidth = scaledWidth + padding * 2;
  const totalHeight = scaledHeight + padding * 2;
  
  return (
    <div className="relative bg-gray-100 rounded" style={{ width: totalWidth, height: totalHeight, padding: `${padding}px` }}>
      <svg
        width={scaledWidth}
        height={scaledHeight}
        className="rounded"
        viewBox={`0 0 ${scaledWidth} ${scaledHeight}`}
      >
        {/* コート背景 */}
        <rect x="0" y="0" width={scaledWidth} height={scaledHeight} fill="#4ade80" />
        
        {/* コートライン */}
        <g stroke="white" fill="none">
          {/* 外枠 */}
          <rect x="0" y="0" width={scaledWidth} height={scaledHeight} strokeWidth={scale * 2} />
          
          {/* ネット */}
          <line x1="0" y1={NET_POSITION} x2={scaledWidth} y2={NET_POSITION} stroke="#424242" strokeWidth={scale * 3} />
          
          {/* サービスライン（ショート） */}
          <line x1="0" y1={NET_POSITION - SHORT_SERVICE_LINE} x2={scaledWidth} y2={NET_POSITION - SHORT_SERVICE_LINE} stroke="white" strokeWidth={scale * 1.5} />
          <line x1="0" y1={NET_POSITION + SHORT_SERVICE_LINE} x2={scaledWidth} y2={NET_POSITION + SHORT_SERVICE_LINE} stroke="white" strokeWidth={scale * 1.5} />
          
          {/* バックバウンダリーライン（ダブルス） */}
          <line x1="0" y1={BACK_BOUNDARY_LINE_SINGLES} x2={scaledWidth} y2={BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth={scale * 1.5} />
          <line x1="0" y1={scaledHeight - BACK_BOUNDARY_LINE_SINGLES} x2={scaledWidth} y2={scaledHeight - BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth={scale * 1.5} />
          
          {/* センターライン（サービスコート内のみ） */}
          <line x1={CENTER_LINE} y1="0" x2={CENTER_LINE} y2={NET_POSITION - SHORT_SERVICE_LINE} stroke="white" strokeWidth={scale * 1.5} />
          <line x1={CENTER_LINE} y1={NET_POSITION + SHORT_SERVICE_LINE} x2={CENTER_LINE} y2={scaledHeight} stroke="white" strokeWidth={scale * 1.5} />
          
          {/* サイドライン（シングルス） */}
          <line x1={SIDE_ALLEY_WIDTH} y1="0" x2={SIDE_ALLEY_WIDTH} y2={scaledHeight} stroke="white" strokeWidth={scale * 1.5} />
          <line x1={scaledWidth - SIDE_ALLEY_WIDTH} y1="0" x2={scaledWidth - SIDE_ALLEY_WIDTH} y2={scaledHeight} stroke="white" strokeWidth={scale * 1.5} />
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
                      stroke="none"
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
              
              {/* ショット番号 */}
              <circle
                cx={fromX + (toX - fromX) / 2}
                cy={fromY + (toY - fromY) / 2}
                r={Math.min(8, scaledWidth * 0.06)}
                fill="white"
                stroke={color}
                strokeWidth="1"
              />
              <text
                x={fromX + (toX - fromX) / 2}
                y={fromY + (toY - fromY) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(10, scaledWidth * 0.08)}
                fontWeight="bold"
                fill={color}
              >
                {shot.order || index + 1}
              </text>
            </g>
          );
        })}

        {/* プレイヤーの過去のショット位置 */}
        {shotTrajectories.filter(shot => shot.shotBy === 'player').map((shot) => {
          const x = (shot.from.x / COURT_WIDTH) * scaledWidth;
          const y = (shot.from.y / COURT_HEIGHT) * scaledHeight;
          const smallRadius = Math.min(3, scaledWidth * 0.025);
          
          return (
            <g key={`player-shot-${shot.id}`}>
              <circle 
                cx={x} 
                cy={y} 
                r={smallRadius}
                fill="#10B981" 
                fillOpacity="0.4"
                stroke="#10B981" 
                strokeWidth={Math.max(1, scaledWidth * 0.005)}
              />
            </g>
          );
        })}
        
        {/* 現在のプレイヤー位置 */}
        {playerPositions.map((player) => {
          const x = (player.x / COURT_WIDTH) * scaledWidth;
          const y = (player.y / COURT_HEIGHT) * scaledHeight;
          const radius = Math.min(12, scaledWidth * 0.1);
          const fontSize = Math.min(11, scaledWidth * 0.09);
          
          const icon = player.role === 'knocker' ? (
            <text 
              x={x} 
              y={y + fontSize * 0.3} 
              textAnchor="middle" 
              fill="white" 
              fontSize={fontSize}
              fontWeight="bold"
            >
              N
            </text>
          ) : player.role === 'player' ? (
            <text 
              x={x} 
              y={y + fontSize * 0.3} 
              textAnchor="middle" 
              fill="white" 
              fontSize={fontSize}
              fontWeight="bold"
            >
              P
            </text>
          ) : (
            <text 
              x={x} 
              y={y + fontSize * 0.3} 
              textAnchor="middle" 
              fill="white" 
              fontSize={fontSize}
              fontWeight="bold"
            >
              {player.label?.substring(0, 1) || 'O'}
            </text>
          );
          
          return (
            <g key={player.id}>
              <circle 
                cx={x} 
                cy={y} 
                r={radius}
                fill={player.color || '#10B981'} 
                stroke="white" 
                strokeWidth={Math.max(1.5, scaledWidth * 0.01)}
              />
              {icon}
              {player.label && (
                <text 
                  x={x} 
                  y={y + radius + fontSize * 0.8} 
                  textAnchor="middle" 
                  fill="#374151" 
                  fontSize={fontSize * 0.7}
                  fontWeight="600"
                >
                  {player.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default PracticeCardMiniCourt;