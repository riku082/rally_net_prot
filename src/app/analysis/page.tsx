'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AnalysisPanel from '@/components/AnalysisPanel';
import BadmintonCourt from '@/components/BadmintonCourt';
import AuthGuard from '@/components/AuthGuard';
import { Player } from '@/types/player';
import { Shot } from '@/types/shot';
import { Match } from '@/types/match';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';

const AnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [allShots, setAllShots] = useState<Shot[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showCourt, setShowCourt] = useState(false);

  // matchIdに基づいてショットをフィルタリング
  const shots = matchId 
    ? allShots.filter(shot => shot.matchId === matchId)
    : allShots;

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.uid) {
        console.log('User not authenticated, skipping data load');
        return;
      }
      
      const [loadedPlayers, loadedShots] = await Promise.all([
        firestoreDb.getPlayers(user.uid),
        firestoreDb.getShots(user.uid),
      ]);
      setPlayers(loadedPlayers);
      setAllShots(loadedShots);

      // matchIdが指定されている場合、該当する試合を取得
      if (matchId) {
        const matches = await firestoreDb.getMatches(user.uid);
        const match = matches.find(m => m.id === matchId);
        if (match) {
          setSelectedMatch(match);
          setShowCourt(true);
        }
      }
    };
    loadData();
  }, [matchId, user]);

  const handleShotAdded = async (shot: Omit<Shot, 'id' | 'timestamp'>) => {
    if (!user || !user.uid) {
      console.log('User not authenticated, cannot add shot');
      return;
    }
    
    await firestoreDb.addShot(shot, user.uid);
    setAllShots(await firestoreDb.getShots(user.uid));
  };

  const handleLastShotDeleted = async () => {
    // 最後のショットを削除
    if (shots.length > 0) {
      const lastShot = shots[shots.length - 1];
      await firestoreDb.deleteShot(lastShot.id);
      if (user && user.uid) {
        setAllShots(await firestoreDb.getShots(user.uid));
      }
    }
  };

  const handleCloseCourt = () => {
    setShowCourt(false);
    setSelectedMatch(null);
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/analysis" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">分析</h2>
            
            {showCourt && selectedMatch ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">配球登録 - {selectedMatch.type === 'singles' ? 'シングルス' : 'ダブルス'}</h3>
                  <button
                    onClick={handleCloseCourt}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    閉じる
                  </button>
                </div>
                <BadmintonCourt 
                  match={selectedMatch}
                  players={players}
                  onShotAdded={handleShotAdded}
                  onLastShotDeleted={handleLastShotDeleted}
                  shots={shots}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <AnalysisPanel players={players} shots={shots} />
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AnalysisPage; 