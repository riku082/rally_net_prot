'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import PlayerForm from '@/components/PlayerForm';
import PlayerList from '@/components/PlayerList';
import AuthGuard from '@/components/AuthGuard';
import { Player } from '@/types/player';
import { Shot } from '@/types/shot';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';

const PlayersPage: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.uid) {
        console.log('User not authenticated, skipping data load');
        return;
      }
      
      setLoading(true);
      const loadedPlayers = await firestoreDb.getPlayers(user.uid);
      const loadedShots = await firestoreDb.getShots(user.uid); // ショットデータも取得
      setPlayers(loadedPlayers);
      setShots(loadedShots);
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handlePlayerAdded = async (player: Player) => {
    if (!user || !user.uid) {
      console.log('User not authenticated, cannot add player');
      return;
    }
    
    await firestoreDb.addPlayer(player, user.uid);
    setPlayers(await firestoreDb.getPlayers(user.uid));
  };

  const handlePlayerDeleted = async (id: string) => {
    await firestoreDb.deletePlayer(id);
    if (user && user.uid) {
      setPlayers(await firestoreDb.getPlayers(user.uid));
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/players" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">選手管理</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 新規選手登録フォーム */}
                <div>
                  <PlayerForm onPlayerAdded={handlePlayerAdded} />
                </div>
                {/* 登録済み選手一覧 */}
                <div>
                  {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                      読み込み中...
                    </div>
                  ) : (
                    <PlayerList 
                      players={players} 
                      shots={shots} 
                      onPlayerDeleted={handlePlayerDeleted}
                    />
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default PlayersPage;