'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Player } from '@/types/player';
import { Shot } from '@/types/shot';
import { FiUser, FiHome, FiTrash2, FiBarChart2, FiTarget, FiXCircle, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PlayerListProps {
  players: Player[];
  shots: Shot[];
  onPlayerDeleted: (id: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, shots, onPlayerDeleted }) => {
  const router = useRouter();
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

    return {
      totalShots,
      crossRate: totalShots > 0 ? (crossShots / totalShots) * 100 : 0,
      missRate: totalShots > 0 ? (missShots / totalShots) * 100 : 0,
      pointRate: totalShots > 0 ? (pointShots / totalShots) * 100 : 0,
      rearRate: totalShots > 0 ? (totalRearShots / totalShots) * 100 : 0,
      midRate: totalShots > 0 ? (totalMidShots / totalShots) * 100 : 0,
      frontRate: totalShots > 0 ? (totalFrontShots / totalShots) * 100 : 0,
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
            weight: '500'
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

  return (
    <div className="p-8 bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          登録済み選手一覧
        </h3>
        <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
          {players.length}名
        </div>
      </div>
      <div className="space-y-6">
        {players.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mb-6">
              <FiUser className="w-12 h-12 text-blue-500" />
            </div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">選手がまだ登録されていません</h4>
            <p className="text-gray-500 max-w-sm mx-auto">上記のフォームから新しい選手を登録して、試合データの記録を始めましょう！</p>
          </div>
        ) : (
          players.map((player) => {
            const stats = calculatePlayerStats(player, shots);
            return (
              <div key={player.id} className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-pointer" onClick={() => router.push(`/analysis?playerId=${player.id}`)}>
                {/* 背景の装飾グラデーション */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  {/* 左側: プレイヤー情報 */}
                  <div className="flex items-center space-x-6">
                    {/* プレイヤーアバター */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <FiUser className="w-10 h-10 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-2xl font-bold text-gray-800 mb-1">
                        {player.name}
                      </h4>
                      <p className="text-gray-500 flex items-center">
                        <FiHome className="mr-2 w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{player.affiliation}</span>
                      </p>
                    </div>
                  </div>
                
                  {/* 中央: 統計情報 */}
                  {stats.totalShots > 0 ? (
                    <div className="flex items-center space-x-8 flex-grow relative z-10">
                      {/* 円グラフ */}
                      <div className="bg-gray-50 rounded-2xl p-4 shadow-inner">
                        <h5 className="text-xs font-semibold text-gray-700 mb-3 text-center">コートエリア分布</h5>
                        <div className="h-24 w-24">
                          <Doughnut data={getChartData(stats)} options={chartOptions} />
                        </div>
                      </div>

                      {/* 統計情報 */}
                      <div className="flex items-center space-x-4 flex-grow">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-shadow flex-1">
                          <div className="flex items-center justify-between">
                            <FiTarget className="w-5 h-5 text-blue-600" />
                            <span className="text-xl font-bold text-blue-700">{stats.crossRate.toFixed(1)}%</span>
                          </div>
                          <p className="text-blue-600 font-medium mt-1 text-sm">クロス率</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 hover:shadow-md transition-shadow flex-1">
                          <div className="flex items-center justify-between">
                            <FiXCircle className="w-5 h-5 text-red-600" />
                            <span className="text-xl font-bold text-red-700">{stats.missRate.toFixed(1)}%</span>
                          </div>
                          <p className="text-red-600 font-medium mt-1 text-sm">ミス率</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 hover:shadow-md transition-shadow flex-1">
                          <div className="flex items-center justify-between">
                            <FiCheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-xl font-bold text-green-700">{stats.pointRate.toFixed(1)}%</span>
                          </div>
                          <p className="text-green-600 font-medium mt-1 text-sm">得点率</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow flex-1">
                          <div className="flex items-center justify-between">
                            <FiBarChart2 className="w-5 h-5 text-gray-600" />
                            <span className="text-xl font-bold text-gray-700">{stats.totalShots}</span>
                          </div>
                          <p className="text-gray-600 font-medium mt-1 text-sm">総ショット数</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 relative z-10 flex-grow">
                      <div className="text-center">
                        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-3">
                          <FiBarChart2 className="w-6 h-6 text-gray-400" />
                        </div>
                        <h5 className="text-lg font-semibold text-gray-600 mb-1">データがありません</h5>
                        <p className="text-gray-500 text-sm">試合を登録して配球データを記録しましょう。</p>
                      </div>
                    </div>
                  )}

                  {/* 右側: アクションボタン */}
                  <div className="flex items-center space-x-2 relative z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/analysis?playerId=${player.id}`);
                      }}
                      className="text-gray-400 hover:text-blue-500 p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group/analysis"
                      title="分析詳細を表示"
                    >
                      <FiActivity className="w-6 h-6 group-hover/analysis:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`${player.name}を削除してもよろしいですか？`)) {
                          onPlayerDeleted(player.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 p-3 rounded-xl hover:bg-red-50 transition-all duration-200 group/delete"
                      title="選手を削除"
                    >
                      <FiTrash2 className="w-6 h-6 group-hover/delete:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlayerList;