import React, { useState } from 'react';
import { Match } from '@/types/match';
import { Shot } from '@/types/shot';
import { Player } from '@/types/player';

interface MatchManagementProps {
  matches: Match[];
  players: Player[];
  shots: Shot[];
  onMatchDeleted: (id: string) => void;
}

const MatchManagement: React.FC<MatchManagementProps> = ({
  matches,
  players,
  shots,
  onMatchDeleted,
}) => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const getPlayerName = (id: string | undefined) => {
    if (!id) return '未設定';
    const player = players.find((p) => p.id === id);
    return player ? `${player.name} (${player.affiliation})` : '不明';
  };

  const getMatchShots = (matchId: string) => {
    return shots.filter(shot => shot.matchId === matchId);
  };

  const calculateMatchStats = (matchId: string) => {
    const matchShots = getMatchShots(matchId);
    const totalShots = matchShots.length;
    const winners = matchShots.filter(shot => shot.result === 'point').length;
    const errors = matchShots.filter(shot => shot.result === 'miss').length;
    const rallies = matchShots.filter(shot => shot.result === 'point' || shot.result === 'miss').length;
    const avgRallyLength = rallies > 0 ? totalShots / rallies : 0;

    return {
      totalShots,
      winners,
      errors,
      rallies,
      avgRallyLength: avgRallyLength.toFixed(1),
      winnerPercentage: totalShots > 0 ? ((winners / totalShots) * 100).toFixed(1) : '0.0',
      errorPercentage: totalShots > 0 ? ((errors / totalShots) * 100).toFixed(1) : '0.0'
    };
  };

  const renderMatchDetails = (match: Match) => {
    const stats = calculateMatchStats(match.id);
    const matchShots = getMatchShots(match.id);

    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">試合概要</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">日付</p>
              <p>{new Date(match.date).toLocaleDateString('ja-JP')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">試合形式</p>
              <p>{match.type === 'singles' ? 'シングルス' : 'ダブルス'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">プレイヤー1</p>
              <p>{getPlayerName(match.players.player1)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">プレイヤー2</p>
              <p>{getPlayerName(match.players.player2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">試合統計</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">総ショット数</p>
              <p className="text-xl font-bold">{stats.totalShots}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">ラリー数</p>
              <p className="text-xl font-bold">{stats.rallies}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">平均ラリー長</p>
              <p className="text-xl font-bold">
                {stats.avgRallyLength}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">ウィナー率</p>
              <p className="text-xl font-bold text-green-600">{stats.winnerPercentage}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">ミス率</p>
              <p className="text-xl font-bold text-red-600">{stats.errorPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">ラリー詳細</h3>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              {showAnalysis ? 'ラリー表示' : '分析表示'}
            </button>
          </div>
          
          {showAnalysis ? (
            <div className="space-y-2">
              {/* 分析表示の内容をここに追加 */}
            </div>
          ) : (
            <div className="space-y-2">
              {matchShots.map((shot, index) => (
                <div key={shot.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {index + 1}. {getPlayerName(shot.hitPlayer)} → {getPlayerName(shot.receivePlayer)}
                    </span>
                    <span className={`text-sm ${
                      shot.result === 'point' ? 'text-green-600' :
                      shot.result === 'miss' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {shot.result === 'point' ? '得点' :
                       shot.result === 'miss' ? 'ミス' : '継続'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    打点: {shot.hitArea} → 着地点: {shot.receiveArea} | ショット: {shot.shotType}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">試合一覧</h2>
        <div className="space-y-2">
          {matches.map(match => (
            <div
              key={match.id}
              className={`p-3 rounded-lg cursor-pointer ${
                selectedMatch?.id === match.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedMatch(match)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {new Date(match.date).toLocaleDateString('ja-JP')} -{' '}
                    {match.type === 'singles' ? 'シングルス' : 'ダブルス'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getPlayerName(match.players.player1)} vs {getPlayerName(match.players.player2)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('この試合を削除してもよろしいですか？')) {
                      onMatchDeleted(match.id);
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMatch && renderMatchDetails(selectedMatch)}
    </div>
  );
};

export default MatchManagement; 