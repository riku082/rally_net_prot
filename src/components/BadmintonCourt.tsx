"use client";

import React, { useState, useEffect } from 'react';
import { Match } from '@/types/match';
import { Shot, ShotType, CourtArea, ShotResult } from '@/types/shot';
import { Player } from '@/types/player';
// import { firestoreDb } from '@/utils/db';
// import { useAuth } from '@/context/AuthContext';

interface BadmintonCourtProps {
  match: Match;
  players: Player[];
  onShotAdded: (shot: Omit<Shot, 'id' | 'timestamp'>, matchId: string) => void; // matchIdを追加
  onLastShotDeleted: () => void;
  onMatchFinished: (matchData: { match: Match; shots: Shot[]; finalScore: { player: number; opponent: number } }) => void;
  shots: Shot[];
  onGameStateChange?: (gameState: unknown) => void;
}

const SHOT_TYPES: { value: ShotType; label: string }[] = [
  { value: 'short_serve', label: 'ショートサーブ' },
  { value: 'long_serve', label: 'ロングサーブ' },
  { value: 'clear', label: 'クリアー' },
  { value: 'smash', label: 'スマッシュ' },
  { value: 'drop', label: 'ドロップ' },
  { value: 'long_return', label: 'ロングリターン' },
  { value: 'short_return', label: 'ショートリターン' },
  { value: 'drive', label: 'ドライブ' },
  { value: 'lob', label: 'ロブ' },
  { value: 'push', label: 'プッシュ' },
  { value: 'hairpin', label: 'ヘアピン' },
];

// 後衛エリアからのショット
const REAR_SHOTS: { value: ShotType; label: string }[] = [
  { value: 'smash', label: 'スマッシュ' },
  { value: 'drop', label: 'ドロップ' },
  { value: 'clear', label: 'クリアー' },
  { value: 'long_return', label: 'ロングリターン' },
  { value: 'short_return', label: 'ショートリターン' },
];

// ミッドエリアからのショット
const MID_SHOTS: { value: ShotType; label: string }[] = [
  { value: 'drive', label: 'ドライブ' },
  { value: 'drop', label: 'ドロップ' },
  { value: 'smash', label: 'スマッシュ' },
  { value: 'clear', label: 'クリアー' },
  { value: 'long_return', label: 'ロングリターン' },
  { value: 'short_return', label: 'ショートリターン' },
];

// 前衛エリアからのショット
const FRONT_SHOTS: { value: ShotType; label: string }[] = [
  { value: 'push', label: 'プッシュ' },
  { value: 'hairpin', label: 'ヘアピン' },
  { value: 'lob', label: 'ロブ' },
  { value: 'clear', label: 'クリアー' },
  { value: 'drive', label: 'ドライブ' },
  { value: 'long_return', label: 'ロングリターン' },
  { value: 'short_return', label: 'ショートリターン' },
];

const SERVE_TYPES: { value: ShotType; label: string }[] = [
  { value: 'short_serve', label: 'ショートサーブ' },
  { value: 'long_serve', label: 'ロングサーブ' },
];

const COURT_AREAS: CourtArea[] = ['LR', 'CR', 'RR', 'LM', 'CM', 'RM', 'LF', 'CF', 'RF'];

const SHOT_RESULTS: { value: ShotResult; label: string }[] = [
  { value: 'continue', label: '継続' },
  { value: 'point', label: '得点' },
  { value: 'miss', label: 'ミス' },
];

const BadmintonCourt: React.FC<BadmintonCourtProps> = ({
  match,
  players,
  onShotAdded,
  onLastShotDeleted,
  onMatchFinished,
  shots,
  onGameStateChange
}) => {
  // const { user } = useAuth();
  const [hitPlayer, setHitPlayer] = useState('');
  const [receivePlayer, setReceivePlayer] = useState('');
  const [shotType, setShotType] = useState<ShotType>('clear');
  const [hitArea, setHitArea] = useState<CourtArea | null>(null);
  const [receiveArea, setReceiveArea] = useState<CourtArea | null>(null);
  const [shotResult, setShotResult] = useState<ShotResult>('continue');
  const [lastShot, setLastShot] = useState<Omit<Shot, 'id' | 'timestamp'> | null>(null);
  const [isHitAreaTop, setIsHitAreaTop] = useState(true);
  const [isServing, setIsServing] = useState(true);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [scoreHistory, setScoreHistory] = useState<{ player: number, opponent: number }[]>([{ player: 0, opponent: 0 }]);

  // スコアを初期化または復元
  useEffect(() => {
    if (match.score) {
      setScore(match.score);
      setScoreHistory([{ player: 0, opponent: 0 }, match.score]);
    }
  }, [match]);

  // コンポーネントがマウントされた時にゲーム状態を復元
  useEffect(() => {
    // ローカルストレージから最新のgameStateを取得
    const matchId = match.id;
    const localStorageKey = `match_temp_${matchId}`;
    try {
      const tempData = localStorage.getItem(localStorageKey);
      console.log('Loading temp data:', tempData);
      if (tempData) {
        const parsedData = JSON.parse(tempData);
        console.log('Parsed data:', parsedData);
        if (parsedData.gameState && parsedData.shots.length > 0) {
          // ショットが存在する場合のみgameStateを復元
          console.log('Restoring game state in 50ms...');
          setTimeout(() => {
            restoreGameState(parsedData.gameState);
          }, 50);
        }
      }
    } catch (error) {
      console.error('Failed to restore game state:', error);
    }
  }, [match.id]);

  // 最初のサーブ選手が選択されているかチェック
  const [isInitialPlayerSelected, setIsInitialPlayerSelected] = useState(false);
  
  // コートの表示方向を管理
  const [isCourtHorizontal, setIsCourtHorizontal] = useState(false);

  // 現在のゲーム状態を保存する関数
  const saveGameState = () => {
    if (onGameStateChange) {
      const gameState = {
        hitPlayer,
        receivePlayer,
        shotType,
        hitArea,
        receiveArea,
        shotResult,
        lastShot,
        isHitAreaTop,
        isServing,
        isFirstClick,
        isInitialPlayerSelected,
        scoreHistory
      };
      onGameStateChange(gameState);
    }
  };

  // ゲーム状態を復元する関数
  const restoreGameState = (gameState: unknown) => {
    if (gameState && typeof gameState === 'object' && gameState !== null) {
      console.log('Restoring game state:', gameState);
      const state = gameState as Record<string, unknown>;
      setHitPlayer((state.hitPlayer as string) || '');
      setReceivePlayer((state.receivePlayer as string) || '');
      setHitArea((state.hitArea as CourtArea) || null);
      setReceiveArea((state.receiveArea as CourtArea) || null);
      setShotResult((state.shotResult as ShotResult) || 'continue');
      setLastShot((state.lastShot as Omit<Shot, 'id' | 'timestamp'>) || null);
      setIsHitAreaTop((state.isHitAreaTop as boolean) ?? true);
      
      // ラリー中かサーブ中かを正しく判断
      if (state.lastShot && typeof state.lastShot === 'object' && state.lastShot !== null && (state.lastShot as unknown as { result: string }).result === 'continue') {
        // 最後のショットが継続の場合はラリー中
        setIsServing(false);
        // ラリー中の場合はshotTypeもclearに設定
        setShotType((state.shotType as ShotType) || 'clear');
      } else {
        // そうでなければサーブ中
        setIsServing((state.isServing as boolean) ?? true);
        // サーブ中の場合はshotTypeをshort_serveに設定
        setShotType((state.shotType as ShotType) || 'short_serve');
      }
      
      setIsFirstClick((state.isFirstClick as boolean) ?? true);
      // ゲーム状態を復元する場合は初期選手選択は既に完了している
      setIsInitialPlayerSelected(true);
      setScoreHistory((state.scoreHistory as { player: number; opponent: number }[]) || [{ player: 0, opponent: 0 }]);
      
      // スコアも復元（scoreHistoryの最後の要素を使用）
      if (state.scoreHistory && Array.isArray(state.scoreHistory) && state.scoreHistory.length > 0) {
        const lastScore = state.scoreHistory[state.scoreHistory.length - 1];
        setScore(lastScore as { player: number; opponent: number });
      }
    }
  };

  // 状態が変わった時にゲーム状態を保存（初期化時は除く）
  const [hasBeenInitialized, setHasBeenInitialized] = useState(false);
  
  useEffect(() => {
    if (hasBeenInitialized) {
      saveGameState();
    }
  }, [hitPlayer, receivePlayer, shotType, hitArea, receiveArea, shotResult, lastShot, isHitAreaTop, isServing, isFirstClick, isInitialPlayerSelected, scoreHistory, hasBeenInitialized]);

  // 初期化完了フラグを設定
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasBeenInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // シングルスの場合、最初のサーブ選手選択後に自動化
  useEffect(() => {
    if (match.type === 'singles' && hitPlayer && !isInitialPlayerSelected && shots.length === 0) {
      // 最初のサーブ選手が選択されたら、レシーブ選手を自動設定
      const opponent = hitPlayer === match.players.player1 ? match.players.opponent1 : match.players.player1;
      setReceivePlayer(opponent);
      setIsInitialPlayerSelected(true);
    }
  }, [match.type, hitPlayer, isInitialPlayerSelected, shots.length, match.players]);

  // ショットが存在する場合は初期選手選択は完了済み
  useEffect(() => {
    if (match.type === 'singles' && shots.length > 0) {
      setIsInitialPlayerSelected(true);
    }
  }, [match.type, shots.length]);

  // サーブエリアを点数に応じて自動設定
  const getServeArea = () => {
    const servingPlayerScore = hitPlayer === match.players.player1 || hitPlayer === match.players.player2 
      ? score.player 
      : score.opponent;
    
    // 偶数の場合はRM、奇数の場合はLM
    return servingPlayerScore % 2 === 0 ? 'RM' : 'LM';
  };

  // サーブ時のエリア自動設定
  useEffect(() => {
    if (isServing && hitPlayer && receivePlayer) {
      const correctServeArea = getServeArea();
      if (hitArea !== correctServeArea) {
        setHitArea(correctServeArea as CourtArea);
      }
    }
  }, [isServing, hitPlayer, receivePlayer, score, hitArea]);

  const getPlayerName = (id: string) => {
    const player = players.find((p) => p.id === id);
    return player ? player.name : '不明';
  };

  // 点数を更新する関数
  const updateScore = async (result: ShotResult, hitPlayerId: string) => {
    let newScore = score;
    if (result === 'point') {
      const isPlayerTeam = hitPlayerId === match.players.player1 || hitPlayerId === match.players.player2;
      newScore = isPlayerTeam 
        ? { ...score, player: score.player + 1 }
        : { ...score, opponent: score.opponent + 1 };
      setScore(newScore);
      setScoreHistory(prev => [...prev, newScore]);
    } else if (result === 'miss') {
      const isPlayerTeam = hitPlayerId === match.players.player1 || hitPlayerId === match.players.player2;
      newScore = isPlayerTeam 
        ? { ...score, opponent: score.opponent + 1 }
        : { ...score, player: score.player + 1 };
      setScore(newScore);
      setScoreHistory(prev => [...prev, newScore]);
    } else {
      // 継続の場合は履歴に現在の点数を追加
      setScoreHistory(prev => [...prev, score]);
    }
    
    // リアルタイム保存を無効化 - 試合終了時に保存
  };

  // 一つ前に戻る機能
  const handleUndo = () => {
    if (shots.length > 0) {
      // 最後のショットを削除
      onLastShotDeleted();
      
      // 点数履歴を一つ前に戻す
      if (scoreHistory.length > 1) {
        const previousScore = scoreHistory[scoreHistory.length - 2];
        setScore(previousScore);
        setScoreHistory(prev => prev.slice(0, -1));
      }
      
      // 1つ前の配球データを取得
      const previousShot = shots[shots.length - 2];
      if (previousShot) {
        // 1つ前の状態に戻す
        setHitPlayer(previousShot.receivePlayer);
        if (match.type === 'singles') {
          // シングルスの場合、相手プレイヤーを自動設定
          setReceivePlayer(previousShot.hitPlayer);
        } else {
          // ダブルスの場合、手動選択のためリセット
          setReceivePlayer('');
        }
        setHitArea(previousShot.receiveArea);
        setReceiveArea(null);
        setShotType('clear');
        setShotResult('continue');
        setIsHitAreaTop(previousShot.receiveArea ? ['LF', 'CF', 'RF', 'LM', 'CM', 'RM'].includes(previousShot.receiveArea) : true);
        setLastShot(previousShot);
        setIsServing(false);
        setIsFirstClick(true);
      } else {
        // 最初の配球だった場合は全てリセット
        if (match.type === 'singles') {
          // シングルスの場合、初期選択状態にリセット
          setHitPlayer('');
          setReceivePlayer('');
          setIsInitialPlayerSelected(false);
        } else {
          // ダブルスの場合、手動選択のためリセット
          setHitPlayer('');
          setReceivePlayer('');
        }
        setHitArea(null);
        setReceiveArea(null);
        setShotType('short_serve');
        setShotResult('continue');
        setIsHitAreaTop(true);
        setIsServing(true);
        setIsFirstClick(true);
        setLastShot(null);
      }
    }
  };

  // 打点エリアに応じたショットの種類を取得
  const getAvailableShots = (area: CourtArea | null) => {
    if (!area) return [];
    if (['LR', 'CR', 'RR'].includes(area)) return REAR_SHOTS;
    if (['LM', 'CM', 'RM'].includes(area)) return MID_SHOTS;
    if (['LF', 'CF', 'RF'].includes(area)) return FRONT_SHOTS;
    return [];
  };

  // エリアが変更されたときにショットタイプをリセット
  const handleHitAreaChange = (area: CourtArea) => {
    setHitArea(area);
    // サーブ中でない場合は、エリアに応じたショットの最初の選択肢をデフォルトに設定
    if (!isServing) {
      const availableShots = getAvailableShots(area);
      if (availableShots.length > 0) {
        setShotType(availableShots[0].value);
      }
    }
  };

  // サーブ時の最初のクリックを処理
  const handleCourtClick = (area: CourtArea, isTopCourt: boolean) => {
    if (isServing && isFirstClick) {
      // サーブ時：点数に応じた正しいエリアのみ受け付ける
      const correctServeArea = getServeArea();
      if (area !== correctServeArea) {
        alert(`サーブは${correctServeArea}エリアから行ってください。（現在の点数: ${hitPlayer === match.players.player1 || hitPlayer === match.players.player2 ? score.player : score.opponent}点）`);
        return;
      }
      setHitArea(area);
      setIsFirstClick(false);
      // クリックしたコートに応じてisHitAreaTopを設定
      setIsHitAreaTop(isTopCourt);
    } else {
      // 通常の処理
      if (isTopCourt) {
        if (isHitAreaTop) {
          handleHitAreaChange(area);
        } else {
          setReceiveArea(area);
        }
      } else {
        if (!isHitAreaTop) {
          handleHitAreaChange(area);
        } else {
          setReceiveArea(area);
        }
      }
    }
  };

  const handleSubmit = async () => {
    // 必須項目のバリデーション
    if (!hitPlayer) {
      alert('打点選手を選択してください');
      return;
    }
    if (!receivePlayer) {
      alert('レシーブ選手を選択してください');
      return;
    }
    if (!hitArea) {
      alert('打点エリアを選択してください');
      return;
    }
    if (!receiveArea) {
      alert('レシーブエリアを選択してください');
      return;
    }
    if (!shotType) {
      alert('ショットタイプを選択してください');
      return;
    }

    const newShot = {
      matchId: match.id,
      hitPlayer,
      receivePlayer,
      hitArea,
      receiveArea,
      shotType,
      result: shotResult,
      isCross: isCrossShot(hitArea, receiveArea)
    };

    onShotAdded(newShot, match.id); // match.idを渡す
    setLastShot(newShot);

    // 点数を更新
    await updateScore(shotResult, hitPlayer);

    // 継続の場合、次の打点情報を設定
    if (shotResult === 'continue') {
      if (match.type === 'singles') {
        // シングルスの場合：プレイヤーを自動で切り替え
        const nextHitPlayer = receivePlayer;
        const nextReceivePlayer = hitPlayer;
        setHitPlayer(nextHitPlayer);
        setReceivePlayer(nextReceivePlayer);
      } else {
        // ダブルスの場合：レシーブ選手を次の打点選手に（手動選択が必要）
        setHitPlayer(receivePlayer);
        setReceivePlayer(''); // レシーブ選手をリセット（手動選択）
      }
      setHitArea(receiveArea);        // レシーブエリアを次の打点エリアに
      setReceiveArea(null);           // レシーブエリアをリセット
      setShotType('clear');           // ショットタイプをリセット
      setIsHitAreaTop(!isHitAreaTop); // 打点エリアの位置を切り替え
      setIsServing(false);            // サーブ状態を解除
      setIsFirstClick(true);          // 最初のクリック状態をリセット
    } else {
      // 継続以外の場合は全てリセット
      if (match.type === 'singles') {
        // シングルス：得点した側の選手がサーブ
        if (shotResult === 'point') {
          // 打点した選手が得点 → その選手がサーブ
          setHitPlayer(hitPlayer);
          setReceivePlayer(receivePlayer);
        } else if (shotResult === 'miss') {
          // 打点した選手がミス → 相手がサーブ
          setHitPlayer(receivePlayer);
          setReceivePlayer(hitPlayer);
        }
        // 既に初期選択は完了しているので、isInitialPlayerSelectedはtrueのまま
      } else {
        // ダブルス：手動選択にリセット（得点した側のチームから選択）
        setHitPlayer('');
        setReceivePlayer('');
      }
      setHitArea(null);
      setReceiveArea(null);
      setShotType('short_serve');     // ショットタイプをショートサーブに設定
      setIsHitAreaTop(true);          // 打点エリアの位置をリセット
      setIsServing(true);             // サーブ状態に設定
      setIsFirstClick(true);          // 最初のクリック状態をリセット
    }
    setShotResult('continue');
  };

  // ダブルスで得点した側のチームのプレイヤーのみを取得
  const getAvailablePlayersForServe = () => {
    if (match.type === 'singles') {
      return [match.players.player1, match.players.opponent1];
    } else {
      // ダブルスの場合、前のショットの結果に基づいて得点チームを決定
      if (lastShot) {
        const lastHitPlayer = lastShot.hitPlayer;
        const wasPlayerTeam = lastHitPlayer === match.players.player1 || lastHitPlayer === match.players.player2;
        
        if (lastShot.result === 'point') {
          // 打点した側が得点 → そのチームのプレイヤーのみ
          return wasPlayerTeam 
            ? [match.players.player1, match.players.player2].filter(Boolean)
            : [match.players.opponent1, match.players.opponent2].filter(Boolean);
        } else if (lastShot.result === 'miss') {
          // 打点した側がミス → 相手チームのプレイヤーのみ
          return wasPlayerTeam 
            ? [match.players.opponent1, match.players.opponent2].filter(Boolean)
            : [match.players.player1, match.players.player2].filter(Boolean);
        }
      }
      // デフォルトは全プレイヤー
      return [match.players.player1, match.players.player2, match.players.opponent1, match.players.opponent2].filter((p): p is string => Boolean(p));
    }
  };

  const availablePlayers = getAvailablePlayersForServe();

  const isCrossShot = (hitArea: CourtArea, receiveArea: CourtArea): boolean => {
    const leftAreas = ['LF', 'LM', 'LR'];
    const rightAreas = ['RF', 'RM', 'RR'];

    const isHitLeft = leftAreas.includes(hitArea);
    const isHitRight = rightAreas.includes(hitArea);
    const isReceiveLeft = leftAreas.includes(receiveArea);
    const isReceiveRight = rightAreas.includes(receiveArea);

    return (isHitLeft && isReceiveRight) || (isHitRight && isReceiveLeft);
  };

  // 試合終了処理
  const handleMatchFinish = () => {
    const matchData = {
      match: { ...match, score },
      shots,
      finalScore: score
    };
    onMatchFinished(matchData);
  };

  // シングルス用サーブ選手入れ替え機能
  const handleSwapServePlayer = () => {
    if (match.type === 'singles' && isServing) {
      const currentHitPlayer = hitPlayer;
      const currentReceivePlayer = receivePlayer;
      
      // 打点選手とレシーブ選手を入れ替え
      setHitPlayer(currentReceivePlayer);
      setReceivePlayer(currentHitPlayer);
      
      // エリア選択をリセット（新しいサーブ選手で再度選択）
      setHitArea(null);
      setReceiveArea(null);
      setIsFirstClick(true);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAreaClick = (area: CourtArea) => {
    if (!hitPlayer) return;

    const isServe = shots.length === 0;
    const isHitPlayer = hitPlayer === match.players.player1 || hitPlayer === match.players.player2;
    const isReceivePlayer = hitPlayer === match.players.opponent1 || hitPlayer === match.players.opponent2;

    if (isServe) {
      // サーブの場合は、上下のコート両方から選択可能
      const newShot: Omit<Shot, 'id' | 'timestamp'> = {
        matchId: match.id,
        hitPlayer: hitPlayer,
        receivePlayer: isHitPlayer ? match.players.opponent1 : match.players.player1,
        hitArea: area,
        receiveArea: 'CF', // サーブの着地点は中央前
        shotType: 'short_serve',
        result: 'continue',
        isCross: false,
      };
      onShotAdded(newShot, match.id); // match.idを渡す
      // サーブ後は選択したエリアに応じてisHitAreaTopを設定
      setIsHitAreaTop(area === hitArea);
    } else if (isHitPlayer) {
      // 打点の選択
      const newShot: Omit<Shot, 'id' | 'timestamp'> = {
        matchId: match.id,
        hitPlayer: hitPlayer,
        receivePlayer: receivePlayer,
        hitArea: area,
        receiveArea: 'CF', // デフォルトの着地点
        shotType: 'clear',
        result: 'continue',
        isCross: false,
      };
      onShotAdded(newShot, match.id); // match.idを渡す
    } else if (isReceivePlayer) {
      // 着地点の選択
      if (shots.length > 0) {
        const lastShot = shots[shots.length - 1];
        const newShot: Shot = {
          ...lastShot,
          receiveArea: area,
        };
        onShotAdded(newShot, match.id); // match.idを渡す
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTop = (area: CourtArea): number => {
    switch (area) {
      case 'LF':
      case 'CF':
      case 'RF':
        return 0;
      case 'LM':
      case 'CM':
      case 'RM':
        return 33.33;
      case 'LR':
      case 'CR':
      case 'RR':
        return 66.66;
      default:
        return 0;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getLeft = (area: CourtArea): number => {
    switch (area) {
      case 'LF':
      case 'LM':
      case 'LR':
        return 0;
      case 'CF':
      case 'CM':
      case 'CR':
        return 33.33;
      case 'RF':
      case 'RM':
      case 'RR':
        return 66.66;
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
        {/* 左側：プレイヤー選択とショット情報 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 点数表示 */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium mb-2 text-center">スコア</h3>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-xs text-gray-600">プレイヤー</p>
                <p className="text-2xl font-bold text-blue-600">{score.player}</p>
              </div>
              <div className="text-xl font-bold text-gray-400">:</div>
              <div className="text-center">
                <p className="text-xs text-gray-600">対戦相手</p>
                <p className="text-2xl font-bold text-red-600">{score.opponent}</p>
              </div>
            </div>
          </div>
          {/* プレイヤー選択 */}
          {match.type === 'singles' ? (
            // シングルスの場合：最初は選択、その後は自動表示
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium mb-2">
                {isInitialPlayerSelected ? 'プレイヤー情報' : '最初のサーブ選手を選択'}
              </h3>
              {!isInitialPlayerSelected ? (
                // 最初のサーブ選手選択
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 mb-2">どちらの選手が最初にサーブしますか？</p>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setHitPlayer(match.players.player1)}
                      className={`p-4 text-base font-medium rounded-lg ${
                        hitPlayer === match.players.player1
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 shadow-md'
                      } transition-all duration-200`}
                    >
                      {getPlayerName(match.players.player1)} がサーブ
                    </button>
                    <button
                      onClick={() => setHitPlayer(match.players.opponent1)}
                      className={`p-4 text-base font-medium rounded-lg ${
                        hitPlayer === match.players.opponent1
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 shadow-md'
                      } transition-all duration-200`}
                    >
                      {getPlayerName(match.players.opponent1)} がサーブ
                    </button>
                  </div>
                </div>
              ) : (
                // 選手情報表示（自動化後）
                <div className="space-y-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-gray-600">
                      {isServing ? 'サーブ選手' : '打点選手'}
                    </p>
                    <p className="text-sm font-medium text-blue-800">{getPlayerName(hitPlayer)}</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded">
                    <p className="text-xs text-gray-600">
                      {isServing ? 'レシーブ選手' : '相手選手'}
                    </p>
                    <p className="text-sm font-medium text-red-800">{getPlayerName(receivePlayer)}</p>
                  </div>
                  {isServing && (
                    <button
                      onClick={handleSwapServePlayer}
                      className="w-full mt-3 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm font-medium shadow-md transition-all duration-200"
                    >
                      🔄 サーブ選手を入れ替え
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-2">※ シングルスでは自動的に選手が切り替わります</p>
                </div>
              )}
            </div>
          ) : (
            // ダブルスの場合：手動選択
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium mb-2">プレイヤー選択</h3>
              {isServing && lastShot && (lastShot.result === 'point' || lastShot.result === 'miss') && (
                <div className="mb-3 p-2 bg-yellow-50 rounded">
                  <p className="text-xs text-yellow-800">
                    {lastShot.result === 'point' 
                      ? `${getPlayerName(lastShot.hitPlayer)} が得点！そのチームがサーブ権を獲得`
                      : `${getPlayerName(lastShot.hitPlayer)} がミス！相手チームがサーブ権を獲得`
                    }
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isServing ? 'サーブ選手' : '打点選手'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePlayers.map((playerId) => (
                      <button
                        key={playerId}
                        onClick={() => setHitPlayer(playerId || '')}
                        className={`p-3 text-sm font-medium rounded-lg ${
                          hitPlayer === playerId
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 hover:bg-gray-200 shadow-md'
                        } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={playerId === receivePlayer}
                      >
                        {getPlayerName(playerId || '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {isServing ? 'レシーブ選手' : '相手選手'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePlayers.map((playerId) => (
                      <button
                        key={playerId}
                        onClick={() => setReceivePlayer(playerId || '')}
                        className={`p-3 text-sm font-medium rounded-lg ${
                          receivePlayer === playerId
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-gray-100 hover:bg-gray-200 shadow-md'
                        } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={playerId === hitPlayer}
                      >
                        {getPlayerName(playerId || '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ショット情報 */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="space-y-3">
              {/* ショットタイプ選択 */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {isServing ? 'サーブの種類' : 'ショットの種類'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(isServing ? SERVE_TYPES : getAvailableShots(hitArea)).map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setShotType(type.value)}
                      className={`p-3 text-sm font-medium rounded-lg ${
                        shotType === type.value
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 shadow-md'
                      } transition-all duration-200`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ショット結果選択 */}
              <div>
                <h3 className="text-sm font-medium mb-2">ショットの結果</h3>
                <div className="grid grid-cols-3 gap-2">
                  {SHOT_RESULTS.map((result) => (
                    <button
                      key={result.value}
                      onClick={() => setShotResult(result.value)}
                      className={`p-3 text-sm font-medium rounded-lg ${
                        shotResult === result.value
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 shadow-md'
                      } transition-all duration-200`}
                    >
                      {result.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 最後の配球データ表示 */}
          {lastShot && (
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">最後の配球</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-medium">打点:</span> {getPlayerName(lastShot.hitPlayer)} ({lastShot.hitArea})
                </p>
                <p>
                  <span className="font-medium">着地:</span> {getPlayerName(lastShot.receivePlayer)} ({lastShot.receiveArea})
                </p>
                <p>
                  <span className="font-medium">ショット:</span>{' '}
                  {SHOT_TYPES.find(type => type.value === lastShot.shotType)?.label}
                </p>
                <p>
                  <span className="font-medium">結果:</span>{' '}
                  {SHOT_RESULTS.find(result => result.value === lastShot.result)?.label}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 中央：コート表示 */}
        <div className="lg:col-span-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">コートエリア選択</h3>
              <button
                onClick={() => setIsCourtHorizontal(!isCourtHorizontal)}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {isCourtHorizontal ? '縦表示' : '横表示'}
              </button>
            </div>
            <div className={isCourtHorizontal ? "flex flex-row items-center" : "flex flex-col"}>
              {/* 左のコート（横表示時）/ 上のコート（縦表示時） */}
              <div className={`relative ${isCourtHorizontal ? 'w-1/2' : 'w-full'}`}>
                <div className={`bg-green-500 relative ${isCourtHorizontal ? 'aspect-[1/2] transform rotate-90' : 'aspect-[2/1]'}`}>
                  <div className={`absolute inset-2 border-2 border-white grid grid-cols-3 grid-rows-3 transform ${isCourtHorizontal ? 'scale-x-[-1]' : 'scale-x-[-1]'}`}>
                    {COURT_AREAS.map((area) => {
                      const isCorrectServeArea = isServing && isFirstClick && area === getServeArea();
                      return (
                        <div
                          key={area}
                          onClick={() => handleCourtClick(area, true)}
                          className={`border border-white cursor-pointer hover:bg-green-400 relative ${
                            isHitAreaTop && hitArea === area ? 'bg-blue-500 bg-opacity-50' : 
                            !isHitAreaTop && receiveArea === area ? 'bg-red-500 bg-opacity-50' : 
                            isCorrectServeArea ? 'bg-yellow-400 bg-opacity-70 animate-pulse' : ''
                          }`}
                        >
                          <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold ${isCourtHorizontal ? '-rotate-90 scale-x-[-1]' : 'scale-x-[-1]'}`}>
                            {area}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ネット */}
              <div className={`relative bg-gray-800 border-white shadow-md ${isCourtHorizontal ? 'w-2 h-full border-l-2 border-r-2' : 'w-full h-2 border-t-2 border-b-2'}`}>
                <div className={`absolute inset-0 ${isCourtHorizontal ? 'bg-gradient-to-b from-gray-700 via-gray-800 to-gray-700' : 'bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700'}`}>
                  <div className={`${isCourtHorizontal ? 'w-full h-full' : 'h-full'} flex items-center justify-center`}>
                    <div className={`bg-white opacity-30 ${isCourtHorizontal ? 'w-[1px] h-full' : 'w-full h-[1px]'}`}></div>
                  </div>
                </div>
                <div className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold bg-gray-900 px-2 py-1 rounded ${isCourtHorizontal ? '-rotate-90' : ''}`}>
                  NET
                </div>
              </div>

              {/* 右のコート（横表示時）/ 下のコート（縦表示時） */}
              <div className={`relative ${isCourtHorizontal ? 'w-1/2' : 'w-full'}`}>
                <div className={`bg-green-500 relative ${isCourtHorizontal ? 'aspect-[1/2] transform rotate-90' : 'aspect-[2/1]'}`}>
                  <div className={`absolute inset-2 border-2 border-white grid grid-cols-3 grid-rows-3 transform ${isCourtHorizontal ? 'scale-y-[-1]' : 'scale-y-[-1]'}`}>
                    {COURT_AREAS.map((area) => {
                      const isCorrectServeArea = isServing && isFirstClick && area === getServeArea();
                      return (
                        <div
                          key={area}
                          onClick={() => handleCourtClick(area, false)}
                          className={`border border-white cursor-pointer hover:bg-green-400 relative ${
                            !isHitAreaTop && hitArea === area ? 'bg-blue-500 bg-opacity-50' : 
                            isHitAreaTop && receiveArea === area ? 'bg-red-500 bg-opacity-50' : 
                            isCorrectServeArea ? 'bg-yellow-400 bg-opacity-70 animate-pulse' : ''
                          }`}
                        >
                          <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold ${isCourtHorizontal ? '-rotate-90 scale-y-[-1]' : 'scale-y-[-1]'}`}>
                            {area}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="text-center text-xs mt-2">
                <span className="inline-block px-2 py-1 bg-blue-500 text-white rounded mr-2">青: 打点エリア</span>
                <span className="inline-block px-2 py-1 bg-red-500 text-white rounded mr-2">赤: レシーブエリア</span>
                {isServing && (
                  <span className="inline-block px-2 py-1 bg-yellow-400 text-black rounded">黄: サーブエリア</span>
                )}
              </div>
              {isServing && (
                <div className="text-center text-xs mt-2 p-2 bg-yellow-50 rounded">
                  <p className="text-yellow-800">
                    サーブルール: {hitPlayer === match.players.player1 || hitPlayer === match.players.player2 ? score.player : score.opponent}点 
                    → {getServeArea()}エリアからサーブ（偶数点: RM、奇数点: LM）
                  </p>
                </div>
              )}

              {/* 反転ボタン */}
              <button
                onClick={() => {
                  setIsHitAreaTop(!isHitAreaTop);
                  // 打点エリアとレシーブエリアを入れ替え
                  const tempArea = hitArea;
                  setHitArea(receiveArea);
                  setReceiveArea(tempArea);
                }}
                className="w-full mt-2 bg-gray-500 text-white py-1 px-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-xs"
              >
                打点・レシーブエリアを反転
              </button>
            </div>
          </div>

          {/* 登録ボタンとアンドゥボタン */}
          <div className="space-y-3 mt-6">
            <div className="flex gap-3">
              <button
                onClick={handleUndo}
                disabled={shots.length === 0}
                className="flex-1 bg-gray-500 text-white py-4 px-6 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-base font-medium shadow-md transition-all duration-200"
              >
                一つ前に戻る
              </button>
              <button
                onClick={handleSubmit}
                disabled={!hitPlayer || !receivePlayer || !hitArea || !receiveArea}
                className="flex-2 bg-blue-500 text-white py-4 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-base font-medium shadow-lg transition-all duration-200"
              >
                {match.type === 'singles' ? 'ショットを登録' : '配球を登録'}
              </button>
            </div>
            <button
              onClick={handleMatchFinish}
              className="w-full bg-green-600 text-white py-5 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg font-semibold shadow-lg transition-all duration-200"
            >
              🏆 試合終了・保存
            </button>
          </div>
        </div>

        {/* 右側：ショット履歴 */}
        <div className="lg:col-span-2">
          <div className="bg-white p-3 rounded-lg shadow-sm h-full">
            <h3 className="text-sm font-medium mb-2">ショット履歴</h3>
            <div className="max-h-[600px] overflow-y-auto">
              {shots.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">まだショットがありません</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {shots.map((shot, index) => (
                    <div 
                      key={shot.id || index}
                      className={`p-2 rounded-lg border ${
                        shot.result === 'point' 
                          ? 'bg-green-50 border-green-200' 
                          : shot.result === 'miss' 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          shot.result === 'point' 
                            ? 'bg-green-100 text-green-800' 
                            : shot.result === 'miss' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {SHOT_RESULTS.find(r => r.value === shot.result)?.label}
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-600">
                            {getPlayerName(shot.hitPlayer)}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="font-medium text-red-600">
                            {getPlayerName(shot.receivePlayer)}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          {shot.hitArea} → {shot.receiveArea}
                        </div>
                        <div className="text-gray-600">
                          {SHOT_TYPES.find(t => t.value === shot.shotType)?.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadmintonCourt;