'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import AnalysisPanel from '@/components/AnalysisPanel';
import BadmintonCourt from '@/components/BadmintonCourt';
import AuthGuard from '@/components/AuthGuard';
import SimpleVideoPlayer from '@/components/SimpleVideoPlayer';
import { Player } from '@/types/player';
import { Shot } from '@/types/shot';
import { Match } from '@/types/match';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';

const AnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId');
  const playerId = searchParams.get('playerId');
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [allShots, setAllShots] = useState<Shot[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showCourt, setShowCourt] = useState(false);
  const [tempShots, setTempShots] = useState<Shot[]>([]);
  const [gameState, setGameState] = useState<unknown>(null);
  const [showVideo, setShowVideo] = useState(false);

  // matchIdまたはplayerIdに基づいてショットをフィルタリング
  const shots = matchId 
    ? [...allShots.filter(shot => shot.matchId === matchId), ...tempShots]
    : playerId 
    ? allShots.filter(shot => shot.hitPlayer === playerId)
    : allShots;

  // ローカルストレージのキー
  const getLocalStorageKey = (matchId: string) => `match_temp_${matchId}`;

  // ローカルストレージから一時データを読み込み
  const loadTempData = (matchId: string) => {
    try {
      const tempData = localStorage.getItem(getLocalStorageKey(matchId));
      return tempData ? JSON.parse(tempData) : { 
        shots: [], 
        score: { player: 0, opponent: 0 },
        gameState: null
      };
    } catch (error) {
      console.error('Failed to load temp data:', error);
      return { 
        shots: [], 
        score: { player: 0, opponent: 0 },
        gameState: null
      };
    }
  };

  // ローカルストレージに一時データを保存
  const saveTempData = (matchId: string, shots: Shot[], score: { player: number; opponent: number }, gameState?: unknown) => {
    try {
      const tempData = { shots, score, gameState, lastUpdated: Date.now() };
      localStorage.setItem(getLocalStorageKey(matchId), JSON.stringify(tempData));
    } catch (error) {
      console.error('Failed to save temp data:', error);
    }
  };

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
          
          // ローカルストレージから一時データを読み込み
          const tempData = loadTempData(matchId);
          setTempShots(tempData.shots);
          setGameState(tempData.gameState);
          
          // 一時データがある場合はスコアもマッチに反映
          if (tempData.shots.length > 0) {
            // ローカルストレージからスコアを復元
            let scoreToUse = tempData.score;
            
            // gameStateからも最新スコアを取得
            if (tempData.gameState && tempData.gameState.scoreHistory) {
              const lastScore = tempData.gameState.scoreHistory[tempData.gameState.scoreHistory.length - 1];
              if (lastScore) {
                scoreToUse = lastScore;
              }
            }
            
            setSelectedMatch({ ...match, score: scoreToUse });
          } else if (match.score) {
            // 一時データがない場合でも、既存のマッチスコアを保持
            setSelectedMatch({ ...match, score: match.score });
          }
        }
      }
    };
    loadData();
  }, [matchId, user]);

  const handleShotAdded = async (shot: Omit<Shot, 'id' | 'timestamp'>, shotMatchId: string) => {
    if (!user || !user.uid) {
      console.log('User not authenticated, cannot add shot');
      return;
    }
    
    // 一時的なIDとタイムスタンプを生成
    const newShot: Shot = {
      ...shot,
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    // 一時データに追加
    const updatedTempShots = [...tempShots, newShot];
    setTempShots(updatedTempShots);
    
    // ローカルストレージに自動保存（スコアは後で更新されるため、現在のスコアを保存）
    if (selectedMatch) {
      saveTempData(shotMatchId, updatedTempShots, selectedMatch.score || { player: 0, opponent: 0 }, gameState);
    }
  };

  const handleLastShotDeleted = async () => {
    // 最後のショットを削除
    if (shots.length > 0) {
      const lastShot = shots[shots.length - 1];
      
      // 一時データから削除
      if (lastShot.id.startsWith('temp_')) {
        const updatedTempShots = tempShots.slice(0, -1);
        setTempShots(updatedTempShots);
        
        // ローカルストレージを更新
        if (selectedMatch && matchId) {
          saveTempData(matchId, updatedTempShots, selectedMatch.score || { player: 0, opponent: 0 }, gameState);
        }
      } else {
        // 既存のFirestoreデータから削除
        await firestoreDb.deleteShot(lastShot.id);
        if (user && user.uid) {
          setAllShots(await firestoreDb.getShots(user.uid));
        }
      }
    }
  };

  const handleCloseCourt = () => {
    setShowCourt(false);
    setSelectedMatch(null);
    setShowVideo(false);
  };

  const handleGameStateChange = (newGameState: unknown) => {
    setGameState(newGameState);
    
    // gameStateが変更されたらローカルストレージにも保存
    if (matchId && newGameState && typeof newGameState === 'object' && newGameState !== null && 'scoreHistory' in newGameState) {
      const scoreHistory = (newGameState as { scoreHistory: unknown[] }).scoreHistory;
      if (Array.isArray(scoreHistory) && scoreHistory.length > 0) {
        const currentScore = scoreHistory[scoreHistory.length - 1];
        saveTempData(matchId, tempShots, currentScore as { player: number; opponent: number }, newGameState);
      }
    }
  };

  const handleMatchFinished = async (matchData: { match: Match; shots: Shot[]; finalScore: { player: number; opponent: number } }) => {
    if (!user || !user.uid || !matchId) {
      console.log('User not authenticated or matchId missing');
      return;
    }

    try {
      // 試合データをFirestoreに保存
      const finalMatch = { ...matchData.match, score: matchData.finalScore };
      await firestoreDb.saveMatches([finalMatch], user.uid);

      // 一時ショットデータを正式なショットデータとしてFirestoreに保存
      for (const shot of tempShots) {
        const finalShot = { ...shot, id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
        await firestoreDb.addShot(finalShot, user.uid, matchId);
      }

      // ローカルストレージをクリア
      localStorage.removeItem(getLocalStorageKey(matchId));
      
      // 状態をリセット
      setTempShots([]);
      
      // データを再読み込み
      const [loadedShots] = await Promise.all([
        firestoreDb.getShots(user.uid),
      ]);
      setAllShots(loadedShots);
      
      alert('試合が正常に保存されました！');
      handleCloseCourt();
    } catch (error) {
      console.error('Failed to save match:', error);
      alert('試合の保存に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/analysis" />
        <MobileNav activePath="/analysis" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {playerId ? `${players.find(p => p.id === playerId)?.name || '選手'}の分析` : '分析'}
              </h2>
              {playerId && (
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  戻る
                </button>
              )}
            </div>
            
            {showCourt && selectedMatch ? (
              <div className="space-y-6">
                {/* 動画とコートの表示エリア */}
                <div className={`grid gap-6 ${selectedMatch.youtubeVideoId && showVideo ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* 動画プレイヤー */}
                  {selectedMatch.youtubeVideoId && showVideo && (
                    <div className="lg:col-span-1">
                      <SimpleVideoPlayer
                        videoId={selectedMatch.youtubeVideoId}
                        title={selectedMatch.youtubeVideoTitle || '試合動画'}
                        onClose={() => setShowVideo(false)}
                      />
                    </div>
                  )}
                  
                  {/* コート入力エリア */}
                  <div className={`${selectedMatch.youtubeVideoId && showVideo ? 'lg:col-span-1' : 'col-span-1'}`}>
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">配球登録 - {selectedMatch.type === 'singles' ? 'シングルス' : 'ダブルス'}</h3>
                        <div className="flex space-x-2">
                          {selectedMatch.youtubeVideoId && (
                            <button
                              onClick={() => setShowVideo(!showVideo)}
                              className={`px-4 py-2 rounded transition-colors ${
                                showVideo 
                                  ? 'bg-red-500 text-white hover:bg-red-600' 
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              {showVideo ? '動画を隠す' : '動画を表示'}
                            </button>
                          )}
                          <button
                            onClick={handleCloseCourt}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            閉じる
                          </button>
                        </div>
                      </div>
                      <BadmintonCourt 
                        match={selectedMatch}
                        players={players}
                        onShotAdded={handleShotAdded}
                        onLastShotDeleted={handleLastShotDeleted}
                        onMatchFinished={handleMatchFinished}
                        shots={shots}
                        onGameStateChange={handleGameStateChange}
                      />
                    </div>
                  </div>
                </div>
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