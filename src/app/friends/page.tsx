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
import { FiSearch, FiUserPlus, FiCheckCircle, FiXCircle, FiUsers, FiMail, FiTrash2, FiCalendar, FiClock, FiUser } from 'react-icons/fi';

interface FriendshipWithProfile extends Friendship {
  fromUserProfile?: UserProfile;
  toUserProfile?: UserProfile;
}

interface MatchRequestWithProfiles extends MatchRequest {
  fromUserProfile?: UserProfile;
}

type TabType = 'friends' | 'requests';

const FriendsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendshipWithProfile[]>([]);
  const [acceptedFriendships, setAcceptedFriendships] = useState<FriendshipWithProfile[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequestWithProfiles[]>([]);
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

  const loadMatchRequests = async () => {
    if (!user?.uid) return;
    try {
      const requests = await firestoreDb.getPendingMatchRequests(user.uid);
      const fromUserIds = requests.map(req => req.fromUserId);
      const fromUserProfiles = await firestoreDb.getUserProfilesByIds(fromUserIds);

      const requestsWithProfiles = requests.map(req => ({
        ...req,
        fromUserProfile: fromUserProfiles.find(p => p.id === req.fromUserId)
      }));
      setMatchRequests(requestsWithProfiles);
    } catch (error) {
      console.error('試合リクエストの読み込みに失敗しました:', error);
    }
  };

  useEffect(() => {
    loadFriendships();
    loadMatchRequests();
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
        !pendingRequests.some(req => req.fromUserId === profile.id || req.toUserId === profile.id)
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

  const handleAcceptMatchRequest = async (request: MatchRequestWithProfiles) => {
    if (!user?.uid) return;
    setMessage(null);
    try {
      await firestoreDb.updateMatchRequestStatus(request.id, 'accepted');
      
      await firestoreDb.addMatch({
        ...request.matchData,
        ownerUserId: user.uid,
      });

      setMessage({ type: 'success', text: '試合リクエストを承認し、試合記録に追加しました！' });
      loadMatchRequests();
    } catch (error) {
      console.error('試合リクエストの承認に失敗しました:', error);
      setMessage({ type: 'error', text: `承認に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` });
    }
  };

  const handleDeclineMatchRequest = async (requestId: string) => {
    setMessage(null);
    try {
      await firestoreDb.updateMatchRequestStatus(requestId, 'declined');
      setMessage({ type: 'success', text: '試合リクエストを拒否しました。' });
      loadMatchRequests();
    } catch (error) {
      console.error('試合リクエストの拒否に失敗しました:', error);
      setMessage({ type: 'error', text: `拒否に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` });
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
      <MobileNav activePath="/friends" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">フレンド</h2>

            {/* タブナビゲーション */}
            <div className="bg-white rounded-xl shadow-lg mb-6">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === 'friends'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <FiUsers className="inline-block mr-2" />
                  フレンド管理
                  {pendingRequests.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`flex-1 py-4 px-6 font-medium text-center transition-colors ${
                    activeTab === 'requests'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <FiMail className="inline-block mr-2" />
                  試合リクエスト
                  {matchRequests.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {matchRequests.length}
                    </span>
                  )}
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
            ) : (
              <div>
                {/* 試合リクエストセクション */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">保留中の試合リクエスト ({matchRequests.length})</h3>
                  {matchRequests.length === 0 ? (
                    <p className="text-gray-500">保留中の試合リクエストはありません。</p>
                  ) : (
                    <div className="space-y-4">
                      {matchRequests.map(request => (
                        <div key={request.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center mb-3 md:mb-0">
                            <img
                              src={request.fromUserProfile?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${request.fromUserProfile?.name || 'A'}`}
                              alt="Avatar"
                              className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div>
                              <p className="font-medium text-gray-800">{request.fromUserProfile?.name || '名無し'} からの試合リクエスト</p>
                              <p className="text-sm text-gray-600 flex items-center">
                                <FiClock className="mr-1" />{new Date(request.createdAt).toLocaleDateString('ja-JP')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex-grow md:ml-8">
                            <p className="text-sm text-gray-700 flex items-center mb-1">
                              <FiCalendar className="mr-2" />試合日: {new Date(request.matchData.date).toLocaleDateString('ja-JP')}
                            </p>
                            <p className="text-sm text-gray-700 flex items-center mb-1">
                              <FiUsers className="mr-2" />形式: {request.matchData.type === 'singles' ? 'シングルス' : 'ダブルス'}
                            </p>
                            <p className="text-sm text-gray-700 flex items-center">
                              <FiUser className="mr-2" />自チーム: {request.matchData.players.player1} {request.matchData.players.player2 ? `& ${request.matchData.players.player2}` : ''}
                            </p>
                            <p className="text-sm text-gray-700 flex items-center">
                              <FiUser className="mr-2" />相手チーム: {request.matchData.players.opponent1} {request.matchData.players.opponent2 ? `& ${request.matchData.players.opponent2}` : ''}
                            </p>
                            
                            {request.matchData.score && (
                              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                <div className="flex justify-center items-center space-x-4">
                                  <div className="text-center">
                                    <p className="text-xs text-gray-600">自チーム</p>
                                    <p className="text-lg font-bold text-blue-600">{request.matchData.score.player}</p>
                                  </div>
                                  <div className="text-md font-bold text-gray-400">:</div>
                                  <div className="text-center">
                                    <p className="text-xs text-gray-600">相手チーム</p>
                                    <p className="text-lg font-bold text-red-600">{request.matchData.score.opponent}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-3 mt-4 md:mt-0 md:ml-auto">
                            <button
                              onClick={() => handleAcceptMatchRequest(request)}
                              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                            >
                              <FiCheckCircle className="mr-2" />承認
                            </button>
                            <button
                              onClick={() => handleDeclineMatchRequest(request.id)}
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
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FriendsPage;