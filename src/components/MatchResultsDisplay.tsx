'use client';

import React from 'react';
import { FaTrophy, FaHandshake, FaTimes, FaCalendarAlt, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

export interface MatchResult {
  id: string;
  date: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  tournament?: string;
  location?: string;
  matchType: 'singles' | 'doubles' | 'mixed';
  notes?: string;
}

interface MatchResultsDisplayProps {
  matches: MatchResult[];
  maxDisplay?: number;
  showStats?: boolean;
}

const MatchResultsDisplay: React.FC<MatchResultsDisplayProps> = ({ 
  matches, 
  maxDisplay = 10,
  showStats = true 
}) => {
  const displayedMatches = matches.slice(0, maxDisplay);
  
  // 戦績統計を計算
  const stats = {
    total: matches.length,
    wins: matches.filter(m => m.result === 'win').length,
    losses: matches.filter(m => m.result === 'loss').length,
    draws: matches.filter(m => m.result === 'draw').length,
    winRate: matches.length > 0 ? (matches.filter(m => m.result === 'win').length / matches.length) * 100 : 0
  };

  const getResultIcon = (result: MatchResult['result']) => {
    switch (result) {
      case 'win':
        return <FaTrophy className="w-4 h-4 text-yellow-500" />;
      case 'loss':
        return <FaTimes className="w-4 h-4 text-red-500" />;
      case 'draw':
        return <FaHandshake className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResultColor = (result: MatchResult['result']) => {
    switch (result) {
      case 'win':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'loss':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'draw':
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getResultLabel = (result: MatchResult['result']) => {
    switch (result) {
      case 'win': return '勝利';
      case 'loss': return '敗北';
      case 'draw': return '引分';
    }
  };

  const getMatchTypeLabel = (type: MatchResult['matchType']) => {
    switch (type) {
      case 'singles': return 'シングルス';
      case 'doubles': return 'ダブルス';
      case 'mixed': return 'ミックスダブルス';
    }
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <GiShuttlecock className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">試合記録がありません</p>
        <p className="text-gray-400 text-sm">試合結果を記録して戦績を蓄積しましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 戦績統計 */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-700 mb-1">{stats.total}</div>
            <div className="text-sm text-blue-600">総試合数</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-700 mb-1">{stats.wins}</div>
            <div className="text-sm text-green-600">勝利</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-700 mb-1">{stats.losses}</div>
            <div className="text-sm text-red-600">敗北</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-700 mb-1">{stats.winRate.toFixed(1)}%</div>
            <div className="text-sm text-purple-600">勝率</div>
          </div>
        </div>
      )}

      {/* 戦績円グラフ風の表示 */}
      {showStats && stats.total > 0 && (
        <div className="bg-white rounded-xl p-6 border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">戦績分布</h4>
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">勝利 {stats.wins}試合</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">敗北 {stats.losses}試合</span>
            </div>
            {stats.draws > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-600">引分 {stats.draws}試合</span>
              </div>
            )}
          </div>
          
          {/* プログレスバー */}
          <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${(stats.wins / stats.total) * 100}%` }}
              ></div>
              <div 
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${(stats.losses / stats.total) * 100}%` }}
              ></div>
              {stats.draws > 0 && (
                <div 
                  className="bg-gray-500 transition-all duration-500"
                  style={{ width: `${(stats.draws / stats.total) * 100}%` }}
                ></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 試合結果一覧 */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center">
          <GiShuttlecock className="w-5 h-5 mr-2 text-blue-600" />
          最近の試合結果
        </h4>
        
        {displayedMatches.map((match) => (
          <div
            key={match.id}
            className={`
              p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md
              ${getResultColor(match.result)}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getResultIcon(match.result)}
                  <span className="font-semibold text-lg">
                    {getResultLabel(match.result)}
                  </span>
                  <span className="text-sm text-gray-600">
                    vs {match.opponent}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <FaCalendarAlt className="w-3 h-3 text-gray-500" />
                    <span>{new Date(match.date).toLocaleDateString('ja-JP')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FaUsers className="w-3 h-3 text-gray-500" />
                    <span>{getMatchTypeLabel(match.matchType)}</span>
                  </div>
                  
                  {match.location && (
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="w-3 h-3 text-gray-500" />
                      <span>{match.location}</span>
                    </div>
                  )}
                  
                  {match.tournament && (
                    <div className="flex items-center space-x-2">
                      <FaTrophy className="w-3 h-3 text-gray-500" />
                      <span>{match.tournament}</span>
                    </div>
                  )}
                </div>

                {match.notes && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded-lg">
                    <p className="text-sm text-gray-700">{match.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="text-right ml-4">
                <div className="text-lg font-bold">
                  {match.score}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {matches.length > maxDisplay && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              他に{matches.length - maxDisplay}試合の記録があります
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchResultsDisplay;