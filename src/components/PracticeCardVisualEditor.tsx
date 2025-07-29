'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayerPosition, 
  ShotTrajectory, 
  MovementPattern, 
  EquipmentPosition, 
  PracticeVisualInfo,
  PracticeMenuType 
} from '@/types/practice';
import { FiUser, FiTarget, FiMove, FiMoreVertical } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';
import { MdSportsBaseball } from 'react-icons/md';

interface PracticeCardVisualEditorProps {
  visualInfo: PracticeVisualInfo;
  practiceType?: PracticeMenuType;
  onUpdate: (visualInfo: PracticeVisualInfo) => void;
  courtType?: 'singles' | 'doubles';
}

interface DragItem {
  type: 'player' | 'equipment' | 'shuttle';
  data: PlayerPosition | EquipmentPosition;
}

// コート寸法（ピクセル）
const COURT_WIDTH = 400;
const COURT_HEIGHT = 600;
const COURT_PADDING = 40;

// グリッドサイズ
const GRID_SIZE = 20;

// コートエリアの色
const COURT_COLORS = {
  court: '#00897B',
  lines: '#FFFFFF',
  service: '#006D5B',
  alley: '#00695C',
  net: '#424242',
  label: '#E0F2F1'
};

const PracticeCardVisualEditor: React.FC<PracticeCardVisualEditorProps> = ({
  visualInfo,
  practiceType,
  onUpdate,
  courtType = 'singles'
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>(visualInfo.playerPositions || []);
  const [equipmentPositions, setEquipmentPositions] = useState<EquipmentPosition[]>(visualInfo.equipmentPositions || []);
  const [shotTrajectories, setShotTrajectories] = useState<ShotTrajectory[]>(visualInfo.shotTrajectories || []);
  const [movementPatterns, setMovementPatterns] = useState<MovementPattern[]>(visualInfo.movementPatterns || []);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<'select' | 'shot' | 'movement'>('select');
  const courtRef = useRef<HTMLDivElement>(null);

  // 練習タイプ別のデフォルト設定
  const getDefaultMarkers = (type: PracticeMenuType) => {
    switch (type) {
      case 'knock_practice':
        return {
          players: [
            { id: 'knocker', x: 200, y: 100, label: 'ノッカー', role: 'knocker' as const, color: '#3B82F6', icon: 'knocker' },
            { id: 'player1', x: 200, y: 500, label: 'プレイヤー', role: 'player' as const, color: '#10B981' }
          ],
          equipment: []
        };
      case 'pattern_practice':
        return {
          players: [
            { id: 'player1', x: 100, y: 500, label: 'P1', role: 'player' as const, color: '#10B981' },
            { id: 'player2', x: 300, y: 500, label: 'P2', role: 'player' as const, color: '#10B981' },
            { id: 'opponent1', x: 100, y: 100, label: 'O1', role: 'opponent' as const, color: '#EF4444' },
            { id: 'opponent2', x: 300, y: 100, label: 'O2', role: 'opponent' as const, color: '#EF4444' }
          ],
          equipment: []
        };
      case 'footwork_practice':
        return {
          players: [
            { id: 'player1', x: 200, y: 300, label: 'プレイヤー', role: 'player' as const, color: '#10B981' }
          ],
          equipment: [
            { id: 'cone1', x: 100, y: 200, type: 'cone', label: '1', color: '#F59E0B' },
            { id: 'cone2', x: 300, y: 200, type: 'cone', label: '2', color: '#F59E0B' },
            { id: 'cone3', x: 100, y: 400, type: 'cone', label: '3', color: '#F59E0B' },
            { id: 'cone4', x: 300, y: 400, type: 'cone', label: '4', color: '#F59E0B' }
          ]
        };
      default:
        return { players: [], equipment: [] };
    }
  };

  // 初期配置
  useEffect(() => {
    if (practiceType && playerPositions.length === 0 && equipmentPositions.length === 0) {
      const defaults = getDefaultMarkers(practiceType);
      setPlayerPositions(defaults.players);
      setEquipmentPositions(defaults.equipment);
    }
  }, [practiceType]);

  // グリッドスナップ
  const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  // ドラッグ開始
  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  // ドロップ処理
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !courtRef.current) return;

    const rect = courtRef.current.getBoundingClientRect();
    const x = snapToGrid(e.clientX - rect.left - COURT_PADDING);
    const y = snapToGrid(e.clientY - rect.top - COURT_PADDING);

    // 範囲チェック
    if (x < 0 || x > COURT_WIDTH || y < 0 || y > COURT_HEIGHT) return;

    if (draggedItem.type === 'player') {
      const updatedPosition = { ...(draggedItem.data as PlayerPosition), x, y };
      setPlayerPositions(prev => 
        prev.map(p => p.id === updatedPosition.id ? updatedPosition : p)
      );
    } else if (draggedItem.type === 'equipment') {
      const updatedPosition = { ...(draggedItem.data as EquipmentPosition), x, y };
      setEquipmentPositions(prev => 
        prev.map(e => e.id === updatedPosition.id ? updatedPosition : e)
      );
    }

    updateVisualInfo();
  };

  // ビジュアル情報を更新
  const updateVisualInfo = () => {
    onUpdate({
      ...visualInfo,
      playerPositions,
      equipmentPositions,
      shotTrajectories,
      movementPatterns
    });
  };

  // アイテムを追加
  const addItem = (type: 'player' | 'equipment' | 'shuttle') => {
    const id = `${type}_${Date.now()}`;
    const x = snapToGrid(COURT_WIDTH / 2);
    const y = snapToGrid(COURT_HEIGHT / 2);

    if (type === 'player') {
      const newPlayer: PlayerPosition = {
        id,
        x,
        y,
        label: `P${playerPositions.length + 1}`,
        role: 'player',
        color: '#10B981'
      };
      setPlayerPositions([...playerPositions, newPlayer]);
    } else if (type === 'equipment') {
      const newEquipment: EquipmentPosition = {
        id,
        x,
        y,
        type: 'cone',
        label: `${equipmentPositions.length + 1}`,
        color: '#F59E0B'
      };
      setEquipmentPositions([...equipmentPositions, newEquipment]);
    }

    updateVisualInfo();
  };

  // アイテムを削除
  const deleteItem = (id: string) => {
    setPlayerPositions(prev => prev.filter(p => p.id !== id));
    setEquipmentPositions(prev => prev.filter(e => e.id !== id));
    updateVisualInfo();
  };

  // プレイヤーマーカーのレンダリング
  const renderPlayerMarker = (player: PlayerPosition) => {
    const getIcon = () => {
      if (player.role === 'knocker') {
        return <MdSportsBaseball className="w-6 h-6" />;
      } else if (player.role === 'coach' || player.role === 'feeder') {
        return <FiUser className="w-6 h-6" />;
      }
      return <FiUser className="w-6 h-6" />;
    };

    const getDirectionRotation = () => {
      const directions: { [key: string]: number } = {
        'north': 0,
        'northeast': 45,
        'east': 90,
        'southeast': 135,
        'south': 180,
        'southwest': 225,
        'west': 270,
        'northwest': 315
      };
      return directions[player.direction || 'north'] || 0;
    };

    return (
      <div
        key={player.id}
        draggable={drawMode === 'select'}
        onDragStart={(e) => handleDragStart(e, { type: 'player', data: player })}
        onDragEnd={handleDragEnd}
        className={`absolute cursor-move ${selectedItem === player.id ? 'ring-2 ring-blue-500' : ''} ${
          drawMode === 'movement' ? 'cursor-pointer' : ''
        }`}
        style={{
          left: player.x + COURT_PADDING - 20,
          top: player.y + COURT_PADDING - 20,
          width: 40,
          height: 40
        }}
        onClick={() => {
          setSelectedItem(player.id);
          if (drawMode === 'movement') {
            setSelectedPlayerId(player.id);
          }
        }}
      >
        <div 
          className="w-full h-full rounded-full flex items-center justify-center text-white relative"
          style={{ backgroundColor: player.color || '#10B981' }}
        >
          {getIcon()}
          {/* 方向矢印 */}
          {player.direction && (
            <div
              className="absolute -top-2 left-1/2 transform -translate-x-1/2"
              style={{ transform: `translateX(-50%) rotate(${getDirectionRotation()}deg)` }}
            >
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white" />
            </div>
          )}
        </div>
        <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap bg-white px-1 rounded shadow">
          {player.label}
        </span>
        {selectedPlayerId === player.id && drawMode === 'movement' && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
            移動経路を描画中
          </div>
        )}
      </div>
    );
  };

  // 装備マーカーのレンダリング
  const renderEquipmentMarker = (equipment: EquipmentPosition) => {
    const getIcon = () => {
      switch (equipment.type) {
        case 'cone':
          return <FiTarget className="w-5 h-5" />;
        case 'shuttle':
          return <GiShuttlecock className="w-5 h-5" />;
        default:
          return <FiMoreVertical className="w-5 h-5" />;
      }
    };

    return (
      <div
        key={equipment.id}
        draggable
        onDragStart={(e) => handleDragStart(e, { type: 'equipment', data: equipment })}
        onDragEnd={handleDragEnd}
        className={`absolute cursor-move ${selectedItem === equipment.id ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: equipment.x + COURT_PADDING - 15,
          top: equipment.y + COURT_PADDING - 15,
          backgroundColor: equipment.color || '#F59E0B',
          width: 30,
          height: 30
        }}
        onClick={() => setSelectedItem(equipment.id)}
      >
        <div className="w-full h-full rounded-full flex items-center justify-center text-white">
          {getIcon()}
        </div>
        {equipment.label && (
          <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
            {equipment.label}
          </span>
        )}
      </div>
    );
  };

  // ショット軌道を追加
  const addShotTrajectory = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const newTrajectory: ShotTrajectory = {
      id: `shot_${Date.now()}`,
      from,
      to,
      shotType: 'clear',
      order: shotTrajectories.length + 1
    };
    setShotTrajectories([...shotTrajectories, newTrajectory]);
    setSelectedItem(newTrajectory.id);
    updateVisualInfo();
  };

  // ショット描画用の状態
  const [shotStart, setShotStart] = useState<{ x: number; y: number } | null>(null);

  // 移動パターンを追加
  const addMovementPattern = (playerId: string, path: { x: number; y: number }[]) => {
    const newPattern: MovementPattern = {
      id: `movement_${Date.now()}`,
      playerId,
      path,
      timing: movementPatterns.length + 1
    };
    setMovementPatterns([...movementPatterns, newPattern]);
    updateVisualInfo();
  };

  // コート上のクリック処理
  const handleCourtClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!courtRef.current || drawMode === 'select') return;

    const rect = courtRef.current.getBoundingClientRect();
    const x = snapToGrid(e.clientX - rect.left - COURT_PADDING);
    const y = snapToGrid(e.clientY - rect.top - COURT_PADDING);

    if (drawMode === 'movement' && selectedPlayerId) {
      if (!isDrawingPath) {
        setIsDrawingPath(true);
        setCurrentPath([{ x, y }]);
      } else {
        setCurrentPath([...currentPath, { x, y }]);
      }
    } else if (drawMode === 'shot') {
      if (!shotStart) {
        setShotStart({ x, y });
      } else {
        addShotTrajectory(shotStart, { x, y });
        setShotStart(null);
      }
    }
  };

  // パス描画を終了
  const finishPath = () => {
    if (drawMode === 'movement' && selectedPlayerId && currentPath.length > 1) {
      addMovementPattern(selectedPlayerId, currentPath);
    }
    setIsDrawingPath(false);
    setCurrentPath([]);
  };

  return (
    <div className="flex gap-6">
      {/* マーカーパレット */}
      <div className="w-48 bg-gray-50 rounded-lg p-4">
        <h3 className="font-bold text-sm mb-4">ツール</h3>
        
        {/* モード選択 */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-600 mb-2">モード</h4>
          <div className="space-y-1">
            <button
              onClick={() => setDrawMode('select')}
              className={`w-full p-2 text-sm rounded-lg transition-colors ${
                drawMode === 'select' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              選択モード
            </button>
            <button
              onClick={() => {
                setDrawMode('shot');
                setShotStart(null);
              }}
              className={`w-full p-2 text-sm rounded-lg transition-colors ${
                drawMode === 'shot' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              シャトル軌道
            </button>
            <button
              onClick={() => setDrawMode('movement')}
              className={`w-full p-2 text-sm rounded-lg transition-colors ${
                drawMode === 'movement' ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              移動経路
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">プレイヤー</h4>
            <button
              onClick={() => addItem('player')}
              className="w-full bg-green-500 text-white rounded-lg p-3 hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <FiUser className="w-5 h-5" />
              <span className="text-sm">プレイヤー追加</span>
            </button>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">用具</h4>
            <button
              onClick={() => addItem('equipment')}
              className="w-full bg-orange-500 text-white rounded-lg p-3 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <FiTarget className="w-5 h-5" />
              <span className="text-sm">コーン追加</span>
            </button>
          </div>

          {drawMode === 'movement' && (
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">移動経路</h4>
              {isDrawingPath && (
                <button
                  onClick={finishPath}
                  className="w-full bg-green-600 text-white rounded-lg p-2 hover:bg-green-700 transition-colors text-sm"
                >
                  経路を確定
                </button>
              )}
            </div>
          )}

          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">設定</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">グリッド表示</span>
            </label>
          </div>
        </div>
      </div>

      {/* コートエリア */}
      <div className="flex-1">
        <div 
          ref={courtRef}
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={{ 
            width: COURT_WIDTH + COURT_PADDING * 2, 
            height: COURT_HEIGHT + COURT_PADDING * 2,
            backgroundColor: '#E8F5E9'
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={handleCourtClick}
        >
          {/* グリッド */}
          {showGrid && (
            <svg 
              className="absolute inset-0 pointer-events-none"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                  <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="gray" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          )}

          {/* コートライン */}
          <svg 
            className="absolute"
            style={{ 
              left: COURT_PADDING, 
              top: COURT_PADDING,
              width: COURT_WIDTH, 
              height: COURT_HEIGHT 
            }}
          >
            {/* コート背景 */}
            <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill={COURT_COLORS.court} />
            
            {/* ダブルスアレー */}
            {courtType === 'doubles' && (
              <>
                <rect x="0" y="0" width="20" height={COURT_HEIGHT} fill={COURT_COLORS.alley} opacity="0.5" />
                <rect x={COURT_WIDTH - 20} y="0" width="20" height={COURT_HEIGHT} fill={COURT_COLORS.alley} opacity="0.5" />
              </>
            )}
            
            {/* サービスエリア */}
            <rect x="0" y="155" width={COURT_WIDTH / 2} height="145" fill={COURT_COLORS.service} opacity="0.3" />
            <rect x={COURT_WIDTH / 2} y="155" width={COURT_WIDTH / 2} height="145" fill={COURT_COLORS.service} opacity="0.3" />
            <rect x="0" y="300" width={COURT_WIDTH / 2} height="145" fill={COURT_COLORS.service} opacity="0.3" />
            <rect x={COURT_WIDTH / 2} y="300" width={COURT_WIDTH / 2} height="145" fill={COURT_COLORS.service} opacity="0.3" />
            
            {/* 外枠 */}
            <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="none" stroke={COURT_COLORS.lines} strokeWidth="3" />
            
            {/* ネット */}
            <line x1="0" y1={COURT_HEIGHT / 2} x2={COURT_WIDTH} y2={COURT_HEIGHT / 2} stroke={COURT_COLORS.net} strokeWidth="4" />
            <line x1="0" y1={COURT_HEIGHT / 2 - 2} x2={COURT_WIDTH} y2={COURT_HEIGHT / 2 - 2} stroke={COURT_COLORS.lines} strokeWidth="1" />
            <line x1="0" y1={COURT_HEIGHT / 2 + 2} x2={COURT_WIDTH} y2={COURT_HEIGHT / 2 + 2} stroke={COURT_COLORS.lines} strokeWidth="1" />
            
            {/* サービスライン */}
            <line x1="0" y1="155" x2={COURT_WIDTH} y2="155" stroke={COURT_COLORS.lines} strokeWidth="2" />
            <line x1="0" y1="445" x2={COURT_WIDTH} y2="445" stroke={COURT_COLORS.lines} strokeWidth="2" />
            
            {/* センターサービスライン */}
            <line x1={COURT_WIDTH / 2} y1="155" x2={COURT_WIDTH / 2} y2="445" stroke={COURT_COLORS.lines} strokeWidth="2" />
            
            {/* ダブルス用サイドライン */}
            {courtType === 'doubles' && (
              <>
                <line x1="20" y1="0" x2="20" y2={COURT_HEIGHT} stroke={COURT_COLORS.lines} strokeWidth="2" />
                <line x1={COURT_WIDTH - 20} y1="0" x2={COURT_WIDTH - 20} y2={COURT_HEIGHT} stroke={COURT_COLORS.lines} strokeWidth="2" />
              </>
            )}
            
            {/* コートエリアラベル */}
            <text x="10" y="25" fill={COURT_COLORS.label} fontSize="12" fontWeight="bold">相手コート</text>
            <text x="10" y={COURT_HEIGHT - 10} fill={COURT_COLORS.label} fontSize="12" fontWeight="bold">自分コート</text>
          </svg>

          {/* ショット軌道 */}
          {shotTrajectories.map((trajectory) => (
            <svg
              key={trajectory.id}
              className="absolute pointer-events-none"
              style={{
                left: COURT_PADDING,
                top: COURT_PADDING,
                width: COURT_WIDTH,
                height: COURT_HEIGHT
              }}
            >
              <defs>
                <marker
                  id={`arrow-${trajectory.id}`}
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
                x1={trajectory.from.x}
                y1={trajectory.from.y}
                x2={trajectory.to.x}
                y2={trajectory.to.y}
                stroke="#FF5722"
                strokeWidth="3"
                markerEnd={`url(#arrow-${trajectory.id})`}
                strokeDasharray="5,5"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="10"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </line>
              <circle cx={trajectory.from.x} cy={trajectory.from.y} r="8" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
              <text
                x={trajectory.from.x + (trajectory.to.x - trajectory.from.x) / 2}
                y={trajectory.from.y + (trajectory.to.y - trajectory.from.y) / 2 - 10}
                fill="#D84315"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                {trajectory.shotType}
              </text>
            </svg>
          ))}

          {/* ショット軌道をクリックで選択 */}
          {shotTrajectories.map((trajectory) => (
            <div
              key={`clickable-${trajectory.id}`}
              className="absolute cursor-pointer"
              style={{
                left: Math.min(trajectory.from.x, trajectory.to.x) + COURT_PADDING - 10,
                top: Math.min(trajectory.from.y, trajectory.to.y) + COURT_PADDING - 10,
                width: Math.abs(trajectory.to.x - trajectory.from.x) + 20,
                height: Math.abs(trajectory.to.y - trajectory.from.y) + 20
              }}
              onClick={() => setSelectedItem(trajectory.id)}
            />
          ))}

          {/* 移動経路 */}
          {movementPatterns.map((pattern) => {
            const player = playerPositions.find(p => p.id === pattern.playerId);
            if (!player || pattern.path.length < 2) return null;
            
            return (
              <svg
                key={pattern.id}
                className="absolute pointer-events-none"
                style={{
                  left: COURT_PADDING,
                  top: COURT_PADDING,
                  width: COURT_WIDTH,
                  height: COURT_HEIGHT
                }}
              >
                <defs>
                  <marker
                    id={`movement-arrow-${pattern.id}`}
                    markerWidth="10"
                    markerHeight="10"
                    refX="8"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L9,3 z" fill={player.color || '#10B981'} />
                  </marker>
                </defs>
                <polyline
                  points={pattern.path.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={player.color || '#10B981'}
                  strokeWidth="2"
                  markerEnd={`url(#movement-arrow-${pattern.id})`}
                  strokeDasharray="3,3"
                  opacity="0.7"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="6"
                    to="0"
                    dur="0.5s"
                    repeatCount="indefinite"
                  />
                </polyline>
                {pattern.path.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill={player.color || '#10B981'}
                    opacity="0.5"
                  />
                ))}
              </svg>
            );
          })}

          {/* 描画中のパス */}
          {isDrawingPath && currentPath.length > 0 && (
            <svg
              className="absolute pointer-events-none"
              style={{
                left: COURT_PADDING,
                top: COURT_PADDING,
                width: COURT_WIDTH,
                height: COURT_HEIGHT
              }}
            >
              <polyline
                points={currentPath.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
              />
              {currentPath.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill="#3B82F6"
                />
              ))}
            </svg>
          )}

          {/* ショット描画中のライン */}
          {shotStart && drawMode === 'shot' && (
            <svg
              className="absolute pointer-events-none"
              style={{
                left: COURT_PADDING,
                top: COURT_PADDING,
                width: COURT_WIDTH,
                height: COURT_HEIGHT
              }}
            >
              <circle cx={shotStart.x} cy={shotStart.y} r="8" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
              <text
                x={shotStart.x}
                y={shotStart.y - 15}
                fill="#D84315"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
              >
                開始点
              </text>
            </svg>
          )}

          {/* プレイヤーマーカー */}
          {playerPositions.map(renderPlayerMarker)}

          {/* 装備マーカー */}
          {equipmentPositions.map(renderEquipmentMarker)}
        </div>
      </div>

      {/* 詳細設定パネル */}
      {selectedItem && (
        <div className="w-64 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm">詳細設定</h3>
            <button
              onClick={() => {
                deleteItem(selectedItem);
                const shot = shotTrajectories.find(s => s.id === selectedItem);
                if (shot) {
                  setShotTrajectories(prev => prev.filter(s => s.id !== selectedItem));
                  updateVisualInfo();
                }
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              削除
            </button>
          </div>

          {/* 選択されたアイテムの詳細設定フォーム */}
          <SelectedItemSettings
            selectedItem={selectedItem}
            playerPositions={playerPositions}
            equipmentPositions={equipmentPositions}
            shotTrajectories={shotTrajectories}
            onUpdatePlayer={(id, updates) => {
              setPlayerPositions(prev => 
                prev.map(p => p.id === id ? { ...p, ...updates } : p)
              );
              updateVisualInfo();
            }}
            onUpdateEquipment={(id, updates) => {
              setEquipmentPositions(prev => 
                prev.map(e => e.id === id ? { ...e, ...updates } : e)
              );
              updateVisualInfo();
            }}
            onUpdateShot={(id, updates) => {
              setShotTrajectories(prev => 
                prev.map(s => s.id === id ? { ...s, ...updates } : s)
              );
              updateVisualInfo();
            }}
            onDeleteShot={(id) => {
              setShotTrajectories(prev => prev.filter(s => s.id !== id));
              updateVisualInfo();
            }}
          />
        </div>
      )}
    </div>
  );
};

// 選択されたアイテムの設定コンポーネント
interface SelectedItemSettingsProps {
  selectedItem: string;
  playerPositions: PlayerPosition[];
  equipmentPositions: EquipmentPosition[];
  shotTrajectories: ShotTrajectory[];
  onUpdatePlayer: (id: string, updates: Partial<PlayerPosition>) => void;
  onUpdateEquipment: (id: string, updates: Partial<EquipmentPosition>) => void;
  onUpdateShot: (id: string, updates: Partial<ShotTrajectory>) => void;
  onDeleteShot: (id: string) => void;
}

const SelectedItemSettings: React.FC<SelectedItemSettingsProps> = ({
  selectedItem,
  playerPositions,
  equipmentPositions,
  shotTrajectories,
  onUpdatePlayer,
  onUpdateEquipment,
  onUpdateShot,
  onDeleteShot
}) => {
  const player = playerPositions.find(p => p.id === selectedItem);
  const equipment = equipmentPositions.find(e => e.id === selectedItem);
  const shot = shotTrajectories.find(s => s.id === selectedItem);

  if (player) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ラベル</label>
          <input
            type="text"
            value={player.label}
            onChange={(e) => onUpdatePlayer(player.id, { label: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">役割</label>
          <select
            value={player.role || 'player'}
            onChange={(e) => onUpdatePlayer(player.id, { role: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="player">プレイヤー</option>
            <option value="opponent">相手</option>
            <option value="coach">コーチ</option>
            <option value="feeder">フィーダー</option>
            <option value="knocker">ノッカー</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">色</label>
          <input
            type="color"
            value={player.color || '#10B981'}
            onChange={(e) => onUpdatePlayer(player.id, { color: e.target.value })}
            className="w-full h-10 rounded-md cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">X座標</label>
            <input
              type="number"
              value={player.x}
              onChange={(e) => onUpdatePlayer(player.id, { x: Number(e.target.value) })}
              min={0}
              max={COURT_WIDTH}
              step={GRID_SIZE}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Y座標</label>
            <input
              type="number"
              value={player.y}
              onChange={(e) => onUpdatePlayer(player.id, { y: Number(e.target.value) })}
              min={0}
              max={COURT_HEIGHT}
              step={GRID_SIZE}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">向き</label>
          <select
            value={player.direction || 'north'}
            onChange={(e) => onUpdatePlayer(player.id, { direction: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="north">北（↑）</option>
            <option value="northeast">北東（↗）</option>
            <option value="east">東（→）</option>
            <option value="southeast">南東（↘）</option>
            <option value="south">南（↓）</option>
            <option value="southwest">南西（↙）</option>
            <option value="west">西（←）</option>
            <option value="northwest">北西（↖）</option>
          </select>
        </div>
      </div>
    );
  }

  if (equipment) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ラベル</label>
          <input
            type="text"
            value={equipment.label || ''}
            onChange={(e) => onUpdateEquipment(equipment.id, { label: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">タイプ</label>
          <select
            value={equipment.type}
            onChange={(e) => onUpdateEquipment(equipment.id, { type: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="cone">コーン</option>
            <option value="shuttle">シャトル</option>
            <option value="target">ターゲット</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">色</label>
          <input
            type="color"
            value={equipment.color || '#F59E0B'}
            onChange={(e) => onUpdateEquipment(equipment.id, { color: e.target.value })}
            className="w-full h-10 rounded-md cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">X座標</label>
            <input
              type="number"
              value={equipment.x}
              onChange={(e) => onUpdateEquipment(equipment.id, { x: Number(e.target.value) })}
              min={0}
              max={COURT_WIDTH}
              step={GRID_SIZE}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Y座標</label>
            <input
              type="number"
              value={equipment.y}
              onChange={(e) => onUpdateEquipment(equipment.id, { y: Number(e.target.value) })}
              min={0}
              max={COURT_HEIGHT}
              step={GRID_SIZE}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  if (shot) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ショットタイプ</label>
          <select
            value={shot.shotType}
            onChange={(e) => onUpdateShot(shot.id, { shotType: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="clear">クリア</option>
            <option value="smash">スマッシュ</option>
            <option value="drop">ドロップ</option>
            <option value="drive">ドライブ</option>
            <option value="net">ネット</option>
            <option value="lift">ロブ</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">開始X</label>
            <input
              type="number"
              value={shot.from.x}
              onChange={(e) => onUpdateShot(shot.id, { from: { ...shot.from, x: Number(e.target.value) } })}
              min={0}
              max={COURT_WIDTH}
              step={GRID_SIZE}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">開始Y</label>
            <input
              type="number"
              value={shot.from.y}
              onChange={(e) => onUpdateShot(shot.id, { from: { ...shot.from, y: Number(e.target.value) } })}
              min={0}
              max={COURT_HEIGHT}
              step={GRID_SIZE}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">終了X</label>
            <input
              type="number"
              value={shot.to.x}
              onChange={(e) => onUpdateShot(shot.id, { to: { ...shot.to, x: Number(e.target.value) } })}
              min={0}
              max={COURT_WIDTH}
              step={GRID_SIZE}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">終了Y</label>
            <input
              type="number"
              value={shot.to.y}
              onChange={(e) => onUpdateShot(shot.id, { to: { ...shot.to, y: Number(e.target.value) } })}
              min={0}
              max={COURT_HEIGHT}
              step={GRID_SIZE}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">説明（オプション）</label>
          <input
            type="text"
            value={shot.description || ''}
            onChange={(e) => onUpdateShot(shot.id, { description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="例: 深いクリアで相手を後方に押し込む"
          />
        </div>
      </div>
    );
  }

  return null;
};

export default PracticeCardVisualEditor;