'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { 
  X,
  Search,
  UserPlus,
  Users,
  Check,
  User,
  Mail
} from 'lucide-react';
import { Friendship } from '@/types/friendship';
import { CommunityMember, CommunityRole } from '@/types/community';

interface Friend {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
  isAlreadyMember?: boolean;
}

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  communityName: string;
  onInviteSuccess?: () => void;
}

export default function InviteFriendsModal({ 
  isOpen, 
  onClose, 
  communityId,
  communityName,
  onInviteSuccess 
}: InviteFriendsModalProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchFriendsAndMembers();
    }
  }, [isOpen, user, communityId]);

  const fetchFriendsAndMembers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // 1. まず現在のアクティブなコミュニティメンバーを取得
      const membersQuery = query(
        collection(db, 'community_members'),
        where('communityId', '==', communityId),
        where('isActive', '==', true)
      );
      const membersSnapshot = await getDocs(membersQuery);
      const activeMemberUserIds = new Set(
        membersSnapshot.docs.map(doc => (doc.data() as CommunityMember).userId)
      );

      // 2. フレンドシップを取得（双方向）
      // Firestoreの制限により、2つのクエリを実行して結果を結合
      const friendshipsQuery1 = query(
        collection(db, 'friendships'),
        where('fromUserId', '==', user.uid),
        where('status', '==', 'accepted')
      );
      const friendshipsQuery2 = query(
        collection(db, 'friendships'),
        where('toUserId', '==', user.uid),
        where('status', '==', 'accepted')
      );
      
      const [friendshipsSnapshot1, friendshipsSnapshot2] = await Promise.all([
        getDocs(friendshipsQuery1),
        getDocs(friendshipsQuery2)
      ]);
      
      const friendUserIds: string[] = [];
      
      // fromUserIdが自分の場合
      friendshipsSnapshot1.docs.forEach(doc => {
        const friendship = doc.data() as Friendship;
        friendUserIds.push(friendship.toUserId);
      });
      
      // toUserIdが自分の場合
      friendshipsSnapshot2.docs.forEach(doc => {
        const friendship = doc.data() as Friendship;
        friendUserIds.push(friendship.fromUserId);
      });
      
      console.log('Found friend IDs:', friendUserIds);

      // 3. フレンドのユーザー情報を取得
      const friendsList: Friend[] = [];
      
      for (const friendId of friendUserIds) {
        try {
          // userProfiles コレクションから情報を取得（ドキュメントIDはユーザーID）
          const profileDoc = await getDoc(doc(db, 'userProfiles', friendId));
          
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            console.log('Profile data for', friendId, ':', profileData);
            
            friendsList.push({
              id: friendId,
              name: profileData.displayName || profileData.name || profileData.email?.split('@')[0] || 'ユーザー',
              email: profileData.email || '',
              photoURL: profileData.avatar || profileData.photoURL || null,
              isAlreadyMember: activeMemberUserIds.has(friendId)
            });
          } else {
            // userProfiles にない場合は基本情報のみ
            console.log('No profile found for', friendId, ', creating basic entry');
            friendsList.push({
              id: friendId,
              name: `ユーザー`,
              email: '',
              photoURL: null,
              isAlreadyMember: activeMemberUserIds.has(friendId)
            });
          }
        } catch (error) {
          console.error('Error fetching profile data for', friendId, ':', error);
          // エラーが発生しても基本情報でユーザーを追加
          friendsList.push({
            id: friendId,
            name: `ユーザー`,
            email: '',
            photoURL: null,
            isAlreadyMember: memberUserIds.has(friendId)
          });
        }
      }
      
      console.log('Final friends list:', friendsList);

      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!user || selectedFriends.length === 0) return;

    setInviting(true);
    try {
      let invitedCount = 0;
      
      // 選択されたフレンドに招待を送信
      for (const friendId of selectedFriends) {
        // 既にアクティブメンバーでないことを確認
        const memberQuery = query(
          collection(db, 'community_members'),
          where('communityId', '==', communityId),
          where('userId', '==', friendId),
          where('isActive', '==', true)
        );
        const memberSnapshot = await getDocs(memberQuery);

        if (memberSnapshot.empty) {
          // 既存の保留中の招待がないか確認
          const invitationQuery = query(
            collection(db, 'community_invitations'),
            where('communityId', '==', communityId),
            where('invitedUserId', '==', friendId),
            where('status', '==', 'pending')
          );
          const invitationSnapshot = await getDocs(invitationQuery);
          
          if (invitationSnapshot.empty) {
            // 招待レコードを作成
            await addDoc(collection(db, 'community_invitations'), {
              communityId,
              inviterId: user.uid,
              invitedUserId: friendId,
              status: 'pending',
              invitedAt: Date.now()
            });
            invitedCount++;
          }
        }
      }

      if (invitedCount > 0) {
        alert(`${invitedCount}名のフレンドに招待を送信しました`);
      } else {
        alert('選択されたフレンドは既に招待済みまたはメンバーです');
      }
      
      onInviteSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error inviting friends:', error);
      alert('招待に失敗しました');
    } finally {
      setInviting(false);
      setSelectedFriends([]);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.email && friend.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const selectAll = () => {
    const availableFriends = filteredFriends
      .filter(f => !f.isAlreadyMember)
      .map(f => f.id);
    setSelectedFriends(availableFriends);
  };

  const deselectAll = () => {
    setSelectedFriends([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              フレンドを招待
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {communityName}にフレンドを招待します
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 検索バー */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="名前やメールアドレスで検索"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {selectedFriends.length}名選択中
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-green-600 hover:text-green-700"
              >
                すべて選択
              </button>
              <button
                onClick={deselectAll}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                選択解除
              </button>
            </div>
          </div>
        </div>

        {/* フレンドリスト */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500 mb-2">
                招待できるフレンドがいません
              </p>
              <p className="text-sm text-gray-400">
                まずはフレンドを追加してください
              </p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">
                検索結果がありません
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    friend.isAlreadyMember
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : selectedFriends.includes(friend.id)
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  } ${!friend.isAlreadyMember && 'cursor-pointer'} transition-colors`}
                  onClick={() => !friend.isAlreadyMember && toggleFriendSelection(friend.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {friend.photoURL ? (
                        <img
                          src={friend.photoURL}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      )}
                      {selectedFriends.includes(friend.id) && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{friend.name}</p>
                      {friend.email && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {friend.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {friend.isAlreadyMember && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      参加済み
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleInvite}
            disabled={selectedFriends.length === 0 || inviting}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors inline-flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {inviting ? '招待中...' : `${selectedFriends.length}名を招待`}
          </button>
        </div>
      </div>
    </div>
  );
}