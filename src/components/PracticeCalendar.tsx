'use client';

import React, { useState, useEffect } from 'react';
import { Practice, PracticeCard } from '@/types/practice';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaClock, FaEdit } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

interface PracticeCalendarProps {
  practices: Practice[];
  practiceCards: PracticeCard[];
  onDateClick: (date: Date, practices: Practice[]) => void;
  onCreatePractice: (date: Date) => void;
  onEditPractice: (practice: Practice) => void;
  onUsePracticeCard: (card: PracticeCard, date: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  practices: Practice[];
}

const PracticeCalendar: React.FC<PracticeCalendarProps> = ({
  practices,
  practiceCards,
  onDateClick,
  onCreatePractice,
  onEditPractice,
  onUsePracticeCard
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate, practices]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // カレンダーの最初の日（前月の日曜日から開始）
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // カレンダーの最後の日（次月の土曜日まで）
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentCalendarDate = new Date(startDate);
    
    while (currentCalendarDate <= endDate) {
      const dateStr = currentCalendarDate.toISOString().split('T')[0];
      const dayPractices = practices.filter(p => p.date === dateStr);
      
      days.push({
        date: new Date(currentCalendarDate),
        isCurrentMonth: currentCalendarDate.getMonth() === month,
        isToday: isSameDay(currentCalendarDate, new Date()),
        practices: dayPractices
      });
      
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    onDateClick(day.date, day.practices);
  };

  const getPracticeIntensityColor = (practices: Practice[]) => {
    if (practices.length === 0) return '';
    
    const totalIntensity = practices.reduce((sum, p) => {
      const intensityMap = { low: 1, medium: 2, high: 3, very_high: 4 };
      return sum + intensityMap[p.intensity];
    }, 0);
    
    const avgIntensity = totalIntensity / practices.length;
    
    if (avgIntensity <= 1.5) return 'bg-green-100 border-green-300';
    if (avgIntensity <= 2.5) return 'bg-yellow-100 border-yellow-300';
    if (avgIntensity <= 3.5) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins}m`;
    }
    return `${mins}m`;
  };

  const getMonthlyStats = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthPractices = practices.filter(p => {
      const practiceDate = new Date(p.date);
      return practiceDate >= monthStart && practiceDate <= monthEnd;
    });
    
    const totalDuration = monthPractices.reduce((sum, p) => sum + p.duration, 0);
    const practicesDays = new Set(monthPractices.map(p => p.date)).size;
    
    return {
      totalPractices: monthPractices.length,
      totalDuration,
      practiceDays: practicesDays,
      avgDuration: monthPractices.length > 0 ? totalDuration / monthPractices.length : 0
    };
  };

  const monthlyStats = getMonthlyStats();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaCalendarAlt className="w-6 h-6 mr-2 text-blue-600" />
            練習カレンダー
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800 min-w-[120px] text-center">
              {currentDate.getFullYear()}年 {months[currentDate.getMonth()]}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            今日
          </button>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            練習追加
          </button>
        </div>
      </div>

      {/* 月次統計 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center">
            <GiShuttlecock className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-blue-600 font-medium">練習回数</p>
              <p className="text-lg font-bold text-blue-800">{monthlyStats.totalPractices}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center">
            <FaClock className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-xs text-green-600 font-medium">総時間</p>
              <p className="text-lg font-bold text-green-800">{formatDuration(monthlyStats.totalDuration)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center">
            <FaCalendarAlt className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <p className="text-xs text-purple-600 font-medium">練習日数</p>
              <p className="text-lg font-bold text-purple-800">{monthlyStats.practiceDays}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center">
            <FaClock className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-xs text-orange-600 font-medium">平均時間</p>
              <p className="text-lg font-bold text-orange-800">{formatDuration(monthlyStats.avgDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* クイック追加パネル */}
      {showQuickAdd && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">クイック追加</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600 mb-2">練習カードから追加</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {practiceCards.slice(0, 5).map(card => (
                  <button
                    key={card.id}
                    onClick={() => {
                      if (selectedDate) {
                        onUsePracticeCard(card, selectedDate);
                        setShowQuickAdd(false);
                      }
                    }}
                    className="w-full text-left p-2 bg-white rounded border hover:bg-blue-50 transition-colors"
                    disabled={!selectedDate}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800">{card.title}</span>
                      <span className="text-xs text-gray-500">30分</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-2">新規作成</p>
              <button
                onClick={() => {
                  if (selectedDate) {
                    onCreatePractice(selectedDate);
                    setShowQuickAdd(false);
                  }
                }}
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!selectedDate}
              >
                <FaPlus className="w-4 h-4 mr-2 inline" />
                新しい練習記録
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {selectedDate ? `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}に追加` : '日付を選択してください'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {/* 曜日ヘッダー */}
        {weekdays.map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-600 text-sm">
            {day}
          </div>
        ))}
        
        {/* 日付セル */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDateClick(day)}
            className={`min-h-[80px] p-1 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
              !day.isCurrentMonth 
                ? 'bg-gray-50 text-gray-400' 
                : day.isToday
                ? 'bg-blue-50 border-blue-300'
                : selectedDate && isSameDay(day.date, selectedDate)
                ? 'bg-blue-100 border-blue-400'
                : day.practices.length > 0
                ? getPracticeIntensityColor(day.practices)
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="text-sm font-medium mb-1">
                {day.date.getDate()}
              </div>
              
              {day.practices.length > 0 && (
                <div className="flex-1 space-y-1">
                  {day.practices.slice(0, 2).map(practice => (
                    <div
                      key={practice.id}
                      className="bg-white bg-opacity-80 rounded px-1 py-0.5 text-xs truncate"
                      title={`${practice.title} (${formatDuration(practice.duration)})`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1">{practice.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPractice(practice);
                          }}
                          className="ml-1 text-gray-500 hover:text-blue-600"
                        >
                          <FaEdit className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {day.practices.length > 2 && (
                    <div className="text-xs text-gray-600 px-1">
                      +{day.practices.length - 2} 件
                    </div>
                  )}
                </div>
              )}
              
              {day.practices.length === 0 && day.isCurrentMonth && (
                <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <FaPlus className="w-3 h-3 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 凡例 */}
      <div className="mt-6 flex flex-wrap items-center justify-center space-x-6 text-xs text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>軽い練習</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>普通の練習</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
          <span>きつい練習</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>非常にきつい練習</span>
        </div>
      </div>
    </div>
  );
};

export default PracticeCalendar;