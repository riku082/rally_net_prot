'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import TopNewsPanel from '@/components/TopNewsPanel';
import AuthGuard from '@/components/AuthGuard';
import { Match } from '@/types/match';
import { Shot } from '@/types/shot';
import { Player } from '@/types/player';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FaUsers, FaTrophy, FaChartBar, FaEnvelopeOpenText, FaUserCircle, FaEdit, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { FiTrendingUp, FiActivity, FiTarget, FiCalendar, FiPlay } from 'react-icons/fi';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [pendingMatchRequestsCount, setPendingMatchRequestsCount] = useState(0);
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.uid) return;
      
      try {
        const [loadedPlayers, loadedMatches, loadedShots] = await Promise.all([
          firestoreDb.getPlayers(user.uid),
          firestoreDb.getMatches(user.uid),
          firestoreDb.getShots(user.uid),
        ]);
        setPlayers(loadedPlayers);
        setMatches(loadedMatches);
        setShots(loadedShots);

        // 保留中の試合リクエスト数を取得
        const pendingRequests = await firestoreDb.getPendingMatchRequests(user.uid);
        setPendingMatchRequestsCount(pendingRequests.length);

        // フレンド一覧を取得
        const acceptedFriendships = await firestoreDb.getAcceptedFriendships(user.uid);
        const friendUserIds = acceptedFriendships.map(friendship => 
          friendship.fromUserId === user.uid ? friendship.toUserId : friendship.fromUserId
        );
        const friendProfiles = await firestoreDb.getUserProfilesByIds(friendUserIds);
        setFriends(friendProfiles.slice(0, 5)); // 最大5人まで表示

      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    };
    loadData();
  }, [user]);

  // 統計データ計算
  const totalShots = shots.length;
  const completedMatches = matches.filter(match => match.score).length;
  const winRate = completedMatches > 0 ? Math.round((completedMatches / matches.length) * 100) : 0;
  const recentMatches = matches.slice(0, 3);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar activePath="/" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* ヘッダーセクション */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-5"></div>
                <div className="relative p-8">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    ダッシュボード
                  </h1>
                  <p className="text-gray-600 text-lg">システムの概要と最新情報を確認できます</p>
                </div>
              </div>

              {/* メイン統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard 
                  icon={<FiTarget className="w-6 h-6" />} 
                  title="登録選手数" 
                  value={players.length}
                  trend={+5}
                  color="gradient-blue"
                />
                <ModernStatCard 
                  icon={<FiActivity className="w-6 h-6" />} 
                  title="総試合数" 
                  value={matches.length}
                  trend={+12}
                  color="gradient-green"
                />
                <ModernStatCard 
                  icon={<FiTrendingUp className="w-6 h-6" />} 
                  title="総配球数" 
                  value={totalShots}
                  trend={+8}
                  color="gradient-purple"
                />
                <Link href="/friends" className="block transform hover:scale-105 transition-all duration-200">
                  <ModernStatCard 
                    icon={<FaEnvelopeOpenText className="w-6 h-6" />} 
                    title="試合リクエスト" 
                    value={pendingMatchRequestsCount}
                    trend={pendingMatchRequestsCount > 0 ? +1 : 0}
                    color="gradient-red"
                    description={pendingMatchRequestsCount > 0 ? '要確認' : 'なし'}
                  />
                </Link>
              </div>

              {/* メインコンテンツグリッド */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 左側：最近の活動とニュース */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 最近の試合 - モダンデザイン */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <FiCalendar className="w-5 h-5 mr-2 text-blue-600" />
                        最近の試合
                      </h3>
                      <Link href="/matches" className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium">
                        すべて表示 →
                      </Link>
                    </div>
                    {recentMatches.length > 0 ? (
                      <div className="space-y-4">
                        {recentMatches.map(match => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState 
                        icon={<FiCalendar className="w-8 h-8" />}
                        title="試合データなし"
                        description="まだ試合が登録されていません"
                        actionText="試合を登録"
                        actionHref="/matches"
                      />
                    )}
                  </div>

                  {/* ニュースセクション */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                    <TopNewsPanel />
                  </div>
                </div>

                {/* 右側：プロフィールとフレンド */}
                <div className="lg:col-span-1 space-y-6">
                  <ModernProfileCard />
                  <FriendsListCard friends={friends} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

// モダン統計カードコンポーネント
interface ModernStatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: number;
  color: 'gradient-blue' | 'gradient-green' | 'gradient-purple' | 'gradient-red';
  description?: string;
}

const ModernStatCard: React.FC<ModernStatCardProps> = ({ icon, title, value, trend, color, description }) => {
  const gradientClasses = {
    'gradient-blue': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'gradient-green': 'bg-gradient-to-br from-emerald-500 to-green-600',
    'gradient-purple': 'bg-gradient-to-br from-purple-500 to-indigo-600',
    'gradient-red': 'bg-gradient-to-br from-red-500 to-pink-600',
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 group h-32 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${gradientClasses[color]} text-white group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {trend > 0 ? <FaArrowUp className="w-3 h-3 mr-1" /> : 
             trend < 0 ? <FaArrowDown className="w-3 h-3 mr-1" /> : null}
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="mt-auto">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );
};

// モダン試合カードコンポーネント
interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const hasVideo = match.youtubeVideoId;
  
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div>
            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {new Date(match.date).toLocaleDateString('ja-JP')}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                match.type === 'singles' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {match.type === 'singles' ? 'シングルス' : 'ダブルス'}
              </span>
              {hasVideo && (
                <div className="flex items-center text-green-600">
                  <FiPlay className="w-3 h-3 mr-1" />
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
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
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
    <div className="text-center py-8">
      <div className="text-gray-400 mb-4 flex justify-center">{icon}</div>
      <h4 className="text-lg font-medium text-gray-600 mb-2">{title}</h4>
      <p className="text-gray-500 mb-4">{description}</p>
      {actionText && actionHref && (
        <Link href={actionHref} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">プロフィール</h3>
        <Link href="/profile" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
          <FaEdit className="w-4 h-4 text-gray-600" />
        </Link>
      </div>
      
      <div className="text-center">
        {/* アバター */}
        <div className="relative mb-6 inline-block">
          {profile?.avatar ? (
            <img 
              src={profile.avatar} 
              alt="Profile" 
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <FaUserCircle className="w-14 h-14 text-white" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        
        {/* ユーザー情報 */}
        <div>
          <h4 className="text-xl font-bold text-gray-800 mb-1">
            {profile?.name || 'ユーザー名未設定'}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            {user?.email || 'メール未設定'}
          </p>
          
          {/* 統計情報 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-medium">レベル</p>
              <p className="text-sm font-bold text-blue-800">
                {profile?.skillLevel === 'beginner' ? '初心者' :
                 profile?.skillLevel === 'intermediate' ? '中級者' :
                 profile?.skillLevel === 'advanced' ? '上級者' : 'プロ'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3">
              <p className="text-xs text-purple-600 font-medium">スタイル</p>
              <p className="text-sm font-bold text-purple-800">
                {profile?.playStyle === 'aggressive' ? '攻撃型' :
                 profile?.playStyle === 'defensive' ? '守備型' : 'バランス'}
              </p>
            </div>
          </div>
          
          {/* アクションボタン */}
          <Link href="/profile" className="w-full">
            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
              プロフィール編集
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// フレンド一覧カード
const FriendsListCard: React.FC<{ friends: any[] }> = ({ friends }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FaUsers className="w-5 h-5 mr-2 text-blue-600" />
          フレンド
        </h3>
        <Link href="/friends" className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium">
          すべて表示 →
        </Link>
      </div>
      
      {friends.length > 0 ? (
        <div className="space-y-3">
          {friends.map((friend, index) => (
            <div key={index} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <FaUserCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-800">{friend.name || 'ユーザー'}</p>
                <p className="text-sm text-gray-600">{friend.email}</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <FaUsers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">まだフレンドがいません</p>
          <Link href="/friends" className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium">
            フレンドを追加
          </Link>
        </div>
      )}
    </div>
  );
};

