// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { Match, MatchType } from '@/types/match';
import { Player } from '@/types/player';
import { UserProfile } from '@/types/userProfile';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FiCalendar, FiUsers, FiUser, FiPlusCircle, FiVideo, FiLink, FiChevronDown } from 'react-icons/fi';
import UnifiedPlayerSelector from './UnifiedPlayerSelector';

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
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isPlayerSelectorOpen, setIsPlayerSelectorOpen] = useState(false);
  const [currentSelectingField, setCurrentSelectingField] = useState<'player1' | 'player2' | 'opponent1' | 'opponent2' | null>(null);

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

  const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    if (url.trim() && extractYouTubeVideoId(url)) {
      setVideoTitle('YouTube動画');
    } else {
      setVideoTitle('');
    }
  };

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

  const handlePlayerSelectorOpen = (field: 'player1' | 'player2' | 'opponent1' | 'opponent2') => {
    setCurrentSelectingField(field);
    setIsPlayerSelectorOpen(true);
  };

  const handlePlayerSelect = (playerId: string) => {
    if (currentSelectingField === 'player1') {
      setPlayer1(playerId);
    } else if (currentSelectingField === 'player2') {
      setPlayer2(playerId);
    } else if (currentSelectingField === 'opponent1') {
      setOpponent1(playerId);
    } else if (currentSelectingField === 'opponent2') {
      setOpponent2(playerId);
    }
    setIsPlayerSelectorOpen(false);
    setCurrentSelectingField(null);
  };

  const getPlayerName = (playerId: string): string => {
    if (!playerId) return '選択してください';
    const player = allSelectablePlayers.find(p => p.id === playerId);
    return player ? `${player.name} (${player.affiliation})` : '選択してください';
  };

  const getExcludePlayerIds = (field: 'player1' | 'player2' | 'opponent1' | 'opponent2'): string[] => {
    const excludeIds = [];
    if (user?.uid) excludeIds.push(user.uid);
    
    if (field === 'player1') {
      // player1を選択する場合は、player2を除外
      if (player2) excludeIds.push(player2);
    } else if (field === 'player2') {
      // player2を選択する場合は、player1を除外
      if (player1) excludeIds.push(player1);
    } else if (field === 'opponent1') {
      // opponent1を選択する場合は、player1, player2, opponent2を除外
      if (player1) excludeIds.push(player1);
      if (player2) excludeIds.push(player2);
      if (opponent2) excludeIds.push(opponent2);
    } else if (field === 'opponent2') {
      // opponent2を選択する場合は、player1, player2, opponent1を除外
      if (player1) excludeIds.push(player1);
      if (player2) excludeIds.push(player2);
      if (opponent1) excludeIds.push(opponent1);
    }
    
    return excludeIds;
  };

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
        youtubeVideoId: extractYouTubeVideoId(videoUrl) || undefined,
        youtubeVideoTitle: videoTitle || '動画',
      });
      // フォームをリセット
      setDate('');
      setType('singles');
      setPlayer1('');
      setPlayer2('');
      setOpponent1('');
      setOpponent2('');
      setVideoUrl('');
      setVideoTitle('');
    }
  };

  // 選択可能な相手選手（自チーム選手以外のすべての選手）
  // const availableOpponents = allSelectablePlayers.filter(
  //   (p) => p.id !== player1 && p.id !== player2
  // );

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
            <button
              type="button"
              onClick={() => handlePlayerSelectorOpen('player1')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none bg-white text-left flex items-center justify-between"
            >
              <span className={player1 ? 'text-gray-900' : 'text-gray-500'}>
                {getPlayerName(player1)}
              </span>
              <FiChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {type === 'doubles' && (
            <div>
              <label htmlFor="player2" className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline-block mr-2 text-gray-500" />選手2
              </label>
              <button
                type="button"
                onClick={() => handlePlayerSelectorOpen('player2')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none bg-white text-left flex items-center justify-between"
              >
                <span className={player2 ? 'text-gray-900' : 'text-gray-500'}>
                  {getPlayerName(player2)}
                </span>
                <FiChevronDown className="w-5 h-5 text-gray-400" />
              </button>
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
            <button
              type="button"
              onClick={() => handlePlayerSelectorOpen('opponent1')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none bg-white text-left flex items-center justify-between"
            >
              <span className={opponent1 ? 'text-gray-900' : 'text-gray-500'}>
                {getPlayerName(opponent1)}
              </span>
              <FiChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {type === 'doubles' && (
            <div>
              <label htmlFor="opponent2" className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline-block mr-2 text-gray-500" />選手2
              </label>
              <button
                type="button"
                onClick={() => handlePlayerSelectorOpen('opponent2')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none bg-white text-left flex items-center justify-between"
              >
                <span className={opponent2 ? 'text-gray-900' : 'text-gray-500'}>
                  {getPlayerName(opponent2)}
                </span>
                <FiChevronDown className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 動画URL入力 */}
      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
          <FiVideo className="inline-block mr-2 text-gray-500" />関連動画URL（オプション）
        </label>
        <div className="space-y-3">
          <input
            type="url"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <input
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="動画のタイトル（任意）"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          {videoUrl && extractYouTubeVideoId(videoUrl) && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiLink className="text-green-600" />
                <span className="text-green-700 text-sm font-medium">有効なYouTube URLが入力されました</span>
              </div>
            </div>
          )}
          {videoUrl && !extractYouTubeVideoId(videoUrl) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiVideo className="text-yellow-600" />
                <span className="text-yellow-700 text-sm">有効なYouTube URLを入力してください</span>
              </div>
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

      {/* 統合選手セレクター */}
      <UnifiedPlayerSelector
        isOpen={isPlayerSelectorOpen}
        onClose={() => {
          setIsPlayerSelectorOpen(false);
          setCurrentSelectingField(null);
        }}
        onPlayerSelect={handlePlayerSelect}
        excludePlayerIds={currentSelectingField ? getExcludePlayerIds(currentSelectingField) : []}
        registeredPlayers={players}
        title={currentSelectingField ? `${currentSelectingField === 'player1' ? '自チーム選手1' : 
                                      currentSelectingField === 'player2' ? '自チーム選手2' : 
                                      currentSelectingField === 'opponent1' ? '相手チーム選手1' : 
                                      '相手チーム選手2'}を選択してください` : '選手を選択してください'}
      />
    </form>
  );
};

export default MatchForm;