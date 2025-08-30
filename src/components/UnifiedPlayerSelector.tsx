'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@/types/player';
import { UserProfile } from '@/types/userProfile';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FiUser, FiUsers, FiSearch, FiX, FiUserPlus } from 'react-icons/fi';

interface UnifiedPlayerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerSelect: (playerId: string) => void;
  excludePlayerIds?: string[];
  registeredPlayers: Player[];
  title?: string;
}

interface SelectablePlayer {
  id: string;
  name: string;
  affiliation: string;
  email?: string;
  isFromFriend: boolean;
  friendId?: string;
}

const UnifiedPlayerSelector: React.FC<UnifiedPlayerSelectorProps> = ({
  isOpen,
  onClose,
  onPlayerSelect,
  excludePlayerIds = [],
  registeredPlayers,
  title = '選手を選択してください'
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'players'>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [friendProfiles, setFriendProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unifiedPlayers, setUnifiedPlayers] = useState<SelectablePlayer[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadFriendProfiles();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (friendProfiles.length > 0 || registeredPlayers.length > 0) {
      createUnifiedPlayersList();
    }
  }, [friendProfiles, registeredPlayers]);

  const loadFriendProfiles = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const friendships = await firestoreDb.getAcceptedFriendships(user.uid);
      const friendUserIds = friendships.map(friendship => 
        friendship.fromUserId === user.uid ? friendship.toUserId : friendship.fromUserId
      );
      const profiles = await firestoreDb.getUserProfilesByIds(friendUserIds);
      setFriendProfiles(profiles);
    } catch (error) {
      console.error('フレンドの読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createUnifiedPlayersList = () => {
    const friendPlayers: SelectablePlayer[] = friendProfiles.map(profile => ({
      id: profile.id,
      name: profile.name || profile.email || '名無し',
      affiliation: profile.team || 'フレンド',
      email: profile.email,
      isFromFriend: true,
      friendId: profile.id
    }));

    const registeredPlayersConverted: SelectablePlayer[] = registeredPlayers.map(player => ({
      id: player.id,
      name: player.name,
      affiliation: player.affiliation,
      email: player.email,
      isFromFriend: false,
      friendId: player.friendId
    }));

    // 重複除去: フレンドを優先する
    const uniquePlayers: SelectablePlayer[] = [];
    const seenNames = new Set<string>();
    const seenEmails = new Set<string>();

    // まずフレンドを追加
    friendPlayers.forEach(player => {
      if (!excludePlayerIds.includes(player.id)) {
        uniquePlayers.push(player);
        seenNames.add(player.name.toLowerCase());
        if (player.email) {
          seenEmails.add(player.email.toLowerCase());
        }
      }
    });

    // 次に登録済み選手を追加（重複していなければ）
    registeredPlayersConverted.forEach(player => {
      if (!excludePlayerIds.includes(player.id)) {
        const isDuplicateName = seenNames.has(player.name.toLowerCase());
        const isDuplicateEmail = player.email && seenEmails.has(player.email.toLowerCase());
        
        if (!isDuplicateName && !isDuplicateEmail) {
          uniquePlayers.push(player);
          seenNames.add(player.name.toLowerCase());
          if (player.email) {
            seenEmails.add(player.email.toLowerCase());
          }
        }
      }
    });

    setUnifiedPlayers(uniquePlayers);
  };

  const filteredPlayers = unifiedPlayers.filter(player => {
    const matchesSearch = searchTerm === '' || 
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.affiliation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === 'friends' ? player.isFromFriend : !player.isFromFriend;

    return matchesSearch && matchesTab;
  });

  const handlePlayerSelect = (playerId: string) => {
    onPlayerSelect(playerId);
    onClose();
  };

  const friendsCount = unifiedPlayers.filter(p => p.isFromFriend).length;
  const playersCount = unifiedPlayers.filter(p => !p.isFromFriend).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* タブナビゲーション */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'friends'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiUsers className="w-4 h-4 inline mr-2" />
            フレンドから選択 ({friendsCount})
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'players'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiUser className="w-4 h-4 inline mr-2" />
            登録選手から選択 ({playersCount})
          </button>
        </div>

        {/* 検索バー */}
        <div className="p-4 border-b">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="選手を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 選手リスト */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
              <span className="text-gray-600">読み込み中...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPlayers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiUser className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>
                    {activeTab === 'friends' ? 'フレンドが見つかりません' : '登録選手が見つかりません'}
                  </p>
                </div>
              ) : (
                filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => handlePlayerSelect(player.id)}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                        player.isFromFriend 
                          ? 'bg-gradient-to-br from-blue-400 to-purple-500' 
                          : 'bg-gradient-to-br from-green-400 to-blue-500'
                      }`}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800">{player.name}</h4>
                          {player.isFromFriend && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FiUserPlus className="w-3 h-3 mr-1" />
                              フレンド
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{player.affiliation}</p>
                      </div>
                    </div>
                    <div className="text-blue-600 hover:text-blue-800">
                      <FiUser className="w-5 h-5" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {activeTab === 'friends' ? 'フレンド' : '登録選手'}: {filteredPlayers.length}名
            </span>
            <span>
              重複は自動的に除去されます（フレンド優先）
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedPlayerSelector;