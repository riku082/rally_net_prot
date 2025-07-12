'use client';

import React, { useState } from 'react';
import { Practice, PracticeCard } from '@/types/practice';
import { FaClock, FaEdit, FaTrash, FaPlus, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

interface PracticeDayDetailProps {
  selectedDate: Date;
  practices: Practice[];
  practiceCards: PracticeCard[];
  onClose: () => void;
  onCreatePractice: (date: Date) => void;
  onEditPractice: (practice: Practice) => void;
  onDeletePractice: (practiceId: string) => void;
}

const PracticeDayDetail: React.FC<PracticeDayDetailProps> = ({
  selectedDate,
  practices,
  practiceCards,
  onClose,
  onCreatePractice,
  onEditPractice,
  onDeletePractice
}) => {

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


  const getTotalDuration = () => {
    return practices.reduce((total, practice) => total + practice.duration, 0);
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
              <p className="text-gray-500 mb-6">新しい練習記録を追加しましょう</p>
              
              <div className="flex justify-center">
                <button
                  onClick={() => onCreatePractice(selectedDate)}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  新しい練習記録
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
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedPractices.map(practice => (
                    <div key={practice.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="text-lg font-semibold text-gray-900">{practice.title}</h5>
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

      </div>
    </div>
  );
};

export default PracticeDayDetail;