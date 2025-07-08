'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/types/userProfile';
import { Friendship } from '@/types/friendship'; // ConnectionからFriendshipに変更
import { FiSearch, FiUserPlus, FiCheckCircle, FiXCircle, FiUsers, FiMail, FiTrash2, FiRefreshCcw } from 'react-icons/fi';

interface FriendshipWithProfile extends Friendship {
  fromUserProfile?: UserProfile;
  toUserProfile?: UserProfile;
}

const FriendsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendshipWithProfile[]>([]);
  const [acceptedFriendships, setAcceptedFriendships] = useState<FriendshipWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadFriendships = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const pending = await firestoreDb.getPendingFriendRequests(user.uid);
      const accepted = await firestoreDb.getAcceptedFriendships(user.uid);

      // 保留中のリクエストのプロフィール情報を取得
      const pendingUserIds = pending.map(req => req.fromUserId);
      const pendingUserProfiles = await firestoreDb.getUserProfilesByIds(pendingUserIds);
      const pendingWithProfiles = pending.map(req => ({
        ...req,
        fromUserProfile: pendingUserProfiles.find(p => p.id === req.fromUserId)
      }));
      setPendingRequests(pendingWithProfiles);

      // 承認済みフレンドシップのプロフィール情報を取得
      const acceptedUserIds = accepted.flatMap(conn => [
        conn.fromUserId === user.uid ? conn.toUserId : conn.fromUserId
      ]);
      const acceptedUserProfiles = await firestoreDb.getUserProfilesByIds(acceptedUserIds);
      const acceptedWithProfiles = accepted.map(conn => ({
        ...conn,
        fromUserProfile: acceptedUserProfiles.find(p => p.id === conn.fromUserId),
        toUserProfile: acceptedUserProfiles.find(p => p.id === conn.toUserId)
      }));
      setAcceptedFriendships(acceptedWithProfiles);

    } catch (error) {
      console.error('フレンド情報の読み込みに失敗しました:', error);
      setMessage({ type: 'error', text: 'フレンド情報の読み込みに失敗しました。' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriendships();
  }, [user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setMessage(null);
    try {
      const results = await firestoreDb.searchUsersByEmail(searchTerm);
      // 自分自身と既にフレンド済みのユーザーを除外
      const filteredResults = results.filter(profile => 
        profile.id !== user?.uid && 
        !acceptedFriendships.some(friendship => friendship.fromUserId === profile.id || friendship.toUserId === profile.id) &&
        !pendingRequests.some(req => req.fromUserId === profile.id || req.toUserId === profile.id) // 保留中のリクエストも除外
      );
      setSearchResults(filteredResults);
      if (filteredResults.length === 0) {
        setMessage({ type: 'error', text: '該当するユーザーが見つかりませんでした。' });
      }
    } catch (error) {
      console.error('ユーザー検索に失敗しました:', error);
      setMessage({ type: 'error', text: 'ユーザー検索に失敗しました。' });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (toUserId: string) => {
    if (!user?.uid) return;
    setMessage(null);
    try {
      await firestoreDb.sendFriendRequest(user.uid, toUserId);
      setMessage({ type: 'success', text: 'フレンドリクエストを送信しました！' });
      loadFriendships(); // フレンドリストを更新
      setSearchResults([]); // 検索結果をクリア
      setSearchTerm('');
    } catch (error) {
      console.error('リクエスト送信に失敗しました:', error);
      setMessage({ type: 'error', text: `リクエスト送信に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` });
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    setMessage(null);
    try {
      await firestoreDb.updateFriendshipStatus(friendshipId, 'accepted');
      setMessage({ type: 'success', text: 'フレンドリクエストを承認しました！' });
      loadFriendships();
    } catch (error) {
      console.error('リクエスト承認に失敗しました:', error);
      setMessage({ type: 'error', text: 'リクエスト承認に失敗しました。' });
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    setMessage(null);
    try {
      await firestoreDb.updateFriendshipStatus(friendshipId, 'declined');
      setMessage({ type: 'success', text: 'フレンドリクエストを拒否しました。' });
      loadFriendships();
    } catch (error) {
      console.error('リクエスト拒否に失敗しました:', error);
      setMessage({ type: 'error', text: 'リクエスト拒否に失敗しました。' });
    }
  };

  const handleDeleteFriendship = async (friendshipId: string) => {
    setMessage(null);
    if (!window.confirm('このフレンドを削除してもよろしいですか？')) return;
    try {
      await firestoreDb.deleteFriendship(friendshipId);
      setMessage({ type: 'success', text: 'フレンドを削除しました。' });
      loadFriendships();
    } catch (error) {
      console.error('フレンド削除に失敗しました:', error);
      setMessage({ type: 'error', text: 'フレンド削除に失敗しました。' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePath="/friends" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">フレンド管理</h2>

            {message && (
              <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            {/* ユーザー検索セクション */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">新しいフレンドを探す</h3>
              <form onSubmit={handleSearch} className="flex space-x-3">
                <input
                  type="email"
                  placeholder="ユーザーのメールアドレスで検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {searchLoading ? '検索中...' : <><FiSearch className="mr-2" />検索</>}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">検索結果</h4>
                  <div className="space-y-3">
                    {searchResults.map(profile => (
                      <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <img
                            src={profile.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name || 'A'}`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{profile.name || '名無し'}</p>
                            <p className="text-sm text-gray-500">{profile.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendRequest(profile.id)}
                          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                        >
                          <FiUserPlus className="mr-2" />リクエスト送信
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 保留中のリクエストセクション */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">保留中のフレンドリクエスト ({pendingRequests.length})</h3>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500">保留中のフレンドリクエストはありません。</p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center">
                        <img
                          src={request.fromUserProfile?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${request.fromUserProfile?.name || 'A'}`}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{request.fromUserProfile?.name || '名無し'} からのリクエスト</p>
                          <p className="text-sm text-gray-500">{request.fromUserProfile?.email || 'メール不明'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                        >
                          <FiCheckCircle className="mr-2" />承認
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id)}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          <FiXCircle className="mr-2" />拒否
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 承認済みフレンドシップセクション */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">承認済みのフレンド ({acceptedFriendships.length})</h3>
              {acceptedFriendships.length === 0 ? (
                <p className="text-gray-500">承認済みのフレンドはいません。</p>
              ) : (
                <div className="space-y-3">
                  {acceptedFriendships.map(friendship => {
                    const connectedUser = friendship.fromUserId === user?.uid ? friendship.toUserProfile : friendship.fromUserProfile;
                    return (
                      <div key={friendship.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center">
                          <img
                            src={connectedUser?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${connectedUser?.name || 'A'}`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{connectedUser?.name || '名無し'}</p>
                            <p className="text-sm text-gray-500">{connectedUser?.email || 'メール不明'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFriendship(friendship.id)}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          <FiTrash2 className="mr-2" />削除
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FriendsPage;
