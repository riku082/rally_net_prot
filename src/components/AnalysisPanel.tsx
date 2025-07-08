"use client";

import React from 'react';
import { Player } from '@/types/player';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Shot, ShotType, ShotResult } from '@/types/shot';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AnalysisPanelProps {
  players: Player[];
  shots: Shot[];
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ players, shots }) => {
  const calculatePlayerStats = (player: Player) => {
    const playerShots = shots.filter(shot => shot.hitPlayer === player.id);
    const totalShots = playerShots.length;
    const rearShots = playerShots.filter(shot => ['LR', 'CR', 'RR'].includes(shot.hitArea));
    const totalRearShots = rearShots.length;
    const winners = rearShots.filter(shot => shot.result === 'point').length;
    const missShots = rearShots.filter(shot => shot.result === 'miss').length;
    const crossShots = playerShots.filter(shot => shot.isCross).length;
    const serveShots = playerShots.filter(shot => shot.shotType === 'short_serve' || shot.shotType === 'long_serve');
    const successfulServes = serveShots.filter(shot => shot.result === 'continue').length;

    // ミスしたエリアの集計
    const missAreas = playerShots
      .filter(shot => shot.result === 'miss')
      .reduce((acc, shot) => {
        acc[shot.hitArea] = (acc[shot.hitArea] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalShots,
      rearRate: totalShots > 0 ? (totalRearShots / totalShots) * 100 : 0,
      pointRate: totalRearShots > 0 ? ((winners / totalRearShots) * 100).toFixed(1) : '0.0',
      missRate: totalRearShots > 0 ? ((missShots / totalRearShots) * 100).toFixed(1) : '0.0',
      crossRate: totalShots > 0 ? ((crossShots / totalShots) * 100).toFixed(1) : '0.0',
      serveSuccessRate: serveShots.length > 0 ? ((successfulServes / serveShots.length) * 100).toFixed(1) : '0.0',
      missAreas
    };
  };

  const getShotTypeChartData = (player: Player) => {
    const playerShots = shots.filter(shot => shot.hitPlayer === player.id);
    const shotTypeCounts = playerShots.reduce((acc, shot) => {
      acc[shot.shotType] = (acc[shot.shotType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const shotTypeLabels = {
      'short_serve': 'ショートサーブ',
      'long_serve': 'ロングサーブ',
      'clear': 'クリアー',
      'smash': 'スマッシュ',
      'drop': 'ドロップ',
      'long_return': 'ロングリターン',
      'short_return': 'ショートリターン',
      'drive': 'ドライブ',
      'lob': 'ロブ',
      'push': 'プッシュ',
      'hairpin': 'ヘアピン'
    };

    return {
      labels: Object.entries(shotTypeCounts).map(([type]) => shotTypeLabels[type as keyof typeof shotTypeLabels]),
      datasets: [
        {
          data: Object.values(shotTypeCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(40, 102, 255, 0.8)',
            'rgba(255, 102, 102, 0.8)',
            'rgba(102, 255, 102, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(40, 102, 255, 1)',
            'rgba(255, 102, 102, 1)',
            'rgba(102, 255, 102, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

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

  const COURT_AREAS = [
    { code: 'LF', name: '左前' },
    { code: 'CF', name: '中央前' },
    { code: 'RF', name: '右前' },
    { code: 'LM', name: '左中' },
    { code: 'CM', name: '中央中' },
    { code: 'RM', name: '右中' },
    { code: 'LR', name: '左後' },
    { code: 'CR', name: '中央後' },
    { code: 'RR', name: '右後' }
  ];

  const getMissHeatmapColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-green-500';
    const intensity = Math.min(1, count / maxCount);
    if (intensity < 0.25) return 'bg-yellow-500';
    if (intensity < 0.5) return 'bg-orange-500';
    if (intensity < 0.75) return 'bg-red-500';
    return 'bg-red-700';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {players.map(player => {
        const stats = calculatePlayerStats(player);
        const maxMissCount = Math.max(...Object.values(stats.missAreas), 0);

        return (
          <div key={player.id} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-4">{player.name}</h3>
            
            {/* ミスのヒートマップ */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">ミスのヒートマップ</h4>
              <div className="aspect-[2/1] bg-green-500 relative">
                <div className="absolute inset-2 border-2 border-white grid grid-cols-3 grid-rows-3">
                  {COURT_AREAS.map((area) => (
                    <div
                      key={area.code}
                      className={`border border-white ${getMissHeatmapColor(stats.missAreas[area.code] || 0, maxMissCount)} relative`}
                    >
                      <div className="absolute top-1 left-1 text-white">
                        <span className="text-[10px] block">{area.name}</span>
                        <span className="text-xs font-bold block">{area.code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ショット種類の円グラフ */}
            <div>
              <h4 className="text-sm font-medium mb-2">ショット種類分布</h4>
              <div className="h-40">
                <Doughnut data={getShotTypeChartData(player)} options={chartOptions} />
              </div>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">クロス率</p>
                <p className="text-xl font-bold">{stats.crossRate}%</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <p className="text-sm text-gray-600">ミス率</p>
                <p className="text-xl font-bold">{stats.missRate}%</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">サーブ成功率</p>
                <p className="text-xl font-bold">{stats.serveSuccessRate}%</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-gray-600">総ショット数</p>
                <p className="text-xl font-bold">{stats.totalShots}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalysisPanel; 