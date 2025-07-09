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
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FiPlus } from 'react-icons/fi';

const MatchesPage: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [connectedUserProfiles, setConnectedUserProfiles] = useState<UserProfile[]>([]); // 追加
  const [loading, setLoading] = useState(true);
  const [showMatchForm, setShowMatchForm] = useState(false);

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

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/matches" />
        <MobileNav activePath="/matches" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">試合記録</h2>
              
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