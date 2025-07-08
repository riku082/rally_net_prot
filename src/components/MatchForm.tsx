'use client';

import React, { useState, useEffect } from 'react';
import { Match, MatchType } from '@/types/match';
import { Player } from '@/types/player';
import { UserProfile } from '@/types/userProfile';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FiCalendar, FiUsers, FiUser, FiPlusCircle } from 'react-icons/fi';

// 選手選択ドロップダウンのオプションとして使用する型
interface SelectablePlayer {
  id: string;
  name: string;
  affiliation: string;
  isUserProfile: boolean; // ユーザープロフィールから来た選手かどうかのフラグ
}

interface MatchFormProps {
  players: Player[]; // ユーザーが登録したローカル選手
  onMatchAdded: (match: Match) => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ players, onMatchAdded }) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [type, setType] = useState<MatchType>('singles');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [opponent1, setOpponent1] = useState('');
  const [opponent2, setOpponent2] = useState('');
  const [connectedUserProfiles, setConnectedUserProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    const loadConnectedUsers = async () => {
      if (!user?.uid) return;
      try {
        const acceptedFriendships = await firestoreDb.getAcceptedFriendships(user.uid);
        const connectedUserIds = acceptedFriendships.flatMap(friendship => [
          friendship.fromUserId === user.uid ? friendship.toUserId : friendship.fromUserId
        ]);
        const profiles = await firestoreDb.getUserProfilesByIds(connectedUserIds);
        setConnectedUserProfiles(profiles);
      } catch (error) {
        console.error('接続済みユーザーの読み込みに失敗しました:', error);
      }
    };
    loadConnectedUsers();
  }, [user]);

  // ローカル選手と接続済みユーザーを結合したリスト
  const allSelectablePlayers: SelectablePlayer[] = [
    ...players.map(p => ({ ...p, isUserProfile: false })),
    ...connectedUserProfiles.map(up => ({
      id: up.id,
      name: up.name || up.email || '名無し',
      affiliation: up.team || '所属不明',
      isUserProfile: true
    }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return; // ユーザーIDがない場合は処理しない

    if (date && player1 && opponent1 && (type === 'singles' || (type === 'doubles' && player2 && opponent2))) {
      onMatchAdded({
        id: Date.now().toString(),
        date,
        type,
        players: {
          player1,
          player2: type === 'doubles' ? player2 : undefined,
          opponent1,
          opponent2: type === 'doubles' ? opponent2 : undefined,
        },
        ownerUserId: user.uid, // 試合を記録したユーザーのID
        createdAt: Date.now(),
      });
      // フォームをリセット
      setDate('');
      setType('singles');
      setPlayer1('');
      setPlayer2('');
      setOpponent1('');
      setOpponent2('');
    }
  };

  // 選択可能な相手選手（自チーム選手以外のすべての選手）
  const availableOpponents = allSelectablePlayers.filter(
    (p) => p.id !== player1 && p.id !== player2
  );

  const renderPlayerOptions = (playerList: SelectablePlayer[]) => (
    playerList.map((p) => (
      <option key={p.id} value={p.id}>
        {p.name} ({p.affiliation}) {p.isUserProfile ? '(ユーザー)' : ''}
      </option>
    ))
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-5">新規試合登録</h3>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          <FiCalendar className="inline-block mr-2 text-gray-500" />試合日
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FiUsers className="inline-block mr-2 text-gray-500" />試合形式
        </label>
        <div className="flex space-x-6 mt-1">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              value="singles"
              checked={type === 'singles'}
              onChange={(e) => setType(e.target.value as MatchType)}
              className="form-radio h-5 w-5 text-blue-600 transition-colors duration-200 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">シングルス</span>
          </label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              value="doubles"
              checked={type === 'doubles'}
              onChange={(e) => setType(e.target.value as MatchType)}
              className="form-radio h-5 w-5 text-blue-600 transition-colors duration-200 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">ダブルス</span>
          </label>
        </div>
      </div>

      {/* 自チーム選手選択セクション */}
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <h4 className="text-lg font-bold text-blue-800 mb-4">自チーム選手</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="player1" className="block text-sm font-medium text-gray-700 mb-2">
              <FiUser className="inline-block mr-2 text-gray-500" />選手1
            </label>
            <select
              id="player1"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
              required
            >
              <option value="">選択してください</option>
              {renderPlayerOptions(allSelectablePlayers.filter(p => p.id !== user?.uid))}
            </select>
          </div>

          {type === 'doubles' && (
            <div>
              <label htmlFor="player2" className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline-block mr-2 text-gray-500" />選手2
              </label>
              <select
                id="player2"
                value={player2}
                onChange={(e) => setPlayer2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
                required
              >
                <option value="">選択してください</option>
                {renderPlayerOptions(
                  allSelectablePlayers.filter((p) => p.id !== player1 && p.id !== user?.uid)
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 相手選手選択セクション */}
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <h4 className="text-lg font-bold text-red-800 mb-4">相手チーム選手</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="opponent1" className="block text-sm font-medium text-gray-700 mb-2">
              <FiUser className="inline-block mr-2 text-gray-500" />選手1
            </label>
            <select
              id="opponent1"
              value={opponent1}
              onChange={(e) => setOpponent1(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
              required
            >
              <option value="">選択してください</option>
              {renderPlayerOptions(availableOpponents)}
            </select>
          </div>

          {type === 'doubles' && (
            <div>
              <label htmlFor="opponent2" className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline-block mr-2 text-gray-500" />選手2
              </label>
              <select
                id="opponent2"
                value={opponent2}
                onChange={(e) => setOpponent2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
                required
              >
                <option value="">選択してください</option>
                {renderPlayerOptions(
                  availableOpponents.filter((p) => p.id !== opponent1)
                )}
              </select>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
      >
        <FiPlusCircle className="mr-2" />試合を登録
      </button>
    </form>
  );
};

export default MatchForm;