'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '@/types/player';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FaUserFriends, FaPlus, FaCheck, FaSearch, FaTimes } from 'react-icons/fa';

interface FriendProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAlreadyPlayer?: boolean;
}

interface FriendToPlayerSelectorProps {
  onPlayerAdded: (player: Player) => void;
  existingPlayers: Player[];
}

const FriendToPlayerSelector: React.FC<FriendToPlayerSelectorProps> = ({ 
  onPlayerAdded, 
  existingPlayers 
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);

  useEffect(() => {
    if (showFriendSelector) {
      loadFriends();
    }
  }, [showFriendSelector, user]);

  const loadFriends = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      // フレンドシップデータを取得
      const friendships = await firestoreDb.getAcceptedFriendships(user.uid);
      
      // フレンドのユーザーIDを取得
      const friendUserIds = friendships.map(friendship => 
        friendship.fromUserId === user.uid ? friendship.toUserId : friendship.fromUserId
      );
      
      // フレンドのプロフィールを取得
      const friendProfiles = await firestoreDb.getUserProfilesByIds(friendUserIds);
      
      // 既に選手として登録されているかチェック
      const friendsWithPlayerStatus = friendProfiles.map(friend => ({
        ...friend,
        isAlreadyPlayer: existingPlayers.some(player => 
          player.name === friend.name
        )
      }));
      
      setFriends(friendsWithPlayerStatus);
    } catch (error) {
      console.error('フレンド読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFriendAsPlayer = async (friend: FriendProfile) => {
    if (!user?.uid || addingFriendId) return;
    
    setAddingFriendId(friend.id);
    try {
      const newPlayer: Player = {
        id: `friend_${friend.id}_${Date.now()}`,
        name: friend.name,
        affiliation: 'フレンド', // デフォルト所属
        email: friend.email,
        friendId: friend.id,
        createdAt: Date.now(),
      };
      
      await onPlayerAdded(newPlayer);
      
      // フレンドリストを更新
      setFriends(friends.map(f => 
        f.id === friend.id ? { ...f, isAlreadyPlayer: true } : f
      ));
      
    } catch (error) {
      console.error('フレンド追加エラー:', error);
    } finally {
      setAddingFriendId(null);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableFriends = filteredFriends.filter(friend => !friend.isAlreadyPlayer);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FaUserFriends className="w-5 h-5 mr-2 text-blue-600" />
          フレンドから選手を追加
        </h3>
        <button
          onClick={() => setShowFriendSelector(!showFriendSelector)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showFriendSelector ? (
            <>
              <FaTimes className="w-4 h-4 mr-2 inline" />
              閉じる
            </>
          ) : (
            <>
              <FaUserFriends className="w-4 h-4 mr-2 inline" />
              フレンドを表示
            </>
          )}
        </button>
      </div>

      {showFriendSelector && (
        <div className="space-y-4">
          {/* 検索バー */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="フレンドを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* フレンドリスト */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600">フレンドを読み込み中...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableFriends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaUserFriends className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>
                    {friends.length === 0 
                      ? 'フレンドが見つかりません' 
                      : '追加可能なフレンドがありません'
                    }
                  </p>
                  {friends.length > 0 && (
                    <p className="text-sm mt-1">全てのフレンドが既に選手として登録されています</p>
                  )}
                </div>
              ) : (
                availableFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{friend.name}</h4>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAddFriendAsPlayer(friend)}
                      disabled={addingFriendId === friend.id}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        addingFriendId === friend.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {addingFriendId === friend.id ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                          追加中...
                        </>
                      ) : (
                        <>
                          <FaPlus className="w-4 h-4 mr-2" />
                          選手として追加
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 既に登録済みのフレンド */}
          {friends.some(f => f.isAlreadyPlayer) && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-3">既に登録済み</h4>
              <div className="space-y-2">
                {friends.filter(f => f.isAlreadyPlayer).map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">{friend.name}</h4>
                      </div>
                    </div>
                    <div className="flex items-center text-green-600">
                      <FaCheck className="w-4 h-4 mr-1" />
                      <span className="text-sm">登録済み</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendToPlayerSelector;