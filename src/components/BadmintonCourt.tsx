"use client";

import React, { useState } from 'react';
import { Match } from '@/types/match';
import { Shot, ShotType, CourtArea, ShotResult } from '@/types/shot';
import { Player } from '@/types/player';

interface BadmintonCourtProps {
  match: Match;
  players: Player[];
  onShotAdded: (shot: Omit<Shot, 'id' | 'timestamp'>, matchId: string) => void; // matchIdを追加
  onLastShotDeleted: () => void;
  shots: Shot[];
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
  shots
}) => {
  const [hitPlayer, setHitPlayer] = useState('');
  const [receivePlayer, setReceivePlayer] = useState('');
  const [shotType, setShotType] = useState<ShotType>('clear');
  const [hitArea, setHitArea] = useState<CourtArea | null>(null);
  const [receiveArea, setReceiveArea] = useState<CourtArea | null>(null);
  const [shotResult, setShotResult] = useState<ShotResult>('continue');
  const [lastShot, setLastShot] = useState<Omit<Shot, 'id' | 'timestamp'> | null>(null);
  const [isHitAreaTop, setIsHitAreaTop] = useState(true);
  const [isServing, setIsServing] = useState(true);

  const getPlayerName = (id: string) => {
    const player = players.find((p) => p.id === id);
    return player ? player.name : '不明';
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

  const handleSubmit = () => {
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

    // 継続の場合、次の打点情報を設定
    if (shotResult === 'continue') {
      setHitPlayer(receivePlayer);    // レシーブ選手を次の打点選手に
      setReceivePlayer('');           // レシーブ選手をリセット
      setHitArea(receiveArea);        // レシーブエリアを次の打点エリアに
      setReceiveArea(null);           // レシーブエリアをリセット
      setShotType('clear');           // ショットタイプをリセット
      setIsHitAreaTop(!isHitAreaTop); // 打点エリアの位置を切り替え
      setIsServing(false);            // サーブ状態を解除
    } else {
      // 継続以外の場合は全てリセット
      setHitPlayer('');
      setReceivePlayer('');
      setHitArea(null);
      setReceiveArea(null);
      setShotType('short_serve');     // ショットタイプをショートサーブに設定
      setIsHitAreaTop(true);          // 打点エリアの位置をリセット
      setIsServing(true);             // サーブ状態に設定
    }
    setShotResult('continue');
  };

  const availablePlayers = match.type === 'singles'
    ? [match.players.player1, match.players.opponent1]
    : [match.players.player1, match.players.player2, match.players.opponent1, match.players.opponent2].filter((p): p is string => Boolean(p));

  const isCrossShot = (hitArea: CourtArea, receiveArea: CourtArea): boolean => {
    const leftAreas = ['LF', 'LM', 'LR'];
    const rightAreas = ['RF', 'RM', 'RR'];

    const isHitLeft = leftAreas.includes(hitArea);
    const isHitRight = rightAreas.includes(hitArea);
    const isReceiveLeft = leftAreas.includes(receiveArea);
    const isReceiveRight = rightAreas.includes(receiveArea);

    return (isHitLeft && isReceiveRight) || (isHitRight && isReceiveLeft);
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
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* 左側：プレイヤー選択とショット情報 */}
        <div className="lg:col-span-2 space-y-4">
          {/* プレイヤー選択 */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium mb-2">プレイヤー選択</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  打点選手
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {availablePlayers.map((playerId) => (
                    <button
                      key={playerId}
                      onClick={() => setHitPlayer(playerId)}
                      className={`p-1 text-xs rounded-md ${
                        hitPlayer === playerId
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      disabled={playerId === receivePlayer}
                    >
                      {getPlayerName(playerId)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  レシーブ選手
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {availablePlayers.map((playerId) => (
                    <button
                      key={playerId}
                      onClick={() => setReceivePlayer(playerId)}
                      className={`p-1 text-xs rounded-md ${
                        receivePlayer === playerId
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      disabled={playerId === hitPlayer}
                    >
                      {getPlayerName(playerId)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ショット情報 */}
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="space-y-3">
              {/* ショットタイプ選択 */}
              <div>
                <h3 className="text-sm font-medium mb-2">
                  {isServing ? 'サーブの種類' : 'ショットの種類'}
                </h3>
                <div className="grid grid-cols-3 gap-1">
                  {(isServing ? SERVE_TYPES : getAvailableShots(hitArea)).map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setShotType(type.value)}
                      className={`p-1 text-xs rounded-md ${
                        shotType === type.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ショット結果選択 */}
              <div>
                <h3 className="text-sm font-medium mb-2">ショットの結果</h3>
                <div className="grid grid-cols-3 gap-1">
                  {SHOT_RESULTS.map((result) => (
                    <button
                      key={result.value}
                      onClick={() => setShotResult(result.value)}
                      className={`p-1 text-xs rounded-md ${
                        shotResult === result.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
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
                <button
                  onClick={() => {
                    onLastShotDeleted();
                    // 1つ前の配球データを取得
                    const previousShot = shots[shots.length - 2];
                    if (previousShot) {
                      // 1つ前の状態に戻す
                      setHitPlayer(previousShot.hitPlayer);
                      setReceivePlayer(previousShot.receivePlayer);
                      setHitArea(previousShot.hitArea);
                      setReceiveArea(previousShot.receiveArea);
                      setShotType(previousShot.shotType);
                      setShotResult(previousShot.result);
                      setIsHitAreaTop(!isHitAreaTop);
                      setLastShot(previousShot);
                    } else {
                      // 最初の配球だった場合は全てリセット
                      setHitPlayer('');
                      setReceivePlayer('');
                      setHitArea(null);
                      setReceiveArea(null);
                      setShotType('clear');
                      setShotResult('continue');
                      setIsHitAreaTop(true);
                      setLastShot(null);
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-medium">打点:</span> {getPlayerName(lastShot.hitPlayer)} ({lastShot.hitArea})
                </p>
                <p>
                  <span className="font-medium">レシーブ:</span> {getPlayerName(lastShot.receivePlayer)} ({lastShot.receiveArea})
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

        {/* 右側：コート表示 */}
        <div className="lg:col-span-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium mb-2">コートエリア選択</h3>
            <div className="flex flex-col">
              {/* 上のコート（左右反転） */}
              <div className="relative w-full">
                <div className="aspect-[2/1] bg-green-500 relative">
                  <div className="absolute inset-2 border-2 border-white grid grid-cols-3 grid-rows-3 transform scale-x-[-1]">
                    {COURT_AREAS.map((area) => (
                      <div
                        key={area}
                        onClick={() => isHitAreaTop ? handleHitAreaChange(area) : setReceiveArea(area)}
                        className={`border border-white cursor-pointer hover:bg-green-400 relative ${
                          isHitAreaTop && hitArea === area ? 'bg-blue-500 bg-opacity-50' : 
                          !isHitAreaTop && receiveArea === area ? 'bg-red-500 bg-opacity-50' : ''
                        }`}
                      >
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold scale-x-[-1]">
                          {area}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 下のコート（上下反転） */}
              <div className="relative w-full -mt-[2px]">
                <div className="aspect-[2/1] bg-green-500 relative">
                  <div className="absolute inset-2 border-2 border-white grid grid-cols-3 grid-rows-3 transform scale-y-[-1]">
                    {COURT_AREAS.map((area) => (
                      <div
                        key={area}
                        onClick={() => !isHitAreaTop ? handleHitAreaChange(area) : setReceiveArea(area)}
                        className={`border border-white cursor-pointer hover:bg-green-400 relative ${
                          !isHitAreaTop && hitArea === area ? 'bg-blue-500 bg-opacity-50' : 
                          isHitAreaTop && receiveArea === area ? 'bg-red-500 bg-opacity-50' : ''
                        }`}
                      >
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold scale-y-[-1]">
                          {area}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center text-xs mt-2">
                <span className="inline-block px-2 py-1 bg-blue-500 text-white rounded mr-2">青: 打点エリア</span>
                <span className="inline-block px-2 py-1 bg-red-500 text-white rounded">赤: レシーブエリア</span>
              </div>

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

          {/* 登録ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!hitPlayer || !receivePlayer || !hitArea || !receiveArea}
            className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            配球を登録
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadmintonCourt;