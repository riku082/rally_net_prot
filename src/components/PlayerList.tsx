'use client';

import React from 'react';
import { Player } from '@/types/player';
import { Shot } from '@/types/shot';
import { FiUser, FiHome, FiTrash2, FiBarChart2, FiTarget, FiXCircle, FiCheckCircle } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PlayerListProps {
  players: Player[];
  shots: Shot[];
  onPlayerDeleted: (id: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, shots, onPlayerDeleted }) => {
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
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
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
            size: 12
          }
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-5">登録済み選手一覧 ({players.length}名)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            <p>まだ選手が登録されていません。</p>
            <p className="mt-2">上記のフォームから新しい選手を登録しましょう！</p>
          </div>
        ) : (
          players.map((player) => {
            const stats = calculatePlayerStats(player, shots);
            return (
              <div key={player.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800 flex items-center">
                      <FiUser className="mr-2 text-blue-600" />{player.name}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <FiHome className="mr-2 text-gray-500" />{player.affiliation}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`${player.name}を削除してもよろしいですか？`)) {
                        onPlayerDeleted(player.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                    title="選手を削除"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
                
                {stats.totalShots > 0 ? (
                  <div className="flex-grow">
                    {/* 円グラフ */}
                    <div className="h-40 mb-4">
                      <Doughnut data={getChartData(stats)} options={chartOptions} />
                    </div>

                    {/* 統計情報 */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-100 p-3 rounded-lg flex items-center">
                        <FiTarget className="mr-2 text-blue-700" />
                        <div>
                          <p className="text-gray-700">クロス率</p>
                          <p className="font-bold text-blue-900">{stats.crossRate.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="bg-red-100 p-3 rounded-lg flex items-center">
                        <FiXCircle className="mr-2 text-red-700" />
                        <div>
                          <p className="text-gray-700">ミス率</p>
                          <p className="font-bold text-red-900">{stats.missRate.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg flex items-center">
                        <FiCheckCircle className="mr-2 text-green-700" />
                        <div>
                          <p className="text-gray-700">得点率</p>
                          <p className="font-bold text-green-900">{stats.pointRate.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg flex items-center">
                        <FiBarChart2 className="mr-2 text-gray-700" />
                        <div>
                          <p className="text-gray-700">総ショット数</p>
                          <p className="font-bold text-gray-900">{stats.totalShots}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>まだ配球データがありません。</p>
                    <p>試合を登録して配球データを記録しましょう。</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlayerList;