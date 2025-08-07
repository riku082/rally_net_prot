'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayerPosition, 
  ShotTrajectory, 
  PracticeVisualInfo,
  PracticeMenuType 
} from '@/types/practice';
import { FiChevronLeft, FiTarget, FiMapPin } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';
import { MdSportsBaseball, MdPerson } from 'react-icons/md';
import { FaUndo, FaCheck, FaTrash } from 'react-icons/fa';

interface PracticeCardVisualEditorProps {
  visualInfo: PracticeVisualInfo;
  practiceType?: PracticeMenuType;
  onUpdate: (visualInfo: PracticeVisualInfo) => void;
  courtType?: 'singles' | 'doubles';
  currentStep?: number;
}

// コート寸法（ピクセル）- 実際の比率に基づく
const COURT_WIDTH = 244;  // 6.1m (縮小サイズ)
const COURT_HEIGHT = 536; // 13.4m (縮小サイズ)
const COURT_PADDING = 30;

// バドミントンコートの正確な寸法（縮小版）
const NET_POSITION = COURT_HEIGHT / 2;
const SHORT_SERVICE_LINE = 79; // ネットから1.98m
const BACK_BOUNDARY_LINE_SINGLES = 30; // エンドラインから0.76m内側
const SIDE_ALLEY_WIDTH = 17; // サイドアレー幅0.42m

// コートエリアの9分割定義
const COURT_AREAS = [
  { id: 'fl', name: '前左', x: 0, y: 0, w: COURT_WIDTH/3, h: COURT_HEIGHT/3 },
  { id: 'fc', name: '前中', x: COURT_WIDTH/3, y: 0, w: COURT_WIDTH/3, h: COURT_HEIGHT/3 },
  { id: 'fr', name: '前右', x: 2*COURT_WIDTH/3, y: 0, w: COURT_WIDTH/3, h: COURT_HEIGHT/3 },
  { id: 'ml', name: '中左', x: 0, y: COURT_HEIGHT/3, w: COURT_WIDTH/3, h: COURT_HEIGHT/3 },
  { id: 'mc', name: '中央', x: COURT_WIDTH/3, y: COURT_HEIGHT/3, w: COURT_WIDTH/3, h: COURT_HEIGHT/3 },
  { id: 'mr', name: '中右', x: 2*COURT_WIDTH/3, y: COURT_HEIGHT/3, w: COURT_WIDTH/3, h: COURT_HEIGHT/3 },
  { id: 'bl', name: '後左', x: 0, y: 2*COURT_HEIGHT/3, w: COURT_WIDTH/3, h: COURT_HEIGHT/3 },
  { id: 'bc', name: '後中', x: COURT_WIDTH/3, y: 2*COURT_HEIGHT/3, w: COURT_WIDTH/3, h: COURT_HEIGHT/3 },
  { id: 'br', name: '後右', x: 2*COURT_WIDTH/3, y: 2*COURT_HEIGHT/3, w: COURT_WIDTH/3, h: COURT_HEIGHT/3 },
];

// ショットタイプ定義
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

