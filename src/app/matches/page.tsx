'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import MatchForm from '@/components/MatchForm';
import MatchList from '@/components/MatchList';
import AuthGuard from '@/components/AuthGuard';
import { Player } from '@/types/player';
import { Match } from '@/types/match';
import { UserProfile } from '@/types/userProfile'; // UserProfileをインポート
import { MatchRequest } from '@/types/matchRequest';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FiPlus, FiBell, FiCheckCircle, FiXCircle, FiUser, FiCalendar } from 'react-icons/fi';

const MatchesPage: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [connectedUserProfiles, setConnectedUserProfiles] = useState<UserProfile[]>([]); // 追加
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.uid) {
        console.log('User not authenticated, skipping data load');
        return;
      }
      
      setLoading(true);
      const loadedPlayers = await firestoreDb.getPlayers(user.uid);
      const loadedMatches = await firestoreDb.getMatches(user.uid);
      setPlayers(loadedPlayers);
      setMatches(loadedMatches);

      // 接続済みユーザーのプロフィールも読み込む
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

      // 試合リクエストも読み込む
      try {
        const requests = await firestoreDb.getPendingMatchRequests(user.uid);
        setMatchRequests(requests);
      } catch (error) {
        console.error('試合リクエストの読み込みに失敗しました:', error);
      }

      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleMatchAdded = async (match: Match) => {
    if (!user || !user.uid) {
      console.log('User not authenticated, cannot add match');
      return;
    }
    
    await firestoreDb.addMatch(match);
    setMatches(await firestoreDb.getMatches(user.uid));
    setShowMatchForm(false);
  };

  const handleMatchDeleted = async (id: string) => {
    if (!user || !user.uid) {
      console.log('User not authenticated, cannot delete match');
      return;
    }
    await firestoreDb.deleteMatch(id, user.uid);
    if (user && user.uid) {
      setMatches(await firestoreDb.getMatches(user.uid));
    }
  };

  const handleMatchSelected = (match: Match) => {
    window.location.href = `/analysis?matchId=${match.id}`;
  };

  const handleAcceptMatchRequest = async (request: MatchRequest) => {
    if (!user?.uid) return;
    try {
      await firestoreDb.updateMatchRequestStatus(request.id, 'accepted');
      
      await firestoreDb.addMatch({
        ...request.matchData,
        ownerUserId: user.uid,
      });

      // リクエストリストを更新
      const updatedRequests = await firestoreDb.getPendingMatchRequests(user.uid);
      setMatchRequests(updatedRequests);
      
      // 試合リストを更新
      const updatedMatches = await firestoreDb.getMatches(user.uid);
      setMatches(updatedMatches);
    } catch (error) {
      console.error('試合リクエストの承認に失敗しました:', error);
    }
  };

  const handleDeclineMatchRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      await firestoreDb.updateMatchRequestStatus(requestId, 'declined');
      const updatedRequests = await firestoreDb.getPendingMatchRequests(user.uid);
      setMatchRequests(updatedRequests);
    } catch (error) {
      console.error('試合リクエストの拒否に失敗しました:', error);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/matches" />
        <MobileNav activePath="/matches" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {matchRequests.length > 0 && (
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiBell className="mr-2" />
                    試合リクエスト
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {matchRequests.length}
                    </span>
                  </button>
                </div>
              )}

              {/* 試合リクエスト通知パネル */}
              {showNotifications && matchRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg mb-6 border border-blue-200">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">保留中の試合リクエスト</h3>
                    <div className="space-y-4">
                      {matchRequests.map(request => (
                        <div key={request.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex-grow mb-3 md:mb-0">
                            <p className="font-medium text-gray-800 flex items-center mb-2">
                              <FiUser className="mr-2" />
                              {connectedUserProfiles.find(p => p.id === request.fromUserId)?.name || '不明なユーザー'} からの試合リクエスト
                            </p>
                            <p className="text-sm text-gray-600 flex items-center mb-2">
                              <FiCalendar className="mr-2" />
                              試合日: {new Date(request.matchData.date).toLocaleDateString('ja-JP')}
                            </p>
                            <p className="text-sm text-gray-600">
                              形式: {request.matchData.type === 'singles' ? 'シングルス' : 'ダブルス'}
                            </p>
                            {request.matchData.score && (
                              <div className="mt-2 p-2 bg-white rounded border">
                                <p className="text-sm text-gray-600">
                                  スコア: {request.matchData.score.player} - {request.matchData.score.opponent}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-3">
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
                  </div>
                </div>
              )}
              
              {/* 試合一覧 */}
              {loading ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  読み込み中...
                </div>
              ) : (
                <MatchList 
                  matches={matches} 
                  players={players} 
                  connectedUserProfiles={connectedUserProfiles} // 追加
                  onMatchDeleted={handleMatchDeleted}
                  onMatchSelected={handleMatchSelected}
                />
              )}
            </div>
          </main>

          {/* プラスボタン */}
          <button
            onClick={() => setShowMatchForm(true)}
            className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            title="新しい試合を登録"
          >
            <FiPlus className="w-8 h-8" />
          </button>

          {/* 試合登録フォームのモーダル/オーバーレイ */}
          {showMatchForm && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                  onClick={() => setShowMatchForm(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                  title="閉じる"
                >
                  &times;
                </button>
                <MatchForm players={players} onMatchAdded={handleMatchAdded} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default MatchesPage;