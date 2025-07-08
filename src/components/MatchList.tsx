'use client';

import React from 'react';
import { Match } from '@/types/match';
import { Player } from '@/types/player';
import { UserProfile } from '@/types/userProfile'; // UserProfileをインポート
import { FiCalendar, FiUsers, FiUser, FiTrash2, FiPlayCircle } from 'react-icons/fi';

interface MatchListProps {
  matches: Match[];
  players: Player[];
  connectedUserProfiles: UserProfile[]; // 追加
  onMatchDeleted: (id: string) => void;
  onMatchSelected: (match: Match) => void;
}

const MatchList: React.FC<MatchListProps> = ({
  matches,
  players,
  connectedUserProfiles, // 追加
  onMatchDeleted,
  onMatchSelected,
}) => {
  const getPlayerName = (id: string | undefined) => {
    if (!id) return '未設定';

    // まずローカル選手リストを検索
    const localPlayer = players.find((p) => p.id === id);
    if (localPlayer) {
      return `${localPlayer.name} (${localPlayer.affiliation})`;
    }

    // 次に接続済みユーザープロフィールを検索
    const connectedUser = connectedUserProfiles.find((p) => p.id === id);
    if (connectedUser) {
      return `${connectedUser.name || connectedUser.email} (フレンド)`;
    }

    return '不明';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-5">登録済み試合一覧 ({matches.length}試合)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            <p>まだ試合が登録されていません。</p>
            <p className="mt-2">右下のプラスボタンから新しい試合を登録しましょう！</p>
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <FiCalendar className="mr-2 text-blue-500" />
                <span>{new Date(match.date).toLocaleDateString('ja-JP')}</span>
                <span className="mx-2">•</span>
                <FiUsers className="mr-2 text-blue-500" />
                <span>{match.type === 'singles' ? 'シングルス' : 'ダブルス'}</span>
              </div>
              
              <div className="mb-3">
                <p className="text-md font-semibold text-gray-800 flex items-center">
                  <FiUser className="mr-2 text-green-600" />
                  自チーム: {getPlayerName(match.players.player1)}
                  {match.players.player2 && `, ${getPlayerName(match.players.player2)}`}
                </p>
                <p className="text-md font-semibold text-gray-800 flex items-center mt-1">
                  <FiUser className="mr-2 text-red-600" />
                  相手選手: {getPlayerName(match.players.opponent1)}
                  {match.players.opponent2 && `, ${getPlayerName(match.players.opponent2)}`}
                </p>
              </div>

              <div className="mt-auto flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onMatchSelected(match)}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  <FiPlayCircle className="mr-2" />配球登録
                </button>
                <button
                  onClick={() => onMatchDeleted(match.id)}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                >
                  <FiTrash2 className="mr-2" />削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MatchList;
