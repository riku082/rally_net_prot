'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayerPosition, 
  ShotTrajectory, 
  PracticeVisualInfo,
  PracticeMenuType 
} from '@/types/practice';
import { FiChevronLeft } from 'react-icons/fi';
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
  mobileMode?: 'players' | 'shots' | 'preview'; // モバイル用のモード
  onShotStart?: (player: PlayerPosition) => void; // ショット開始時のコールバック
  mobileSelectedAreas?: string[]; // 選択されたエリアIDの配列
  onAreaSelect?: (areaId: string) => void; // エリア選択時のコールバック
}

// コート寸法（ピクセル）- 実際の比率に基づく
const COURT_WIDTH = 244;  // 6.1m (縮小サイズ)
const COURT_HEIGHT = 536; // 13.4m (縮小サイズ)
const COURT_PADDING = 30;

// バドミントンコートの正確な寸法（縮小版）
const NET_POSITION = COURT_HEIGHT / 2;
const SHORT_SERVICE_LINE = 79; // ネットから1.98m
const LONG_SERVICE_LINE = 53; // エンドラインから1.32m内側（ダブルス用）
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

// エリアが隣接しているかを判定する関数
const areAreasAdjacent = (area1: { x: number, y: number, w: number, h: number }, area2: { x: number, y: number, w: number, h: number }) => {
  // 水平方向で隣接
  const horizontallyAdjacent = 
    (area1.x + area1.w === area2.x || area2.x + area2.w === area1.x) &&
    !(area1.y + area1.h <= area2.y || area2.y + area2.h <= area1.y);
  
  // 垂直方向で隣接
  const verticallyAdjacent = 
    (area1.y + area1.h === area2.y || area2.y + area2.h === area1.y) &&
    !(area1.x + area1.w <= area2.x || area2.x + area2.w <= area1.x);
  
  return horizontallyAdjacent || verticallyAdjacent;
};

// 接しているエリアをグループ化する関数
const groupAdjacentAreas = (areaIds: string[]) => {
  const groups: string[][] = [];
  const processed = new Set<string>();
  
  for (const areaId of areaIds) {
    if (processed.has(areaId)) continue;
    
    const currentGroup = [areaId];
    processed.add(areaId);
    
    // 現在のグループに隣接するエリアを再帰的に追加
    let addedNew = true;
    while (addedNew) {
      addedNew = false;
      for (const remainingAreaId of areaIds) {
        if (processed.has(remainingAreaId)) continue;
        
        const remainingArea = COURT_AREAS.find(a => a.id === remainingAreaId);
        if (!remainingArea) continue;
        
        // 現在のグループのいずれかのエリアと隣接するかチェック
        for (const groupAreaId of currentGroup) {
          const groupArea = COURT_AREAS.find(a => a.id === groupAreaId);
          if (groupArea && areAreasAdjacent(groupArea, remainingArea)) {
            currentGroup.push(remainingAreaId);
            processed.add(remainingAreaId);
            addedNew = true;
            break;
          }
        }
      }
    }
    
    groups.push(currentGroup);
  }
  
  return groups;
};

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
  currentStep,
  mobileMode,
  onShotStart,
  mobileSelectedAreas = [],
  onAreaSelect
}) => {
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>(visualInfo.playerPositions || []);
  const [shotTrajectories, setShotTrajectories] = useState<ShotTrajectory[]>(visualInfo.shotTrajectories || []);
  const [inputMode, setInputMode] = useState<'setup' | 'shot'>(() => {
    // モバイルモードの場合、モードを固定
    if (mobileMode === 'players') return 'setup';
    if (mobileMode === 'shots') return 'shot';
    return visualInfo.shotTrajectories && visualInfo.shotTrajectories.length > 0 ? 'shot' : 'setup';
  });
  const [shotInputMode, setShotInputMode] = useState<'pinpoint' | 'area'>('pinpoint');
  const [currentShot, setCurrentShot] = useState<{ from?: PlayerPosition; to?: { x: number; y: number }; nextPlayer?: PlayerPosition }>({});
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<{x: number, y: number}[]>([]);
  const [shotTypeSelections, setShotTypeSelections] = useState<{[key: string]: string[]}>({});
  const [isSelectingTargets, setIsSelectingTargets] = useState(false);
  const [currentShotNumber, setCurrentShotNumber] = useState(
    visualInfo.shotTrajectories && visualInfo.shotTrajectories.length > 0 
      ? Math.max(...visualInfo.shotTrajectories.map(s => s.order || 0)) + 1 
      : 1
  );
  const [history, setHistory] = useState<{
    action: 'addShot' | 'selectTarget' | 'movePlayer' | 'addPosition' | 'removePosition' | 'editMemo' | 'changeMode';
    state: {
      shotTrajectories: ShotTrajectory[];
      playerPositions: PlayerPosition[];
      selectedPoints: {x: number, y: number}[];
      selectedAreas: string[];
      currentShotNumber: number;
      isWaitingForPlayer: boolean;
      isSelectingTargets: boolean;
      latestShotLanding: {x: number, y: number} | null;
      inputMode?: 'setup' | 'shot';
    };
  }[]>([]);
  // ノック練習で既存のショットがある場合、最後のショットの状態から判断
  const initIsWaitingForPlayer = () => {
    if (practiceType === 'knock_practice' && visualInfo.shotTrajectories && visualInfo.shotTrajectories.length > 0) {
      const lastShot = visualInfo.shotTrajectories[visualInfo.shotTrajectories.length - 1];
      // 最後のショットがノッカーからなら、プレイヤーの返球待ち
      return lastShot.shotBy === 'knocker';
    }
    return false;
  };
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(initIsWaitingForPlayer());
  const [continuousMode, setContinuousMode] = useState(true); // 連続入力モード
  const [selectedShotType, setSelectedShotType] = useState<string>('clear'); // デフォルトでクリアを選択
  const [playerShotSettings, setPlayerShotSettings] = useState<Record<string, ShotTrajectory[]>>({}); // 各プレイヤーのショット設定
  const [selectedPlayerForSettings, setSelectedPlayerForSettings] = useState<PlayerPosition | null>(null); // 設定中のプレイヤー
  const [tempShotTargets, setTempShotTargets] = useState<Array<{ x: number; y: number; area?: string }>>([]);  // 複数の着地点を選択可能
  const [playerSettingsMode, setPlayerSettingsMode] = useState<'pinpoint' | 'area'>('pinpoint'); // プレイヤー設定モードの入力方式
  const [playerSettingsShotTypes, setPlayerSettingsShotTypes] = useState<{[key: string]: string[]}>({});  // プレイヤー設定モードでのショットタイプ選択
  const [mobileView, setMobileView] = useState<'controls' | 'history' | 'court'>('controls'); // モバイル表示の切り替え
  // カウンターの初期値を既存のポジションから計算（一貫性のある番号付け）
  const getInitialCounter = (role: string) => {
    const existing = (visualInfo.playerPositions || []);
    if (role === 'player') {
      // プレイヤーは全体で通し番号
      const allPlayers = existing.filter(p => p.role === 'player' || p.role === 'opponent');
      return allPlayers.length + 1;
    } else if (role === 'knocker') {
      const knockers = existing.filter(p => p.role === 'knocker');
      return knockers.length + 1;
    } else if (role === 'feeder') {
      const feeders = existing.filter(p => p.role === 'feeder');
      return feeders.length + 1;
    }
    return 1;
  };
  const [playerCounter, setPlayerCounter] = useState(getInitialCounter('player'));
  const [knockerCounter, setKnockerCounter] = useState(getInitialCounter('knocker'));
  const [coneCounter, setConeCounter] = useState(getInitialCounter('feeder'));
  const [redPlayerCounter, setRedPlayerCounter] = useState(1);
  const [greenPlayerCounter, setGreenPlayerCounter] = useState(1);
  const [selectedKnocker, setSelectedKnocker] = useState<PlayerPosition | null>(null);
  const [latestShotLanding, setLatestShotLanding] = useState<{x: number, y: number} | null>(null);
  const courtRef = useRef<HTMLDivElement>(null);
  const [draggingPlayer, setDraggingPlayer] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // モバイルモードの場合は外部のvisualInfoを直接使用するため同期
  useEffect(() => {
    if (mobileMode) {
      console.log('Syncing mobile mode - visualInfo shots:', visualInfo.shotTrajectories);
      setPlayerPositions(visualInfo.playerPositions || []);
      setShotTrajectories(visualInfo.shotTrajectories || []);
    }
  }, [visualInfo, mobileMode]);

  // 初期配置
  useEffect(() => {
    if (practiceType && playerPositions.length === 0) {
      const defaults = getDefaultPositions(practiceType);
      setPlayerPositions(defaults);
    }
  }, [practiceType]);
  

  // プレイヤー位置とショット軌道の変更を監視して更新（モバイルモードでは外部制御なのでスキップ）
  useEffect(() => {
    if (mobileMode) return; // モバイルモードでは外部から制御されるのでスキップ
    
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
  }, [playerPositions, shotTrajectories, onUpdate, visualInfo, mobileMode]);

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
        { id: 'knocker', x: COURT_WIDTH/2, y: 50, label: 'K1', role: 'knocker', color: '#3B82F6' },
        { id: 'player1', x: COURT_WIDTH/2, y: COURT_HEIGHT - 50, label: 'P1', role: 'player', color: '#10B981' }
      ];
    } else {
      return [
        { id: 'player1', x: COURT_WIDTH/2 - 40, y: COURT_HEIGHT - 50, label: 'P1', role: 'player', color: '#10B981', team: 'green' },
        { id: 'player2', x: COURT_WIDTH/2 + 40, y: COURT_HEIGHT - 50, label: 'P2', role: 'player', color: '#10B981', team: 'green' },
        { id: 'opponent1', x: COURT_WIDTH/2 - 40, y: 50, label: 'P3', role: 'opponent', color: '#EF4444', team: 'red' },
        { id: 'opponent2', x: COURT_WIDTH/2 + 40, y: 50, label: 'P4', role: 'opponent', color: '#EF4444', team: 'red' }
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
  const handleCourtClick = (e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<SVGElement>) => {
    // モバイルモードでの処理
    if (mobileMode === 'players') {
      // プレイヤー配置モードでは処理しない（ボタンで配置）
      return;
    }
    
    if (mobileMode === 'shots') {
      // モバイル用ショット入力モード - PC版と同様の処理
      // 外部のコールバックに座標を渡してモバイル側で処理
      const target = e.currentTarget as SVGElement | HTMLDivElement;
      const rect = target instanceof SVGElement ? 
        target.getBoundingClientRect() : 
        target.getBoundingClientRect();
      
      const scaleX = COURT_WIDTH / rect.width;
      const scaleY = COURT_HEIGHT / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      // 範囲チェック
      if (x < 0 || x > COURT_WIDTH || y < 0 || y > COURT_HEIGHT) return;
      
      // モバイル側のコールバックに座標を渡す（onShotStartを拡張利用）
      onShotStart?.({ x, y } as any);
      return;
    }
    
    // 通常モードの処理
    if (inputMode !== 'shot') return;

    // SVG要素の場合とDIV要素の場合で処理を分ける
    let x: number, y: number;
    
    if ((e.target as Element).tagName === 'svg' || (e.target as Element).closest('svg')) {
      // SVG内でのクリック（PC版ノック練習）
      const svg = ((e.target as Element).tagName === 'svg' ? e.target : (e.target as Element).closest('svg')) as SVGElement;
      const rect = svg.getBoundingClientRect();
      const scaleX = COURT_WIDTH / rect.width;
      const scaleY = COURT_HEIGHT / rect.height;
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    } else if (courtRef.current) {
      // DIV要素でのクリック（通常のコート）
      const rect = courtRef.current.getBoundingClientRect();
      x = e.clientX - rect.left - COURT_PADDING;
      y = e.clientY - rect.top - COURT_PADDING;
    } else {
      return;
    }

    if (x < 0 || x > COURT_WIDTH || y < 0 || y > COURT_HEIGHT) return;
    
    // プレイヤー設定モードの処理
    if (practiceType === 'pattern_practice' && selectedPlayerForSettings) {
      if (playerSettingsMode === 'pinpoint') {
        // ピンポイント選択（複数可）
        setTempShotTargets(prev => {
          // 既に同じ位置が選択されていれば削除、なければ追加
          const existingIndex = prev.findIndex(p => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10);
          if (existingIndex >= 0) {
            const newTargets = prev.filter((_, i) => i !== existingIndex);
            setSelectedPoints(newTargets.map(t => ({x: t.x, y: t.y})));
            return newTargets;
          }
          const newTargets = [...prev, { x, y }];
          setSelectedPoints(newTargets.map(t => ({x: t.x, y: t.y})));
          return newTargets;
        });
        setIsSelectingTargets(true);
      }
      return;
    }

    if (shotInputMode === 'pinpoint') {
      if (practiceType === 'knock_practice') {
        if (!isWaitingForPlayer) {
          // ノック練習: 初回のノッカーからの配球
          const currentKnocker = playerPositions.find(p => p.role === 'knocker');
          if (currentKnocker) {
            saveToHistory('addShot');
            const newShot: ShotTrajectory = {
              id: `shot_${Date.now()}`,
              from: { x: currentKnocker.x, y: currentKnocker.y },
              to: { x, y },
              shotType: '',
              shotBy: 'knocker',
              order: currentShotNumber,
              memo: ''
            };
            
            // 前回のノッカーショットがある場合、プレイヤーの移動矢印を追加
            const previousKnockerShot = [...shotTrajectories].reverse().find(s => s.shotBy === 'knocker');
            if (previousKnockerShot) {
              const movementArrow: ShotTrajectory = {
                id: `movement_${Date.now()}`,
                from: { x: previousKnockerShot.to.x, y: previousKnockerShot.to.y },
                to: { x, y },
                shotType: 'movement',
                isMovement: true,
                shotBy: 'player',
                order: currentShotNumber,
                description: 'プレイヤー移動',
                memo: ''
              };
              setShotTrajectories([...shotTrajectories, movementArrow, newShot]);
            } else {
              setShotTrajectories([...shotTrajectories, newShot]);
            }
            
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
          // プレイヤーをクリックで直接選択することも可能
          let clickedPlayer = null;
          let minDistance = 30; // 30px以内にプレイヤーがいる場合選択
          
          playerPositions.forEach(player => {
            if (player.role === 'player' || player.role === 'opponent') {
              const distance = Math.sqrt(
                Math.pow(player.x - x, 2) + Math.pow(player.y - y, 2)
              );
              if (distance < minDistance) {
                minDistance = distance;
                clickedPlayer = player;
              }
            }
          });
          
          if (clickedPlayer) {
            setCurrentShot({ from: clickedPlayer });
          }
          return;
        } else if (!currentShot.to) {
          // 着地点を設定
          setCurrentShot({ ...currentShot, to: { x, y } });
          setIsSelectingTargets(true);
          setSelectedPoints([{x, y}]);
          // 着地点が決まったら、プレイヤー選択モードへ
          setIsWaitingForPlayer(true);
        } else if (isWaitingForPlayer && !currentShot.nextPlayer) {
          // 自動的に反対側のチームのプレイヤーを選択
          const currentTeam = currentShot.from.team || (currentShot.from.id.includes('red') ? 'red' : 'green');
          const oppositeTeam = currentTeam === 'red' ? 'green' : 'red';
          
          // 反対側のチームで、着地点に最も近いプレイヤーを探す
          let nearestPlayer = null;
          let minDistance = Infinity;
          
          playerPositions.forEach(player => {
            if (player.role === 'player' || player.role === 'opponent') {
              const playerTeam = player.team || (player.id.includes('red') ? 'red' : 'green');
              if (playerTeam === oppositeTeam) {
                const distance = Math.sqrt(
                  Math.pow(player.x - currentShot.to.x, 2) + Math.pow(player.y - currentShot.to.y, 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  nearestPlayer = player;
                }
              }
            }
          });
          
          if (nearestPlayer) {
            // プレイヤーを着地点に移動
            setPlayerPositions(prev => 
              prev.map(p => p.id === nearestPlayer.id 
                ? { ...p, x: currentShot.to.x, y: currentShot.to.y } 
                : p
              )
            );
            // 移動したプレイヤーを次の打ち手として設定
            setCurrentShot({ ...currentShot, nextPlayer: nearestPlayer });
            setIsWaitingForPlayer(false);
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
    // プレイヤー設定モードのエリア選択処理
    if (practiceType === 'pattern_practice' && selectedPlayerForSettings) {
      if (playerSettingsMode === 'area') {
        const area = COURT_AREAS.find(a => a.id === areaId);
        if (area) {
          const centerX = area.x + area.w / 2;
          const centerY = area.y + area.h / 2;
          setTempShotTargets(prev => {
            // 既に同じエリアが選択されていれば削除、なければ追加
            const existingIndex = prev.findIndex(p => p.area === areaId);
            if (existingIndex >= 0) {
              return prev.filter((_, i) => i !== existingIndex);
            }
            return [...prev, { x: centerX, y: centerY, area: areaId }];
          });
        }
      }
      return;
    }
    
    // 通常のエリア選択処理
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
      // エリアの追加（重複を許可）
      saveToHistory('selectTarget');
      setSelectedAreas([...selectedAreas, areaId]);
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
    if (lastState.inputMode) {
      setInputMode(lastState.inputMode);
    }
    setHistory(history.slice(0, -1));
  };

  // 履歴保存
  const saveToHistory = (action: 'addShot' | 'selectTarget' | 'movePlayer' | 'addPosition' | 'removePosition' | 'editMemo' | 'changeMode') => {
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
        latestShotLanding,
        inputMode
      }
    }]);
  };

  // コート上に新しいアイテムを追加
  const addItemToCourt = (type: 'player' | 'knocker' | 'cone' | 'redPlayer' | 'greenPlayer') => {
    const centerX = COURT_WIDTH / 2;
    const centerY = COURT_HEIGHT / 2;
    
    let newItem: PlayerPosition;
    
    // 一意のIDを生成するためにタイムスタンプも追加
    const timestamp = Date.now();
    
    switch (type) {
      case 'player':
        newItem = {
          id: `player${playerCounter}_${timestamp}`,
          x: centerX + (Math.random() - 0.5) * 100,
          y: COURT_HEIGHT - 100 + (Math.random() - 0.5) * 50,
          label: `P${playerCounter}`,
          role: 'player',
          color: '#10B981'
        };
        setPlayerCounter(playerCounter + 1);
        break;
      case 'redPlayer':
        newItem = {
          id: `redPlayer${playerCounter}_${timestamp}`,
          x: centerX + (Math.random() - 0.5) * 100,
          y: 100 + (Math.random() - 0.5) * 50,  // 上側コート（奥） - 赤チーム
          label: `P${playerCounter}`,
          role: 'player',
          color: '#EF4444',
          team: 'red'  // チーム識別用
        };
        setPlayerCounter(playerCounter + 1);
        setRedPlayerCounter(redPlayerCounter + 1);
        break;
      case 'greenPlayer':
        newItem = {
          id: `greenPlayer${playerCounter}_${timestamp}`,
          x: centerX + (Math.random() - 0.5) * 100,
          y: COURT_HEIGHT - 100 + (Math.random() - 0.5) * 50,  // 下側コート（手前） - 緑チーム
          label: `P${playerCounter}`,
          role: 'player',
          color: '#10B981',
          team: 'green'  // チーム識別用
        };
        setPlayerCounter(playerCounter + 1);
        setGreenPlayerCounter(greenPlayerCounter + 1);
        break;
      case 'knocker':
        newItem = {
          id: `knocker${knockerCounter}_${timestamp}`,
          x: centerX + (Math.random() - 0.5) * 100,
          y: 100 + (Math.random() - 0.5) * 50,
          label: `K${knockerCounter}`,
          role: 'knocker',
          color: '#3B82F6'
        };
        setKnockerCounter(knockerCounter + 1);
        break;
      case 'cone':
        newItem = {
          id: `cone${coneCounter}_${timestamp}`,
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

  // 指定したプレイヤーを最新のショット着地点に移動
  const movePlayerToShotLanding = (playerId?: string) => {
    if (!latestShotLanding) return;
    
    // playerIdが指定されている場合はそのプレイヤー、されていない場合はデフォルトのプレイヤー
    const targetPlayer = playerId 
      ? playerPositions.find(p => p.id === playerId)
      : playerPositions.find(p => p.role === 'player');
    
    if (targetPlayer) {
      saveToHistory('movePlayer');
      setPlayerPositions(prev => 
        prev.map(p => p.id === targetPlayer.id ? { ...p, x: latestShotLanding.x, y: latestShotLanding.y } : p)
      );
      // 移動後、着地点をクリア
      setLatestShotLanding(null);
      // プレイヤーが移動したので、ノッカーのショット番号を確定
      setCurrentShotNumber(currentShotNumber + 1);
    }
  };

  // ショットタイプの変更（複数選択対応）
  const handleShotTypeChange = (targetId: string, shotType: string) => {
    setShotTypeSelections(prev => {
      const currentTypes = prev[targetId] || [];
      const isSelected = currentTypes.includes(shotType);
      
      if (isSelected) {
        // 既に選択されている場合は解除
        return {
          ...prev,
          [targetId]: currentTypes.filter(type => type !== shotType)
        };
      } else {
        // 選択されていない場合は追加
        return {
          ...prev,
          [targetId]: [...currentTypes, shotType]
        };
      }
    });
  };

  // プレイヤー設定からパターンを生成（新方式）
  const generatePatternFromPlayerSettings = () => {
    // 全プレイヤーの設定済みショットを収集
    const allShots: ShotTrajectory[] = [];
    let order = 1;
    
    Object.entries(playerShotSettings).forEach(([playerId, shots]) => {
      shots.forEach(shot => {
        allShots.push({
          ...shot,
          order: order++
        });
      });
    });
    
    // ショットを表示
    setShotTrajectories(allShots);
    setCurrentShotNumber(order);
    
    // リセット
    setSelectedPlayerForSettings(null);
    setTempShotTargets([]);
    setSelectedPoints([]);
    setSelectedAreas([]);
    setIsSelectingTargets(false);
  };
  
  // プレイヤー設定からパターンを生成（旧方式 - 使用しない）
  const generatePatternFromSettings = () => {
    const redPlayers = playerPositions.filter(p => {
      const team = p.team || (p.role === 'opponent' ? 'red' : p.id.includes('red') ? 'red' : 'green');
      return (p.role === 'player' || p.role === 'opponent') && team === 'red';
    });
    const greenPlayers = playerPositions.filter(p => {
      const team = p.team || (p.role === 'opponent' ? 'red' : p.id.includes('red') ? 'red' : 'green');
      return (p.role === 'player' || p.role === 'opponent') && team === 'green';
    });
    
    if (redPlayers.length === 0 || greenPlayers.length === 0) {
      alert('両チームにプレイヤーが必要です');
      return;
    }
    
    // 既存のショットをクリア
    setShotTrajectories([]);
    
    // 交互にショットを生成（最大8ショット）
    const newShots: ShotTrajectory[] = [];
    let shotOrder = 1;
    const maxShots = 8;
    
    for (let i = 0; i < maxShots; i++) {
      const isRedTurn = i % 2 === 0;
      const currentPlayers = isRedTurn ? redPlayers : greenPlayers;
      const targetPlayers = isRedTurn ? greenPlayers : redPlayers;
      
      // ランダムなプレイヤーを選択
      const shooterIndex = Math.floor(Math.random() * currentPlayers.length);
      const targetIndex = Math.floor(Math.random() * targetPlayers.length);
      const shooter = currentPlayers[shooterIndex];
      const target = targetPlayers[targetIndex];
      
      // プレイヤーのショット設定を取得
      const shotTypes = playerShotSettings[shooter.id] || [];
      if (shotTypes.length === 0) {
        // ショット設定がない場合はデフォルトでクリアを使用
        shotTypes.push('clear');
      }
      
      // ランダムなショットタイプを選択
      const shotTypeIndex = Math.floor(Math.random() * shotTypes.length);
      const shotType = shotTypes[shotTypeIndex];
      
      // ターゲットの位置をコート内でランダムに調整
      const targetX = Math.max(20, Math.min(COURT_WIDTH - 20, target.x + (Math.random() - 0.5) * 80));
      const targetY = isRedTurn 
        ? Math.max(20, Math.min(NET_POSITION - 20, target.y + (Math.random() - 0.5) * 50))  // 奥側コート
        : Math.max(NET_POSITION + 20, Math.min(COURT_HEIGHT - 20, target.y + (Math.random() - 0.5) * 50)); // 手前コート
      
      // ショットを作成
      const shot: ShotTrajectory = {
        id: `shot_${Date.now()}_${i}`,
        from: { x: shooter.x, y: shooter.y },
        to: { x: targetX, y: targetY },
        shotType: shotType,
        shotBy: 'player',
        order: shotOrder++
      };
      
      newShots.push(shot);
      
      // 次のショットのために、ターゲットプレイヤーを着地点に移動（視覚的な調整）
      target.x = targetX;
      target.y = targetY;
    }
    
    setShotTrajectories(newShots);
    setCurrentShotNumber(shotOrder);
    
    // 入力モードをリセット
    setCurrentShot({});
    setIsSelectingTargets(false);
  };
  
  // プレイヤーをクリックした時の処理
  const handlePlayerClick = (player: PlayerPosition) => {
    if (mobileMode === 'shots') {
      // モバイル用：プレイヤー情報をコールバックに渡す
      onShotStart?.(player);
    }
  };
  
  // ショット確定処理
  const confirmShots = () => {
    saveToHistory('addShot');
    
    if (selectedPoints.length > 0) {
      // ピンポイントモードでのショット追加
      if (practiceType === 'knock_practice') {
        if (isWaitingForPlayer) {
          // プレイヤーからの返球 - 複数ターゲット対応
          const player = playerPositions.find(p => p.role === 'player');
          if (player) {
            // 各ポイントに一つの矢印を作成（複数ショットタイプをまとめる）
            let shotIndex = 0;
            selectedPoints.forEach((point, index) => {
              const shotTypes = shotTypeSelections[`point_${index}`] || ['clear'];
              if (shotTypes.length > 0) {
                const newShot: ShotTrajectory = {
                  id: `shot_${Date.now()}_${shotIndex}`,
                  from: { x: player.x, y: player.y },
                  to: point,
                  shotType: shotTypes[0], // 最初のタイプを代表として使用
                  shotTypes: shotTypes.length > 1 ? shotTypes : undefined, // 複数ある場合のみ設定
                  shotBy: 'player' as const,
                  order: currentShotNumber + shotIndex,
                  memo: ''
                };
                setShotTrajectories(prev => [...prev, newShot]);
                shotIndex++;
              }
            });
            
            setCurrentShotNumber(currentShotNumber + shotIndex);
          }
          setIsWaitingForPlayer(false); // ノッカーからの配球に戻る
        } else {
        // 通常のショット
        // 各ポイントに一つの矢印を作成（複数ショットタイプをまとめる）
        let shotIndex = 0;
        // 現在のポジションからfrom位置を取得
        let fromPos = { x: 0, y: 0 };
        let shotByRole: 'knocker' | 'player' = 'player';
        if (currentShot.from?.role === 'knocker') {
          const currentKnocker = playerPositions.find(p => p.role === 'knocker');
          fromPos = currentKnocker ? { x: currentKnocker.x, y: currentKnocker.y } : { x: 0, y: 0 };
          shotByRole = 'knocker';
        } else if (currentShot.from) {
          const currentPlayer = playerPositions.find(p => p.id === currentShot.from?.id);
          fromPos = currentPlayer ? { x: currentPlayer.x, y: currentPlayer.y } : { x: currentShot.from.x, y: currentShot.from.y };
          shotByRole = currentShot.from.role || 'player';
        }
        
        selectedPoints.forEach((point, index) => {
          const shotTypes = shotTypeSelections[`point_${index}`] || ['clear'];
          if (shotTypes.length > 0) {
            const newShot: ShotTrajectory = {
              id: `shot_${Date.now()}_${shotIndex}`,
              from: fromPos,
              to: point,
              shotType: shotTypes[0], // 最初のタイプを代表として使用
              shotTypes: shotTypes.length > 1 ? shotTypes : undefined, // 複数ある場合のみ設定
              shotBy: shotByRole,
              order: currentShotNumber + shotIndex,
              memo: ''
            };
            setShotTrajectories(prev => [...prev, newShot]);
            shotIndex++;
          }
        });
        
        setCurrentShotNumber(currentShotNumber + shotIndex);
      }
      } else {
        // パターン練習のショット処理
        if (currentShot.from && selectedPoints.length > 0) {
          let shotIndex = 0;
          selectedPoints.forEach((point, index) => {
            const shotTypes = shotTypeSelections[`point_${index}`] || ['clear'];
            if (shotTypes.length > 0) {
              const newShot: ShotTrajectory = {
                id: `shot_${Date.now()}_${shotIndex}`,
                from: { x: currentShot.from.x, y: currentShot.from.y },
                to: point,
                shotType: shotTypes[0],
                shotTypes: shotTypes.length > 1 ? shotTypes : undefined,
                shotBy: 'player' as const,
                order: currentShotNumber + shotIndex,
                memo: ''
              };
              setShotTrajectories(prev => [...prev, newShot]);
              shotIndex++;
            }
          });
          
          setCurrentShotNumber(currentShotNumber + shotIndex);
          
          // 次のショットのため、着地点のプレイヤーを次の打ち手に設定
          if (currentShot.nextPlayer) {
            // nextPlayerを着地点に移動
            setPlayerPositions(prev => 
              prev.map(p => p.id === currentShot.nextPlayer.id 
                ? { ...p, x: selectedPoints[0].x, y: selectedPoints[0].y } 
                : p
              )
            );
            // 次のショットの準備
            setCurrentShot({ from: currentShot.nextPlayer });
          } else {
            setCurrentShot({});
          }
        }
      }
      
      setSelectedPoints([]);
      setShotTypeSelections({});
      if (practiceType === 'knock_practice') {
        setCurrentShot({});
      }
      setIsSelectingTargets(false);
      setShotInputMode('pinpoint'); // デフォルトに戻す
      
    } else if (selectedAreas.length > 0) {
      // エリアモードでのショット追加
      if (isWaitingForPlayer) {
        // プレイヤーからの返球
        const player = playerPositions.find(p => p.role === 'player');
        if (player) {
          // 接しているエリアをグループ化して一つの矢印でまとめる
          let shotIndex = 0;
          const areaGroups = groupAdjacentAreas(selectedAreas);
          
          areaGroups.forEach(groupAreaIds => {
            // グループ内の全エリアのショットタイプを集約
            const allShotTypes = new Set<string>();
            groupAreaIds.forEach(areaId => {
              const areaTypes = shotTypeSelections[areaId] || ['clear'];
              areaTypes.forEach(type => allShotTypes.add(type));
            });
            
            if (allShotTypes.size > 0) {
              // グループの中心点を計算
              let totalX = 0, totalY = 0, validAreas = 0;
              groupAreaIds.forEach(areaId => {
                const area = COURT_AREAS.find(a => a.id === areaId);
                if (area) {
                  totalX += area.x + area.w/2;
                  totalY += area.y + area.h/2;
                  validAreas++;
                }
              });
              
              if (validAreas > 0) {
                const centerX = totalX / validAreas;
                const centerY = totalY / validAreas;
                const shotTypesArray = Array.from(allShotTypes);
                
                const newShot: ShotTrajectory = {
                  id: `shot_${Date.now()}_${shotIndex}`,
                  from: { x: player.x, y: player.y },
                  to: { x: centerX, y: centerY },
                  shotType: shotTypesArray[0], // 最初のタイプを代表として使用
                  shotTypes: shotTypesArray.length > 1 ? shotTypesArray : undefined,
                  shotBy: 'player',
                  order: currentShotNumber + shotIndex,
                  targetArea: groupAreaIds.join(','),
                  memo: ''
                };
                setShotTrajectories(prev => [...prev, newShot]);
                shotIndex++;
              }
            }
          });
          
          setCurrentShotNumber(currentShotNumber + shotIndex);
        }
        setIsWaitingForPlayer(false); // ノッカーからの配球に戻る
      } else {
        // 接しているエリアをグループ化して一つの矢印でまとめる
        let shotIndex = 0;
        const areaGroups = groupAdjacentAreas(selectedAreas);
        // 現在のポジションからfrom位置を取得
        let fromPos = { x: 0, y: 0 };
        if (currentShot.from?.role === 'knocker') {
          const currentKnocker = playerPositions.find(p => p.role === 'knocker');
          fromPos = currentKnocker ? { x: currentKnocker.x, y: currentKnocker.y } : { x: 0, y: 0 };
        } else if (currentShot.from) {
          const currentPlayer = playerPositions.find(p => p.id === currentShot.from?.id);
          fromPos = currentPlayer ? { x: currentPlayer.x, y: currentPlayer.y } : { x: currentShot.from.x, y: currentShot.from.y };
        }
        
        areaGroups.forEach(groupAreaIds => {
          // グループ内の全エリアのショットタイプを集約
          const allShotTypes = new Set<string>();
          groupAreaIds.forEach(areaId => {
            const areaTypes = shotTypeSelections[areaId] || ['clear'];
            areaTypes.forEach(type => allShotTypes.add(type));
          });
          
          if (allShotTypes.size > 0) {
            // グループの中心点を計算
            let totalX = 0, totalY = 0, validAreas = 0;
            groupAreaIds.forEach(areaId => {
              const area = COURT_AREAS.find(a => a.id === areaId);
              if (area) {
                totalX += area.x + area.w/2;
                totalY += area.y + area.h/2;
                validAreas++;
              }
            });
            
            if (validAreas > 0) {
              const centerX = totalX / validAreas;
              const centerY = totalY / validAreas;
              const shotTypesArray = Array.from(allShotTypes);
              
              // shotByの値を正しく設定
              let shotByRole: 'knocker' | 'player' = 'player';
              if (currentShot.from?.role === 'knocker') {
                shotByRole = 'knocker';
              } else if (currentShot.from?.role) {
                shotByRole = currentShot.from.role as 'knocker' | 'player';
              }
              
              const newShot: ShotTrajectory = {
                id: `shot_${Date.now()}_${shotIndex}`,
                from: fromPos,
                to: { x: centerX, y: centerY },
                shotType: shotTypesArray[0], // 最初のタイプを代表として使用
                shotTypes: shotTypesArray.length > 1 ? shotTypesArray : undefined,
                shotBy: shotByRole,
                order: currentShotNumber + shotIndex,
                targetArea: groupAreaIds.join(','),
                memo: ''
              };
              setShotTrajectories(prev => [...prev, newShot]);
              shotIndex++;
            }
          }
        });
        
        setCurrentShotNumber(currentShotNumber + shotIndex);
      }
      
      setSelectedAreas([]);
      setShotTypeSelections({});
      setShotInputMode('pinpoint'); // デフォルトに戻す
      
      // ノック練習の場合の次のショット準備
      if (practiceType === 'knock_practice') {
        if (isWaitingForPlayer) {
          // プレイヤーの返球が完了したので、次はノッカーの番
          const knocker = playerPositions.find(p => p.role === 'knocker');
          if (knocker) {
            setCurrentShot({ from: knocker });
            setIsSelectingTargets(true);
          } else {
            setCurrentShot({});
            setIsSelectingTargets(false);
          }
        } else {
          // ノッカーの配球が完了したので、プレイヤーの番を待つ
          setCurrentShot({});
          setIsSelectingTargets(false);
          // isWaitingForPlayerはhandleCourtClickで設定される
        }
      } else {
        // パターン練習の場合
        setCurrentShot({});
        setIsSelectingTargets(false);
      }
    }
  };

  // モバイルモードの場合はコートのみを表示（visualInfoを直接使用）
  if (mobileMode) {
    const mobilePlayerPositions = visualInfo.playerPositions || [];
    const mobileShotTrajectories = visualInfo.shotTrajectories || [];
    
    console.log('Mobile mode - using visualInfo directly:', mobileShotTrajectories);
    
    return (
      <div className="relative bg-gray-100 rounded-lg" style={{ width: COURT_WIDTH + COURT_PADDING * 2, height: COURT_HEIGHT + COURT_PADDING * 2 }}>
        <svg 
          viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`}
          className="absolute cursor-pointer"
          style={{ 
            left: COURT_PADDING,
            top: COURT_PADDING,
            width: COURT_WIDTH,
            height: COURT_HEIGHT
          }}
          onClick={handleCourtClick}
            onPointerMove={(e) => {
              if (draggingPlayer && mobileMode === 'players') {
                e.preventDefault();
                const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
                const scaleX = COURT_WIDTH / rect.width;
                const scaleY = COURT_HEIGHT / rect.height;
                const clientX = e.clientX;
                const clientY = e.clientY;
                const newX = Math.max(0, Math.min(COURT_WIDTH, (clientX - rect.left) * scaleX - dragOffset.x));
                const newY = Math.max(0, Math.min(COURT_HEIGHT, (clientY - rect.top) * scaleY - dragOffset.y));
                const newPositions = mobilePlayerPositions.map(p => 
                  p.id === draggingPlayer ? { ...p, x: newX, y: newY } : p
                );
                // requestAnimationFrameを使用してスムーズな更新
                requestAnimationFrame(() => {
                  onUpdate({ ...visualInfo, playerPositions: newPositions });
                });
              }
            }}
            onPointerUp={() => {
              if (draggingPlayer) {
                setDraggingPlayer(null);
              }
            }}
            onPointerLeave={() => {
              if (draggingPlayer) {
                setDraggingPlayer(null);
              }
            }}
          >
            {/* Court Background */}
            <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="#4ade80" />
            
            {/* Court Lines */}
            <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="none" stroke="white" strokeWidth="2" />
            
            {/* Net */}
            <line x1="0" y1={NET_POSITION} x2={COURT_WIDTH} y2={NET_POSITION} stroke="#424242" strokeWidth="3" />
            
            {/* Service Lines */}
            <line x1="0" y1={NET_POSITION - SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={NET_POSITION - SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
            <line x1="0" y1={NET_POSITION + SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={NET_POSITION + SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
            
            {/* Back Boundary Lines */}
            <line x1="0" y1={BACK_BOUNDARY_LINE_SINGLES} x2={COURT_WIDTH} y2={BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth="1.5" />
            <line x1="0" y1={COURT_HEIGHT - BACK_BOUNDARY_LINE_SINGLES} x2={COURT_WIDTH} y2={COURT_HEIGHT - BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth="1.5" />
            
            {/* Center Line */}
            <line x1={COURT_WIDTH / 2} y1="0" x2={COURT_WIDTH / 2} y2={NET_POSITION - SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
            <line x1={COURT_WIDTH / 2} y1={NET_POSITION + SHORT_SERVICE_LINE} x2={COURT_WIDTH / 2} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />
            
            {/* Side Lines */}
            <line x1={SIDE_ALLEY_WIDTH} y1="0" x2={SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />
            <line x1={COURT_WIDTH - SIDE_ALLEY_WIDTH} y1="0" x2={COURT_WIDTH - SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />
            
            {/* 9分割グリッド - エリア選択モードのみ表示 */}
            {mobileMode === 'shots' && onAreaSelect && (
              <>
                {/* 相手側（9分割） */}
                {COURT_AREAS.filter(area => area.id.startsWith('opp_')).map((area) => {
                  const isSelected = mobileSelectedAreas.includes(area.id);
                  return (
                    <rect
                      key={area.id}
                      x={area.x}
                      y={area.y}
                      width={area.w}
                      height={area.h}
                      fill={isSelected ? '#22c55e' : 'transparent'}
                      fillOpacity={isSelected ? 0.4 : 0}
                      stroke={isSelected ? '#16a34a' : '#ffffff'}
                      strokeWidth={isSelected ? '2' : '0.5'}
                      strokeOpacity={isSelected ? 1 : 0.3}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAreaSelect(area.id);
                      }}
                    />
                  );
                })}
                
                {/* エリアラベル表示（選択時のみ） */}
                {COURT_AREAS.filter(area => area.id.startsWith('opp_') && mobileSelectedAreas.includes(area.id)).map((area) => (
                  <text
                    key={`label-${area.id}`}
                    x={area.x + area.w / 2}
                    y={area.y + area.h / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="#ffffff"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {area.name.replace('相手', '')}
                  </text>
                ))}
              </>
            )}
            
            
            {/* ショット軌道 - visualInfoから直接レンダリング */}
            {mobileShotTrajectories.map((shot, index) => {
              const color = shot.isMovement ? '#FCD34D' : (shot.shotBy === 'knocker' ? '#000000' : '#10B981');
              return (
                <g key={shot.id}>
                  <defs>
                    <marker
                      id={`arrow-${shot.id}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
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
                    strokeDasharray={shot.isMovement ? "5,3" : undefined}
                    markerEnd={`url(#arrow-${shot.id})`}
                    opacity="0.8"
                  />
                  <circle
                    cx={(shot.from.x + shot.to.x) / 2}
                    cy={(shot.from.y + shot.to.y) / 2}
                    r="12"
                    fill="white"
                    stroke={color}
                    strokeWidth="2"
                  />
                  <text
                    x={(shot.from.x + shot.to.x) / 2}
                    y={(shot.from.y + shot.to.y) / 2 + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={color}
                  >
                    {shot.order || index + 1}
                  </text>
                </g>
              );
            })}
            
            {/* プレイヤー表示 */}
            {mobilePlayerPositions.map((player) => (
              <g key={player.id}>
                <circle 
                  cx={player.x} 
                  cy={player.y} 
                  r="15"
                  fill={player.color || '#10B981'} 
                  stroke="white" 
                  strokeWidth="2"
                  className="cursor-move"
                  style={{ cursor: mobileMode === 'players' ? 'move' : 'pointer' }}
                  onPointerDown={(e) => {
                    if (mobileMode === 'players') {
                      e.stopPropagation();
                      setDraggingPlayer(player.id);
                      const rect = (e.currentTarget as SVGElement).ownerSVGElement?.getBoundingClientRect();
                      if (rect) {
                        const scaleX = COURT_WIDTH / rect.width;
                        const scaleY = COURT_HEIGHT / rect.height;
                        const clientX = 'touches' in e ? (e as any).touches[0].clientX : e.clientX;
                        const clientY = 'touches' in e ? (e as any).touches[0].clientY : e.clientY;
                        setDragOffset({
                          x: (clientX - rect.left) * scaleX - player.x,
                          y: (clientY - rect.top) * scaleY - player.y
                        });
                      }
                    } else if (mobileMode === 'shots') {
                      e.stopPropagation();
                      handlePlayerClick(player);
                    }
                  }}
                />
                <text 
                  x={player.x} 
                  y={player.y + 5} 
                  textAnchor="middle" 
                  fill="white" 
                  fontSize="12"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {player.label?.charAt(0) || 'P'}
                </text>
              </g>
            ))}
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-1 lg:gap-4 p-1 lg:p-4 h-screen lg:h-auto overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* モバイル用レイアウト: 3タブ切り替え表示 */}
      <div className="lg:hidden flex flex-col h-screen overflow-hidden">
        {/* タブ切り替えボタン */}
        <div className="flex gap-1 p-2 bg-white border-b">
          <button
            type="button"
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              mobileView === 'court' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setMobileView('court');
            }}
          >
            コート
          </button>
          <button
            type="button"
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              mobileView === 'controls' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setMobileView('controls');
            }}
          >
            作成
          </button>
          <button
            type="button"
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
              mobileView === 'history' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setMobileView('history');
            }}
          >
            履歴
          </button>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-hidden">
          {/* コートシート */}
          {mobileView === 'court' && (
            <div className="h-full flex items-center justify-center bg-white p-4">
              <div 
                ref={courtRef}
                className="relative bg-gray-100 rounded-lg shadow-lg"
                style={{ 
                  width: '100%',
                  maxWidth: '500px',
                  aspectRatio: `${COURT_WIDTH + COURT_PADDING * 2} / ${COURT_HEIGHT + COURT_PADDING * 2}`
                }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handlePlayerDrop}
            onClick={(e) => {
              e.stopPropagation();
              handleCourtClick(e);
            }}
          >
            {/* Court SVG content (same as PC version) */}
            <svg 
              viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`}
              className="absolute"
              style={{ 
                left: `${(COURT_PADDING / (COURT_WIDTH + COURT_PADDING * 2)) * 100}%`,
                top: `${(COURT_PADDING / (COURT_HEIGHT + COURT_PADDING * 2)) * 100}%`,
                width: `${(COURT_WIDTH / (COURT_WIDTH + COURT_PADDING * 2)) * 100}%`,
                height: `${(COURT_HEIGHT / (COURT_HEIGHT + COURT_PADDING * 2)) * 100}%`
              }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Court Background */}
              <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="#4ade80" />
              
              {/* Court Lines */}
              <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="none" stroke="white" strokeWidth="2" />
              
              {/* Net */}
              <line x1="0" y1={NET_POSITION} x2={COURT_WIDTH} y2={NET_POSITION} stroke="#424242" strokeWidth="3" />
              
              {/* Service Line (Short) */}
              <line x1="0" y1={NET_POSITION - SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={NET_POSITION - SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
              <line x1="0" y1={NET_POSITION + SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={NET_POSITION + SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
              
              {/* Back Boundary Line (Doubles) */}
              <line x1="0" y1={BACK_BOUNDARY_LINE_SINGLES} x2={COURT_WIDTH} y2={BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth="1.5" />
              <line x1="0" y1={COURT_HEIGHT - BACK_BOUNDARY_LINE_SINGLES} x2={COURT_WIDTH} y2={COURT_HEIGHT - BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth="1.5" />
              
              {/* Center Line (Service Court Only) */}
              <line x1={COURT_WIDTH / 2} y1="0" x2={COURT_WIDTH / 2} y2={NET_POSITION - SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
              <line x1={COURT_WIDTH / 2} y1={NET_POSITION + SHORT_SERVICE_LINE} x2={COURT_WIDTH / 2} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />
              
              {/* Side Line (Singles) */}
              <line x1={SIDE_ALLEY_WIDTH} y1="0" x2={SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />
              <line x1={COURT_WIDTH - SIDE_ALLEY_WIDTH} y1="0" x2={COURT_WIDTH - SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />
              
              {/* ショット表示（モバイル版） */}
              {shotTrajectories.map((shot) => {
                const color = shot.isMovement ? '#FCD34D' : (shot.shotBy === 'knocker' ? '#000000' : '#10B981');
                return (
                  <g key={shot.id}>
                    <defs>
                      <marker
                        id={`arrowhead-${shot.id}`}
                        markerWidth="10"
                        markerHeight="10"
                        refX="8"
                        refY="3"
                        orient="auto"
                      >
                        <path d="M0,0 L0,6 L9,3 z" fill={color} />
                      </marker>
                    </defs>
                    
                    {/* エリアターゲットの場合 */}
                    {shot.targetArea && (
                      <>
                        {shot.targetArea.split(',').map(areaId => {
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
                                fillOpacity={0.2}
                                stroke={color}
                                strokeWidth="1"
                              />
                            );
                          }
                          return null;
                        })}
                      </>
                    )}
                    
                    {/* ショット矢印 */}
                    <line
                      x1={shot.from.x}
                      y1={shot.from.y}
                      x2={shot.to.x}
                      y2={shot.to.y}
                      stroke={color}
                      strokeDasharray={shot.isMovement ? "5,3" : undefined}
                      strokeWidth="2"
                      markerEnd={`url(#arrowhead-${shot.id})`}
                    />
                    
                    {/* ショット番号 */}
                    <circle
                      cx={(shot.from.x + shot.to.x) / 2}
                      cy={(shot.from.y + shot.to.y) / 2}
                      r="10"
                      fill={color}
                    />
                    <text
                      x={(shot.from.x + shot.to.x) / 2}
                      y={(shot.from.y + shot.to.y) / 2 + 4}
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {shot.order}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Player icons with touch support */}
            {playerPositions.map(player => {
              const playerColor = player.color || '#10B981';
              const playerSize = 40;
              return (
                <div 
                  key={player.id}
                  className={`absolute ${inputMode === 'setup' ? 'cursor-move' : 'cursor-pointer'} touch-none`}
                  style={{ 
                    left: `${((player.x + COURT_PADDING) / (COURT_WIDTH + COURT_PADDING * 2)) * 100}%`,
                    top: `${((player.y + COURT_PADDING) / (COURT_HEIGHT + COURT_PADDING * 2)) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${playerSize}px`,
                    height: `${playerSize}px`,
                    backgroundColor: playerColor,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onTouchStart={(e) => {
                    if (inputMode === 'setup') {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const rect = courtRef.current?.getBoundingClientRect();
                      if (rect) {
                        const startX = touch.clientX;
                        const startY = touch.clientY;
                        const startPlayerX = player.x;
                        const startPlayerY = player.y;
                        
                        const handleTouchMove = (moveEvent: TouchEvent) => {
                          moveEvent.preventDefault();
                          const moveTouch = moveEvent.touches[0];
                          const deltaX = (moveTouch.clientX - startX) * (COURT_WIDTH / rect.width);
                          const deltaY = (moveTouch.clientY - startY) * (COURT_HEIGHT / rect.height);
                          
                          const newX = Math.max(0, Math.min(COURT_WIDTH, startPlayerX + deltaX));
                          const newY = Math.max(0, Math.min(COURT_HEIGHT, startPlayerY + deltaY));
                          
                          setPlayerPositions(prev => 
                            prev.map(p => p.id === player.id ? { ...p, x: newX, y: newY } : p)
                          );
                        };
                        
                        const handleTouchEnd = () => {
                          document.removeEventListener('touchmove', handleTouchMove);
                          document.removeEventListener('touchend', handleTouchEnd);
                        };
                        
                        document.addEventListener('touchmove', handleTouchMove, { passive: false });
                        document.addEventListener('touchend', handleTouchEnd);
                      }
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Pattern practice click handling removed (sequential mode deleted)
                    if (inputMode === 'shot' && shotInputMode === 'pinpoint' && !currentShot.from && player.role !== 'feeder') {
                      setCurrentShot({ from: player });
                    }
                  }}
                >
                  {player.role === 'knocker' ? (
                    <MdSportsBaseball className="w-3.5 h-3.5" />
                  ) : player.role === 'feeder' ? (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                    </svg>
                  ) : (
                    <MdPerson className="w-3.5 h-3.5" />
                  )}
                  <div className="absolute -bottom-4 text-[9px] font-medium text-gray-700 whitespace-nowrap">
                    {player.label}
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          )}

          {/* 練習カード作成 */}
          {mobileView === 'controls' && (
            <div className="h-full bg-gray-50 rounded-lg p-4 overflow-y-auto">
              <div className="text-sm font-bold mb-2">練習カード作成</div>
              <div className="text-xs text-gray-600 mb-2">
                {practiceType === 'knock_practice' ? 'ノック練習' : 'パターン練習'}
              </div>
              
              {/* Setup mode */}
              {inputMode === 'setup' && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">追加するアイテム</div>
                  <div className="grid grid-cols-2 gap-1">
                    {practiceType === 'knock_practice' ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItemToCourt('player');
                          }}
                          className="p-2 bg-white border border-green-300 rounded-lg text-xs"
                        >
                          <MdPerson className="w-4 h-4 mx-auto mb-1 text-green-500" />
                          プレイヤー
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItemToCourt('knocker');
                          }}
                          className="p-2 bg-white border border-blue-300 rounded-lg text-xs"
                        >
                          <MdSportsBaseball className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                          ノッカー
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItemToCourt('redPlayer');
                          }}
                          className="p-2 bg-white border border-red-300 rounded-lg text-xs"
                        >
                          <MdPerson className="w-4 h-4 mx-auto mb-1 text-red-500" />
                          赤
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItemToCourt('greenPlayer');
                          }}
                          className="p-2 bg-white border border-green-300 rounded-lg text-xs"
                        >
                          <MdPerson className="w-4 h-4 mx-auto mb-1 text-green-500" />
                          緑
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      saveToHistory('changeMode');
                      setInputMode('shot');
                    }}
                    disabled={playerPositions.length === 0}
                    className="w-full py-1.5 bg-blue-500 text-white rounded-lg text-xs disabled:opacity-50"
                  >
                    ショット入力へ
                  </button>
                </div>
              )}
              
              {/* Shot mode */}
              {inputMode === 'shot' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setInputMode('setup')}
                    className="w-full py-1.5 bg-gray-500 text-white rounded-lg text-xs"
                  >
                    配置モードに戻る
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ショット履歴 */}
          {mobileView === 'history' && (
            <div className="h-full bg-white rounded-lg p-4 overflow-y-auto">
              <div className="text-lg font-bold mb-3">ショット履歴</div>
              <div className="space-y-2">
                {shotTrajectories.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    ショットを入力してください
                  </p>
                ) : (
                  shotTrajectories.map((shot) => (
                    <div key={shot.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm">
                        ショット {shot.order}
                      </div>
                      {shot.shotType && (
                        <div className="text-xs text-gray-600 mt-1">
                          {SHOT_TYPES.find(t => t.id === shot.shotType)?.name}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PC版レイアウト（従来通り） */}
      {/* コートエリア（PC版） */}
      <div className="hidden lg:flex flex-1 items-center justify-center">
        <div 
          ref={courtRef}
          className="relative bg-gray-100 rounded-lg shadow-lg cursor-crosshair w-full lg:w-auto"
          style={{ 
            maxWidth: '100%',
            width: COURT_WIDTH + COURT_PADDING * 2,
            aspectRatio: `${COURT_WIDTH + COURT_PADDING * 2} / ${COURT_HEIGHT + COURT_PADDING * 2}`
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handlePlayerDrop}
          onClick={(e) => {
            e.stopPropagation();
            handleCourtClick(e);
          }}
        >
          {/* Court */}
          <svg 
            viewBox={`0 0 ${COURT_WIDTH} ${COURT_HEIGHT}`}
            className="absolute"
            style={{ 
              left: `${(COURT_PADDING / (COURT_WIDTH + COURT_PADDING * 2)) * 100}%`,
              top: `${(COURT_PADDING / (COURT_HEIGHT + COURT_PADDING * 2)) * 100}%`,
              width: `${(COURT_WIDTH / (COURT_WIDTH + COURT_PADDING * 2)) * 100}%`,
              height: `${(COURT_HEIGHT / (COURT_HEIGHT + COURT_PADDING * 2)) * 100}%`
            }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Court Background */}
            <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="#4ade80" />
            
            {/* Court Lines */}
            <rect x="0" y="0" width={COURT_WIDTH} height={COURT_HEIGHT} fill="none" stroke="white" strokeWidth="2" />
            
            {/* Net */}
            <line x1="0" y1={NET_POSITION} x2={COURT_WIDTH} y2={NET_POSITION} stroke="#424242" strokeWidth="3" />
            
            {/* Service Line (Short) */}
            <line x1="0" y1={NET_POSITION - SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={NET_POSITION - SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
            <line x1="0" y1={NET_POSITION + SHORT_SERVICE_LINE} x2={COURT_WIDTH} y2={NET_POSITION + SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
            
            {/* Back Boundary Line (Doubles) */}
            <line x1="0" y1={BACK_BOUNDARY_LINE_SINGLES} x2={COURT_WIDTH} y2={BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth="1.5" />
            <line x1="0" y1={COURT_HEIGHT - BACK_BOUNDARY_LINE_SINGLES} x2={COURT_WIDTH} y2={COURT_HEIGHT - BACK_BOUNDARY_LINE_SINGLES} stroke="white" strokeWidth="1.5" />
            
            {/* Center Line (Service Court Only) */}
            <line x1={COURT_WIDTH / 2} y1="0" x2={COURT_WIDTH / 2} y2={NET_POSITION - SHORT_SERVICE_LINE} stroke="white" strokeWidth="1.5" />
            <line x1={COURT_WIDTH / 2} y1={NET_POSITION + SHORT_SERVICE_LINE} x2={COURT_WIDTH / 2} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />
            
            {/* Side Line (Singles) */}
            <line x1={SIDE_ALLEY_WIDTH} y1="0" x2={SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />
            <line x1={COURT_WIDTH - SIDE_ALLEY_WIDTH} y1="0" x2={COURT_WIDTH - SIDE_ALLEY_WIDTH} y2={COURT_HEIGHT} stroke="white" strokeWidth="1.5" />

            {/* Connected area group background display */}
            {((inputMode === 'shot' && shotInputMode === 'area' && currentShot.from) || 
              (practiceType === 'pattern_practice' && selectedPlayerForSettings && playerSettingsMode === 'area')) &&
              (selectedAreas.length > 0 || tempShotTargets.some(t => t.area)) && (
                <g>
                  {(() => {
                    // プレイヤー設定モードの場合はtempShotTargetsから、それ以外はselectedAreasを使用
                    const areasToGroup = true 
                      ? tempShotTargets.map(t => t.area).filter(Boolean) as string[]
                      : selectedAreas;
                    return groupAdjacentAreas(areasToGroup).map((groupAreaIds, groupIndex) => {
                  if (groupAreaIds.length <= 1) return null;
                  
                  // グループの境界を計算
                  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
                  groupAreaIds.forEach(areaId => {
                    const area = COURT_AREAS.find(a => a.id === areaId);
                    if (area) {
                      minX = Math.min(minX, area.x);
                      minY = Math.min(minY, area.y);
                      maxX = Math.max(maxX, area.x + area.w);
                      maxY = Math.max(maxY, area.y + area.h);
                    }
                  });
                  
                  // グループ全体のショットタイプを集約
                  let groupColor = '#FCD34D';
                  if (true) {
                    // プレイヤー設定モードでは紫色
                    groupColor = '#8B5CF6';
                  } else {
                    const allTypes = new Set<string>();
                    groupAreaIds.forEach(areaId => {
                      const types = shotTypeSelections[areaId] || [];
                      types.forEach(type => allTypes.add(type));
                    });
                    const primaryType = allTypes.size > 0 ? SHOT_TYPES.find(t => allTypes.has(t.id)) : null;
                    groupColor = primaryType?.color || '#FCD34D';
                  }
                  
                  return (
                    <rect
                      key={`group-${groupIndex}`}
                      x={minX - 2}
                      y={minY - 2}
                      width={maxX - minX + 4}
                      height={maxY - minY + 4}
                      fill={groupColor}
                      fillOpacity={0.15}
                      stroke={groupColor}
                      strokeWidth="3"
                      strokeDasharray="8,4"
                      rx="4"
                      className="pointer-events-none"
                    />
                  );
                  });
                  })()}
                </g>
              )}
            
            {/* Area display and selection - always visible for click interaction */}
            {COURT_AREAS.map(area => {
                  // プレイヤー設定モードでのエリア選択状態をチェック
                  const isSelectedInPlayerSettings = true && 
                    selectedPlayerForSettings && 
                    playerSettingsMode === 'area' &&
                    tempShotTargets.some(t => t.area === area.id);
                  
                  // エリアを表示する条件
                  const shouldShowArea = (inputMode === 'shot' && shotInputMode === 'area') ||
                    (practiceType === 'pattern_practice' && 
                     selectedPlayerForSettings && playerSettingsMode === 'area');
                  
                  const isSelected = selectedAreas.includes(area.id) || isSelectedInPlayerSettings;
                  const selectedTypes = shotTypeSelections[area.id] || [];
                  // 複数選択の場合は最初のタイプの色を使用、未選択の場合はデフォルト色
                  const primaryShotType = selectedTypes.length > 0 ? SHOT_TYPES.find(t => t.id === selectedTypes[0]) : null;
                  const fillColor = isSelected ? (isSelectedInPlayerSettings ? '#8B5CF6' : primaryShotType?.color || '#FCD34D') : 'transparent';
                  
                  // エリアを表示すべきでない場合は何も表示しない
                  if (!shouldShowArea) return null;
                  
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
                        className="cursor-pointer transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAreaClick(area.id);
                        }}
                      />
                      {isSelected && (
                        <g>
                          <text
                            x={area.x + area.w/2}
                            y={area.y + area.h/2 - 5}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="10"
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {area.name}
                          </text>
                          {selectedTypes.length > 0 && (
                            <text
                              x={area.x + area.w/2}
                              y={area.y + area.h/2 + 8}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill="white"
                              fontSize="9"
                              fontWeight="bold"
                              className="pointer-events-none"
                            >
                              {selectedTypes.length}種類
                            </text>
                          )}
                        </g>
                      )}
                    </g>
                  );
                })}
            
            {/* Shot trajectories (displayed above areas) */}
            <g>
              {/* プレイヤー設定モードで設定済みのショットを表示 */}
              {practiceType === 'pattern_practice' && 
                (() => {
                  // 同じターゲットへのショットをグループ化
                  const groupedShots: { [key: string]: { shots: any[], from: any, to: any, targetArea?: string } } = {};
                  let shotCounter = 0;
                  
                  Object.entries(playerShotSettings).forEach(([playerId, shots]) => {
                    shots.forEach(shot => {
                      const key = `${shot.from.x}_${shot.from.y}_${shot.to.x}_${shot.to.y}_${shot.targetArea || ''}`;
                      if (!groupedShots[key]) {
                        groupedShots[key] = {
                          shots: [],
                          from: shot.from,
                          to: shot.to,
                          targetArea: shot.targetArea
                        };
                      }
                      groupedShots[key].shots.push({
                        ...shot,
                        playerId,
                        orderNumber: ++shotCounter
                      });
                    });
                  });
                  
                  return Object.entries(groupedShots).map(([key, group], groupIndex) => {
                    const targetAreaIds = group.targetArea ? group.targetArea.split(',') : [];
                    
                    return (
                      <g key={key}>
                        {/* エリアターゲットの場合 */}
                        {targetAreaIds.length > 0 && targetAreaIds.map(areaId => {
                          const area = COURT_AREAS.find(a => a.id === areaId);
                          if (!area) return null;
                          const firstShot = group.shots[0];
                          const shotType = SHOT_TYPES.find(t => t.id === firstShot.shotType);
                          const fillColor = shotType?.color || '#10B981';
                          return (
                            <rect
                              key={areaId}
                              x={area.x}
                              y={area.y}
                              width={area.w}
                              height={area.h}
                              fill={fillColor}
                              fillOpacity={0.15}
                              stroke="none"
                              className="pointer-events-none"
                            />
                          );
                        })}
                        
                        {/* 矢印 - グループの最初のショットの色を使用 */}
                        {(() => {
                          const firstShot = group.shots[0];
                          const shotType = SHOT_TYPES.find(t => t.id === firstShot.shotType);
                          const arrowColor = shotType?.color || '#10B981';
                          
                          return (
                            <>
                              <line
                                x1={group.from.x}
                                y1={group.from.y}
                                x2={group.to.x}
                                y2={group.to.y}
                                stroke={arrowColor}
                                strokeWidth="2.5"
                                markerEnd={`url(#arrow-group-${groupIndex})`}
                                className="pointer-events-none"
                              />
                              <defs>
                                <marker
                                  id={`arrow-group-${groupIndex}`}
                                  markerWidth="8"
                                  markerHeight="8"
                                  refX="6"
                                  refY="3"
                                  orient="auto"
                                  markerUnits="strokeWidth"
                                >
                                  <path
                                    d="M0,0 L0,6 L7,3 z"
                                    fill={arrowColor}
                                  />
                                </marker>
                              </defs>
                            </>
                          );
                        })()}
                        
                        {/* ショット番号 - 複数の場合はカンマ区切りで表示 */}
                        <g>
                          <circle
                            cx={group.from.x + (group.to.x - group.from.x) * 0.5}
                            cy={group.from.y + (group.to.y - group.from.y) * 0.5}
                            r={group.shots.length > 1 ? 16 : 12}
                            fill="white"
                            stroke="#6B7280"
                            strokeWidth="2"
                            className="pointer-events-none"
                          />
                          <text
                            x={group.from.x + (group.to.x - group.from.x) * 0.5}
                            y={group.from.y + (group.to.y - group.from.y) * 0.5 + 1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#374151"
                            fontSize={group.shots.length > 2 ? "9" : "11"}
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {group.shots.map(s => s.orderNumber).join(',')}
                          </text>
                        </g>
                      </g>
                    );
                  });
                })()}
              
              {/* 既存のショット軌道 */}
              {shotTrajectories.map((shot) => {
                const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
                const color = shot.isMovement ? '#FCD34D' : (shot.shotBy === 'knocker' ? '#000000' : (shotType?.color || '#10B981'));
                
                // エリアターゲットの場合、複数エリアを塗りつぶす
                const targetAreaIds = shot.targetArea ? shot.targetArea.split(',') : [];
                
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
                
                {/* Fill area */}
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
                  strokeDasharray={shot.isMovement ? "5,3" : undefined}
                  markerEnd={`url(#arrow-${shot.id})`}
                />
                
                {/* Shot number and multiple shot type indicator */}
                <circle
                  cx={shot.from.x + (shot.to.x - shot.from.x) / 2}
                  cy={shot.from.y + (shot.to.y - shot.from.y) / 2}
                  r={shot.shotTypes && shot.shotTypes.length > 1 ? "15" : "12"}
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray={shot.shotTypes && shot.shotTypes.length > 1 ? "3,2" : "0"}
                />
                <text
                  x={shot.from.x + (shot.to.x - shot.from.x) / 2}
                  y={shot.from.y + (shot.to.y - shot.from.y) / 2 + (shot.shotTypes && shot.shotTypes.length > 1 ? -2 : 4)}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill={color}
                >
                  {shot.order}
                </text>
                {/* Multiple shot type count display */}
                {shot.shotTypes && shot.shotTypes.length > 1 && (
                  <text
                    x={shot.from.x + (shot.to.x - shot.from.x) / 2}
                    y={shot.from.y + (shot.to.y - shot.from.y) / 2 + 10}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill={color}
                  >
                    {shot.shotTypes.length}種
                  </text>
                )}
              </g>
            );
          })}
          </g>
          </svg>

          {/* Selected points display */}
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

          {/* Player display */}
          {playerPositions.map(player => (
            <div
              key={player.id}
              draggable={inputMode === 'setup'}
              onDragStart={(e) => handlePlayerDrag(e, player)}
              className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                inputMode === 'setup' ? 'cursor-move' : 
                practiceType === 'pattern_practice' && inputMode === 'shot' && !selectedPlayerForSettings ? 'cursor-pointer hover:scale-110' :
                practiceType === 'pattern_practice' && isWaitingForPlayer && !currentShot.nextPlayer && player.id !== currentShot.from?.id ? 'cursor-pointer hover:scale-110' :
                'cursor-default'
              } ${
                currentShot.from?.id === player.id ? 'ring-4 ring-purple-400 ring-offset-2' :
                currentShot.nextPlayer?.id === player.id ? 'ring-4 ring-green-400 ring-offset-2' :
                selectedPlayerForSettings?.id === player.id ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
              }`}
              style={{
                left: player.x + COURT_PADDING - 20,
                top: player.y + COURT_PADDING - 20,
                backgroundColor: player.color || '#10B981'
              }}
              onClick={(e) => {
                e.stopPropagation();
                // パターン練習でプレイヤー選択
                if (practiceType === 'pattern_practice' && inputMode === 'shot') {
                  // プレイヤー設定モードの場合
                  if (!selectedPlayerForSettings && (player.role === 'player' || player.role === 'opponent')) {
                    // プレイヤーを選択
                    setSelectedPlayerForSettings(player);
                    setTempShotTargets([]);
                    setSelectedPoints([]);
                    setSelectedAreas([]);
                  }
                }
                if (inputMode === 'shot' && shotInputMode === 'pinpoint' && !currentShot.from && player.role !== 'feeder') {
                  setCurrentShot({ from: player });
                }
              }}
            >
              {player.role === 'knocker' ? (
                <MdSportsBaseball className="w-5 h-5" />
              ) : player.role === 'feeder' ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
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

      {/* ツールボックス（中央） */}
      <div className={`w-full lg:w-80 bg-gray-50 rounded-lg p-3 lg:p-4 flex flex-col gap-3 lg:gap-4 lg:h-[600px] lg:min-h-[600px] lg:max-h-[600px] overflow-y-auto ${
        mobileView !== 'controls' ? 'hidden lg:flex' : 'flex'
      }`}>
        {/* 練習タイプ表示 */}
        <div className="text-sm text-gray-600">
          {practiceType === 'knock_practice' ? 'ノック練習' : 'パターン練習'}
        </div>

        {/* Setup mode */}
        {inputMode === 'setup' && (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">コートに追加するアイテム</div>
              <div className="grid grid-cols-3 gap-2">
                {practiceType === 'knock_practice' ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItemToCourt('player');
                      }}
                      className="p-2 sm:p-3 bg-white border-2 border-green-300 rounded-lg hover:bg-green-50 transition-all flex flex-col items-center gap-1"
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
                      className="p-2 sm:p-3 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-all flex flex-col items-center gap-1"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <MdSportsBaseball className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-medium whitespace-nowrap">ノッカー</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItemToCourt('redPlayer');
                      }}
                      className="p-2 sm:p-3 bg-white border-2 border-red-300 rounded-lg hover:bg-red-50 transition-all flex flex-col items-center gap-1"
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <MdPerson className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-medium whitespace-nowrap">赤プレイヤー</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItemToCourt('greenPlayer');
                      }}
                      className="p-2 sm:p-3 bg-white border-2 border-green-300 rounded-lg hover:bg-green-50 transition-all flex flex-col items-center gap-1"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <MdPerson className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-medium whitespace-nowrap">緑プレイヤー</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItemToCourt('cone');
                  }}
                  className="p-2 sm:p-3 bg-white border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-all flex flex-col items-center gap-1"
                >
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="2" />
                      <path d="M12 10v12" />
                      <path d="M8 14l8 8" />
                      <path d="M16 14l-8 8" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap">コーン</span>
                </button>
              </div>
            </div>

            {/* Placed items */}
            <div className="space-y-2">
              <div className="text-sm font-medium">配置済みアイテム</div>
              <div className="bg-white rounded-lg p-2 sm:p-3 max-h-32 sm:max-h-40 overflow-y-auto">
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
                              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="12" cy="12" r="2" fill="currentColor" />
                              </svg>
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

            {/* Setup complete button */}
            {playerPositions.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  saveToHistory('changeMode');
                  setInputMode('shot');
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
              >
                <span className="whitespace-nowrap">配置完了してショット入力へ →</span>
              </button>
            )}
          </>
        )}

        {/* Shot input mode */}
        {inputMode === 'shot' && (
          <>
            
            {/* Knocker selection for knock practice */}
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
            
            {/* Player settings mode for pattern practice */}
            {practiceType === 'pattern_practice' && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {!selectedPlayerForSettings ? 'ショットを設定するプレイヤーを選択' : 
                   tempShotTargets.length === 0 ? `${selectedPlayerForSettings.label}のショット着地点を選択` :
                   'ショットタイプを選択'}
                </div>
                
                {/* プレイヤー選択 */}
                {!selectedPlayerForSettings && (
                  <div className="space-y-2">
                    {/* 赤チーム */}
                    <div>
                      <div className="text-[10px] font-medium text-red-600 mb-1">赤チーム（奥）</div>
                      <div className="grid grid-cols-2 gap-1">
                        {playerPositions.filter(p => {
                          // opponentロールは赤チームとして扱う
                          const team = p.team || (p.role === 'opponent' ? 'red' : p.id.includes('red') ? 'red' : p.id.includes('green') ? 'green' : null);
                          return (p.role === 'player' || p.role === 'opponent') && team === 'red';
                        }).map(player => {
                          const shots = playerShotSettings[player.id] || [];
                          return (
                            <button
                              key={player.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Selected red player:', player);
                                setSelectedPlayerForSettings(player);
                              }}
                              className="p-1.5 border-2 rounded-lg transition-all flex items-center gap-1 border-gray-300 bg-white hover:border-red-300"
                            >
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" 
                                   style={{ backgroundColor: player.color }}>
                                {player.label}
                              </div>
                              <span className="text-[10px] font-medium">
                                {shots.length > 0 ? `(${shots.length}ショット)` : '未設定'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* 緑チーム */}
                    <div>
                      <div className="text-[10px] font-medium text-green-600 mb-1">緑チーム（手前）</div>
                      <div className="grid grid-cols-2 gap-1">
                        {playerPositions.filter(p => {
                          // opponentロールは赤チームとして扱う
                          const team = p.team || (p.role === 'opponent' ? 'red' : p.id.includes('red') ? 'red' : p.id.includes('green') ? 'green' : null);
                          return (p.role === 'player' || p.role === 'opponent') && team === 'green';
                        }).map(player => {
                          const shots = playerShotSettings[player.id] || [];
                          return (
                            <button
                              key={player.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Selected green player:', player);
                                setSelectedPlayerForSettings(player);
                              }}
                              className="p-1.5 border-2 rounded-lg transition-all flex items-center gap-1 border-gray-300 bg-white hover:border-green-300"
                            >
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" 
                                   style={{ backgroundColor: player.color }}>
                                {player.label}
                              </div>
                              <span className="text-[10px] font-medium">
                                {shots.length > 0 ? `(${shots.length}ショット)` : '未設定'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 選択中のプレイヤー表示と着地点選択 */}
                {selectedPlayerForSettings && tempShotTargets.length === 0 && (
                  <div className="space-y-2">
                    <div className="bg-purple-50 p-2 rounded-lg flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" 
                           style={{ backgroundColor: selectedPlayerForSettings.color }}>
                        {selectedPlayerForSettings.label}
                      </div>
                      <span className="text-xs">のショットを設定中</span>
                    </div>
                    
                    {/* 入力モード選択 */}
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPlayerSettingsMode('pinpoint');
                          setTempShotTargets([]);
                          setSelectedPoints([]);
                          setPlayerSettingsShotTypes({});
                        }}
                        className={`p-1.5 text-[10px] rounded transition-all ${
                          playerSettingsMode === 'pinpoint' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ピンポイント
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlayerSettingsMode('area');
                          setTempShotTargets([]);
                          setSelectedPoints([]);
                          setPlayerSettingsShotTypes({});
                        }}
                        className={`p-1.5 text-[10px] rounded transition-all ${
                          playerSettingsMode === 'area' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        エリア
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      {playerSettingsMode === 'pinpoint' 
                        ? 'コート上をクリックして着地点を選択（複数選択可）'
                        : 'エリアをクリックして選択（複数選択可）'}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlayerForSettings(null);
                        setTempShotTargets([]);
                        setSelectedPoints([]);
                        setSelectedAreas([]);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      ← プレイヤー選択に戻る
                    </button>
                  </div>
                )}
                
                {/* ショットタイプ選択 */}
                {selectedPlayerForSettings && tempShotTargets.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">ショットタイプを選択（複数選択可）</div>
                    <div className="grid grid-cols-3 gap-1">
                      {SHOT_TYPES.map(shotType => {
                        // 選択中のターゲットのキーを作成
                        const targetKey = playerSettingsMode === 'area' && tempShotTargets[0]?.area 
                          ? `area_${tempShotTargets.map(t => t.area).sort().join('_')}`
                          : `point_${selectedPlayerForSettings.id}_${tempShotTargets.length}`;
                        const selectedTypes = playerSettingsShotTypes[targetKey] || [];
                        const isSelected = selectedTypes.includes(shotType.id);
                        
                        return (
                          <button
                            key={shotType.id}
                            type="button"
                            onClick={() => {
                              setPlayerSettingsShotTypes(prev => {
                                const current = prev[targetKey] || [];
                                if (current.includes(shotType.id)) {
                                  // 既に選択されていれば削除
                                  return {
                                    ...prev,
                                    [targetKey]: current.filter(t => t !== shotType.id)
                                  };
                                } else {
                                  // 選択されていなければ追加
                                  return {
                                    ...prev,
                                    [targetKey]: [...current, shotType.id]
                                  };
                                }
                              });
                            }}
                            className={`col-span-1 flex flex-col items-center gap-1 p-2 border-2 rounded-lg transition-all ${
                              isSelected 
                                ? 'bg-opacity-20 border-opacity-100' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                            }`}
                            style={isSelected ? {
                              backgroundColor: shotType.color + '33',
                              borderColor: shotType.color,
                              color: shotType.color
                            } : {}}
                          >
                            <div className="w-6 h-6">
                              {shotType.icon}
                            </div>
                            <span className="text-[10px] font-medium">{shotType.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* ショット確定ボタン */}
                    {Object.values(playerSettingsShotTypes).some(types => types.length > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedPlayerForSettings && tempShotTargets.length > 0) {
                            const playerId = selectedPlayerForSettings.id;
                            const existingShots = playerShotSettings[playerId] || [];
                            const newShots: ShotTrajectory[] = [];
                            
                            if (playerSettingsMode === 'area' && tempShotTargets.some(t => t.area)) {
                              // エリアモード: 隣接エリアをグループ化
                              const areaIds = tempShotTargets.map(t => t.area).filter(Boolean) as string[];
                              const groups = groupAdjacentAreas(areaIds);
                              
                              groups.forEach(groupAreaIds => {
                                const targetKey = `area_${groupAreaIds.sort().join('_')}`;
                                const shotTypes = playerSettingsShotTypes[targetKey] || ['clear'];
                                
                                shotTypes.forEach((shotType, typeIndex) => {
                                  const targetArea = groupAreaIds.join(',');
                                  // グループの中心を計算
                                  let centerX = 0, centerY = 0;
                                  groupAreaIds.forEach(areaId => {
                                    const area = COURT_AREAS.find(a => a.id === areaId);
                                    if (area) {
                                      centerX += area.x + area.w / 2;
                                      centerY += area.y + area.h / 2;
                                    }
                                  });
                                  centerX /= groupAreaIds.length;
                                  centerY /= groupAreaIds.length;
                                  
                                  newShots.push({
                                    id: `shot_${Date.now()}_${playerId}_${groupAreaIds.join('_')}_${typeIndex}`,
                                    from: { x: selectedPlayerForSettings.x, y: selectedPlayerForSettings.y },
                                    to: { x: centerX, y: centerY },
                                    targetArea,
                                    shotType,
                                    shotBy: 'player',
                                    order: 0
                                  });
                                });
                              });
                            } else {
                              // ピンポイントモード
                              tempShotTargets.forEach((target, index) => {
                                const targetKey = `point_${selectedPlayerForSettings.id}_${tempShotTargets.length}`;
                                const shotTypes = playerSettingsShotTypes[targetKey] || ['clear'];
                                
                                shotTypes.forEach((shotType, typeIndex) => {
                                  newShots.push({
                                    id: `shot_${Date.now()}_${playerId}_${index}_${typeIndex}`,
                                    from: { x: selectedPlayerForSettings.x, y: selectedPlayerForSettings.y },
                                    to: { x: target.x, y: target.y },
                                    shotType,
                                    shotBy: 'player',
                                    order: 0
                                  });
                                });
                              });
                            }
                            
                            setPlayerShotSettings(prev => ({
                              ...prev,
                              [playerId]: [...existingShots, ...newShots]
                            }));
                            
                            // リセット
                            setSelectedPlayerForSettings(null);
                            setTempShotTargets([]);
                            setSelectedPoints([]);
                            setSelectedAreas([]);
                            setPlayerSettingsShotTypes({});
                            setIsSelectingTargets(false);
                          }
                        }}
                        className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium text-sm"
                      >
                        ショットを確定
                      </button>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTempShotTargets([]);
                          setSelectedPoints([]);
                          setSelectedAreas([]);
                          setIsSelectingTargets(false);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 設定済みショット一覧と完了ボタン */}
                {Object.keys(playerShotSettings).length > 0 && !selectedPlayerForSettings && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">設定済みショット</div>
                    <div className="bg-gray-50 rounded p-2 max-h-32 overflow-y-auto">
                      {Object.entries(playerShotSettings).map(([playerId, shots]) => {
                        const player = playerPositions.find(p => p.id === playerId);
                        if (!player) return null;
                        return (
                          <div key={playerId} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                                   style={{ backgroundColor: player.color }}>
                                {player.label}
                              </div>
                              <span className="text-[10px]">{shots.length}ショット</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPlayerShotSettings(prev => {
                                  const newSettings = { ...prev };
                                  delete newSettings[playerId];
                                  return newSettings;
                                });
                              }}
                              className="text-[10px] text-red-500 hover:text-red-700"
                            >
                              削除
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // 全プレイヤーの設定からパターンを生成
                        generatePatternFromPlayerSettings();
                      }}
                      className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-sm"
                    >
                      設定したショットを表示
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Current state display */}
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-gray-400 mt-0.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">操作ガイド</div>
                  <div className="text-sm text-gray-700">
                    {practiceType === 'knock_practice' ? (
                      isWaitingForPlayer ? 
                        (latestShotLanding ? 
                          'プレイヤーを着地点に移動させてください' :
                          'プレイヤーからの返球を設定してください') :
                        'ノッカーからの配球着地点をクリック'
                    ) : (
                      currentShot.from ? 
                        `${currentShot.from.label}からのショット着地点を選択` :
                        'ショットを打つプレイヤーを選択'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Player movement selection */}
            {practiceType === 'knock_practice' && isWaitingForPlayer && latestShotLanding && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">プレイヤー移動選択</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {playerPositions
                    .filter(player => player.role !== 'knocker')
                    .map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePlayerToShotLanding(player.id);
                        }}
                        className="w-full px-3 py-2 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 text-gray-700 rounded-lg transition-all font-medium flex items-center gap-2 border border-gray-200 hover:border-green-300"
                      >
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: player.color || '#10B981' }}
                        />
                        <MdPerson className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {player.label || ((player.role === 'player' || player.role === 'opponent') ? 'プレイヤー' : 'その他')}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">→着地点</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Hide landing point selection during knock practice (until player moves to landing point) and during player settings mode */}
            {!(practiceType === 'knock_practice' && (!isWaitingForPlayer || (isWaitingForPlayer && latestShotLanding))) && 
             !(practiceType === 'pattern_practice') && (
              <div className="space-y-2">
                <div className="text-sm font-medium">着地点選択</div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShotInputMode('pinpoint');
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 min-h-[65px] border-2 ${
                      shotInputMode === 'pinpoint' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <svg viewBox="0 0 32 32" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {/* Arrow */}
                      <path d="M10 10 L20 20" strokeWidth="1.8" markerEnd="url(#arrowhead-pinpoint)" />
                      {/* Target */}
                      <circle cx="20" cy="20" r="4" fill="none" strokeWidth="1.2" />
                      <circle cx="20" cy="20" r="2" fill="none" strokeWidth="1" />
                      <circle cx="20" cy="20" r="0.8" fill="currentColor" />
                      <defs>
                        <marker id="arrowhead-pinpoint" markerWidth="6" markerHeight="6" refX="5" refY="2" orient="auto">
                          <path d="M0,0 L0,4 L5,2 z" fill="currentColor" />
                        </marker>
                      </defs>
                    </svg>
                    ピンポイント
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShotInputMode('area');
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
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 min-h-[65px] border-2 ${
                      shotInputMode === 'area' 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/25' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-purple-50 hover:to-purple-100 hover:text-purple-700 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <svg viewBox="0 0 32 32" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {/* Arrow */}
                      <path d="M8 8 L20 20" strokeWidth="1.8" markerEnd="url(#arrowhead-area)" />
                      {/* Area selection range */}
                      <rect x="18" y="18" width="8" height="8" rx="1" strokeDasharray="1.5,1" strokeWidth="1" />
                      <rect x="19.5" y="19.5" width="5" height="5" rx="0.5" strokeDasharray="1,0.5" strokeWidth="0.8" />
                      <rect x="20.5" y="20.5" width="3" height="3" rx="0.5" fill="currentColor" fillOpacity="0.4" strokeWidth="0.5" />
                      <defs>
                        <marker id="arrowhead-area" markerWidth="6" markerHeight="6" refX="5" refY="2" orient="auto">
                          <path d="M0,0 L0,4 L5,2 z" fill="currentColor" />
                        </marker>
                      </defs>
                    </svg>
                    エリア
                  </button>
                </div>
              </div>
            )}

            {/* Target selection complete button */}
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

            {/* Select by shot type */}
            {!isSelectingTargets && (selectedPoints.length > 0 || selectedAreas.length > 0) && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  各ターゲットのショットタイプを選択
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {/* Pinpoint mode */}
                  {shotInputMode === 'pinpoint' && selectedPoints.map((point, index) => {
                  const pointId = `point_${index}`;
                  const selectedTypes = shotTypeSelections[pointId] || [];
                  return (
                    <div key={pointId} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-2">
                        ターゲット {index + 1} {selectedTypes.length > 0 && <span className="text-blue-600">({selectedTypes.length}種類選択中)</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {SHOT_TYPES.map(type => {
                          const isSelected = selectedTypes.includes(type.id);
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShotTypeChange(pointId, type.id);
                              }}
                              className={`px-2 py-2 rounded text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 relative ${
                                isSelected 
                                  ? 'text-white ring-2' 
                                  : 'text-gray-700 hover:bg-opacity-20'
                              }`}
                              style={{
                                backgroundColor: isSelected ? type.color : type.color + '20',
                                borderColor: type.color,
                                borderWidth: '1px',
                                ringColor: isSelected ? type.color : 'transparent'
                              }}
                            >
                              {React.cloneElement(type.icon, { className: 'w-4 h-4 flex-shrink-0' })}
                              <span className="text-[10px] leading-tight">{type.name}</span>
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">✓</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                {/* Area mode */}
                {shotInputMode === 'area' && selectedAreas.map((areaId) => {
                  const area = COURT_AREAS.find(a => a.id === areaId);
                  const selectedTypes = shotTypeSelections[areaId] || [];
                  return (
                    <div key={areaId} className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-2">
                        エリア: {area?.name} {selectedTypes.length > 0 && <span className="text-blue-600">({selectedTypes.length}種類選択中)</span>}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {SHOT_TYPES.map(type => {
                          const isSelected = selectedTypes.includes(type.id);
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShotTypeChange(areaId, type.id);
                              }}
                              className={`px-2 py-2 rounded text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 relative ${
                                isSelected 
                                  ? 'text-white ring-2' 
                                  : 'text-gray-700 hover:bg-opacity-20'
                              }`}
                              style={{
                                backgroundColor: isSelected ? type.color : type.color + '20',
                                borderColor: type.color,
                                borderWidth: '1px',
                                ringColor: isSelected ? type.color : 'transparent'
                              }}
                            >
                              {React.cloneElement(type.icon, { className: 'w-4 h-4 flex-shrink-0' })}
                              <span className="text-[10px] leading-tight">{type.name}</span>
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">✓</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
                
                {/* Shot confirmation button */}
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

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              // ショット履歴がある場合は通常のundo
              if (history.length > 0) {
                undoLastAction();
              } 
              // ショット履歴がなく、ショット入力モードの場合は配置設定に戻る
              else if (inputMode === 'shot' && shotTrajectories.length === 0) {
                setInputMode('setup');
                // 選択状態をリセット
                setCurrentShot({});
                setSelectedPoints([]);
                setSelectedAreas([]);
                setIsSelectingTargets(false);
                setSelectedPlayerForSettings(null);
                setTempShotTargets([]);
              }
            }}
            disabled={history.length === 0 && !(inputMode === 'shot' && shotTrajectories.length === 0)}
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
      <div className={`w-full lg:w-80 bg-white rounded-lg p-3 lg:p-4 ${
        mobileView !== 'history' ? 'hidden lg:block' : 'block'
      }`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GiShuttlecock className="w-5 h-5 text-gray-600" />
            ショット履歴
          </h3>
          <span className="text-sm text-gray-500">
            {(() => {
              // プレイヤー設定モードの場合は全プレイヤーのショット数を合計
              if (practiceType === 'pattern_practice') {
                const totalShots = Object.values(playerShotSettings).flat().length;
                return `${totalShots}球`;
              }
              return `${shotTrajectories.length}球`;
            })()}
          </span>
        </div>
        
        <div className="space-y-2 overflow-y-auto">
          {/* プレイヤー設定モードの履歴表示 */}
          {practiceType === 'pattern_practice' ? (
            Object.entries(playerShotSettings).map(([playerId, shots]) => {
              if (shots.length === 0) return null;
              const player = playerPositions.find(p => p.id === playerId);
              if (!player) return null;
              
              return (
                <div key={playerId} className="border-l-4 pl-2" style={{ borderColor: player.color }}>
                  <div className="text-xs font-semibold text-gray-700 mb-1">
                    {player.label}のショット
                  </div>
                  {shots.map((shot, index) => {
                    const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
                    const targetAreaIds = shot.targetArea ? shot.targetArea.split(',') : [];
                    const areaNames = targetAreaIds.map(id => {
                      const area = COURT_AREAS.find(a => a.id === id);
                      return area ? area.name : id;
                    }).join(' + ');
                    
                    return (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                               style={{ backgroundColor: shotType?.color || '#10B981' }}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {shotType && (
                                <>
                                  <div className="w-5 h-5" style={{ color: shotType.color }}>
                                    {shotType.icon}
                                  </div>
                                  <span className="text-sm font-medium" style={{ color: shotType.color }}>
                                    {shotType.name}
                                  </span>
                                </>
                              )}
                            </div>
                            {areaNames && (
                              <div className="text-xs text-gray-500 mt-1">
                                → {areaNames}
                              </div>
                            )}
                          </div>
                        </div>
                        <ShotMemo
                          shotId={`${playerId}_${index}`}
                          memo={shot.memo}
                          onUpdateMemo={(shotId, memo) => {
                            saveToHistory('editMemo');
                            setPlayerShotSettings(prev => {
                              const playerShots = [...(prev[playerId] || [])];
                              if (playerShots[index]) {
                                playerShots[index] = { ...playerShots[index], memo };
                              }
                              return { ...prev, [playerId]: playerShots };
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : shotTrajectories.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              ショットを入力してください
            </p>
          ) : (
            shotTrajectories
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((shot) => {
                const shotType = SHOT_TYPES.find(t => t.id === shot.shotType);
                const targetArea = shot.targetArea ? COURT_AREAS.find(a => a.id === shot.targetArea) : null;
                const isMovement = shot.isMovement;
                const shotByLabel = isMovement ? '移動' : (shot.shotBy === 'knocker' ? 'ノック' : 
                                  shot.shotBy === 'opponent' ? '相手' : 'プレイヤー');
                const bgColor = isMovement ? 'bg-yellow-50' : (shot.shotBy === 'knocker' ? 'bg-gray-50' : 
                              shot.shotBy === 'opponent' ? 'bg-red-50' : 'bg-green-50');
                const borderColor = isMovement ? 'border-yellow-300' : (shot.shotBy === 'knocker' ? 'border-gray-300' : 
                                  shot.shotBy === 'opponent' ? 'border-red-200' : 'border-green-200');
                
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
                          backgroundColor: isMovement ? '#FCD34D' : (shot.shotBy === 'knocker' ? '#000000' : 
                                         (shotType?.color || '#10B981'))
                        }}
                      >
                        {shot.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {isMovement ? 'プレイヤー移動' : shotByLabel}
                          </span>
                          {!isMovement && shot.shotTypes && shot.shotTypes.length > 1 ? (
                            <div className="flex flex-wrap gap-1">
                              {shot.shotTypes.map(typeId => {
                                const type = SHOT_TYPES.find(t => t.id === typeId);
                                return type ? (
                                  <span 
                                    key={typeId}
                                    className="text-xs px-1.5 py-0.5 rounded text-white flex items-center gap-0.5"
                                    style={{ backgroundColor: type.color }}
                                  >
                                    {React.cloneElement(type.icon, { className: 'w-2.5 h-2.5' })}
                                    <span className="text-[10px]">{type.name}</span>
                                  </span>
                                ) : null;
                              })}
                              <span className="text-xs text-gray-500 ml-1">({shot.shotTypes.length}種類)</span>
                            </div>
                          ) : !isMovement && shotType ? (
                            <span 
                              className="text-xs px-2 py-1 rounded-full text-white flex items-center gap-1"
                              style={{ backgroundColor: shotType.color }}
                            >
                              {React.cloneElement(shotType.icon, { className: 'w-3 h-3' })}
                              <span>{shotType.name}</span>
                            </span>
                          ) : null}
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