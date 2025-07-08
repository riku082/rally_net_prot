'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { MatchRequest } from '@/types/matchRequest';
import { UserProfile } from '@/types/userProfile';
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiUsers, FiUser } from 'react-icons/fi';

interface MatchRequestWithProfiles extends MatchRequest {
  fromUserProfile?: UserProfile;
}

const MatchRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<MatchRequestWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadMatchRequests = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const requests = await firestoreDb.getPendingMatchRequests(user.uid);
      const fromUserIds = requests.map(req => req.fromUserId);
      const fromUserProfiles = await firestoreDb.getUserProfilesByIds(fromUserIds);

      const requestsWithProfiles = requests.map(req => ({
        ...req,
        fromUserProfile: fromUserProfiles.find(p => p.id === req.fromUserId)
      }));
      setPendingRequests(requestsWithProfiles);
    } catch (error) {
      console.error('試合リクエストの読み込みに失敗しました:', error);
      setMessage({ type: 'error', text: '試合リクエストの読み込みに失敗しました。' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatchRequests();
  }, [user]);

  const handleAcceptRequest = async (request: MatchRequestWithProfiles) => {
    if (!user?.uid) return;
    setMessage(null);
    try {
      // 試合リクエストのステータスを更新
      await firestoreDb.updateMatchRequestStatus(request.id, 'accepted');
      
      // 自分の試合記録に試合を追加
      await firestoreDb.addMatch({
        ...request.matchData,
        ownerUserId: user.uid, // 承認したユーザーのIDをownerUserIdとして保存
      });

      setMessage({ type: 'success', text: '試合リクエストを承認し、試合記録に追加しました！' });
      loadMatchRequests(); // リクエストリストを更新
    } catch (error) {
      console.error('試合リクエストの承認に失敗しました:', error);
      setMessage({ type: 'error', text: `承認に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}` });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setMessage(null);
    try {
      await firestoreDb.updateMatchRequestStatus(requestId, 'declined');
      setMessage({ type: 'success', text: '試合リクエストを拒否しました。' });
      loadMatchRequests(); // リクエストリストを更新
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
      <Sidebar activePath="/match-requests" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">試合リクエスト</h2>

            {message && (
              <div className={`p-4 mb-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">保留中の試合リクエスト ({pendingRequests.length})</h3>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500">保留中の試合リクエストはありません。</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(request => (
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
                      </div>

                      <div className="flex space-x-3 mt-4 md:mt-0 md:ml-auto">
                        <button
                          onClick={() => handleAcceptRequest(request)}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default MatchRequestsPage;