const PracticeCardVisualEditor: React.FC<PracticeCardVisualEditorProps> = ({
  visualInfo,
  practiceType = 'knock_practice',
  onUpdate,
  courtType = 'singles',
  currentStep
}) => {
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>(visualInfo.playerPositions || []);
  const [shotTrajectories, setShotTrajectories] = useState<ShotTrajectory[]>(visualInfo.shotTrajectories || []);
  const [inputMode, setInputMode] = useState<'setup' | 'shot'>('setup');
  const [shotInputMode, setIshotInputMode] = useState<'pinpoint' | 'area'>('pinpoint');
  const [currentShot, setCurrentShot] = useState<{ from?: PlayerPosition; areas?: string[]; points?: {x: number, y: number}[] }>({});
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<{x: number, y: number}[]>([]);
  const [currentShotNumber, setCurrentShotNumber] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true); // 連続入力モード
  const [selectedShotType, setSelectedShotType] = useState<string>('clear'); // デフォルトでクリアを選択
  const [playerCounter, setPlayerCounter] = useState(1);
  const [knockerCounter, setKnockerCounter] = useState(1);
  const [coneCounter, setConeCounter] = useState(1);
  const courtRef = useRef<HTMLDivElement>(null);

  // 初期配置
  useEffect(() => {
    if (practiceType && playerPositions.length === 0) {
      const defaults = getDefaultPositions(practiceType);
      setPlayerPositions(defaults);
    }
  }, [practiceType]);
  

  // プレイヤー位置とショット軌道の変更を監視して更新
  useEffect(() => {
    // 実際に値が変更された場合のみ更新
    const hasPlayerChanges = JSON.stringify(playerPositions) !== JSON.stringify(visualInfo.playerPositions || []);
    const hasShotChanges = JSON.stringify(shotTrajectories) !== JSON.stringify(visualInfo.shotTrajectories || []);
    
    if ((playerPositions.length > 0 || shotTrajectories.length > 0) && (hasPlayerChanges || hasShotChanges)) {
      onUpdate({
        ...visualInfo,
        playerPositions,
        shotTrajectories
      });
    }
  }, [playerPositions, shotTrajectories]);

  // デフォルトポジション取得
  const getDefaultPositions = (type: PracticeMenuType): PlayerPosition[] => {
    if (type === 'knock_practice') {
      return [
        { id: 'knocker', x: COURT_WIDTH/2, y: 50, label: 'ノッカー', role: 'knocker', color: '#3B82F6' },
        { id: 'player1', x: COURT_WIDTH/2, y: COURT_HEIGHT - 50, label: 'プレイヤー', role: 'player', color: '#10B981' }
      ];
    } else {
      return [
        { id: 'player1', x: COURT_WIDTH/2 - 40, y: COURT_HEIGHT - 50, label: 'P1', role: 'player', color: '#10B981' },
        { id: 'player2', x: COURT_WIDTH/2 + 40, y: COURT_HEIGHT - 50, label: 'P2', role: 'player', color: '#10B981' },
        { id: 'opponent1', x: COURT_WIDTH/2 - 40, y: 50, label: 'O1', role: 'opponent', color: '#EF4444' },
        { id: 'opponent2', x: COURT_WIDTH/2 + 40, y: 50, label: 'O2', role: 'opponent', color: '#EF4444' }
      ];
    }
  };


  // プレイヤー位置のドラッグ処理
  const handlePlayerDrag = (e: React.DragEvent, player: PlayerPosition) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('playerId', player.id);
  };

  const handlePlayerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData('playerId');
    if (!playerId || !courtRef.current) return;

    const rect = courtRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - COURT_PADDING;
    const y = e.clientY - rect.top - COURT_PADDING;

    if (x < 0 || x > COURT_WIDTH || y < 0 || y > COURT_HEIGHT) return;

    setPlayerPositions(prev => 
      prev.map(p => p.id === playerId ? { ...p, x, y } : p)
    );
  };

  // コート上のクリック処理
  const handleCourtClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (inputMode !== 'shot' || !courtRef.current) return;

    const rect = courtRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - COURT_PADDING;
    const y = e.clientY - rect.top - COURT_PADDING;

    if (x < 0 || x > COURT_WIDTH || y < 0 || y > COURT_HEIGHT) return;

    if (shotInputMode === 'pinpoint') {
      if (practiceType === 'knock_practice') {
        if (!isWaitingForPlayer) {
          // ノック練習: ノッカーからの配球
          const knocker = playerPositions.find(p => p.role === 'knocker');
          if (knocker) {
            saveToHistory();
            const newShot: ShotTrajectory = {
              id: `shot_${Date.now()}`,
              from: { x: knocker.x, y: knocker.y },
              to: { x, y },
              shotType: '',
              shotBy: 'knocker',
              order: currentShotNumber
            };
            setShotTrajectories([...shotTrajectories, newShot]);
            setCurrentShotNumber(currentShotNumber + 1);
            setIsWaitingForPlayer(true);
          }
        } else {
          // プレイヤーからの返球を設定
          setSelectedPoints([{x, y}]);
        }
      } else {
        // パターン練習
        if (!currentShot.from) {
          // 最初にクリックされた位置に最も近いプレイヤーを探す
          let nearestPlayer = playerPositions[0];
          let minDistance = Infinity;
          
          playerPositions.forEach(player => {
            const distance = Math.sqrt(Math.pow(player.x - x, 2) + Math.pow(player.y - y, 2));
            if (distance < minDistance) {
              minDistance = distance;
              nearestPlayer = player;
            }
          });
          
          if (nearestPlayer && minDistance < 50) {
            setCurrentShot({ from: nearestPlayer });
          }
        } else {
          setSelectedPoints([{x, y}]);
        }
      }
    }
  };

  // エリアクリック処理
  const handleAreaClick = (areaId: string) => {
    if (inputMode !== 'shot' || shotInputMode !== 'area') return;

    if (selectedAreas.includes(areaId)) {
      setSelectedAreas(selectedAreas.filter(a => a !== areaId));
    } else {
      setSelectedAreas([...selectedAreas, areaId]);
    }
  };

  // 一つ前に戻る
  const undoLastAction = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setShotTrajectories(lastState.shots);
    setCurrentShotNumber(lastState.shotNumber);
    setHistory(history.slice(0, -1));
  };

  // 履歴保存
  const saveToHistory = () => {
    setHistory([...history, {
      shots: [...shotTrajectories],
      shotNumber: currentShotNumber
    }]);
  };

  // コート上に新しいアイテムを追加
  const addItemToCourt = (type: 'player' | 'knocker' | 'cone') => {
    const centerX = COURT_WIDTH / 2;
    const centerY = COURT_HEIGHT / 2;
    
    let newItem: PlayerPosition;
    
    switch (type) {
      case 'player':
        newItem = {
          id: `player${playerCounter + 1}`,
          x: centerX + (Math.random() - 0.5) * 100,
          y: COURT_HEIGHT - 100 + (Math.random() - 0.5) * 50,
          label: `P${playerCounter + 1}`,
          role: 'player',
          color: '#10B981'
        };
        setPlayerCounter(playerCounter + 1);
        break;
      case 'knocker':
        newItem = {
          id: `knocker${knockerCounter + 1}`,
          x: centerX + (Math.random() - 0.5) * 100,
          y: 100 + (Math.random() - 0.5) * 50,
          label: `N${knockerCounter + 1}`,
          role: 'knocker',
          color: '#3B82F6'
        };
        setKnockerCounter(knockerCounter + 1);
        break;
      case 'cone':
        newItem = {
          id: `cone${coneCounter}`,
          x: centerX + (Math.random() - 0.5) * 150,
          y: centerY + (Math.random() - 0.5) * 150,
          label: `C${coneCounter}`,
          role: 'feeder',
          color: '#F59E0B'
        };
        setConeCounter(coneCounter + 1);
        break;
    }
    
    setPlayerPositions([...playerPositions, newItem]);
  };

  // アイテムの削除
  const removeItem = (itemId: string) => {
    setPlayerPositions(playerPositions.filter(p => p.id !== itemId));
  };

  // ショットタイプ選択後の処理
  const handleShotTypeSelect = (shotType: string) => {
    saveToHistory();
    
    if (selectedPoints.length > 0) {
      // ピンポイントモードでのショット追加
      if (isWaitingForPlayer) {
        // プレイヤーからの返球
        const player = playerPositions.find(p => p.role === 'player');
        if (player) {
          const newShots = selectedPoints.map((point, index) => ({
            id: `shot_${Date.now()}_${index}`,
            from: { x: player.x, y: player.y },
            to: point,
            shotType,
            shotBy: 'player' as const,
            order: currentShotNumber + index
          }));
          setShotTrajectories([...shotTrajectories, ...newShots]);
          setCurrentShotNumber(currentShotNumber + selectedPoints.length);
        }
      } else {
        // 通常のショット
        const newShots = selectedPoints.map((point, index) => ({
          id: `shot_${Date.now()}_${index}`,
          from: currentShot.from ? { x: currentShot.from.x, y: currentShot.from.y } : { x: 0, y: 0 },
          to: point,
          shotType,
          shotBy: currentShot.from?.role || 'player' as const,
          order: currentShotNumber + index
        }));
        setShotTrajectories([...shotTrajectories, ...newShots]);
        setCurrentShotNumber(currentShotNumber + selectedPoints.length);
      }
      
      setSelectedPoints([]);
      setCurrentShot({});
      setIsWaitingForPlayer(false);
      
    } else if (selectedAreas.length > 0) {
      // エリアモードでのショット追加
      selectedAreas.forEach((areaId, index) => {
        const area = COURT_AREAS.find(a => a.id === areaId);
        if (area) {
          let fromPos;
          if (isWaitingForPlayer) {
            const player = playerPositions.find(p => p.role === 'player');
            fromPos = player ? { x: player.x, y: player.y } : { x: 0, y: 0 };
          } else {
            fromPos = currentShot.from ? { x: currentShot.from.x, y: currentShot.from.y } : { x: 0, y: 0 };
          }
          
          const newShot: ShotTrajectory = {
            id: `shot_${Date.now()}_${index}`,
            from: fromPos,
            to: { x: area.x + area.w/2, y: area.y + area.h/2 },
            shotType,
            shotBy: isWaitingForPlayer ? 'player' : (currentShot.from?.role || 'player'),
            order: currentShotNumber + index,
            targetArea: area.id
          };
          setShotTrajectories([...shotTrajectories, newShot]);
        }
      });
      
      setCurrentShotNumber(currentShotNumber + selectedAreas.length);
      setSelectedAreas([]);
      setCurrentShot({});
      setIsWaitingForPlayer(false);
    }
  };

  return (
    <div className="flex gap-4 h-full" onClick={(e) => e.stopPropagation()}>
      {/* コートエリア（左側） */}
      <div className="flex-1 flex items-center justify-center">
        <div 
          ref={courtRef}
          className="relative bg-green-50 rounded-lg shadow-lg cursor-crosshair"
          style={{ 
            width: COURT_WIDTH + COURT_PADDING * 2, 
            height: COURT_HEIGHT + COURT_PADDING * 2
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handlePlayerDrop}
          onClick={(e) => {
            e.stopPropagation();
            handleCourtClick(e);
          }}
        >
          {/* コート */}
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
            <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="#00897B" />
            
            {/* コートライン */}
            <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="none" stroke="white" strokeWidth="2" />
            
            {/* ネット */}
            <line x1="0" y1={NET_POSITION} x2={COURT_WIDTH} y2={NET_POSITION} stroke="#424242" strokeWidth="3" />
            
            {/* サービスライン */}
            <line x1="0" y1={NET_POSITION - SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={NET_POSITION - SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
            <line x1="0" y1={NET_POSITION + SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={NET_POSITION + SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
            
            {/* バックバウンダリーライン */}
            <line x1="0" y1={BACK_BOUNDARY_LINE_SINGLES} x2={COURT_WIDTH} y2={BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth="1.5" />
            <line x1="0" y1={COURT_HEIGHT - BACK_BOUNDARY_LINE_SINGLES} x2={COURT_WIDTH} y2={COURT_HEIGHT - BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth="1.5" />
            
            {/* センターライン */}
            <line x1={COURT_WIDTH / 2} y1="0" x2={COURT_WIDTH / 2} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />
            
            {/* サイドライン */}
            <line x1={SIDE_ALLEY_WIDTH} y1="0" x2={SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" strokeDasharray="5,5" />
            <line x1={COURT_WIDTH - SIDE_ALLEY_WIDTH} y1="0" x2={COURT_WIDTH - SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" strokeDasharray="5,5" />

            {/* エリア選択モード時のガイド表示 */}
            {inputMode === 'shot' && shotInputMode === 'area' && (
              <g>
                {COURT_AREAS.map(area => (
                  <rect
                    key={area.id}
                    x={area.x}
                    y={area.y}
                    width={area.w}
                    height={area.h}
                    fill={selectedAreas.includes(area.id) ? '#FCD34D' : 'transparent'}
                    fillOpacity={0.3}
                    stroke="#FCD34D"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAreaClick(area.id);
                    }}
                  />
                ))}
              </g>
            )}
          </svg>

          {/* ショット軌道 */}
          {shotTrajectories.map((shot) => {
            const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
            const color = shot.shotBy === 'knocker' ? '#3B82F6' : (shotType?.color || '#10B981');
            
            return (
              <svg
                key={shot.id}
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
                  r="12"
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                />
                <text
                  x={shot.from.x + (shot.to.x - shot.from.x) / 2}
                  y={shot.from.y + (shot.to.y - shot.from.y) / 2 + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={color}
                >
                  {shot.order}
                </text>
              </svg>
            );
          })}

          {/* 選択中のポイント表示 */}
          {selectedPoints.map((point, index) => (
            <div
              key={index}
              className="absolute w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"
              style={{
                left: point.x + COURT_PADDING - 8,
                top: point.y + COURT_PADDING - 8
              }}
            />
          ))}

          {/* プレイヤー表示 */}
          {playerPositions.map(player => (
            <div
              key={player.id}
              draggable={inputMode === 'setup'}
              onDragStart={(e) => handlePlayerDrag(e, player)}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white cursor-move shadow-lg ${
                inputMode !== 'setup' ? 'cursor-default' : ''
              }`}
              style={{
                left: player.x + COURT_PADDING - 20,
                top: player.y + COURT_PADDING - 20,
                backgroundColor: player.color || '#10B981'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (inputMode === 'shot' && shotInputMode === 'pinpoint' && !currentShot.from && player.role !== 'feeder') {
                  setCurrentShot({ from: player });
                }
              }}
            >
              {player.role === 'knocker' ? (
                <MdSportsBaseball className="w-5 h-5" />
              ) : player.role === 'feeder' ? (
                <FiTarget className="w-5 h-5" />
              ) : (
                <MdPerson className="w-5 h-5" />
              )}
              <div className="absolute -bottom-6 text-xs font-medium text-gray-700 whitespace-nowrap">
                {player.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ツールボックス（右側） */}
      <div className="w-80 bg-gray-50 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto">
        {/* ヘッダー */}
        <div>
          <h3 className="text-lg font-bold mb-2">練習カード作成</h3>
          <div className="text-sm text-gray-600">
            {practiceType === 'knock_practice' ? 'ノック練習' : 'パターン練習'}
          </div>
        </div>

        {/* 入力モード切替 */}
        <div className="space-y-2">
          <div className="text-sm font-medium">入力モード</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInputMode('setup');
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                inputMode === 'setup' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MdPerson className="inline w-4 h-4 mr-1" />
              配置
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInputMode('shot');
              }}
              disabled={playerPositions.length === 0}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                inputMode === 'shot' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <GiShuttlecock className="inline w-4 h-4 mr-1" />
              ショット
            </button>
          </div>
        </div>

        {/* 配置モード */}
        {inputMode === 'setup' && (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">コートに追加するアイテム</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItemToCourt('player');
                  }}
                  className="p-4 bg-white border-2 border-green-300 rounded-lg hover:bg-green-50 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MdPerson className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium">プレイヤー</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItemToCourt('knocker');
                  }}
                  className="p-4 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <MdSportsBaseball className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium">ノッカー</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItemToCourt('cone');
                  }}
                  className="p-4 bg-white border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-all flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <FiTarget className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium">コーン</span>
                </button>
              </div>
            </div>

            {/* 配置済みアイテム */}
            <div className="space-y-2">
              <div className="text-sm font-medium">配置済みアイテム</div>
              <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
                {playerPositions.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">アイテムを追加してください</p>
                ) : (
                  <div className="space-y-2">
                    {playerPositions.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white" 
                            style={{ backgroundColor: item.color }}
                          >
                            {item.role === 'knocker' ? (
                              <MdSportsBaseball className="w-4 h-4" />
                            ) : item.role === 'feeder' ? (
                              <FiTarget className="w-4 h-4" />
                            ) : (
                              <MdPerson className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 配置完了ボタン */}
            {playerPositions.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInputMode('shot');
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
              >
                配置完了してショット入力へ →
              </button>
            )}
          </>
        )}

        {/* ショット入力モード */}
        {inputMode === 'shot' && (
          <>
            {/* 現在の状態表示 */}
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <div className="font-medium text-blue-800 mb-1">現在の入力状態</div>
              <div className="text-blue-600">
                {practiceType === 'knock_practice' ? (
                  isWaitingForPlayer ? 
                    '🎾 プレイヤーからの返球を設定してください' :
                    '🏸 ノッカーからの配球位置をクリック'
                ) : (
                  currentShot.from ? 
                    `👤 ${currentShot.from.label}からのショット着地点を選択` :
                    '👤 ショットを打つプレイヤーを選択'
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">着地点選択</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIshotInputMode('pinpoint');
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    shotInputMode === 'pinpoint' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiMapPin className="inline w-4 h-4 mr-1" />
                  ピンポイント
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIshotInputMode('area');
                  }}
                  disabled={practiceType === 'knock_practice' && !isWaitingForPlayer}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    shotInputMode === 'area' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <FiTarget className="inline w-4 h-4 mr-1" />
                  エリア
                </button>
              </div>
            </div>

            {/* ショットタイプ選択 */}
            {(selectedPoints.length > 0 || selectedAreas.length > 0) && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  ショットタイプ
                  {isWaitingForPlayer && <span className="text-xs text-purple-600 ml-2">(プレイヤー返球)</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {practiceType === 'knock_practice' && isWaitingForPlayer ? (
                    // ノック練習でプレイヤー返球時はショットタイプ選択必須
                    SHOT_TYPES.map(type => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShotTypeSelect(type.id);
                        }}
                        className="px-3 py-2 bg-white rounded-lg hover:bg-gray-100 text-sm font-medium border-2 transition-all"
                        style={{ borderColor: type.color }}
                      >
                        {type.name}
                      </button>
                    ))
                  ) : (
                    // その他の場合
                    <>
                      {SHOT_TYPES.map(type => (
                        <button
                          type="button"
                          key={type.id}
                          onClick={(e) => {
                          e.stopPropagation();
                          handleShotTypeSelect(type.id);
                        }}
                          className="px-3 py-2 bg-white rounded-lg hover:bg-gray-100 text-sm font-medium border"
                          style={{ borderColor: type.color }}
                        >
                          {type.name}
                        </button>
                      ))}
                      {practiceType === 'knock_practice' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShotTypeSelect('');
                          }}
                          className="col-span-2 px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium"
                        >
                          ショットタイプなし
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* アクションボタン */}
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              undoLastAction();
            }}
            disabled={history.length === 0}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <FaUndo className="inline w-4 h-4 mr-2" />
            一つ前に戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeCardVisualEditor;