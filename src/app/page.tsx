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
import { FaUsers, FaTrophy, FaChartBar, FaEnvelopeOpenText, FaUserCircle, FaEdit } from 'react-icons/fa';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);
  const [pendingMatchRequestsCount, setPendingMatchRequestsCount] = useState(0);

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

      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    };
    loadData();
  }, [user]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
                <p className="text-gray-600 mt-1">システムの概要と最新情報を確認できます。</p>
              </div>

              {/* 上段：統計情報とプロフィール */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* 左側2/3：統計カード */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <StatCard icon={<FaUsers />} title="登録選手数" value={players.length} color="blue" />
                  <StatCard icon={<FaTrophy />} title="総試合数" value={matches.length} color="green" />
                  <StatCard icon={<FaChartBar />} title="総配球数" value={shots.length} color="yellow" />
                  
                  {/* 試合リクエストカード */}
                  <Link href="/match-requests" className="block">
                    <StatCard 
                      icon={<FaEnvelopeOpenText />} 
                      title="試合リクエスト" 
                      value={pendingMatchRequestsCount} 
                      color="red"
                      description={pendingMatchRequestsCount > 0 ? '要確認' : 'なし'}
                    />
                  </Link>
                </div>

                {/* 右側1/3：プロフィール */}
                <div className="lg:col-span-1">
                  <ProfileCard />
                </div>
              </div>

              {/* 中段：トップニュース */}
              <div className="mb-8">
                <TopNewsPanel />
              </div>

              {/* 下段：最近の試合（仮） */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                 <h3 className="text-xl font-bold text-gray-800 mb-4">最近の試合</h3>
                 {matches.length > 0 ? (
                   <ul className="space-y-3">
                     {matches.slice(0, 5).map(match => (
                       <li key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                         <span className="text-gray-700 font-medium">
                           {new Date(match.date).toLocaleDateString('ja-JP')} - {match.type === 'singles' ? 'シングルス' : 'ダブルス'}
                         </span>
                         <Link href={`/analysis?matchId=${match.id}`} className="text-blue-600 hover:underline text-sm">
                           詳細を見る
                         </Link>
                       </li>
                     ))}
                   </ul>
                 ) : (
                   <p className="text-gray-500">まだ試合が登録されていません。</p>
                 )}
              </div>

            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

// 統計カードコンポーネント
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'; // redを追加
  description?: string; // descriptionを追加
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600', // redを追加
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 flex items-center">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <div className="w-6 h-6">
          {icon}
        </div>
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );
};

// プロフィールカードコンポーネント
const ProfileCard: React.FC = () => {
  const { profile, user } = useAuth();
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">プロフィール</h3>
        <Link href="/profile" className="text-blue-600 hover:text-blue-800">
          <FaEdit className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="flex flex-col items-center">
        {/* アバター */}
        <div className="relative mb-4">
          {profile?.avatar ? (
            <img 
              src={profile.avatar} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <FaUserCircle className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* ユーザー情報 */}
        <div className="text-center w-full">
          <h4 className="text-lg font-semibold text-gray-800 mb-1">
            {profile?.name || 'ユーザー名未設定'}
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {user?.email || 'メール未設定'}
          </p>
          
          {/* 詳細情報 */}
          <div className="space-y-2 text-sm">
            {profile?.team && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">チーム:</span>
                <span className="font-medium text-gray-800">{profile.team}</span>
              </div>
            )}
            {profile?.skillLevel && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">レベル:</span>
                <span className="font-medium text-gray-800">
                  {profile.skillLevel === 'beginner' ? '初心者' :
                   profile.skillLevel === 'intermediate' ? '中級者' :
                   profile.skillLevel === 'advanced' ? '上級者' : 'プロ'}
                </span>
              </div>
            )}
            {profile?.playStyle && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">スタイル:</span>
                <span className="font-medium text-gray-800">
                  {profile.playStyle === 'aggressive' ? '攻撃型' :
                   profile.playStyle === 'defensive' ? '守備型' : 'オールラウンド'}
                </span>
              </div>
            )}
            {profile?.preferredGameType && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">好きな形式:</span>
                <span className="font-medium text-gray-800">
                  {profile.preferredGameType === 'singles' ? 'シングルス' :
                   profile.preferredGameType === 'doubles' ? 'ダブルス' : '両方'}
                </span>
              </div>
            )}
            {profile?.dominantHand && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">利き手:</span>
                <span className="font-medium text-gray-800">
                  {profile.dominantHand === 'right' ? '右利き' : '左利き'}
                </span>
              </div>
            )}
            {profile?.experience && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">経験年数:</span>
                <span className="font-medium text-gray-800">{profile.experience}年</span>
              </div>
            )}
          </div>
          
          {/* プロフィール編集ボタン */}
          <Link href="/profile" className="mt-4 inline-block">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              プロフィール編集
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
