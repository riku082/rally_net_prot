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
import ShotMemo from './ShotMemo';

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

// コートエリアの9分割定義（上下コート別々）
const HALF_COURT_HEIGHT = COURT_HEIGHT / 2;
const COURT_AREAS = [
  // 上側コート（相手側）
  { id: 'opp_fl', name: '相手前左', x: 0, y: 0, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'opp_fc', name: '相手前中', x: COURT_WIDTH/3, y: 0, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'opp_fr', name: '相手前右', x: 2*COURT_WIDTH/3, y: 0, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'opp_ml', name: '相手中左', x: 0, y: HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'opp_mc', name: '相手中央', x: COURT_WIDTH/3, y: HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'opp_mr', name: '相手中右', x: 2*COURT_WIDTH/3, y: HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'opp_bl', name: '相手後左', x: 0, y: 2*HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'opp_bc', name: '相手後中', x: COURT_WIDTH/3, y: 2*HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'opp_br', name: '相手後右', x: 2*COURT_WIDTH/3, y: 2*HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  // 下側コート（自分側）
  { id: 'own_fl', name: '自分前左', x: 0, y: HALF_COURT_HEIGHT, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'own_fc', name: '自分前中', x: COURT_WIDTH/3, y: HALF_COURT_HEIGHT, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'own_fr', name: '自分前右', x: 2*COURT_WIDTH/3, y: HALF_COURT_HEIGHT, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'own_ml', name: '自分中左', x: 0, y: HALF_COURT_HEIGHT + HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'own_mc', name: '自分中央', x: COURT_WIDTH/3, y: HALF_COURT_HEIGHT + HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'own_mr', name: '自分中右', x: 2*COURT_WIDTH/3, y: HALF_COURT_HEIGHT + HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'own_bl', name: '自分後左', x: 0, y: HALF_COURT_HEIGHT + 2*HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'own_bc', name: '自分後中', x: COURT_WIDTH/3, y: HALF_COURT_HEIGHT + 2*HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
  { id: 'own_br', name: '自分後右', x: 2*COURT_WIDTH/3, y: HALF_COURT_HEIGHT + 2*HALF_COURT_HEIGHT/3, w: COURT_WIDTH/3, h: HALF_COURT_HEIGHT/3 },
];

// ショットタイプ定義（イラスト付き）
const SHOT_TYPES = [
  { 
    id: 'clear', 
    name: 'クリア', 
    color: '#3B82F6',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
        <path d="M12 20 L12 4 M12 4 L8 8 M12 4 L16 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
      </svg>
    )
  },
  { 
    id: 'smash', 
    name: 'スマッシュ', 
    color: '#EF4444',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
        <path d="M4 4 L20 20 M20 20 L16 19 M20 20 L19 16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="4" cy="4" r="1.5" fill="currentColor"/>
      </svg>
    )
  },
  { 
    id: 'drop', 
    name: 'ドロップ', 
    color: '#10B981',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
        <path d="M6 6 Q12 12 12 20 M12 20 L10 18 M12 20 L14 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
      </svg>
    )
  },
  { 
    id: 'hairpin', 
    name: 'ヘアピン', 
    color: '#8B5CF6',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
        <path d="M8 8 Q12 4 16 8 Q12 12 16 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
      </svg>
    )
  },
  { 
    id: 'drive', 
    name: 'ドライブ', 
    color: '#F59E0B',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
        <path d="M4 12 L20 12 M20 12 L16 8 M20 12 L16 16" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    )
  },
  { 
    id: 'push', 
    name: 'プッシュ', 
    color: '#EC4899',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
        <path d="M6 10 L18 14 M18 14 L14 12 M18 14 L16 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="10" r="1.5" fill="currentColor"/>
      </svg>
    )
  },
  { 
    id: 'lob', 
    name: 'ロブ', 
    color: '#14B8A6',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
        <path d="M8 16 Q12 4 16 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
      </svg>
    )
  },
  { 
    id: 'receive', 
    name: 'レシーブ', 
    color: '#06B6D4',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
        <path d="M20 8 L4 16 M4 16 L8 14 M4 16 L6 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="8" r="1.5" fill="currentColor"/>
      </svg>
    )
  },
  { 
    id: 'other', 
    name: 'その他', 
    color: '#6B7280',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="8" strokeWidth="2"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      </svg>
    )
  },
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
  const [currentShot, setCurrentShot] = useState<{ from?: PlayerPosition }>({});
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<{x: number, y: number}[]>([]);
  const [shotTypeSelections, setShotTypeSelections] = useState<{[key: string]: string}>({});
  const [isSelectingTargets, setIsSelectingTargets] = useState(false);
  const [currentShotNumber, setCurrentShotNumber] = useState(1);
  const [history, setHistory] = useState<{
    action: 'addShot' | 'selectTarget' | 'movePlayer' | 'addPosition' | 'removePosition' | 'editMemo';
    state: {
      shotTrajectories: ShotTrajectory[];
      playerPositions: PlayerPosition[];
      selectedPoints: {x: number, y: number}[];
      selectedAreas: string[];
      currentShotNumber: number;
      isWaitingForPlayer: boolean;
      isSelectingTargets: boolean;
      latestShotLanding: {x: number, y: number} | null;
    };
  }[]>([]);
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(false);
  const [continuousMode, setContinuousMode] = useState(true); // 連続入力モード
  const [selectedShotType, setSelectedShotType] = useState<string>('clear'); // デフォルトでクリアを選択
  const [playerCounter, setPlayerCounter] = useState(1);
  const [knockerCounter, setKnockerCounter] = useState(1);
  const [coneCounter, setConeCounter] = useState(1);
  const [selectedKnocker, setSelectedKnocker] = useState<PlayerPosition | null>(null);
  const [latestShotLanding, setLatestShotLanding] = useState<{x: number, y: number} | null>(null);
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

  // ノック練習でショットモードに入った時、ノッカーを自動選択
  useEffect(() => {
    if (inputMode === 'shot' && practiceType === 'knock_practice' && !selectedKnocker) {
      const knockers = playerPositions.filter(p => p.role === 'knocker');
      if (knockers.length === 1) {
        setSelectedKnocker(knockers[0]);
      }
    }
  }, [inputMode, practiceType, playerPositions]);

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

    saveToHistory('addPosition');
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
          // ノック練習: 初回のノッカーからの配球
          if (selectedKnocker) {
            saveToHistory('addShot');
            const newShot: ShotTrajectory = {
              id: `shot_${Date.now()}`,
              from: { x: selectedKnocker.x, y: selectedKnocker.y },
              to: { x, y },
              shotType: '',
              shotBy: 'knocker',
              order: currentShotNumber
            };
            setShotTrajectories([...shotTrajectories, newShot]);
            setLatestShotLanding({ x, y });
            setIsWaitingForPlayer(true);
            // currentShotNumberはまだ増やさない（プレイヤー移動後に増やす）
          }
        } else if (latestShotLanding && !currentShot.from) {
          // プレイヤーが移動していない間は、ノッカーの配球を更新し続ける
          const lastShot = shotTrajectories[shotTrajectories.length - 1];
          if (lastShot && lastShot.shotBy === 'knocker') {
            saveToHistory('addShot');
            const updatedShots = [...shotTrajectories];
            updatedShots[updatedShots.length - 1] = {
              ...lastShot,
              to: { x, y }
            };
            setShotTrajectories(updatedShots);
            setLatestShotLanding({ x, y });
          }
        } else {
          // プレイヤーからの返球を設定
          const player = playerPositions.find(p => p.role === 'player');
          if (player && !currentShot.from) {
            setCurrentShot({ from: player });
          }
          if (!isSelectingTargets) {
            saveToHistory('selectTarget');
            setIsSelectingTargets(true);
            setSelectedPoints([{x, y}]);
          } else {
            // ターゲット追加
            saveToHistory('selectTarget');
            setSelectedPoints([...selectedPoints, {x, y}]);
          }
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
            return; // プレイヤーを選択したら次のクリックから着地点選択
          }
        } else {
          // ターゲット選択中
          if (!isSelectingTargets) {
            saveToHistory('selectTarget');
            setIsSelectingTargets(true);
            setSelectedPoints([{x, y}]);
          } else {
            // ターゲット追加
            saveToHistory('selectTarget');
            setSelectedPoints([...selectedPoints, {x, y}]);
          }
        }
      }
    }
  };

  // エリアクリック処理
  const handleAreaClick = (areaId: string) => {
    if (inputMode !== 'shot' || shotInputMode !== 'area') return;

    // ノック練習で未選択の場合
    if (practiceType === 'knock_practice' && isWaitingForPlayer && !currentShot.from) {
      const player = playerPositions.find(p => p.role === 'player');
      if (player) {
        setCurrentShot({ from: player });
      }
    }

    // パターン練習で未選択の場合
    if (practiceType !== 'knock_practice' && !currentShot.from) {
      const player = playerPositions.find(p => p.role === 'player');
      if (player) {
        setCurrentShot({ from: player });
      }
    }

    if (!isSelectingTargets) {
      // ターゲット選択開始
      saveToHistory('selectTarget');
      setIsSelectingTargets(true);
      setSelectedAreas([areaId]);
    } else {
      // エリアの追加/削除
      saveToHistory('selectTarget');
      if (selectedAreas.includes(areaId)) {
        setSelectedAreas(selectedAreas.filter(a => a !== areaId));
      } else {
        setSelectedAreas([...selectedAreas, areaId]);
      }
    }
  };

  // 一つ前に戻る
  const undoLastAction = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1].state;
    setShotTrajectories(lastState.shotTrajectories);
    setPlayerPositions(lastState.playerPositions);
    setSelectedPoints(lastState.selectedPoints);
    setSelectedAreas(lastState.selectedAreas);
    setCurrentShotNumber(lastState.currentShotNumber);
    setIsWaitingForPlayer(lastState.isWaitingForPlayer);
    setIsSelectingTargets(lastState.isSelectingTargets);
    setLatestShotLanding(lastState.latestShotLanding);
    setHistory(history.slice(0, -1));
  };

  // 履歴保存
  const saveToHistory = (action: 'addShot' | 'selectTarget' | 'movePlayer' | 'addPosition' | 'removePosition' | 'editMemo') => {
    setHistory([...history, {
      action,
      state: {
        shotTrajectories: [...shotTrajectories],
        playerPositions: [...playerPositions],
        selectedPoints: [...selectedPoints],
        selectedAreas: [...selectedAreas],
        currentShotNumber,
        isWaitingForPlayer,
        isSelectingTargets,
        latestShotLanding
      }
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
    
    saveToHistory('addPosition');
    setPlayerPositions([...playerPositions, newItem]);
  };

  // アイテムの削除
  const removeItem = (itemId: string) => {
    saveToHistory('removePosition');
    setPlayerPositions(playerPositions.filter(p => p.id !== itemId));
  };

  // プレイヤーを最新のショット着地点に移動
  const movePlayerToShotLanding = () => {
    if (!latestShotLanding) return;
    
    const player = playerPositions.find(p => p.role === 'player');
    if (player) {
      saveToHistory('movePlayer');
      setPlayerPositions(prev => 
        prev.map(p => p.id === player.id ? { ...p, x: latestShotLanding.x, y: latestShotLanding.y } : p)
      );
      // 移動後、着地点をクリア
      setLatestShotLanding(null);
      // プレイヤーが移動したので、ノッカーのショット番号を確定
      setCurrentShotNumber(currentShotNumber + 1);
    }
  };

  // ショットタイプの変更
  const handleShotTypeChange = (targetId: string, shotType: string) => {
    setShotTypeSelections(prev => ({
      ...prev,
      [targetId]: shotType
    }));
  };

  // ショット確定処理
  const confirmShots = () => {
    saveToHistory('addShot');
    
    if (selectedPoints.length > 0) {
      // ピンポイントモードでのショット追加
      if (isWaitingForPlayer) {
        // プレイヤーからの返球 - 複数ターゲット対応
        const player = playerPositions.find(p => p.role === 'player');
        if (player) {
          // 同じショットタイプごとにグループ化
          const shotGroups: {[key: string]: {x: number, y: number}[]} = {};
          selectedPoints.forEach((point, index) => {
            const shotType = shotTypeSelections[`point_${index}`] || 'clear';
            if (!shotGroups[shotType]) {
              shotGroups[shotType] = [];
            }
            shotGroups[shotType].push(point);
          });

          // グループごとにショットを作成
          let shotIndex = 0;
          Object.entries(shotGroups).forEach(([shotType, points]) => {
            points.forEach(point => {
              const newShot: ShotTrajectory = {
                id: `shot_${Date.now()}_${shotIndex}`,
                from: { x: player.x, y: player.y },
                to: point,
                shotType,
                shotBy: 'player' as const,
                order: currentShotNumber + shotIndex
              };
              setShotTrajectories(prev => [...prev, newShot]);
              shotIndex++;
            });
          });
          
          setCurrentShotNumber(currentShotNumber + selectedPoints.length);
        }
        setIsWaitingForPlayer(false); // ノッカーからの配球に戻る
      } else {
        // 通常のショット
        // 同じショットタイプごとにグループ化
        const shotGroups: {[key: string]: {x: number, y: number}[]} = {};
        selectedPoints.forEach((point, index) => {
          const shotType = shotTypeSelections[`point_${index}`] || 'clear';
          if (!shotGroups[shotType]) {
            shotGroups[shotType] = [];
          }
          shotGroups[shotType].push(point);
        });

        // グループごとにショットを作成
        let shotIndex = 0;
        Object.entries(shotGroups).forEach(([shotType, points]) => {
          points.forEach(point => {
            const newShot: ShotTrajectory = {
              id: `shot_${Date.now()}_${shotIndex}`,
              from: currentShot.from ? { x: currentShot.from.x, y: currentShot.from.y } : { x: 0, y: 0 },
              to: point,
              shotType,
              shotBy: currentShot.from?.role || 'player' as const,
              order: currentShotNumber + shotIndex
            };
            setShotTrajectories(prev => [...prev, newShot]);
            shotIndex++;
          });
        });
        
        setCurrentShotNumber(currentShotNumber + selectedPoints.length);
      }
      
      setSelectedPoints([]);
      setShotTypeSelections({});
      setCurrentShot({});
      setIsSelectingTargets(false);
      
    } else if (selectedAreas.length > 0) {
      // エリアモードでのショット追加
      if (isWaitingForPlayer) {
        // プレイヤーからの返球
        const player = playerPositions.find(p => p.role === 'player');
        if (player) {
          const shotGroups: {[key: string]: string[]} = {};
          selectedAreas.forEach((areaId) => {
            const shotType = shotTypeSelections[areaId] || 'clear';
            if (!shotGroups[shotType]) {
              shotGroups[shotType] = [];
            }
            shotGroups[shotType].push(areaId);
          });

          // グループごとにショットを作成（同じショットタイプのエリアは1本の矢印に統合）
          let shotIndex = 0;
          Object.entries(shotGroups).forEach(([shotType, areaIds]) => {
            const fromPos = { x: player.x, y: player.y };
        
        // 複数エリアの中心点を計算
        let centerX = 0;
        let centerY = 0;
        let validAreas = 0;
        
        areaIds.forEach(areaId => {
          const area = COURT_AREAS.find(a => a.id === areaId);
          if (area) {
            centerX += area.x + area.w/2;
            centerY += area.y + area.h/2;
            validAreas++;
          }
        });
        
        if (validAreas > 0) {
          centerX /= validAreas;
          centerY /= validAreas;
          
          const newShot: ShotTrajectory = {
            id: `shot_${Date.now()}_${shotIndex}`,
            from: fromPos,
            to: { x: centerX, y: centerY },
            shotType,
            shotBy: currentShot.from?.role || 'player',
            order: currentShotNumber + shotIndex,
            targetArea: areaIds.join(',')
          };
            setShotTrajectories(prev => [...prev, newShot]);
            shotIndex++;
          }
        });
        
        setCurrentShotNumber(currentShotNumber + 1);
        }
        setIsWaitingForPlayer(false); // ノッカーからの配球に戻る
      } else {
        // 通常のショット
        const shotGroups: {[key: string]: string[]} = {};
        selectedAreas.forEach((areaId) => {
          const shotType = shotTypeSelections[areaId] || 'clear';
          if (!shotGroups[shotType]) {
            shotGroups[shotType] = [];
          }
          shotGroups[shotType].push(areaId);
        });

        // グループごとにショットを作成
        let shotIndex = 0;
        Object.entries(shotGroups).forEach(([shotType, areaIds]) => {
          const fromPos = currentShot.from ? { x: currentShot.from.x, y: currentShot.from.y } : { x: 0, y: 0 };
          
          // 複数エリアの中心点を計算
          let centerX = 0;
          let centerY = 0;
          let validAreas = 0;
          
          areaIds.forEach(areaId => {
            const area = COURT_AREAS.find(a => a.id === areaId);
            if (area) {
              centerX += area.x + area.w/2;
              centerY += area.y + area.h/2;
              validAreas++;
            }
          });
          
          if (validAreas > 0) {
            centerX /= validAreas;
            centerY /= validAreas;
            
            const newShot: ShotTrajectory = {
              id: `shot_${Date.now()}_${shotIndex}`,
              from: fromPos,
              to: { x: centerX, y: centerY },
              shotType,
              shotBy: currentShot.from?.role || 'player',
              order: currentShotNumber + shotIndex,
              targetArea: areaIds.join(',')
            };
            setShotTrajectories(prev => [...prev, newShot]);
            shotIndex++;
          }
        });
        
        setCurrentShotNumber(currentShotNumber + 1);
      }
      
      setSelectedAreas([]);
      setShotTypeSelections({});
      setCurrentShot({});
      setIsSelectingTargets(false);
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

            {/* エリア選択モード時のみガイド表示 */}
            {inputMode === 'shot' && shotInputMode === 'area' && currentShot.from && (
              <g>
                {COURT_AREAS.map(area => {
                  const isSelected = selectedAreas.includes(area.id);
                  const shotType = isSelected ? SHOT_TYPES.find(t => t.id === (shotTypeSelections[area.id] || 'clear')) : null;
                  const fillColor = isSelected ? (shotType?.color || '#FCD34D') : 'transparent';
                  
                  return (
                    <g key={area.id}>
                      <rect
                        x={area.x}
                        y={area.y}
                        width={area.w}
                        height={area.h}
                        fill={fillColor}
                        fillOpacity={isSelected ? 0.3 : 0}
                        stroke={isSelected ? fillColor : '#9CA3AF'}
                        strokeWidth={isSelected ? "2" : "0.5"}
                        strokeDasharray={isSelected ? "0" : "0"}
                        className="cursor-pointer transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAreaClick(area.id);
                        }}
                      />
                      {isSelected && (
                        <text
                          x={area.x + area.w/2}
                          y={area.y + area.h/2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {area.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}
          </svg>

          {/* ショット軌道 */}
          {shotTrajectories.map((shot) => {
            const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
            const color = shot.shotBy === 'knocker' ? '#000000' : (shotType?.color || '#10B981');
            
            // エリアターゲットの場合、複数エリアを塗りつぶす
            const targetAreaIds = shot.targetArea ? shot.targetArea.split(',') : [];
            
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
                        strokeWidth="2"
                      />
                    );
                  }
                  return null;
                })}
                
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

        {/* 入力モード切替（ショットが入力されていない場合のみ表示） */}
        {shotTrajectories.length === 0 && (
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
        )}

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
                  className="p-3 bg-white border-2 border-green-300 rounded-lg hover:bg-green-50 transition-all flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MdPerson className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap">プレイヤー</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItemToCourt('knocker');
                  }}
                  className="p-3 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-all flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <MdSportsBaseball className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap">ノッカー</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItemToCourt('cone');
                  }}
                  className="p-3 bg-white border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-all flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <FiTarget className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap">コーン</span>
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
                <span className="whitespace-nowrap">配置完了してショット入力へ →</span>
              </button>
            )}
          </>
        )}

        {/* ショット入力モード */}
        {inputMode === 'shot' && (
          <>
            {/* ノック練習のノッカー選択 */}
            {practiceType === 'knock_practice' && (
              <div className="space-y-2">
                <div className="text-sm font-medium">使用するノッカー</div>
                {playerPositions.filter(p => p.role === 'knocker').length > 1 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {playerPositions.filter(p => p.role === 'knocker').map(knocker => (
                      <button
                        key={knocker.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKnocker(knocker);
                        }}
                        className={`p-3 border-2 rounded-lg transition-all flex items-center gap-2 ${
                          selectedKnocker?.id === knocker.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <MdSportsBaseball className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{knocker.label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <MdSportsBaseball className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">{selectedKnocker?.label || 'ノッカー'}</span>
                  </div>
                )}
              </div>
            )}

            {/* 現在の状態表示 */}
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <div className="font-medium text-blue-800 mb-1">現在の入力状態</div>
              <div className="text-blue-600">
                {practiceType === 'knock_practice' ? (
                  isWaitingForPlayer ? 
                    (latestShotLanding && !currentShot.from ? 
                      '🏸 ノッカーの配球位置を変更できます（クリックで変更）' :
                      '🎾 プレイヤーからの返球を設定してください') :
                    '🏸 ノッカーからの配球位置をクリック'
                ) : (
                  currentShot.from ? 
                    `👤 ${currentShot.from.label}からのショット着地点を選択` :
                    '👤 ショットを打つプレイヤーを選択'
                )}
              </div>
            </div>

            {/* プレイヤー移動ボタン */}
            {practiceType === 'knock_practice' && isWaitingForPlayer && latestShotLanding && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  movePlayerToShotLanding();
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all font-medium flex items-center justify-center gap-2"
              >
                <MdPerson className="w-5 h-5" />
                <span className="whitespace-nowrap">プレイヤーをシャトル着地点に移動</span>
              </button>
            )}

            {/* ノッカーの配球選択時は着地点選択を表示しない */}
            {!(practiceType === 'knock_practice' && !isWaitingForPlayer) && (
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
                      // エリアモードに切り替えた時、プレイヤーが選択されていなければ選択
                      if (!currentShot.from && practiceType === 'pattern_practice') {
                        const player = playerPositions.find(p => p.role === 'player');
                        if (player) {
                          setCurrentShot({ from: player });
                        }
                      } else if (!currentShot.from && practiceType === 'knock_practice' && isWaitingForPlayer) {
                        const player = playerPositions.find(p => p.role === 'player');
                        if (player) {
                          setCurrentShot({ from: player });
                        }
                      }
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      shotInputMode === 'area' 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FiTarget className="inline w-4 h-4 mr-1" />
                    エリア
                  </button>
                </div>
              </div>
            )}

            {/* ターゲット選択完了ボタン */}
            {isSelectingTargets && (selectedPoints.length > 0 || selectedAreas.length > 0) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelectingTargets(false);
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2"
              >
                <FaCheck className="w-4 h-4" />
                <span className="whitespace-nowrap">ターゲット選択完了</span>
              </button>
            )}

            {/* ショットタイプ別に選択 */}
            {!isSelectingTargets && (selectedPoints.length > 0 || selectedAreas.length > 0) && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  各ターゲットのショットタイプを選択
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {/* ピンポイントモード */}
                  {shotInputMode === 'pinpoint' && selectedPoints.map((point, index) => {
                  const pointId = `point_${index}`;
                  const currentType = shotTypeSelections[pointId] || 'clear';
                  return (
                    <div key={pointId} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-2">
                        ターゲット {index + 1}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {SHOT_TYPES.map(type => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShotTypeChange(pointId, type.id);
                            }}
                            className={`px-2 py-2 rounded text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                              currentType === type.id 
                                ? 'text-white ring-2' 
                                : 'text-gray-700 hover:bg-opacity-20'
                            }`}
                            style={{
                              backgroundColor: currentType === type.id ? type.color : type.color + '20',
                              borderColor: type.color,
                              borderWidth: '1px',
                              ringColor: currentType === type.id ? type.color : 'transparent'
                            }}
                          >
                            {React.cloneElement(type.icon, { className: 'w-4 h-4 flex-shrink-0' })}
                            <span className="text-[10px] leading-tight">{type.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* エリアモード */}
                {shotInputMode === 'area' && selectedAreas.map((areaId) => {
                  const area = COURT_AREAS.find(a => a.id === areaId);
                  const currentType = shotTypeSelections[areaId] || 'clear';
                  return (
                    <div key={areaId} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-2">
                        エリア: {area?.name}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {SHOT_TYPES.map(type => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShotTypeChange(areaId, type.id);
                            }}
                            className={`px-2 py-2 rounded text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                              currentType === type.id 
                                ? 'text-white ring-2' 
                                : 'text-gray-700 hover:bg-opacity-20'
                            }`}
                            style={{
                              backgroundColor: currentType === type.id ? type.color : type.color + '20',
                              borderColor: type.color,
                              borderWidth: '1px',
                              ringColor: currentType === type.id ? type.color : 'transparent'
                            }}
                          >
                            {React.cloneElement(type.icon, { className: 'w-4 h-4 flex-shrink-0' })}
                            <span className="text-[10px] leading-tight">{type.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                </div>
                
                {/* ショット確定ボタン */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmShots();
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                >
                  ショットを確定
                </button>
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
          {isSelectingTargets && (selectedPoints.length > 0 || selectedAreas.length > 0) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoints([]);
                setSelectedAreas([]);
                setShotTypeSelections({});
                setIsSelectingTargets(false);
              }}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>

      {/* ショット履歴（右側） */}
      <div className="w-80 bg-white rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GiShuttlecock className="w-5 h-5 text-gray-600" />
            ショット履歴
          </h3>
          <span className="text-sm text-gray-500">
            {shotTrajectories.length}球
          </span>
        </div>
        
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {shotTrajectories.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              ショットを入力してください
            </p>
          ) : (
            shotTrajectories
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((shot) => {
                const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
                const targetArea = shot.targetArea ? COURT_AREAS.find(a => a.id === shot.targetArea) : null;
                const shotByLabel = shot.shotBy === 'knocker' ? 'ノック' : 
                                  shot.shotBy === 'opponent' ? '相手' : 'プレイヤー';
                const bgColor = shot.shotBy === 'knocker' ? 'bg-gray-50' : 
                              shot.shotBy === 'opponent' ? 'bg-red-50' : 'bg-green-50';
                const borderColor = shot.shotBy === 'knocker' ? 'border-gray-300' : 
                                  shot.shotBy === 'opponent' ? 'border-red-200' : 'border-green-200';
                
                return (
                  <div 
                    key={shot.id} 
                    className={`p-3 rounded-lg border ${bgColor} ${borderColor} transition-all hover:shadow-sm`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ 
                          backgroundColor: shot.shotBy === 'knocker' ? '#000000' : 
                                         (shotType?.color || '#10B981') 
                        }}
                      >
                        {shot.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {shotByLabel}
                          </span>
                          {shotType && (
                            <span 
                              className="text-xs px-2 py-1 rounded-full text-white flex items-center gap-1"
                              style={{ backgroundColor: shotType.color }}
                            >
                              {React.cloneElement(shotType.icon, { className: 'w-3 h-3' })}
                              <span>{shotType.name}</span>
                            </span>
                          )}
                        </div>
                        {targetArea && (
                          <div className="text-xs text-gray-600">
                            着地: {targetArea.name}
                          </div>
                        )}
                        {shot.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {shot.description}
                          </div>
                        )}
                        <ShotMemo
                          shotId={shot.id}
                          memo={shot.memo}
                          onUpdateMemo={(shotId, memo) => {
                            saveToHistory('editMemo');
                            setShotTrajectories(prev => 
                              prev.map(s => s.id === shotId ? { ...s, memo } : s)
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeCardVisualEditor;