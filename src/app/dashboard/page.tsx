'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import TopNewsPanel from '@/components/TopNewsPanel';
import AuthGuard from '@/components/AuthGuard';
import { Match } from '@/types/match';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FaUsers, FaUserCircle, FaEdit, FaBrain, FaEye } from 'react-icons/fa';
import { FiCalendar, FiPlay } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [friends, setFriends] = useState<unknown[]>([]);
  const [mbtiResult, setMbtiResult] = useState<unknown | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.uid) return;
      
      try {
        const [loadedMatches] = await Promise.all([
          firestoreDb.getMatches(user.uid),
        ]);
        setMatches(loadedMatches);

        // フレンド一覧を取得
        const acceptedFriendships = await firestoreDb.getAcceptedFriendships(user.uid);
        const friendUserIds = acceptedFriendships.map(friendship => 
          friendship.fromUserId === user.uid ? friendship.toUserId : friendship.fromUserId
        );
        const friendProfiles = await firestoreDb.getUserProfilesByIds(friendUserIds);
        setFriends(friendProfiles.slice(0, 5)); // 最大5人まで表示

        // MBTI診断結果を取得
        const mbtiData = await firestoreDb.getMBTIResult(user.uid);
        setMbtiResult(mbtiData);

      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    };
    loadData();
  }, [user]);

  // 統計データ計算
  const recentMatches = matches.slice(0, 3);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar activePath="/dashboard" />
        <MobileNav activePath="/dashboard" />
        <div className="flex-1 flex flex-col lg:ml-0">
          <Topbar />
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
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

              {/* メインコンテンツグリッド - レスポンシブレイアウト */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {/* 左側：プロフィールとBPSI診断 */}
                <div className="space-y-4 sm:space-y-6 order-1 md:order-1">
                  <ModernProfileCard />
                  <BPSIResultCard mbtiResult={mbtiResult} />
                </div>

                {/* 右側：最近の試合とフレンド */}
                <div className="space-y-4 sm:space-y-6 order-2 md:order-2">
                  {/* 最近の試合 */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                        <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
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
                        icon={<FiCalendar className="w-6 h-6 sm:w-8 sm:h-8" />}
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

// フレンド一覧カード
const FriendsListCard: React.FC<{ friends: unknown[] }> = ({ friends }) => {
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

// BPSI診断結果カード
const BPSIResultCard: React.FC<{ mbtiResult: unknown | null }> = ({ mbtiResult }) => {
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

  const result = mbtiResult as { result: string; createdAt: number; analysis?: { confidenceScore: number } };
  
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

// タイプタイトルを取得するヘルパー関数
const getTypeTitle = (type: string): string => {
  const typeTitles: { [key: string]: string } = {
    'ESTJ': '統率者',
    'ESTP': '冒険家',
    'ESFJ': '世話好き',
    'ESFP': '自由人',
    'ENTJ': '指揮官',
    'ENTP': '発明家',
    'ENFJ': 'カリスマ',
    'ENFP': 'インスピレーター',
    'ISTJ': '職人',
    'ISTP': '技術者',
    'ISFJ': '保護者',
    'ISFP': '芸術家',
    'INTJ': '戦略家',
    'INTP': '研究者',
    'INFJ': '提唱者',
    'INFP': '理想主義者'
  };
  return typeTitles[type] || type;
};