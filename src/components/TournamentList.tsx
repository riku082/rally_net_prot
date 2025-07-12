'use client';

import React, { useState, useEffect } from 'react';
import { Tournament } from '@/types/tournament';
import { TournamentScraper } from '@/utils/tournamentScraper';
import TournamentCard from './TournamentCard';
import { FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaFilter, FaSpinner } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

interface TournamentListProps {
  userRegion?: string;
  limit?: number;
  showFilters?: boolean;
  title?: string;
}

const TournamentList: React.FC<TournamentListProps> = ({ 
  userRegion, 
  limit, 
  showFilters = false,
  title = "バドミントン大会情報"
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Tournament['level'] | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<Tournament['category'] | ''>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  useEffect(() => {
    loadTournaments();
  }, [userRegion]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = userRegion 
        ? await TournamentScraper.getTournamentsByRegion(userRegion)
        : await TournamentScraper.getUpcomingTournaments(limit || 10);
      
      setTournaments(data);
    } catch (err) {
      console.error('大会情報の取得に失敗しました:', err);
      setError('大会情報の取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (selectedLevel && tournament.level !== selectedLevel) return false;
    if (selectedCategory && tournament.category !== selectedCategory) return false;
    if (selectedRegion && !tournament.region.includes(selectedRegion)) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedLevel('');
    setSelectedCategory('');
    setSelectedRegion('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="w-6 h-6 text-blue-600 animate-spin mr-3" />
          <span className="text-gray-600">大会情報を読み込んでいます...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaTrophy className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2">読み込みエラー</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadTournaments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <FaTrophy className="w-5 h-5 mr-2 text-yellow-600" />
            {title}
          </h3>
          {userRegion && (
            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              📍 {userRegion}
            </span>
          )}
        </div>

        {/* フィルター */}
        {showFilters && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <FaFilter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">フィルター:</span>
              </div>
              
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as Tournament['level'] | '')}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全レベル</option>
                <option value="beginner">初級者</option>
                <option value="intermediate">中級者</option>
                <option value="advanced">上級者</option>
                <option value="all">全レベル対象</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Tournament['category'] | '')}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全カテゴリ</option>
                <option value="singles">シングルス</option>
                <option value="doubles">ダブルス</option>
                <option value="mixed">ミックスダブルス</option>
                <option value="team">チーム戦</option>
                <option value="other">その他</option>
              </select>

              <input
                type="text"
                placeholder="地域で絞り込み"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />

              {(selectedLevel || selectedCategory || selectedRegion) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  クリア
                </button>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredTournaments.length}件の大会が見つかりました
            </div>
          </div>
        )}
      </div>

      {/* 大会リスト */}
      <div className="p-4">
        {filteredTournaments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <GiShuttlecock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">大会情報が見つかりません</p>
            <p className="text-gray-500 text-sm">
              {userRegion ? `${userRegion}での大会情報がありません` : '現在開催予定の大会がありません'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTournaments.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>公式大会</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>一般大会</span>
            </div>
          </div>
          <button
            onClick={loadTournaments}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            🔄 更新
          </button>
        </div>
      </div>
    </div>
  );
};

export default TournamentList;