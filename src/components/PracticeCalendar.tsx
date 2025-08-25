'use client';

import React, { useState, useEffect } from 'react';
import { Practice, PracticeCard } from '@/types/practice';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaClock, FaEdit, FaChartBar, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';

interface PracticeCalendarProps {
  practices: Practice[];
  onDateClick: (date: Date, practices: Practice[]) => void;
  onEditPractice: (practice: Practice) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  practices: Practice[];
}

const PracticeCalendar: React.FC<PracticeCalendarProps> = ({
  practices,
  onDateClick,
  onEditPractice
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [showStats, setShowStats] = useState(false);

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
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 px-2">
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
          <div className="flex items-center">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="前月"
            >
              <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
            <h3 className="text-sm sm:text-lg font-semibold text-gray-800 min-w-[110px] sm:min-w-[140px] text-center">
              {currentDate.getFullYear()}年 {months[currentDate.getMonth()]}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="次月"
            >
              <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            今日
          </button>
        </div>
        
        <button
          onClick={() => setShowStats(!showStats)}
          className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FaChartBar className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>統計</span>
          {showStats ? <FaChevronUp className="w-2 h-2 sm:w-3 sm:h-3" /> : <FaChevronDown className="w-2 h-2 sm:w-3 sm:h-3" />}
        </button>
      </div>

      {/* 月次統計 - 折りたたみ可能 */}
      {showStats && (
        <div className="bg-gray-50 rounded-lg p-2 sm:p-4 mb-3 sm:mb-4 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
              <div className="flex items-center">
                <GiShuttlecock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-1 sm:mr-2" />
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-600 font-medium">練習回数</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{monthlyStats.totalPractices}回</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
              <div className="flex items-center">
                <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1 sm:mr-2" />
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-600 font-medium">総時間</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{formatDuration(monthlyStats.totalDuration)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
              <div className="flex items-center">
                <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-1 sm:mr-2" />
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-600 font-medium">練習日数</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{monthlyStats.practiceDays}日</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-2 sm:p-3 shadow-sm">
              <div className="flex items-center">
                <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-1 sm:mr-2" />
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-600 font-medium">平均時間</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">{formatDuration(monthlyStats.avgDuration)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* カレンダーグリッド */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-auto">
        <div className="grid grid-cols-7 min-h-full">
          {/* 曜日ヘッダー */}
          <div className="col-span-7 grid grid-cols-7 border-b border-gray-200 sticky top-0 bg-white z-10">
            {weekdays.map((day, index) => (
              <div 
                key={day} 
                className={`py-2 sm:py-3 text-center font-medium text-xs sm:text-sm ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* 日付セル */}
          {calendarDays.map((day, index) => {
            const dayOfWeek = day.date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  border-r border-b border-gray-200 p-1 sm:p-2 cursor-pointer transition-all duration-200
                  hover:bg-gray-50 relative
                  ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                  ${day.isToday ? 'bg-blue-50' : ''}
                  ${selectedDate && isSameDay(day.date, selectedDate) ? 'bg-blue-100' : ''}
                  ${(index + 1) % 7 === 0 ? 'border-r-0' : ''}
                `}
                style={{ 
                  minHeight: 'max(80px, calc((100vh - 350px) / 6))',
                  maxHeight: 'max(120px, calc((100vh - 350px) / 6))'
                }}
              >
                <div className="flex flex-col h-full">
                  <div className={`
                    text-xs sm:text-sm font-medium mb-0.5 sm:mb-1
                    ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                    ${day.isToday ? 'text-blue-600 font-bold' : ''}
                    ${isWeekend && day.isCurrentMonth ? (dayOfWeek === 0 ? 'text-red-500' : 'text-blue-500') : ''}
                  `}>
                    {day.date.getDate()}
                  </div>
                  
                  {day.practices.length > 0 && (
                    <div className="flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto">
                      {day.practices.slice(0, window.innerWidth < 640 ? 2 : 3).map(practice => (
                        <div
                          key={practice.id}
                          className="group relative"
                        >
                          <div
                            className={`
                              rounded px-1 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs cursor-pointer
                              transition-all duration-200 hover:shadow-sm
                              ${
                                practice.type === 'basic_practice' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                practice.type === 'game_practice' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                practice.type === 'physical_training' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                                'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                            title={`${practice.title} (${practice.startTime}-${practice.endTime})`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate flex-1 font-medium">
                                <span className="hidden sm:inline">
                                  {practice.startTime && (
                                    <span className="opacity-75">{practice.startTime.slice(0, 5)} </span>
                                  )}
                                </span>
                                {practice.title}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditPractice(practice);
                                }}
                                className="opacity-0 group-hover:opacity-100 ml-0.5 sm:ml-1 text-gray-500 hover:text-blue-600 transition-opacity hidden sm:block"
                              >
                                <FaEdit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {day.practices.length > (window.innerWidth < 640 ? 2 : 3) && (
                        <div className="text-[10px] sm:text-xs text-gray-500 px-1 sm:px-2 font-medium">
                          他{day.practices.length - (window.innerWidth < 640 ? 2 : 3)}件
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PracticeCalendar;