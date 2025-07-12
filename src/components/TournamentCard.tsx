'use client';

import React from 'react';
import { Tournament } from '@/types/tournament';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaDollarSign, FaExternalLinkAlt, FaMedal, FaClock } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

interface TournamentCardProps {
  tournament: Tournament;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const getLevelColor = (level: Tournament['level']) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getLevelLabel = (level: Tournament['level']) => {
    switch (level) {
      case 'beginner': return '初級者';
      case 'intermediate': return '中級者';
      case 'advanced': return '上級者';
      default: return '全レベル';
    }
  };

  const getCategoryLabel = (category: Tournament['category']) => {
    switch (category) {
      case 'singles': return 'シングルス';
      case 'doubles': return 'ダブルス';
      case 'mixed': return 'ミックスダブルス';
      case 'team': return 'チーム戦';
      default: return 'その他';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    } catch {
      return dateString;
    }
  };

  const isDeadlineSoon = () => {
    if (!tournament.registrationDeadline) return false;
    const deadline = new Date(tournament.registrationDeadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isDeadlinePassed = () => {
    if (!tournament.registrationDeadline) return false;
    const deadline = new Date(tournament.registrationDeadline);
    const now = new Date();
    return deadline < now;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {tournament.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              {tournament.isOfficial && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <FaMedal className="w-3 h-3 mr-1" />
                  公式
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(tournament.level)}`}>
                {getLevelLabel(tournament.level)}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {getCategoryLabel(tournament.category)}
              </span>
            </div>
          </div>
          <GiShuttlecock className="w-6 h-6 text-blue-600 flex-shrink-0 ml-2" />
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="p-4 space-y-3">
        {/* 開催日時 */}
        <div className="flex items-center text-sm text-gray-600">
          <FaCalendarAlt className="w-4 h-4 mr-2 text-blue-500" />
          <span>{formatDate(tournament.date)}</span>
        </div>

        {/* 開催場所 */}
        <div className="flex items-center text-sm text-gray-600">
          <FaMapMarkerAlt className="w-4 h-4 mr-2 text-red-500" />
          <span className="truncate">{tournament.location}</span>
        </div>

        {/* 申込締切 */}
        {tournament.registrationDeadline && (
          <div className="flex items-center text-sm">
            <FaClock className="w-4 h-4 mr-2 text-orange-500" />
            <span className={`${isDeadlinePassed() ? 'text-red-600 font-medium' : isDeadlineSoon() ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
              申込締切: {formatDate(tournament.registrationDeadline)}
              {isDeadlinePassed() && ' (締切済み)'}
              {isDeadlineSoon() && ' (締切間近!)'}
            </span>
          </div>
        )}

        {/* 参加費 */}
        {tournament.fee !== undefined && (
          <div className="flex items-center text-sm text-gray-600">
            <FaDollarSign className="w-4 h-4 mr-2 text-green-500" />
            <span>参加費: {tournament.fee === 0 ? '無料' : `${tournament.fee.toLocaleString()}円`}</span>
          </div>
        )}

        {/* 定員 */}
        {tournament.maxParticipants && (
          <div className="flex items-center text-sm text-gray-600">
            <FaUsers className="w-4 h-4 mr-2 text-purple-500" />
            <span>定員: {tournament.maxParticipants}名</span>
          </div>
        )}

        {/* 説明 */}
        {tournament.description && (
          <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            <p className="line-clamp-2">{tournament.description}</p>
          </div>
        )}

        {/* 主催者情報 */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">主催:</span> {tournament.organizerInfo.name}
        </div>
      </div>

      {/* フッター */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {tournament.region}
          </span>
          {tournament.sourceUrl && (
            <a
              href={tournament.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              詳細を見る
              <FaExternalLinkAlt className="w-3 h-3 ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;