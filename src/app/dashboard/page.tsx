'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import TopNewsPanel from '@/components/TopNewsPanel';
import AuthGuard from '@/components/AuthGuard';
import PerformanceMonitor from '@/components/PerformanceMonitor';

import { Match } from '@/types/match';
import { Practice, PracticeCard } from '@/types/practice';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FaUsers, FaUserCircle, FaEdit, FaBrain, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiCalendar, FiPlay } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';
import Link from 'next/link';

interface Friend {
  name: string;
  email: string;
}

interface MbtiAnalysisResult {
  result: string;
  createdAt: number;
  analysis?: {
    confidenceScore: number;
  };
}

// ダッシュボード用モバイルカレンダーコンポーネント
interface DashboardMobileCalendarProps {
  practices: Practice[];
  onCalendarClick: () => void;
}

const DashboardMobileCalendar: React.FC<DashboardMobileCalendarProps> = ({ practices, onCalendarClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(currentDate.getDate() - day);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayPractices = practices.filter(p => p.date === dateStr);
      
      weekDays.push({
        date: new Date(date),
        practices: dayPractices,
        isToday: isSameDay(date, new Date()),
        isCurrentMonth: date.getMonth() === currentDate.getMonth()
      });
    }
    return weekDays;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getPracticeIndicatorColor = (practices: Practice[]) => {
    if (practices.length === 0) return '';
    
    const totalIntensity = practices.reduce((sum, p) => {
      const intensityMap = { low: 1, medium: 2, high: 3, very_high: 4 };
      return sum + intensityMap[p.intensity];
    }, 0);
    
    const avgIntensity = totalIntensity / practices.length;
    
    if (avgIntensity <= 1.5) return 'bg-green-400';
    if (avgIntensity <= 2.5) return 'bg-yellow-400';
    if (avgIntensity <= 3.5) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const weekDays = generateWeekDays();

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronLeft className="w-3 h-3 text-gray-600" />
          </button>
          <div className="text-center min-w-[120px]">
            <h4 className="text-sm font-semibold text-gray-800">
              {currentDate.getFullYear()}年 {months[currentDate.getMonth()]}
            </h4>
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronRight className="w-3 h-3 text-gray-600" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          今日
        </button>
      </div>

      {/* 週表示カレンダー */}
      <div className="grid grid-cols-7 gap-1">
        {/* 曜日ヘッダー */}
        {weekdays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
        
        {/* 日付セル */}
        {weekDays.map((day, index) => (
          <div
            key={index}
            onClick={onCalendarClick}
            className={`min-h-[50px] p-1 border rounded cursor-pointer transition-all duration-200 ${
              !day.isCurrentMonth 
                ? 'bg-gray-50 text-gray-400' 
                : day.isToday
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex flex-col h-full items-center">
              <div className="text-xs font-medium mb-1">
                {day.date.getDate()}
              </div>
              
              {day.practices.length > 0 && (
                <div className="flex flex-col items-center space-y-0.5">
                  <div 
                    className={`w-2 h-2 rounded-full ${getPracticeIndicatorColor(day.practices)}`}
                    title={`${day.practices.length}件の練習`}
                  />
                  <div className="text-xs text-gray-600">
                    {day.practices.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 簡易統計 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-600">今週</div>
            <div className="text-sm font-bold text-gray-800">
              {weekDays.reduce((sum, day) => sum + day.practices.length, 0)}回
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">今月</div>
            <div className="text-sm font-bold text-gray-800">
              {practices.filter(p => {
                const practiceDate = new Date(p.date);
                return practiceDate.getMonth() === currentDate.getMonth() && 
                       practiceDate.getFullYear() === currentDate.getFullYear();
              }).length}回
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600">総計</div>
            <div className="text-sm font-bold text-gray-800">{practices.length}回</div>
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex items-center justify-center space-x-3 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>軽</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span>普通</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          <span>きつい</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          <span>激</span>
        </div>
      </div>
    </div>
  );
};

// ダッシュボード用デスクトップカレンダーコンポーネント
interface DashboardDesktopCalendarProps {
  practices: Practice[];
  onCalendarClick: () => void;
}

const DashboardDesktopCalendar: React.FC<DashboardDesktopCalendarProps> = ({ practices, onCalendarClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
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
    
    return days;
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
  };

  const getPracticeIndicatorColor = (practices: Practice[]) => {
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
    const practiceDays = new Set(monthPractices.map(p => p.date)).size;
    
    return {
      totalPractices: monthPractices.length,
      totalDuration,
      practiceDays,
      avgDuration: monthPractices.length > 0 ? totalDuration / monthPractices.length : 0
    };
  };

  const calendarDays = generateCalendarDays();
  const monthlyStats = getMonthlyStats();

  return (
    <div 
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={onCalendarClick}
    >
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateMonth('prev');
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-800 min-w-[120px] text-center">
            {currentDate.getFullYear()}年 {months[currentDate.getMonth()]}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateMonth('next');
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToToday();
          }}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          今日
        </button>
      </div>

      {/* 月次統計 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <GiShuttlecock className="w-4 h-4 text-blue-600 mr-1" />
          </div>
          <p className="text-xs text-blue-600 font-medium">練習回数</p>
          <p className="text-lg font-bold text-blue-800">{monthlyStats.totalPractices}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <FiCalendar className="w-4 h-4 text-green-600 mr-1" />
          </div>
          <p className="text-xs text-green-600 font-medium">総時間</p>
          <p className="text-lg font-bold text-green-800">{formatDuration(monthlyStats.totalDuration)}</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <FiCalendar className="w-4 h-4 text-purple-600 mr-1" />
          </div>
          <p className="text-xs text-purple-600 font-medium">練習日数</p>
          <p className="text-lg font-bold text-purple-800">{monthlyStats.practiceDays}</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <FiCalendar className="w-4 h-4 text-orange-600 mr-1" />
          </div>
          <p className="text-xs text-orange-600 font-medium">平均時間</p>
          <p className="text-lg font-bold text-orange-800">{formatDuration(monthlyStats.avgDuration)}</p>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {/* 曜日ヘッダー */}
        {weekdays.map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
            {day}
          </div>
        ))}
        
        {/* 日付セル */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`min-h-[60px] p-1 border rounded transition-all duration-200 ${
              !day.isCurrentMonth 
                ? 'bg-gray-50 text-gray-400' 
                : day.isToday
                ? 'bg-blue-50 border-blue-300'
                : day.practices.length > 0
                ? getPracticeIndicatorColor(day.practices)
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="text-sm font-medium mb-1 text-center">
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
                      <span className="truncate">{practice.title}</span>
                    </div>
                  ))}
                  
                  {day.practices.length > 2 && (
                    <div className="text-xs text-gray-600 px-1">
                      +{day.practices.length - 2} 件
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 凡例 */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>軽い練習</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>普通の練習</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
          <span>きつい練習</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>非常にきつい練習</span>
        </div>
      </div>
      
      {/* クリックで詳細表示の案内 */}
      <div className="mt-3 text-center">
        <p className="text-xs text-gray-500">カレンダーをクリックして詳細管理 →</p>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [mbtiResult, setMbtiResult] = useState<MbtiAnalysisResult | null>(null);
  const [practices, setPractices] = useState<Practice[]>([]);


  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.uid) return;
      
      try {
        const loadedMatches = await firestoreDb.getMatches(user.uid);
        setMatches(loadedMatches);

        // フレンド一覧を取得
        const acceptedFriendships = await firestoreDb.getAcceptedFriendships(user.uid);
        const friendUserIds = acceptedFriendships.map(friendship => 
          friendship.fromUserId === user.uid ? friendship.toUserId : friendship.fromUserId
        );
        const friendProfiles = await firestoreDb.getUserProfilesByIds(friendUserIds);
        setFriends(friendProfiles.slice(0, 5) as Friend[]); // 最大5人まで表示

        // MBTI診断結果を取得
        const mbtiData = await firestoreDb.getMBTIResult(user.uid);
        setMbtiResult(mbtiData as MbtiAnalysisResult);

        // 練習データを取得
        const loadedPractices = await firestoreDb.getPractices(user.uid);
        setPractices(loadedPractices);

        // 練習カードを取得
              // const loadedPracticeCards = await firestoreDb.getPracticeCards(user.uid);
      // setPracticeCards(loadedPracticeCards);

      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    };
    loadData();
  }, [user]);

  // 統計データ計算
  const recentMatches = matches.slice(0, 3);

  // カレンダー用のハンドラー（練習管理ページに移動）
  const handleCalendarInteraction = () => {
    // カレンダーの任意の操作で練習管理ページに移動
    window.location.href = '/practice-management';
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar activePath="/dashboard" />
        <MobileNav activePath="/dashboard" />
        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar />
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <PerformanceMonitor />
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
              {/* ヘッダーセクション */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl opacity-5"></div>
                <div className="relative p-4 sm:p-6 md:p-8">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    ダッシュボード
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg">システムの概要と最新情報を確認できます</p>
                </div>
              </div>

              {/* メインコンテンツグリッド - 3列レイアウト */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {/* 左側：プロフィールとBPSI診断 */}
                <div className="space-y-4 sm:space-y-6 order-1 lg:order-1">
                  <ModernProfileCard />
                  <BPSIResultCard mbtiResult={mbtiResult} />
                </div>

                {/* 中央：カレンダー */}
                <div className="order-3 lg:order-2">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                        <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                        練習カレンダー
                      </h3>
                      <Link href="/practice-management" className="text-green-600 hover:text-green-800 transition-colors text-xs sm:text-sm font-medium">
                        詳細表示 →
                      </Link>
                    </div>
                    
                    {/* デスクトップ版：表示専用カレンダー */}
                    <div className="hidden lg:block">
                      <DashboardDesktopCalendar
                        practices={practices}
                        onCalendarClick={handleCalendarInteraction}
                      />
                    </div>
                    
                    {/* モバイル版：表示専用カレンダー */}
                    <div className="lg:hidden">
                      <DashboardMobileCalendar 
                        practices={practices}
                        onCalendarClick={handleCalendarInteraction}
                      />
                    </div>
                  </div>
                </div>

                {/* 右側：最近の試合とフレンド */}
                <div className="space-y-4 sm:space-y-6 order-2 lg:order-3">
                  {/* 最近の試合 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                        <GiShuttlecock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                        最近の試合
                      </h3>
                      <Link href="/matches" className="text-blue-600 hover:text-blue-800 transition-colors text-xs sm:text-sm font-medium">
                        すべて表示 →
                      </Link>
                    </div>
                    {recentMatches.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {recentMatches.map(match => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState 
                        icon={<GiShuttlecock className="w-6 h-6 sm:w-8 sm:h-8" />}
                        title="試合データなし"
                        description="まだ試合が登録されていません"
                        actionText="試合を登録"
                        actionHref="/matches"
                      />
                    )}
                  </div>

                  {/* フレンド */}
                  <FriendsListCard friends={friends} />
                </div>
              </div>

              {/* ニュースセクション - 全幅 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                <TopNewsPanel />
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}


// モダン試合カードコンポーネント
interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const hasVideo = match.youtubeVideoId;
  
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
              {new Date(match.date).toLocaleDateString('ja-JP')}
            </p>
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600">
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                match.type === 'singles' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {match.type === 'singles' ? 'シングルス' : 'ダブルス'}
              </span>
              {hasVideo && (
                <div className="flex items-center text-green-600">
                  <FiPlay className="w-3 h-3 mr-0.5 sm:mr-1" />
                  <span className="text-xs">動画あり</span>
                </div>
              )}
              {match.score && (
                <span className="text-xs text-gray-500">
                  {match.score.player}-{match.score.opponent}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link 
          href={`/analysis?matchId=${match.id}`} 
          className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-md sm:rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        >
          詳細
        </Link>
      </div>
    </div>
  );
};

// 空の状態コンポーネント
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionText, actionHref }) => {
  return (
    <div className="text-center py-6 sm:py-8">
      <div className="text-gray-400 mb-3 sm:mb-4 flex justify-center">{icon}</div>
      <h4 className="text-base sm:text-lg font-medium text-gray-600 mb-2">{title}</h4>
      <p className="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4">{description}</p>
      {actionText && actionHref && (
        <Link href={actionHref} className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium">
          {actionText}
        </Link>
      )}
    </div>
  );
};

// モダンプロフィールカードコンポーネント
const ModernProfileCard: React.FC = () => {
  const { profile, user } = useAuth();
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800">プロフィール</h3>
        <Link href="/profile" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
          <FaEdit className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
        </Link>
      </div>
      
      <div className="text-center">
        {/* アバター */}
        <div className="relative mb-4 sm:mb-6 inline-block">
          {profile?.avatar ? (
            <div 
              style={{ backgroundImage: `url(${profile.avatar})` }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-cover bg-center border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <FaUserCircle className="w-10 h-10 sm:w-14 sm:h-14 text-white" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        
        {/* ユーザー情報 */}
        <div>
          <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
            {profile?.name || 'ユーザー名未設定'}
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 truncate">
            {user?.email || 'メール未設定'}
          </p>
          
          {/* 統計情報 */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-2 sm:p-3">
              <p className="text-xs text-blue-600 font-medium">レベル</p>
              <p className="text-xs sm:text-sm font-bold text-blue-800">
                {profile?.skillLevel === 'beginner' ? '初心者' :
                 profile?.skillLevel === 'intermediate' ? '中級者' :
                 profile?.skillLevel === 'advanced' ? '上級者' : 'プロ'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-2 sm:p-3">
              <p className="text-xs text-purple-600 font-medium">スタイル</p>
              <p className="text-xs sm:text-sm font-bold text-purple-800">
                {profile?.playStyle === 'aggressive' ? '攻撃型' :
                 profile?.playStyle === 'defensive' ? '守備型' : 'バランス'}
              </p>
            </div>
          </div>
          
          {/* アクションボタン */}
          <Link href="/profile" className="w-full">
            <button className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm sm:text-base">
              プロフィール編集
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// フレンドリストカードコンポーネント
const FriendsListCard: React.FC<{ friends: Friend[] }> = ({ friends }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
          <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
          フレンド
        </h3>
        <Link href="/friends" className="text-blue-600 hover:text-blue-800 transition-colors text-xs sm:text-sm font-medium">
          すべて表示 →
        </Link>
      </div>
      
      {friends.length > 0 ? (
        <div className="space-y-2 sm:space-y-3">
          {friends.map((friend, index) => (
            <div key={index} className="flex items-center p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <FaUserCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{friend.name || 'ユーザー'}</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{friend.email}</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <FaUsers className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-xs sm:text-sm">まだフレンドがいません</p>
          <Link href="/friends" className="text-blue-600 hover:text-blue-800 transition-colors text-xs sm:text-sm font-medium">
            フレンドを追加
          </Link>
        </div>
      )}
    </div>
  );
};

// BPSI診断結果カードコンポーネント
const BPSIResultCard: React.FC<{ mbtiResult: MbtiAnalysisResult | null }> = ({ mbtiResult }) => {
  if (!mbtiResult) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
            <FaBrain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
            BPSI診断
          </h3>
        </div>
        
        <div className="text-center py-4 sm:py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-3 sm:mb-4">
            <GiShuttlecock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">まだ診断を受けていません</p>
          <Link href="/analysis" className="inline-flex items-center px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium">
            診断を受ける
          </Link>
        </div>
      </div>
    );
  }

  const result = mbtiResult;
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
          <FaBrain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
          BPSI診断結果
        </h3>
        <Link href="/analysis" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
          <FaEye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
        </Link>
      </div>
      
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-3 sm:mb-4">
          <span className="text-white font-bold text-base sm:text-lg">{result.result}</span>
        </div>
        
        <div className="space-y-2">
          <p className="text-base sm:text-lg font-bold text-gray-800">
            {getTypeTitle(result.result)}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">
            {new Date(result.createdAt).toLocaleDateString('ja-JP')}に診断
          </p>
          
          {result.analysis?.confidenceScore && (
            <div className="bg-purple-50 rounded-lg p-2 sm:p-3 mt-2 sm:mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-purple-600 font-medium">信頼度</span>
                <span className="text-xs sm:text-sm font-bold text-purple-800">{result.analysis.confidenceScore}%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-1.5 sm:h-2 mt-1 sm:mt-2">
                <div 
                  className="bg-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                  style={{ width: `${result.analysis.confidenceScore}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <Link href="/analysis" className="w-full mt-3 sm:mt-4 inline-block">
          <button className="w-full px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium text-xs sm:text-sm">
            詳細を見る
          </button>
        </Link>
      </div>
    </div>
  );
};

// MBTIタイプのタイトルを取得する関数
const getTypeTitle = (type: string): string => {
  const typeTitles: { [key: string]: string } = {
    'INTJ': '戦略家',
    'INTP': '論理学者',
    'ENTJ': '指揮官',
    'ENTP': '討論家',
    'INFJ': '提唱者',
    'INFP': '仲介者',
    'ENFJ': '主人公',
    'ENFP': '運動家',
    'ISTJ': '管理者',
    'ISFJ': '擁護者',
    'ESTJ': '幹部',
    'ESFJ': '領事官',
    'ISTP': '巨匠',
    'ISFP': '冒険家',
    'ESTP': '起業家',
    'ESFP': 'エンターテイナー'
  };
  
  return typeTitles[type] || type;
};

