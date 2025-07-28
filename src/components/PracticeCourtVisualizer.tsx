'use client';

import React, { useState } from 'react';
import { CourtZone } from '@/types/practice';

interface PracticeCourtVisualizerProps {
  selectedAreas?: CourtZone[];
  focusArea?: CourtZone;
  onAreaSelect?: (area: CourtZone) => void;
  courtType?: 'singles' | 'doubles';
  interactive?: boolean;
  className?: string;
  showLabels?: boolean;
  showPlayerPositions?: boolean;
  playerPositions?: { x: number; y: number; label: string }[];
  shotTrajectories?: { from: { x: number; y: number }; to: { x: number; y: number }; type: string }[];
}

const PracticeCourtVisualizer: React.FC<PracticeCourtVisualizerProps> = ({
  selectedAreas = [],
  focusArea,
  onAreaSelect,
  courtType = 'doubles',
  interactive = false,
  className = '',
  showLabels = false,
  showPlayerPositions = false,
  playerPositions = [],
  shotTrajectories = []
}) => {
  const [hoveredArea, setHoveredArea] = useState<CourtZone | null>(null);

  // コート寸法（ダブルス：13.4m x 6.1m、シングルス：13.4m x 5.18m）
  const courtWidth = 400;
  const courtHeight = 600;
  const netY = courtHeight / 2;
  
  // シングルス用の幅調整
  const sideMargin = courtType === 'singles' ? 20 : 0;
  const effectiveWidth = courtWidth - (sideMargin * 2);

  // エリア定義
  const areas: Array<{
    zone: CourtZone;
    path: string;
    label: string;
    labelX: number;
    labelY: number;
    centerX: number;
    centerY: number;
  }> = [
    // 相手側コート（上側）
    {
      zone: 'backcourt_left',
      path: `M ${sideMargin} 20 L ${sideMargin + effectiveWidth/3} 20 L ${sideMargin + effectiveWidth/3} ${netY - 120} L ${sideMargin} ${netY - 120} Z`,
      label: '後衛左',
      labelX: sideMargin + effectiveWidth/6,
      labelY: 80,
      centerX: sideMargin + effectiveWidth/6,
      centerY: (20 + netY - 120) / 2
    },
    {
      zone: 'backcourt_center',
      path: `M ${sideMargin + effectiveWidth/3} 20 L ${sideMargin + (effectiveWidth*2)/3} 20 L ${sideMargin + (effectiveWidth*2)/3} ${netY - 120} L ${sideMargin + effectiveWidth/3} ${netY - 120} Z`,
      label: '後衛中央',
      labelX: sideMargin + effectiveWidth/2,
      labelY: 80,
      centerX: sideMargin + effectiveWidth/2,
      centerY: (20 + netY - 120) / 2
    },
    {
      zone: 'backcourt_right',
      path: `M ${sideMargin + (effectiveWidth*2)/3} 20 L ${sideMargin + effectiveWidth} 20 L ${sideMargin + effectiveWidth} ${netY - 120} L ${sideMargin + (effectiveWidth*2)/3} ${netY - 120} Z`,
      label: '後衛右',
      labelX: sideMargin + (effectiveWidth*5)/6,
      labelY: 80,
      centerX: sideMargin + (effectiveWidth*5)/6,
      centerY: (20 + netY - 120) / 2
    },
    {
      zone: 'midcourt_left',
      path: `M ${sideMargin} ${netY - 120} L ${sideMargin + effectiveWidth/3} ${netY - 120} L ${sideMargin + effectiveWidth/3} ${netY - 60} L ${sideMargin} ${netY - 60} Z`,
      label: '中衛左',
      labelX: sideMargin + effectiveWidth/6,
      labelY: netY - 90,
      centerX: sideMargin + effectiveWidth/6,
      centerY: netY - 90
    },
    {
      zone: 'midcourt_center',
      path: `M ${sideMargin + effectiveWidth/3} ${netY - 120} L ${sideMargin + (effectiveWidth*2)/3} ${netY - 120} L ${sideMargin + (effectiveWidth*2)/3} ${netY - 60} L ${sideMargin + effectiveWidth/3} ${netY - 60} Z`,
      label: '中衛中央',
      labelX: sideMargin + effectiveWidth/2,
      labelY: netY - 90,
      centerX: sideMargin + effectiveWidth/2,
      centerY: netY - 90
    },
    {
      zone: 'midcourt_right',
      path: `M ${sideMargin + (effectiveWidth*2)/3} ${netY - 120} L ${sideMargin + effectiveWidth} ${netY - 120} L ${sideMargin + effectiveWidth} ${netY - 60} L ${sideMargin + (effectiveWidth*2)/3} ${netY - 60} Z`,
      label: '中衛右',
      labelX: sideMargin + (effectiveWidth*5)/6,
      labelY: netY - 90,
      centerX: sideMargin + (effectiveWidth*5)/6,
      centerY: netY - 90
    },
    {
      zone: 'frontcourt_left',
      path: `M ${sideMargin} ${netY - 60} L ${sideMargin + effectiveWidth/3} ${netY - 60} L ${sideMargin + effectiveWidth/3} ${netY - 10} L ${sideMargin} ${netY - 10} Z`,
      label: '前衛左',
      labelX: sideMargin + effectiveWidth/6,
      labelY: netY - 35,
      centerX: sideMargin + effectiveWidth/6,
      centerY: netY - 35
    },
    {
      zone: 'frontcourt_center',
      path: `M ${sideMargin + effectiveWidth/3} ${netY - 60} L ${sideMargin + (effectiveWidth*2)/3} ${netY - 60} L ${sideMargin + (effectiveWidth*2)/3} ${netY - 10} L ${sideMargin + effectiveWidth/3} ${netY - 10} Z`,
      label: '前衛中央',
      labelX: sideMargin + effectiveWidth/2,
      labelY: netY - 35,
      centerX: sideMargin + effectiveWidth/2,
      centerY: netY - 35
    },
    {
      zone: 'frontcourt_right',
      path: `M ${sideMargin + (effectiveWidth*2)/3} ${netY - 60} L ${sideMargin + effectiveWidth} ${netY - 60} L ${sideMargin + effectiveWidth} ${netY - 10} L ${sideMargin + (effectiveWidth*2)/3} ${netY - 10} Z`,
      label: '前衛右',
      labelX: sideMargin + (effectiveWidth*5)/6,
      labelY: netY - 35,
      centerX: sideMargin + (effectiveWidth*5)/6,
      centerY: netY - 35
    },

    // 自分側コート（下側）
    {
      zone: 'frontcourt_left_own',
      path: `M ${sideMargin} ${netY + 10} L ${sideMargin + effectiveWidth/3} ${netY + 10} L ${sideMargin + effectiveWidth/3} ${netY + 60} L ${sideMargin} ${netY + 60} Z`,
      label: '前衛左（自）',
      labelX: sideMargin + effectiveWidth/6,
      labelY: netY + 35,
      centerX: sideMargin + effectiveWidth/6,
      centerY: netY + 35
    },
    {
      zone: 'frontcourt_center_own',
      path: `M ${sideMargin + effectiveWidth/3} ${netY + 10} L ${sideMargin + (effectiveWidth*2)/3} ${netY + 10} L ${sideMargin + (effectiveWidth*2)/3} ${netY + 60} L ${sideMargin + effectiveWidth/3} ${netY + 60} Z`,
      label: '前衛中央（自）',
      labelX: sideMargin + effectiveWidth/2,
      labelY: netY + 35,
      centerX: sideMargin + effectiveWidth/2,
      centerY: netY + 35
    },
    {
      zone: 'frontcourt_right_own',
      path: `M ${sideMargin + (effectiveWidth*2)/3} ${netY + 10} L ${sideMargin + effectiveWidth} ${netY + 10} L ${sideMargin + effectiveWidth} ${netY + 60} L ${sideMargin + (effectiveWidth*2)/3} ${netY + 60} Z`,
      label: '前衛右（自）',
      labelX: sideMargin + (effectiveWidth*5)/6,
      labelY: netY + 35,
      centerX: sideMargin + (effectiveWidth*5)/6,
      centerY: netY + 35
    },
    {
      zone: 'midcourt_left_own',
      path: `M ${sideMargin} ${netY + 60} L ${sideMargin + effectiveWidth/3} ${netY + 60} L ${sideMargin + effectiveWidth/3} ${netY + 120} L ${sideMargin} ${netY + 120} Z`,
      label: '中衛左（自）',
      labelX: sideMargin + effectiveWidth/6,
      labelY: netY + 90,
      centerX: sideMargin + effectiveWidth/6,
      centerY: netY + 90
    },
    {
      zone: 'midcourt_center_own',
      path: `M ${sideMargin + effectiveWidth/3} ${netY + 60} L ${sideMargin + (effectiveWidth*2)/3} ${netY + 60} L ${sideMargin + (effectiveWidth*2)/3} ${netY + 120} L ${sideMargin + effectiveWidth/3} ${netY + 120} Z`,
      label: '中衛中央（自）',
      labelX: sideMargin + effectiveWidth/2,
      labelY: netY + 90,
      centerX: sideMargin + effectiveWidth/2,
      centerY: netY + 90
    },
    {
      zone: 'midcourt_right_own',
      path: `M ${sideMargin + (effectiveWidth*2)/3} ${netY + 60} L ${sideMargin + effectiveWidth} ${netY + 60} L ${sideMargin + effectiveWidth} ${netY + 120} L ${sideMargin + (effectiveWidth*2)/3} ${netY + 120} Z`,
      label: '中衛右（自）',
      labelX: sideMargin + (effectiveWidth*5)/6,
      labelY: netY + 90,
      centerX: sideMargin + (effectiveWidth*5)/6,
      centerY: netY + 90
    },
    {
      zone: 'backcourt_left_own',
      path: `M ${sideMargin} ${netY + 120} L ${sideMargin + effectiveWidth/3} ${netY + 120} L ${sideMargin + effectiveWidth/3} ${courtHeight - 20} L ${sideMargin} ${courtHeight - 20} Z`,
      label: '後衛左（自）',
      labelX: sideMargin + effectiveWidth/6,
      labelY: netY + 170,
      centerX: sideMargin + effectiveWidth/6,
      centerY: (netY + 120 + courtHeight - 20) / 2
    },
    {
      zone: 'backcourt_center_own',
      path: `M ${sideMargin + effectiveWidth/3} ${netY + 120} L ${sideMargin + (effectiveWidth*2)/3} ${netY + 120} L ${sideMargin + (effectiveWidth*2)/3} ${courtHeight - 20} L ${sideMargin + effectiveWidth/3} ${courtHeight - 20} Z`,
      label: '後衛中央（自）',
      labelX: sideMargin + effectiveWidth/2,
      labelY: netY + 170,
      centerX: sideMargin + effectiveWidth/2,
      centerY: (netY + 120 + courtHeight - 20) / 2
    },
    {
      zone: 'backcourt_right_own',
      path: `M ${sideMargin + (effectiveWidth*2)/3} ${netY + 120} L ${sideMargin + effectiveWidth} ${netY + 120} L ${sideMargin + effectiveWidth} ${courtHeight - 20} L ${sideMargin + (effectiveWidth*2)/3} ${courtHeight - 20} Z`,
      label: '後衛右（自）',
      labelX: sideMargin + (effectiveWidth*5)/6,
      labelY: netY + 170,
      centerX: sideMargin + (effectiveWidth*5)/6,
      centerY: (netY + 120 + courtHeight - 20) / 2
    }
  ];

  const getAreaColor = (zone: CourtZone): string => {
    if (focusArea === zone) {
      return '#dc2626'; // 赤 - フォーカスエリア
    }
    if (selectedAreas.includes(zone)) {
      return '#2563eb'; // 青 - 選択エリア
    }
    if (hoveredArea === zone && interactive) {
      return '#60a5fa'; // 薄い青 - ホバー
    }
    return '#f3f4f6'; // グレー - デフォルト
  };

  const getAreaOpacity = (zone: CourtZone): number => {
    if (focusArea === zone) return 0.8;
    if (selectedAreas.includes(zone)) return 0.6;
    if (hoveredArea === zone && interactive) return 0.4;
    return 0.2;
  };

  const handleAreaClick = (zone: CourtZone) => {
    if (interactive && onAreaSelect) {
      onAreaSelect(zone);
    }
  };

  const getShotTrajectoryColor = (type: string): string => {
    const colors: Record<string, string> = {
      'smash': '#dc2626',
      'clear': '#2563eb', 
      'drop': '#16a34a',
      'drive': '#ca8a04',
      'lob': '#9333ea',
      'default': '#6b7280'
    };
    return colors[type] || colors.default;
  };

  return (
    <div className={`select-none ${className}`}>
      <svg 
        width={courtWidth} 
        height={courtHeight} 
        viewBox={`0 0 ${courtWidth} ${courtHeight}`}
        className="border border-gray-300 rounded-lg bg-green-50"
      >
        {/* コート背景 */}
        <rect 
          x={sideMargin} 
          y="20" 
          width={effectiveWidth} 
          height={courtHeight - 40} 
          fill="#22c55e" 
          fillOpacity="0.1" 
          stroke="#16a34a" 
          strokeWidth="2"
        />
        
        {/* ネット */}
        <line 
          x1={sideMargin} 
          y1={netY} 
          x2={sideMargin + effectiveWidth} 
          y2={netY} 
          stroke="#374151" 
          strokeWidth="3"
        />
        <text 
          x={courtWidth/2} 
          y={netY - 5} 
          textAnchor="middle" 
          className="text-xs fill-gray-600 font-medium"
        >
          ネット
        </text>

        {/* サービスボックス線 */}
        <line 
          x1={sideMargin + effectiveWidth/3} 
          y1={netY - 60} 
          x2={sideMargin + effectiveWidth/3} 
          y2={netY + 60} 
          stroke="#16a34a" 
          strokeWidth="1"
        />
        <line 
          x1={sideMargin + (effectiveWidth*2)/3} 
          y1={netY - 60} 
          x2={sideMargin + (effectiveWidth*2)/3} 
          y2={netY + 60} 
          stroke="#16a34a" 
          strokeWidth="1"
        />

        {/* エリアポリゴン */}
        {areas.map((area) => (
          <g key={area.zone}>
            <path
              d={area.path}
              fill={getAreaColor(area.zone)}
              fillOpacity={getAreaOpacity(area.zone)}
              stroke={selectedAreas.includes(area.zone) || focusArea === area.zone ? '#1f2937' : '#d1d5db'}
              strokeWidth={selectedAreas.includes(area.zone) || focusArea === area.zone ? '2' : '1'}
              className={interactive ? 'cursor-pointer transition-all duration-200' : ''}
              onMouseEnter={() => interactive && setHoveredArea(area.zone)}
              onMouseLeave={() => interactive && setHoveredArea(null)}
              onClick={() => handleAreaClick(area.zone)}
            />
            
            {/* エリアラベル */}
            {showLabels && (
              <text
                x={area.labelX}
                y={area.labelY}
                textAnchor="middle"
                className={`text-xs font-medium pointer-events-none ${
                  selectedAreas.includes(area.zone) || focusArea === area.zone 
                    ? 'fill-gray-800' 
                    : 'fill-gray-600'
                }`}
              >
                {area.label}
              </text>
            )}
          </g>
        ))}

        {/* ショット軌道 */}
        {shotTrajectories.map((trajectory, index) => (
          <g key={index}>
            <defs>
              <marker
                id={`arrowhead-${index}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={getShotTrajectoryColor(trajectory.type)}
                />
              </marker>
            </defs>
            <line
              x1={trajectory.from.x}
              y1={trajectory.from.y}
              x2={trajectory.to.x}
              y2={trajectory.to.y}
              stroke={getShotTrajectoryColor(trajectory.type)}
              strokeWidth="3"
              markerEnd={`url(#arrowhead-${index})`}
              className="drop-shadow-sm"
            />
          </g>
        ))}

        {/* プレイヤー位置 */}
        {showPlayerPositions && playerPositions.map((position, index) => (
          <g key={index}>
            <circle
              cx={position.x}
              cy={position.y}
              r="8"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            <text
              x={position.x}
              y={position.y + 3}
              textAnchor="middle"
              className="text-xs font-bold fill-white pointer-events-none"
            >
              {position.label}
            </text>
          </g>
        ))}

        {/* コート境界線 */}
        <rect 
          x={sideMargin} 
          y="20" 
          width={effectiveWidth} 
          height={courtHeight - 40} 
          fill="none" 
          stroke="#16a34a" 
          strokeWidth="3"
        />

        {/* コートタイプ表示 */}
        <text 
          x="10" 
          y="15" 
          className="text-xs fill-gray-600 font-medium"
        >
          {courtType === 'singles' ? 'シングルス' : 'ダブルス'}コート
        </text>
      </svg>
      
      {/* 選択されたエリアの表示 */}
      {(selectedAreas.length > 0 || focusArea) && (
        <div className="mt-2 text-xs text-gray-600">
          {focusArea && (
            <div className="mb-1">
              <span className="inline-block w-3 h-3 bg-red-600 rounded mr-2"></span>
              フォーカス: {areas.find(a => a.zone === focusArea)?.label}
            </div>
          )}
          {selectedAreas.length > 0 && (
            <div>
              <span className="inline-block w-3 h-3 bg-blue-600 rounded mr-2"></span>
              対象エリア: {selectedAreas.map(zone => areas.find(a => a.zone === zone)?.label).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* 凡例 */}
      {(shotTrajectories.length > 0 || showPlayerPositions) && (
        <div className="mt-2 text-xs">
          {shotTrajectories.length > 0 && (
            <div className="mb-1">
              <span className="font-medium text-gray-700">ショット軌道:</span>
              <span className="ml-2 text-red-600">●</span> スマッシュ
              <span className="ml-2 text-blue-600">●</span> クリア
              <span className="ml-2 text-green-600">●</span> ドロップ
              <span className="ml-2 text-yellow-600">●</span> ドライブ
              <span className="ml-2 text-purple-600">●</span> ロブ
            </div>
          )}
          {showPlayerPositions && (
            <div>
              <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
              プレイヤー位置
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PracticeCourtVisualizer;