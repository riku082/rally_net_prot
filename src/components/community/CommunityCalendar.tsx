'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus
} from 'lucide-react';
import { CommunityEvent, EventStatus } from '@/types/community';
import Link from 'next/link';

interface CommunityCalendarProps {
  communityId: string;
  events: CommunityEvent[];
  onEventClick?: (event: CommunityEvent) => void;
}

type ViewMode = 'month' | 'week';

export default function CommunityCalendar({ 
  communityId, 
  events, 
  onEventClick 
}: CommunityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // カレンダーの日付を生成
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);

    // 週の最初（日曜日）まで戻る
    startDate.setDate(startDate.getDate() - startDate.getDay());
    // 週の最後（土曜日）まで進める
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // 週表示用の日付を生成
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const calendarDays = useMemo(() => {
    return viewMode === 'month' ? generateCalendarDays() : generateWeekDays();
  }, [currentDate, viewMode]);

  // 日付に対応するイベントを取得
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate() &&
        event.status !== EventStatus.CANCELLED
      );
    });
  };

  // ナビゲーション
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // 日付フォーマット
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${endOfWeek.toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="前へ"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={navigateToday}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              今日
            </button>
            
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="次へ"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 ml-4">
              {viewMode === 'month' ? formatMonthYear() : formatWeekRange()}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'month' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                月
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === 'week' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                週
              </button>
            </div>

            <Link
              href={`/community/${communityId}/events/new`}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              イベント作成
            </Link>
          </div>
        </div>
      </div>

      {/* カレンダー本体 */}
      <div className="p-4">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`py-2 text-center text-sm font-medium bg-gray-50 ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-lg overflow-hidden">
          {calendarDays.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDate = isToday(date);
            
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 bg-white cursor-pointer hover:bg-gray-50 transition-colors
                  ${!isCurrentMonthDay && viewMode === 'month' ? 'bg-gray-50 text-gray-400' : ''}
                  ${isTodayDate ? 'ring-2 ring-green-500 ring-inset' : ''}
                  ${selectedDate && date.toDateString() === selectedDate.toDateString() ? 'bg-green-50' : ''}
                `}
                onClick={() => setSelectedDate(date)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    index % 7 === 0 ? 'text-red-600' : 
                    index % 7 === 6 ? 'text-blue-600' : 
                    'text-gray-900'
                  } ${!isCurrentMonthDay ? 'text-gray-400' : ''}`}>
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-1 rounded">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* イベント表示 (最大3件) */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className="text-xs p-1 rounded bg-green-100 hover:bg-green-200 text-green-800 truncate transition-colors"
                      title={event.title}
                    >
                      <span className="font-medium">
                        {new Date(event.startDateTime).toLocaleTimeString('ja-JP', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {' '}
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3}件
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 選択した日付のイベント詳細 */}
      {selectedDate && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            {selectedDate.toLocaleDateString('ja-JP', { 
              month: 'long', 
              day: 'numeric', 
              weekday: 'long' 
            })}のイベント
          </h3>
          
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              この日のイベントはありません
            </p>
          ) : (
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map((event) => (
                <Link
                  key={event.id}
                  href={`/community/${communityId}/events/${event.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {event.title}
                      </h4>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(event.startDateTime).toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(event.endDateTime).toLocaleTimeString('ja-JP', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                        {event.maxParticipants && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            定員 {event.maxParticipants}名
                          </div>
                        )}
                      </div>
                    </div>
                    {event.difficulty && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.difficulty === 'beginner' ? 'bg-blue-100 text-blue-700' :
                        event.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {event.difficulty === 'beginner' ? '初級' :
                         event.difficulty === 'intermediate' ? '中級' : '上級'}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}