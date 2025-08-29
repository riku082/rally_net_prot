'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/types/userProfile';
import { Friendship } from '@/types/friendship';
import { MatchRequest } from '@/types/matchRequest';
import { FiSearch, FiUserPlus, FiCheckCircle, FiXCircle, FiUsers, FiTrash2, FiUser, FiExternalLink, FiEye } from 'react-icons/fi';
import RecommendedUsers from '@/components/RecommendedUsers';
import FriendDetailModal from '@/components/FriendDetailModal';

interface FriendshipWithProfile extends Friendship {
  fromUserProfile?: UserProfile;
  toUserProfile?: UserProfile;
}

interface MatchRequestWithProfiles extends MatchRequest {
  fromUserProfile?: UserProfile;
}

type TabType = 'friends' | 'search';

const FriendsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendshipWithProfile[]>([]);
  const [acceptedFriendships, setAcceptedFriendships] = useState<FriendshipWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [showFriendModal, setShowFriendModal] = useState(false);

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
      const results = await firestoreDb.searchUsers(searchTerm, 'name');
      
      // 送信済みリクエストも取得
      const sentRequests = await firestoreDb.getSentFriendRequests(user?.uid!);
      
      // 自分自身と既にフレンド済み、リクエスト済みのユーザーを除外
      const filteredResults = results.filter(profile => 
        profile.id !== user?.uid && 
        !acceptedFriendships.some(friendship => friendship.fromUserId === profile.id || friendship.toUserId === profile.id) &&
        !pendingRequests.some(req => req.fromUserId === profile.id || req.toUserId === profile.id) &&
        !sentRequests.some(req => req.toUserId === profile.id)
      );
      setSearchResults(filteredResults);
      if (filteredResults.length === 0) {
        setMessage({ type: 'error', text: `該当する名前のユーザーが見つかりませんでした。` });
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
      loadFriendships();
      setSearchResults([]);
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

  const handleFriendClick = (friendProfile: UserProfile) => {
    setSelectedFriend(friendProfile);
    setShowFriendModal(true);
  };

  const handleViewProfile = (friendProfile: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/user/${friendProfile.id}`;
  };

  const handleCloseFriendModal = () => {
    setShowFriendModal(false);
    setSelectedFriend(null);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activePath="/friends" />
      <MobileNav activePath="/friends" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">フレンド</h2>

            {/* タブナビゲーション */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-medium text-center transition-colors ${
                    activeTab === 'friends'
                      ? 'text-theme-primary-600 border-b-2 border-theme-primary-600 bg-theme-primary-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <FiUsers className="inline-block mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm md:text-base">フレンド一覧</span>
                  {pendingRequests.length > 0 && (
                    <span className="ml-1 sm:ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 py-3 sm:py-4 px-2 sm:px-6 font-medium text-center transition-colors ${
                    activeTab === 'search'
                      ? 'text-theme-primary-600 border-b-2 border-theme-primary-600 bg-theme-primary-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <FiSearch className="inline-block mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm md:text-base">フレンドを検索</span>
                </button>
              </div>
            </div>

            {message && (
              <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            {/* タブコンテンツ */}
            {activeTab === 'friends' ? (
              <div>
                {/* 保留中のリクエストセクション */}
                <div className="bg-white rounded-xl shadow-lg mb-6">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">フレンドリクエスト ({pendingRequests.length})</h3>
                  </div>
                  {pendingRequests.length === 0 ? (
                    <div className="p-8 text-center">
                      <FiUserPlus className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500">新しいフレンドリクエストはありません。</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {pendingRequests.map(request => (
                        <div key={request.id} className="flex items-center justify-between px-6 py-4">
                          <div className="flex items-center flex-grow">
                            <img
                              src={request.fromUserProfile?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${request.fromUserProfile?.name || 'A'}`}
                              alt="Avatar"
                              className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div className="flex-grow">
                              <p className="font-semibold text-gray-900">{request.fromUserProfile?.name || '名無し'}</p>
                              {request.fromUserProfile?.playRegion && (
                                <p className="text-sm text-gray-500">{request.fromUserProfile.playRegion}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="px-4 py-2 bg-theme-primary-600 text-white text-sm font-medium rounded-lg hover:bg-theme-primary-700 transition-colors"
                            >
                              承認
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(request.id)}
                              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              拒否
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* フレンド一覧セクション */}
                <div className="bg-white rounded-xl shadow-lg">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">フレンド ({acceptedFriendships.length})</h3>
                  </div>
                  {acceptedFriendships.length === 0 ? (
                    <div className="p-8 text-center">
                      <FiUsers className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p className="text-gray-500">フレンドはいません。</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {acceptedFriendships.map(friendship => {
                        const connectedUser = friendship.fromUserId === user?.uid ? friendship.toUserProfile : friendship.fromUserProfile;
                        return (
                          <div key={friendship.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div 
                              className="flex items-center flex-grow cursor-pointer"
                              onClick={(e) => connectedUser && handleViewProfile(connectedUser, e)}
                            >
                              <img
                                src={connectedUser?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${connectedUser?.name || 'A'}`}
                                alt="Avatar"
                                className="w-12 h-12 rounded-full object-cover mr-4"
                              />
                              <div className="flex-grow">
                                <p className="font-semibold text-gray-900">{connectedUser?.name || '名無し'}</p>
                                {connectedUser?.playRegion && (
                                  <p className="text-sm text-gray-500">{connectedUser.playRegion}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleViewProfile(connectedUser!, e)}
                              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              プロフィール
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* ユーザー検索セクション */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">新しいフレンドを探す</h3>
                  

                  <form onSubmit={handleSearch} className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="ユーザーの名前で検索（部分一致）"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                      style={{ color: '#000000' }}
                    />
                    <button
                      type="submit"
                      disabled={searchLoading}
                      className="flex items-center px-5 py-2 bg-theme-primary-600 text-white rounded-lg shadow-md hover:bg-theme-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {searchLoading ? '検索中...' : <><FiSearch className="mr-2" />検索</>}
                    </button>
                  </form>

                  {searchResults.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3">検索結果</h4>
                      <div className="divide-y divide-gray-100">
                        {searchResults.map(profile => (
                          <div key={profile.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center flex-grow">
                              <img
                                src={profile.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name || 'A'}`}
                                alt="Avatar"
                                className="w-12 h-12 rounded-full object-cover mr-4"
                              />
                              <div className="flex-grow">
                                <p className="font-semibold text-gray-900">{profile.name || '名無し'}</p>
                                {profile.playRegion && (
                                  <p className="text-sm text-gray-500">{profile.playRegion}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleSendRequest(profile.id)}
                              className="px-4 py-2 bg-theme-primary-600 text-white text-sm font-medium rounded-lg hover:bg-theme-primary-700 transition-colors"
                            >
                              フォロー
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* おすすめユーザーセクション */}
                <RecommendedUsers 
                  onSendRequest={handleSendRequest}
                  onMessage={setMessage}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* フレンド詳細モーダル */}
      {selectedFriend && (
        <FriendDetailModal
          friend={selectedFriend}
          isOpen={showFriendModal}
          onClose={handleCloseFriendModal}
        />
      )}
    </div>
  );
};

export default FriendsPage;