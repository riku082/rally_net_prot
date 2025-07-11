'use client';

import React, { useState } from 'react';
import { Practice, PracticeCard } from '@/types/practice';
import { FaClock, FaEdit, FaTrash, FaPlus, FaTimes, FaPlay, FaCalendarAlt } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

interface PracticeDayDetailProps {
  selectedDate: Date;
  practices: Practice[];
  practiceCards: PracticeCard[];
  onClose: () => void;
  onCreatePractice: (date: Date) => void;
  onEditPractice: (practice: Practice) => void;
  onDeletePractice: (practiceId: string) => void;
  onUsePracticeCard: (card: PracticeCard, date: Date) => void;
}

const PracticeDayDetail: React.FC<PracticeDayDetailProps> = ({
  selectedDate,
  practices,
  practiceCards,
  onClose,
  onCreatePractice,
  onEditPractice,
  onDeletePractice,
  onUsePracticeCard
}) => {
  const [showCardSelector, setShowCardSelector] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:mm format
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const getIntensityColor = (intensity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      very_high: 'bg-red-100 text-red-800'
    };
    return colors[intensity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getIntensityLabel = (intensity: string) => {
    const labels = {
      low: '軽い',
      medium: '普通',
      high: 'きつい',
      very_high: '非常にきつい'
    };
    return labels[intensity as keyof typeof labels] || intensity;
  };

  const getTotalDuration = () => {
    return practices.reduce((total, practice) => total + practice.duration, 0);
  };

  const getAverageIntensity = () => {
    if (practices.length === 0) return 0;
    const intensityMap = { low: 1, medium: 2, high: 3, very_high: 4 };
    const total = practices.reduce((sum, p) => sum + intensityMap[p.intensity as keyof typeof intensityMap], 0);
    return total / practices.length;
  };

  const sortedPractices = practices.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaCalendarAlt className="w-6 h-6 mr-3 text-blue-600" />
              {formatDate(selectedDate)}
            </h2>
            {practices.length > 0 && (
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <GiShuttlecock className="w-4 h-4 mr-1" />
                  {practices.length}件の練習
                </span>
                <span className="flex items-center">
                  <FaClock className="w-4 h-4 mr-1" />
                  合計 {formatDuration(getTotalDuration())}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-6">
          {practices.length === 0 ? (
            /* 練習がない日 */
            <div className="text-center py-12">
              <GiShuttlecock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">この日は練習記録がありません</h3>
              <p className="text-gray-500 mb-6">新しい練習記録を追加するか、練習カードから選択してください</p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => onCreatePractice(selectedDate)}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  新しい練習記録
                </button>
                <button
                  onClick={() => setShowCardSelector(true)}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaPlay className="w-4 h-4 mr-2" />
                  練習カードから選択
                </button>
              </div>
            </div>
          ) : (
            /* 練習がある日 */
            <div className="space-y-6">
              {/* 日次統計 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">この日の統計</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{practices.length}</p>
                    <p className="text-sm text-gray-600">練習回数</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{formatDuration(getTotalDuration())}</p>
                    <p className="text-sm text-gray-600">合計時間</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{getAverageIntensity().toFixed(1)}</p>
                    <p className="text-sm text-gray-600">平均強度</p>
                  </div>
                </div>
              </div>

              {/* 練習一覧 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">練習記録</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onCreatePractice(selectedDate)}
                      className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus className="w-3 h-3 mr-1" />
                      追加
                    </button>
                    <button
                      onClick={() => setShowCardSelector(true)}
                      className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaPlay className="w-3 h-3 mr-1" />
                      カード
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedPractices.map(practice => (
                    <div key={practice.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="text-lg font-semibold text-gray-900">{practice.title}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(practice.intensity)}`}>
                              {getIntensityLabel(practice.intensity)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <FaClock className="w-3 h-3 mr-1" />
                              {formatTime(practice.startTime)} - {formatTime(practice.endTime)}
                            </span>
                            <span>({formatDuration(practice.duration)})</span>
                          </div>

                          {practice.description && (
                            <p className="text-gray-700 text-sm mb-3">{practice.description}</p>
                          )}

                          {practice.skills.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 mb-1">スキル評価</p>
                              <div className="flex flex-wrap gap-2">
                                {practice.skills.map(skill => (
                                  <span key={skill.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {skill.name} ({skill.rating}/5)
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {practice.notes && (
                            <div className="bg-gray-50 rounded p-2 text-sm">
                              <p className="text-gray-600"><strong>メモ:</strong> {practice.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => onEditPractice(practice)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('この練習記録を削除しますか？')) {
                                onDeletePractice(practice.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 練習カード選択モーダル */}
        {showCardSelector && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">練習カードを選択</h3>
                <button
                  onClick={() => setShowCardSelector(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                {practiceCards.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">練習カードがありません</p>
                ) : (
                  <div className="space-y-3">
                    {practiceCards.map(card => (
                      <button
                        key={card.id}
                        onClick={() => {
                          onUsePracticeCard(card, selectedDate);
                          setShowCardSelector(false);
                        }}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{card.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {card.difficulty === 'beginner' ? '初級' : card.difficulty === 'intermediate' ? '中級' : '上級'}
                              </span>
                              <span className="text-xs text-gray-500">
                                30分
                              </span>
                            </div>
                          </div>
                          <FaPlay className="w-5 h-5 text-green-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeDayDetail;