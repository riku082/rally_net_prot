'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@/types/player';
import { Shot } from '@/types/shot';
import { UserProfile } from '@/types/userProfile';
import { FiUser, FiHome, FiTrash2, FiBarChart2, FiTarget, FiXCircle, FiCheckCircle, FiActivity, FiUserPlus, FiZap, FiEye, FiLock } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { RallyAnalyzer } from '@/utils/rallyAnalyzer';
import { PrivacyChecker } from '@/utils/privacyChecker';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PlayerListProps {
  players: Player[];
  shots: Shot[];
  onPlayerDeleted: (id: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, shots, onPlayerDeleted }) => {
  const router = useRouter();
  const { user } = useAuth();
  const rallyAnalyzer = new RallyAnalyzer(shots, []);
  const [friendProfiles, setFriendProfiles] = useState<UserProfile[]>([]);
  const [friendShots, setFriendShots] = useState<{ [userId: string]: Shot[] }>({});
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);

  // フレンドの情報を読み込み
  useEffect(() => {
    const loadFriendData = async () => {
      if (!user?.uid) return;
      
      setIsLoadingFriends(true);
      try {
        // フレンドのプロフィール情報を取得
        const friendships = await firestoreDb.getAcceptedFriendships(user.uid);
        const friendUserIds = friendships.map(friendship => 
          friendship.fromUserId === user.uid ? friendship.toUserId : friendship.fromUserId
        );
        
        const profiles = await firestoreDb.getUserProfilesByIds(friendUserIds);
        setFriendProfiles(profiles);
        
        // 公開設定を確認して、フレンドの配球データを取得
        const friendShotsData: { [userId: string]: Shot[] } = {};
        
        for (const profile of profiles) {
          const canViewAnalysis = PrivacyChecker.canViewAnalysis(profile, user.uid, true);
          if (canViewAnalysis) {
            try {
              const shots = await firestoreDb.getShots(profile.id);
              friendShotsData[profile.id] = shots;
            } catch (error) {
              console.error(`フレンド ${profile.name} の配球データ取得エラー:`, error);
              friendShotsData[profile.id] = [];
            }
          }
        }
        
        setFriendShots(friendShotsData);
      } catch (error) {
        console.error('フレンドデータの読み込みエラー:', error);
      } finally {
        setIsLoadingFriends(false);
      }
    };
    
    loadFriendData();
  }, [user]);
  
  // 選手ごとの統計を計算
  const calculatePlayerStats = (player: Player, shots: Shot[]) => {
    const playerShots = shots.filter(shot => shot.hitPlayer === player.id);
    const totalShots = playerShots.length;
    const crossShots = playerShots.filter(shot => shot.isCross).length;
    const missShots = playerShots.filter(shot => shot.result === 'miss').length;
    const pointShots = playerShots.filter(shot => shot.result === 'point').length;
    const totalRearShots = playerShots.filter(shot => ['LR', 'CR', 'RR'].includes(shot.hitArea)).length;
    const totalMidShots = playerShots.filter(shot => ['LM', 'CM', 'RM'].includes(shot.hitArea)).length;
    const totalFrontShots = playerShots.filter(shot => ['LF', 'CF', 'RF'].includes(shot.hitArea)).length;

    // ラリー分析の追加
    const rallyAnalysis = rallyAnalyzer.analyzeRallies(undefined, player.id);

    return {
      totalShots,
      crossRate: totalShots > 0 ? (crossShots / totalShots) * 100 : 0,
      missRate: totalShots > 0 ? (missShots / totalShots) * 100 : 0,
      pointRate: totalShots > 0 ? (pointShots / totalShots) * 100 : 0,
      rearRate: totalShots > 0 ? (totalRearShots / totalShots) * 100 : 0,
      midRate: totalShots > 0 ? (totalMidShots / totalShots) * 100 : 0,
      frontRate: totalShots > 0 ? (totalFrontShots / totalShots) * 100 : 0,
      averageRallyCount: rallyAnalysis.averageRallyCount,
      totalRallies: rallyAnalysis.totalRallies,
      shortRallyWinRate: rallyAnalysis.rallyRangeAnalysis.short.winRate,
      longRallyWinRate: rallyAnalysis.rallyRangeAnalysis.long.winRate,
    };
  };

  const getChartData = (stats: ReturnType<typeof calculatePlayerStats>) => ({
    labels: ['後衛', '中衛', '前衛'],
    datasets: [
      {
        data: [
          stats.rearRate,
          stats.midRate,
          stats.frontRate
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11,
            weight: 500
          },
          color: '#6B7280',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    cutout: '65%',
    responsive: true,
    maintainAspectRatio: false
  };

  // フレンドの統計を計算
  const calculateFriendStats = (profile: UserProfile) => {
    const shots = friendShots[profile.id] || [];
    if (shots.length === 0) return null;
    
    const friendRallyAnalyzer = new RallyAnalyzer(shots, []);
    const rallyAnalysis = friendRallyAnalyzer.analyzeRallies(undefined, profile.id);
    
    const totalShots = shots.length;
    const crossShots = shots.filter(shot => shot.isCross).length;
    const missShots = shots.filter(shot => shot.result === 'miss').length;
    const pointShots = shots.filter(shot => shot.result === 'point').length;
    const totalRearShots = shots.filter(shot => ['LR', 'CR', 'RR'].includes(shot.hitArea)).length;
    const totalMidShots = shots.filter(shot => ['LM', 'CM', 'RM'].includes(shot.hitArea)).length;
    const totalFrontShots = shots.filter(shot => ['LF', 'CF', 'RF'].includes(shot.hitArea)).length;
    
    return {
      totalShots,
      crossRate: totalShots > 0 ? (crossShots / totalShots) * 100 : 0,
      missRate: totalShots > 0 ? (missShots / totalShots) * 100 : 0,
      pointRate: totalShots > 0 ? (pointShots / totalShots) * 100 : 0,
      rearRate: totalShots > 0 ? (totalRearShots / totalShots) * 100 : 0,
      midRate: totalShots > 0 ? (totalMidShots / totalShots) * 100 : 0,
      frontRate: totalShots > 0 ? (totalFrontShots / totalShots) * 100 : 0,
      averageRallyCount: rallyAnalysis.averageRallyCount,
      totalRallies: rallyAnalysis.totalRallies,
      shortRallyWinRate: rallyAnalysis.rallyRangeAnalysis.short.winRate,
      longRallyWinRate: rallyAnalysis.rallyRangeAnalysis.long.winRate,
    };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          登録済み選手一覧
        </h3>
        <div className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-semibold shadow-lg self-start sm:self-auto">
          {players.length}名
        </div>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {/* 自分の選手 */}
        {players.length === 0 ? (
          <div className="col-span-full text-center py-12 sm:py-16">
            <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <FiUser className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">選手がまだ登録されていません</h4>
            <p className="text-gray-500 max-w-sm mx-auto text-sm sm:text-base">上記のフォームから新しい選手を登録して、試合データの記録を始めましょう！</p>
          </div>
        ) : (
          players.map((player) => {
            const stats = calculatePlayerStats(player, shots);
            return (
              <div key={player.id} className="group bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-pointer" onClick={() => router.push(`/analysis?playerId=${player.id}`)}>
                {/* 背景の装飾グラデーション */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10 space-y-4 lg:space-y-0">
                  {/* 左側: プレイヤー情報 */}
                  <div className="flex items-center space-x-4 sm:space-x-6 flex-shrink-0">
                    {/* プレイヤーアバター */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <FiUser className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                          {player.name}
                        </h4>
                        {player.friendId && (
                          <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto">
                            <FiUserPlus className="w-3 h-3 mr-1" />
                            フレンド
                          </div>
                        )}
                      </div>
                      <p className="text-gray-500 flex items-center text-sm sm:text-base">
                        <FiHome className="mr-2 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{player.affiliation}</span>
                      </p>
                      {player.email && (
                        <p className="text-gray-400 text-xs sm:text-sm flex items-center mt-1">
                          <span className="truncate">{player.email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                
                  {/* 中央: 統計情報 */}
                  {stats.totalShots > 0 ? (
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 flex-grow relative z-10">
                      {/* 円グラフ */}
                      <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-inner self-center lg:self-auto">
                        <h5 className="text-xs font-semibold text-gray-700 mb-2 sm:mb-3 text-center">コートエリア分布</h5>
                        <div className="h-20 w-20 sm:h-24 sm:w-24 mx-auto">
                          <Doughnut data={getChartData(stats)} options={chartOptions} />
                        </div>
                      </div>

                      {/* 統計情報 */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 flex-grow">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <FiTarget className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mb-1 sm:mb-0" />
                            <span className="text-sm sm:text-lg font-bold text-blue-700">{stats.crossRate.toFixed(1)}%</span>
                          </div>
                          <p className="text-blue-600 font-medium mt-1 text-xs">クロス率</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-red-200 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <FiXCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mb-1 sm:mb-0" />
                            <span className="text-sm sm:text-lg font-bold text-red-700">{stats.missRate.toFixed(1)}%</span>
                          </div>
                          <p className="text-red-600 font-medium mt-1 text-xs">ミス率</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mb-1 sm:mb-0" />
                            <span className="text-sm sm:text-lg font-bold text-green-700">{stats.pointRate.toFixed(1)}%</span>
                          </div>
                          <p className="text-green-600 font-medium mt-1 text-xs">得点率</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <FiZap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 mb-1 sm:mb-0" />
                            <span className="text-sm sm:text-lg font-bold text-purple-700">{stats.averageRallyCount.toFixed(1)}</span>
                          </div>
                          <p className="text-purple-600 font-medium mt-1 text-xs">平均ラリー数</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <FiBarChart2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mb-1 sm:mb-0" />
                            <span className="text-sm sm:text-lg font-bold text-gray-700">{stats.totalShots}</span>
                          </div>
                          <p className="text-gray-600 font-medium mt-1 text-xs">総ショット数</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-6 sm:py-8 relative z-10 flex-grow">
                      <div className="text-center">
                        <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3">
                          <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                        <h5 className="text-base sm:text-lg font-semibold text-gray-600 mb-1">データがありません</h5>
                        <p className="text-gray-500 text-xs sm:text-sm">試合を登録して配球データを記録しましょう。</p>
                      </div>
                    </div>
                  )}

                  {/* 右側: アクションボタン */}
                  <div className="flex items-center justify-end space-x-1 sm:space-x-2 relative z-10 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/analysis?playerId=${player.id}`);
                      }}
                      className="text-gray-400 hover:text-blue-500 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 group/analysis"
                      title="分析詳細を表示"
                    >
                      <FiActivity className="w-5 h-5 sm:w-6 sm:h-6 group-hover/analysis:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`${player.name}を削除してもよろしいですか？`)) {
                          onPlayerDeleted(player.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-red-50 transition-all duration-200 group/delete"
                      title="選手を削除"
                    >
                      <FiTrash2 className="w-5 h-5 sm:w-6 sm:h-6 group-hover/delete:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* フレンドの選手情報 */}
        {friendProfiles.length > 0 && (
          <div className="border-t pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h4 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                フレンドの分析結果
              </h4>
              <div className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-semibold shadow-lg self-start sm:self-auto">
                {friendProfiles.length}名
              </div>
            </div>
            
            {isLoadingFriends ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-600">フレンドの情報を読み込み中...</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {friendProfiles.map((profile) => {
                  const canViewStats = PrivacyChecker.canViewStats(profile, user?.uid || null, true);
                  const canViewAnalysis = PrivacyChecker.canViewAnalysis(profile, user?.uid || null, true);
                  const friendStats = calculateFriendStats(profile);
                  
                  return (
                    <div key={profile.id} className="group bg-white border border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-pointer" onClick={() => router.push(`/analysis?playerId=${profile.id}`)}>
                      {/* 背景の装飾グラデーション */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                      
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10 space-y-4 lg:space-y-0">
                        {/* 左側: プレイヤー情報 */}
                        <div className="flex items-center space-x-4 sm:space-x-6 flex-shrink-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <FiUser className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                                {profile.name}
                              </h4>
                              <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto">
                                <FiUserPlus className="w-3 h-3 mr-1" />
                                フレンド
                              </div>
                            </div>
                            <p className="text-gray-500 flex items-center text-sm sm:text-base">
                              <FiHome className="mr-2 w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{profile.team || '所属不明'}</span>
                            </p>
                            <p className="text-gray-400 text-xs sm:text-sm flex items-center mt-1">
                              <span className="truncate">{profile.email}</span>
                            </p>
                          </div>
                        </div>
                        
                        {/* 中央: 統計情報またはプライバシーメッセージ */}
                        {canViewStats && canViewAnalysis && friendStats ? (
                          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 flex-grow relative z-10">
                            {/* 円グラフ */}
                            <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-inner self-center lg:self-auto">
                              <h5 className="text-xs font-semibold text-gray-700 mb-2 sm:mb-3 text-center">コートエリア分布</h5>
                              <div className="h-20 w-20 sm:h-24 sm:w-24 mx-auto">
                                <Doughnut data={getChartData(friendStats)} options={chartOptions} />
                              </div>
                            </div>

                            {/* 統計情報 */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 flex-grow">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <FiTarget className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mb-1 sm:mb-0" />
                                  <span className="text-sm sm:text-lg font-bold text-blue-700">{friendStats.crossRate.toFixed(1)}%</span>
                                </div>
                                <p className="text-blue-600 font-medium mt-1 text-xs">クロス率</p>
                              </div>
                              <div className="bg-gradient-to-br from-red-50 to-red-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-red-200 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <FiXCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 mb-1 sm:mb-0" />
                                  <span className="text-sm sm:text-lg font-bold text-red-700">{friendStats.missRate.toFixed(1)}%</span>
                                </div>
                                <p className="text-red-600 font-medium mt-1 text-xs">ミス率</p>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mb-1 sm:mb-0" />
                                  <span className="text-sm sm:text-lg font-bold text-green-700">{friendStats.pointRate.toFixed(1)}%</span>
                                </div>
                                <p className="text-green-600 font-medium mt-1 text-xs">得点率</p>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <FiZap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 mb-1 sm:mb-0" />
                                  <span className="text-sm sm:text-lg font-bold text-purple-700">{friendStats.averageRallyCount.toFixed(1)}</span>
                                </div>
                                <p className="text-purple-600 font-medium mt-1 text-xs">平均ラリー数</p>
                              </div>
                              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <FiBarChart2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mb-1 sm:mb-0" />
                                  <span className="text-sm sm:text-lg font-bold text-gray-700">{friendStats.totalShots}</span>
                                </div>
                                <p className="text-gray-600 font-medium mt-1 text-xs">総ショット数</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-6 sm:py-8 relative z-10 flex-grow">
                            <div className="text-center">
                              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3">
                                <FiLock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                              </div>
                              <h5 className="text-base sm:text-lg font-semibold text-gray-600 mb-1">非公開設定</h5>
                              <p className="text-gray-500 text-xs sm:text-sm">
                                {canViewStats ? '分析データがありません' : '統計情報が非公開です'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 右側: アクションボタン */}
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2 relative z-10 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/analysis?playerId=${profile.id}`);
                            }}
                            className="text-gray-400 hover:text-green-500 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-green-50 transition-all duration-200 group/analysis"
                            title="分析詳細を表示"
                          >
                            <FiEye className="w-5 h-5 sm:w-6 sm:h-6 group-hover/analysis:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerList;