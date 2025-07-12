'use client';

import React, { useMemo } from 'react';
import { Practice } from '@/types/practice';
import { FaChartLine, FaClock, FaFire, FaBullseye, FaArrowUp } from 'react-icons/fa';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface PracticeAnalyticsChartsProps {
  practices: Practice[];
}

const PracticeAnalyticsCharts: React.FC<PracticeAnalyticsChartsProps> = ({ practices }) => {
  // スキル別練習時間の分析
  const skillAnalysis = useMemo(() => {
    const skillData: { [key: string]: { totalTime: number; sessions: number; avgRating: number } } = {};
    
    practices.forEach(practice => {
      practice.skills?.forEach(skill => {
        if (!skillData[skill.category]) {
          skillData[skill.category] = { totalTime: 0, sessions: 0, avgRating: 0 };
        }
        skillData[skill.category].totalTime += practice.duration;
        skillData[skill.category].sessions += 1;
        skillData[skill.category].avgRating += skill.rating || 0;
      });
    });

    // 平均評価を計算
    Object.keys(skillData).forEach(skill => {
      skillData[skill].avgRating = skillData[skill].avgRating / skillData[skill].sessions;
    });

    return skillData;
  }, [practices]);


  // 月別練習時間分析
  const monthlyAnalysis = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    
    practices.forEach(practice => {
      const date = new Date(practice.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + practice.duration;
    });

    return monthlyData;
  }, [practices]);

  // レーダーチャートデータ（スキル評価）
  const radarData = {
    labels: [
      'サーブ', 'レシーブ', 'クリア', 'ドロップ', 'スマッシュ', 
      'ネットプレイ', 'ドライブ', 'フットワーク', '守備', '戦術'
    ],
    datasets: [
      {
        label: '現在のスキルレベル',
        data: [
          skillAnalysis['serve']?.avgRating || 0,
          skillAnalysis['receive']?.avgRating || 0,
          skillAnalysis['clear']?.avgRating || 0,
          skillAnalysis['drop']?.avgRating || 0,
          skillAnalysis['smash']?.avgRating || 0,
          skillAnalysis['net_play']?.avgRating || 0,
          skillAnalysis['drive']?.avgRating || 0,
          skillAnalysis['footwork']?.avgRating || 0,
          skillAnalysis['defense']?.avgRating || 0,
          skillAnalysis['strategy']?.avgRating || 0,
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };

  // 練習時間棒グラフデータ（スキル別）
  const skillTimeData = {
    labels: Object.keys(skillAnalysis).map(skill => {
      const skillLabels: { [key: string]: string } = {
        'serve': 'サーブ',
        'receive': 'レシーブ',
        'clear': 'クリア',
        'drop': 'ドロップ',
        'smash': 'スマッシュ',
        'net_play': 'ネットプレイ',
        'drive': 'ドライブ',
        'footwork': 'フットワーク',
        'defense': '守備',
        'strategy': '戦術',
        'physical': 'フィジカル',
        'mental': 'メンタル'
      };
      return skillLabels[skill] || skill;
    }),
    datasets: [
      {
        label: '練習時間（分）',
        data: Object.values(skillAnalysis).map(data => data.totalTime),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(129, 140, 248, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(20, 184, 166, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(129, 140, 248, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            weight: 500
          },
          color: '#6B7280',
          padding: 20
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
    }
  };

  const radarOptions = {
    ...chartOptions,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        suggestedMin: 0,
        suggestedMax: 5,
        pointLabels: {
          font: {
            size: 11,
            weight: 500
          },
          color: '#6B7280'
        },
        ticks: {
          display: false
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11
          }
        }
      }
    }
  };

  // 統計サマリー
  const totalTime = practices.reduce((sum, p) => sum + p.duration, 0);
  const avgDuration = practices.length > 0 ? totalTime / practices.length : 0;
  const totalSessions = practices.length;
  const avgRating = practices.length > 0 
    ? practices.reduce((sum, p) => sum + (p.skills?.reduce((skillSum, skill) => skillSum + (skill.rating || 0), 0) || 0), 0) / 
      practices.reduce((sum, p) => sum + (p.skills?.length || 0), 0)
    : 0;

  if (practices.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
          <FaChartLine className="w-6 h-6 mr-2 text-blue-600" />
          練習分析
        </h2>
        <div className="text-center py-12">
          <FaChartLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">練習データがありません</h3>
          <p className="text-gray-500">練習記録を追加すると、ここに分析結果が表示されます。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <FaChartLine className="w-6 h-6 mr-2 text-blue-600" />
        練習分析
      </h2>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center">
            <FaClock className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600 font-medium">総練習時間</p>
              <p className="text-2xl font-bold text-blue-800">{Math.floor(totalTime / 60)}h {totalTime % 60}m</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center">
            <FaBullseye className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600 font-medium">練習セッション数</p>
              <p className="text-2xl font-bold text-green-800">{totalSessions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center">
            <FaArrowUp className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm text-purple-600 font-medium">平均時間</p>
              <p className="text-2xl font-bold text-purple-800">{avgDuration.toFixed(0)}分</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-center">
            <FaFire className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600 font-medium">平均スキル評価</p>
              <p className="text-2xl font-bold text-orange-800">{avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* チャートグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* スキルレーダーチャート */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">スキル評価レーダー</h3>
          <div className="h-80">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* スキル別練習時間 */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">スキル別練習時間</h3>
          <div className="h-80">
            <Bar data={skillTimeData} options={barOptions} />
          </div>
        </div>


        {/* 詳細統計 */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">練習統計詳細</h3>
          <div className="space-y-4">
            {Object.entries(skillAnalysis).map(([skill, data]) => {
              const skillLabels: { [key: string]: string } = {
                'serve': 'サーブ',
                'receive': 'レシーブ',
                'clear': 'クリア',
                'drop': 'ドロップ',
                'smash': 'スマッシュ',
                'net_play': 'ネットプレイ',
                'drive': 'ドライブ',
                'footwork': 'フットワーク',
                'defense': '守備',
                'strategy': '戦術',
                'physical': 'フィジカル',
                'mental': 'メンタル'
              };
              const skillName = skillLabels[skill] || skill;
              
              return (
                <div key={skill} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="font-medium text-gray-700">{skillName}</span>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-blue-600">{data.totalTime}分</span>
                    <span className="text-green-600">{data.sessions}回</span>
                    <span className="text-purple-600">★{data.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeAnalyticsCharts;