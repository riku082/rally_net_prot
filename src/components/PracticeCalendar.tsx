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
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 p-3 sm:p-4 lg:p-6">
      {/* ヘッダー */}
      <div className="flex flex-col space-y-3 sm:space-y-4 lg:space-y-0 lg:flex-row justify-between items-start lg:items-center mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
            <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 text-blue-600" />
            練習カレンダー
          </h2>
          <div className="flex items-center justify-center space-x-2 sm:space-x-3">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 min-w-[100px] sm:min-w-[120px] text-center">
              {currentDate.getFullYear()}年 {months[currentDate.getMonth()]}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 w-full lg:w-auto">
          <button
            onClick={goToToday}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-1 lg:flex-none"
          >
            今日
          </button>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm flex-1 lg:flex-none"
          >
            <FaPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">練習追加</span>
            <span className="sm:hidden">追加</span>
          </button>
        </div>
      </div>

      {/* 月次統計 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center">
            <GiShuttlecock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-1 sm:mr-2" />
            <div>
              <p className="text-xs text-blue-600 font-medium">練習回数</p>
              <p className="text-sm sm:text-lg font-bold text-blue-800">{monthlyStats.totalPractices}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center">
            <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1 sm:mr-2" />
            <div>
              <p className="text-xs text-green-600 font-medium">総時間</p>
              <p className="text-sm sm:text-lg font-bold text-green-800">{formatDuration(monthlyStats.totalDuration)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center">
            <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-1 sm:mr-2" />
            <div>
              <p className="text-xs text-purple-600 font-medium">練習日数</p>
              <p className="text-sm sm:text-lg font-bold text-purple-800">{monthlyStats.practiceDays}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center">
            <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-1 sm:mr-2" />
            <div>
              <p className="text-xs text-orange-600 font-medium">平均時間</p>
              <p className="text-sm sm:text-lg font-bold text-orange-800">{formatDuration(monthlyStats.avgDuration)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* クイック追加パネル */}
      {showQuickAdd && (
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">クイック追加</h4>
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
                      <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">{card.title}</span>
                      <span className="text-xs text-gray-500 ml-2">30分</span>
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
                className="w-full p-2 sm:p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                disabled={!selectedDate}
              >
                <FaPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
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
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {/* 曜日ヘッダー */}
        {weekdays.map(day => (
          <div key={day} className="p-2 sm:p-3 text-center font-medium text-gray-600 text-xs sm:text-sm">
            {day}
          </div>
        ))}
        
        {/* 日付セル */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDateClick(day)}
            className={`min-h-[60px] sm:min-h-[80px] p-0.5 sm:p-1 border rounded cursor-pointer transition-all duration-200 hover:shadow-md ${
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
              <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 text-center sm:text-left">
                {day.date.getDate()}
              </div>
              
              {day.practices.length > 0 && (
                <div className="flex-1 space-y-0.5 sm:space-y-1">
                  {day.practices.slice(0, window.innerWidth < 640 ? 1 : 2).map(practice => (
                    <div
                      key={practice.id}
                      className="bg-white bg-opacity-80 rounded px-0.5 sm:px-1 py-0.5 text-xs truncate"
                      title={`${practice.title} (${formatDuration(practice.duration)})`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate flex-1">{practice.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPractice(practice);
                          }}
                          className="ml-0.5 sm:ml-1 text-gray-500 hover:text-blue-600 hidden sm:block"
                        >
                          <FaEdit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {day.practices.length > (window.innerWidth < 640 ? 1 : 2) && (
                    <div className="text-xs text-gray-600 px-0.5 sm:px-1">
                      +{day.practices.length - (window.innerWidth < 640 ? 1 : 2)} 件
                    </div>
                  )}
                </div>
              )}
              
              {day.practices.length === 0 && day.isCurrentMonth && (
                <div className="flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <FaPlus className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 凡例 */}
      <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-gray-600">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>軽い練習</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>普通の練習</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-100 border border-orange-300 rounded"></div>
          <span>きつい練習</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>非常にきつい練習</span>
        </div>
      </div>
    </div>
  );
};

export default PracticeCalendar;