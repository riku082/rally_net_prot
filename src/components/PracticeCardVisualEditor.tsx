import React, { useState, useEffect, useRef } from 'react';
import { ShotTrajectory, PracticeCard, PracticeMenuType } from '@/types/practice';
import { FaTrash, FaUndo, FaRedo, FaDrawPolygon, FaEraser } from 'react-icons/fa';
import { GiShuttlecock, GiTennisBall, GiFeather } from 'react-icons/gi';
import { MdSportsBaseball } from 'react-icons/md';

interface PracticeCardVisualEditorProps {
  visualInfo: Partial<PracticeCard['visualInfo']>;
  onUpdate: (visualInfo: Partial<PracticeCard['visualInfo']>) => void;
  practiceMenuType?: PracticeMenuType;
  practiceType?: string;
}

// 拡大されたコートサイズ (1m = 50px)
const COURT_WIDTH = 305;  // 6.1m = 305px
const COURT_HEIGHT = 670; // 13.4m = 670px
const NET_POSITION = COURT_HEIGHT / 2; // 335px
const SHORT_SERVICE_LINE = NET_POSITION - 99; // 1.98m = 99px
const LONG_SERVICE_LINE_SINGLES = NET_POSITION + 240; // 4.72m from net = 236px (singles)
const LONG_SERVICE_LINE_DOUBLES = NET_POSITION + 190; // 3.96m from net = 198px (doubles)
const SIDE_ALLEY_WIDTH = 22; // 0.42m = 21px

export default function PracticeCardVisualEditor({
  visualInfo,
  onUpdate,
  practiceMenuType,
  practiceType
}: PracticeCardVisualEditorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShot, setCurrentShot] = useState<{ from: { x: number; y: number } } | null>(null);
  const [selectedShotType, setSelectedShotType] = useState<string>('');
  const [currentSequenceNumber, setCurrentSequenceNumber] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<'player' | 'opponent'>('player');
  const [isAreaSelectionMode, setIsAreaSelectionMode] = useState(false);
  const [isSelectingArea, setIsSelectingArea] = useState(false);
  const [areaStart, setAreaStart] = useState<{ x: number; y: number } | null>(null);
  const [currentArea, setCurrentArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isMultipleShotMode, setIsMultipleShotMode] = useState(false);
  const [pendingShot, setPendingShot] = useState<{ from: { x: number; y: number } } | null>(null);
  const [pendingShotLandingPoints, setPendingShotLandingPoints] = useState<{ x: number; y: number }[]>([]);
  const [actionHistory, setActionHistory] = useState<any[]>([]);
  const [redoHistory, setRedoHistory] = useState<any[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // コート上の座標を取得
  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const screenCTM = svg.getScreenCTM();
    if (screenCTM) {
      const svgP = pt.matrixTransform(screenCTM.inverse());
      return { x: svgP.x, y: svgP.y };
    }
    return { x: 0, y: 0 };
  };

  // ショットタイプの設定
  const shotTypes = practiceMenuType === 'basic' 
    ? ['クリア', 'ドロップ', 'スマッシュ', 'ヘアピン', 'プッシュ', 'ドライブ']
    : practiceMenuType === 'footwork'
    ? ['フットワーク']
    : ['クリア', 'ドロップ', 'スマッシュ', 'ヘアピン', 'プッシュ', 'ドライブ', 'サーブ', 'レシーブ'];

  // ショットの色を取得
  const getShotColor = (shot: ShotTrajectory) => {
    if (practiceType === 'knock_practice') {
      // ノック練習の場合
      const sourcePlayer = visualInfo.players?.find(p => 
        Math.abs(p.position.x - shot.from.x) < 20 && 
        Math.abs(p.position.y - shot.from.y) < 20
      );
      return sourcePlayer?.role === 'knocker' ? '#3B82F6' : '#10B981';
    } else if (practiceType === 'pattern_practice') {
      // パターン練習の場合
      const isFromOpponentCourt = shot.from.y < NET_POSITION;
      return isFromOpponentCourt ? '#EF4444' : '#10B981';
    }
    return '#3B82F6'; // デフォルト
  };

  // 新しいショットを追加
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isAreaSelectionMode) {
      const coords = getCoordinates(e);
      setIsSelectingArea(true);
      setAreaStart(coords);
      setCurrentArea({ x: coords.x, y: coords.y, width: 0, height: 0 });
      return;
    }

    if (!selectedShotType) return;

    const coords = getCoordinates(e);
    
    // エリアが選択されている場合、エリア内のクリックかチェック
    if (selectedArea && !isMultipleShotMode) {
      const isInArea = coords.x >= selectedArea.x && 
                       coords.x <= selectedArea.x + selectedArea.width &&
                       coords.y >= selectedArea.y && 
                       coords.y <= selectedArea.y + selectedArea.height;
      if (!isInArea) return;
    }

    if (isMultipleShotMode && !pendingShot) {
      // 複数ショットモード：開始点を設定
      setPendingShot({ from: coords });
    } else if (isMultipleShotMode && pendingShot) {
      // 複数ショットモード：着地点を追加
      setPendingShotLandingPoints(prev => [...prev, coords]);
    } else {
      // 通常モード
      setIsDrawing(true);
      setCurrentShot({ from: coords });
    }
  };

  // ショットの終点を設定
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isSelectingArea && areaStart) {
      const coords = getCoordinates(e);
      const width = coords.x - areaStart.x;
      const height = coords.y - areaStart.y;
      setCurrentArea({
        x: width >= 0 ? areaStart.x : coords.x,
        y: height >= 0 ? areaStart.y : coords.y,
        width: Math.abs(width),
        height: Math.abs(height)
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isSelectingArea) {
      setIsSelectingArea(false);
      if (currentArea && currentArea.width > 10 && currentArea.height > 10) {
        setSelectedArea(currentArea);
      }
      setCurrentArea(null);
      return;
    }

    if (!isDrawing || !currentShot || !selectedShotType) return;

    const coords = getCoordinates(e);
    
    // 同じ点でのクリックは無視
    if (Math.abs(coords.x - currentShot.from.x) < 5 && Math.abs(coords.y - currentShot.from.y) < 5) {
      setIsDrawing(false);
      setCurrentShot(null);
      return;
    }

    const newShot: ShotTrajectory = {
      id: `shot-${Date.now()}`,
      from: currentShot.from,
      to: coords,
      shotType: selectedShotType,
      order: (visualInfo.shotTrajectories?.length || 0) + 1,
      sequenceNumber: currentSequenceNumber
    };

    // アクション履歴に追加
    setActionHistory(prev => [...prev, {
      type: 'add_shot',
      data: newShot
    }]);
    setRedoHistory([]);

    onUpdate({
      ...visualInfo,
      shotTrajectories: [...(visualInfo.shotTrajectories || []), newShot]
    });

    setIsDrawing(false);
    setCurrentShot(null);
  };

  // ショットを削除
  const handleDeleteShot = (shotId: string) => {
    const shotToDelete = visualInfo.shotTrajectories?.find(s => s.id === shotId);
    if (shotToDelete) {
      setActionHistory(prev => [...prev, {
        type: 'delete_shot',
        data: shotToDelete
      }]);
      setRedoHistory([]);
    }

    onUpdate({
      ...visualInfo,
      shotTrajectories: visualInfo.shotTrajectories?.filter(s => s.id !== shotId) || []
    });
  };

  // プレイヤーを追加
  const handleAddPlayer = (role: 'player' | 'opponent' | 'knocker', position: { x: number; y: number }) => {
    const newPlayer = {
      id: `player-${Date.now()}`,
      name: role === 'knocker' ? 'ノッカー' : role === 'player' ? 'プレイヤー' : '相手',
      position,
      role
    };

    onUpdate({
      ...visualInfo,
      players: [...(visualInfo.players || []), newPlayer]
    });
  };

  // プレイヤーを削除
  const handleDeletePlayer = (playerId: string) => {
    onUpdate({
      ...visualInfo,
      players: visualInfo.players?.filter(p => p.id !== playerId) || []
    });
  };

  // プレイヤーをドラッグ
  const handlePlayerDrag = (playerId: string, newPosition: { x: number; y: number }) => {
    onUpdate({
      ...visualInfo,
      players: visualInfo.players?.map(p => 
        p.id === playerId ? { ...p, position: newPosition } : p
      ) || []
    });
  };

  // クリア
  const handleClear = () => {
    setActionHistory(prev => [...prev, {
      type: 'clear_all',
      data: {
        shotTrajectories: visualInfo.shotTrajectories,
        players: visualInfo.players
      }
    }]);
    setRedoHistory([]);

    onUpdate({
      shotTrajectories: [],
      players: []
    });
    setCurrentSequenceNumber(1);
    setSelectedArea(null);
    setPendingShot(null);
    setPendingShotLandingPoints([]);
  };

  // Undo機能
  const handleUndo = () => {
    if (actionHistory.length === 0) return;

    const lastAction = actionHistory[actionHistory.length - 1];
    setRedoHistory(prev => [...prev, lastAction]);

    switch (lastAction.type) {
      case 'add_shot':
        onUpdate({
          ...visualInfo,
          shotTrajectories: visualInfo.shotTrajectories?.filter(s => s.id !== lastAction.data.id) || []
        });
        break;
      case 'delete_shot':
        onUpdate({
          ...visualInfo,
          shotTrajectories: [...(visualInfo.shotTrajectories || []), lastAction.data]
        });
        break;
      case 'clear_all':
        onUpdate(lastAction.data);
        break;
    }

    setActionHistory(prev => prev.slice(0, -1));
  };

  const handlePracticeTypeClick = (type: PracticeMenuType) => {
    window.dispatchEvent(new CustomEvent('selectPracticeType', { detail: { type } }));
  };

  // ノック練習での複数ショット処理
  const handleMultipleShotComplete = () => {
    if (pendingShot && pendingShotLandingPoints.length > 0) {
      const shots = pendingShotLandingPoints.map((point, index) => ({
        id: `shot-${Date.now()}-${index}`,
        from: pendingShot.from,
        to: point,
        shotType: selectedShotType,
        order: (visualInfo.shotTrajectories?.length || 0) + index + 1,
        sequenceNumber: currentSequenceNumber
      }));
      
      onUpdate({
        ...visualInfo,
        shotTrajectories: [...(visualInfo.shotTrajectories || []), ...shots]
      });

      // リセット
      setPendingShot(null);
      setPendingShotLandingPoints([]);
      setCurrentSequenceNumber(prev => prev + 1);
    }
  };

  // 複数ショットモードのキャンセル
  const handleMultipleShotCancel = () => {
    setPendingShot(null);
    setPendingShotLandingPoints([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">ビジュアル編集</h3>
      
      {/* ツールバー */}
      <div className="mb-4 space-y-4">
        {/* ショットタイプ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ショットタイプ
          </label>
          <div className="flex flex-wrap gap-2">
            {shotTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedShotType(type)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedShotType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* プレイヤー選択（ノック練習以外） */}
        {practiceType !== 'knock_practice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ショット元
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPlayer('player')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlayer === 'player'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                プレイヤー
              </button>
              <button
                onClick={() => setSelectedPlayer('opponent')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPlayer === 'opponent'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                相手
              </button>
            </div>
          </div>
        )}

        {/* 特殊モード */}
        {practiceType === 'knock_practice' && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsMultipleShotMode(!isMultipleShotMode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isMultipleShotMode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              複数ショットモード
            </button>
            {isMultipleShotMode && pendingShot && (
              <>
                <button
                  onClick={handleMultipleShotComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  完了 ({pendingShotLandingPoints.length}点)
                </button>
                <button
                  onClick={handleMultipleShotCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>
        )}

        {/* エリア選択モード */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsAreaSelectionMode(!isAreaSelectionMode);
              setSelectedArea(null);
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              isAreaSelectionMode
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaDrawPolygon />
            エリア選択
          </button>
          {selectedArea && (
            <button
              onClick={() => setSelectedArea(null)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 flex items-center gap-2"
            >
              <FaEraser />
              エリア解除
            </button>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-2">
          <button
            onClick={handleUndo}
            disabled={actionHistory.length === 0}
            className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="元に戻す"
          >
            <FaUndo />
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-2"
          >
            <FaTrash />
            クリア
          </button>
        </div>

        {/* シーケンス番号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            シーケンス番号: {currentSequenceNumber}
          </label>
          <button
            onClick={() => setCurrentSequenceNumber(prev => prev + 1)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            次のシーケンス
          </button>
        </div>
      </div>

      {/* コートビジュアライザー */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="670"
          viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`}
          className="bg-green-50"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isAreaSelectionMode ? 'crosshair' : selectedShotType ? 'crosshair' : 'default' }}
        >
          {/* コートの線 */}
          {/* 外枠 */}
          <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="none" stroke="#333" strokeWidth="3" />
          
          {/* ネット */}
          <line x1="0" y1={NET_POSITION} x2={COURT_WIDTH} y2={NET_POSITION} stroke="#333" strokeWidth="4" />
          <rect x="0" y={NET_POSITION - 38} width={COURT_WIDTH} height="76" fill="rgba(0,0,0,0.1)" />
          
          {/* ショートサービスライン */}
          <line x1="0" y1={SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={SHORT_SERVICE_LINE} stroke="#333" strokeWidth="2" />
          <line x1="0" y1={COURT_HEIGHT - SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={COURT_HEIGHT - SHORT_SERVICE_LINE} stroke="#333" strokeWidth="2" />
          
          {/* ロングサービスライン（ダブルス） */}
          <line x1="0" y1={LONG_SERVICE_LINE_DOUBLES} x2={COURT_WIDTH} y2={LONG_SERVICE_LINE_DOUBLES} stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="0" y1={COURT_HEIGHT - LONG_SERVICE_LINE_DOUBLES} x2={COURT_WIDTH} y2={COURT_HEIGHT - LONG_SERVICE_LINE_DOUBLES} stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
          
          {/* ロングサービスライン（シングルス） */}
          <line x1={SIDE_ALLEY_WIDTH} y1={LONG_SERVICE_LINE_SINGLES} x2={COURT_WIDTH - SIDE_ALLEY_WIDTH} y2={LONG_SERVICE_LINE_SINGLES} stroke="#333" strokeWidth="2" />
          <line x1={SIDE_ALLEY_WIDTH} y1={COURT_HEIGHT - LONG_SERVICE_LINE_SINGLES} x2={COURT_WIDTH - SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT - LONG_SERVICE_LINE_SINGLES} stroke="#333" strokeWidth="2" />
          
          {/* センターライン */}
          <line x1={COURT_WIDTH / 2} y1="0" x2={COURT_WIDTH / 2} y2={COURT_HEIGHT} stroke="#333" strokeWidth="2" />
          
          {/* サイドライン（シングルス） */}
          <line x1={SIDE_ALLEY_WIDTH} y1="0" x2={SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
          <line x1={COURT_WIDTH - SIDE_ALLEY_WIDTH} y1="0" x2={COURT_WIDTH - SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="#333" strokeWidth="2" strokeDasharray="5,5" />

          {/* エリア選択表示 */}
          {currentArea && (
            <rect
              x={currentArea.x}
              y={currentArea.y}
              width={currentArea.width}
              height={currentArea.height}
              fill="rgba(99, 102, 241, 0.2)"
              stroke="rgb(99, 102, 241)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
          {selectedArea && (
            <rect
              x={selectedArea.x}
              y={selectedArea.y}
              width={selectedArea.width}
              height={selectedArea.height}
              fill="rgba(99, 102, 241, 0.1)"
              stroke="rgb(99, 102, 241)"
              strokeWidth="2"
            />
          )}

          {/* 既存のショット */}
          {visualInfo.shotTrajectories?.map(shot => (
            <g key={shot.id}>
              <line
                x1={shot.from.x}
                y1={shot.from.y}
                x2={shot.to.x}
                y2={shot.to.y}
                stroke={getShotColor(shot)}
                strokeWidth="3"
                markerEnd="url(#arrowhead)"
                className="cursor-pointer hover:stroke-opacity-70"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteShot(shot.id);
                }}
              />
              {/* ショットタイプラベル */}
              <text
                x={(shot.from.x + shot.to.x) / 2}
                y={(shot.from.y + shot.to.y) / 2 - 5}
                textAnchor="middle"
                fill={getShotColor(shot)}
                fontSize="12"
                fontWeight="bold"
              >
                {shot.shotType}
              </text>
              {/* シーケンス番号 */}
              {shot.sequenceNumber && (
                <circle
                  cx={shot.from.x}
                  cy={shot.from.y}
                  r="12"
                  fill="white"
                  stroke={getShotColor(shot)}
                  strokeWidth="2"
                />
              )}
              {shot.sequenceNumber && (
                <text
                  x={shot.from.x}
                  y={shot.from.y + 4}
                  textAnchor="middle"
                  fill={getShotColor(shot)}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {shot.sequenceNumber}
                </text>
              )}
            </g>
          ))}

          {/* プレイヤー */}
          {visualInfo.players?.map(player => (
            <g
              key={player.id}
              className="cursor-move"
              onMouseDown={(e) => {
                e.stopPropagation();
                // ドラッグ処理を開始
              }}
            >
              <circle
                cx={player.position.x}
                cy={player.position.y}
                r="15"
                fill={player.role === 'knocker' ? '#3B82F6' : player.role === 'player' ? '#10B981' : '#EF4444'}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={player.position.x}
                y={player.position.y + 25}
                textAnchor="middle"
                fill="#333"
                fontSize="12"
                fontWeight="bold"
              >
                {player.name}
              </text>
            </g>
          ))}

          {/* 複数ショットモードの表示 */}
          {isMultipleShotMode && pendingShot && (
            <>
              <circle
                cx={pendingShot.from.x}
                cy={pendingShot.from.y}
                r="8"
                fill="#8B5CF6"
                stroke="white"
                strokeWidth="2"
              />
              {pendingShotLandingPoints.map((point, index) => (
                <g key={index}>
                  <line
                    x1={pendingShot.from.x}
                    y1={pendingShot.from.y}
                    x2={point.x}
                    y2={point.y}
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill="#8B5CF6"
                    stroke="white"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </>
          )}

          {/* 矢印の定義 */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#333"
              />
            </marker>
          </defs>
        </svg>
      </div>

      {/* プレイヤー配置（ノック練習の場合） */}
      {practiceType === 'knock_practice' && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">プレイヤー配置</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleAddPlayer('knocker', { x: COURT_WIDTH / 2, y: 50 })}
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              ノッカーを追加
            </button>
            <button
              onClick={() => handleAddPlayer('player', { x: COURT_WIDTH / 2, y: COURT_HEIGHT - 50 })}
              className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              プレイヤーを追加
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            プレイヤーをクリックして削除、ドラッグして移動できます
          </p>
        </div>
      )}

      {/* 使い方の説明 */}
      <div className="mt-4 text-sm text-gray-600">
        <p>1. ショットタイプを選択</p>
        <p>2. コート上でドラッグしてショットを追加</p>
        <p>3. ショットをクリックして削除</p>
        {practiceType === 'knock_practice' && (
          <p>4. 複数ショットモード: 開始点をクリック → 複数の着地点をクリック → 完了</p>
        )}
      </div>
    </div>
  );
}