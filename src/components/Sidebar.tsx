import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaTachometerAlt, FaUser, FaChartBar, FaDatabase, FaUserCircle, FaRss, FaUserFriends, FaEnvelope } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi'; // GiShuttlecockをインポート

const navItems = [
  { label: 'ダッシュボード', icon: <FaTachometerAlt />, path: '/' },
  { label: '選手管理', icon: <FaUser />, path: '/players' },
  { label: '試合記録', icon: <GiShuttlecock />, path: '/matches' }, // GiShuttlecockを使用
  { label: '分析', icon: <FaChartBar />, path: '/analysis' },
  { label: 'ニュース', icon: <FaRss />, path: '/news' },
  { label: 'フレンド管理', icon: <FaUserFriends />, path: '/friends' },
  { label: '試合リクエスト', icon: <FaEnvelope />, path: '/match-requests' },
  { label: 'データ管理', icon: <FaDatabase />, path: '/management' },
];

const Sidebar: React.FC<{ activePath?: string }> = ({ activePath = '/' }) => {
  const router = useRouter();
  const { user, profile } = useAuth();
  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col py-6 px-4">
      <div className="flex items-center mb-10">
        <span className="text-2xl font-bold text-blue-600 mr-2">🎯</span>
        <span className="text-xl font-bold text-gray-800">ヨシダシステム</span>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors duration-150 ${activePath === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => router.push(item.path)}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* プロフィールウィジェット */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow flex flex-col items-center">
        <FaUserCircle className="text-4xl text-gray-400 mb-2" />
        <div className="text-sm font-semibold text-gray-800 mb-1">
          {profile?.name || user?.email || 'ユーザー'}
        </div>
        <div className="text-xs text-gray-500 mb-2">
          {user?.email || 'メール未設定'}
        </div>
        <button
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => router.push('/profile')}
        >
          プロフィール編集
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;