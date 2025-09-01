// @ts-nocheck
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaHome, FaUser, FaChartBar, FaUserCircle, FaRss, FaUserFriends, FaBrain, FaBars, FaTimes, FaBook, FaQuestionCircle, FaMailBulk, FaUsers, FaFileContract } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';
import Image from 'next/image';
import NotificationBadge from './NotificationBadge';

const navItems = [
  { label: 'ホーム', icon: <FaHome />, path: '/dashboard' },
  { label: '練習管理', icon: <FaBook />, path: '/practice-management' },
  { label: 'コミュニティ', icon: <FaUsers />, path: '/community' },
  { label: 'ニュース', icon: <FaRss />, path: '/news' },
  { label: 'フレンド', icon: <FaUserFriends />, path: '/friends' },
  { label: 'BPSI診断', icon: <FaBrain />, path: '/mbti' },
  
  // Coming Soon項目（非表示）
  // { label: '選手管理', icon: <FaUser />, path: '/players', disabled: true },
  // { label: '試合記録', icon: <GiShuttlecock />, path: '/matches', badge: 'ヨシダシステム', disabled: true },
  // { label: '分析', icon: <FaChartBar />, path: '/analysis', disabled: true },
];

const MobileNav: React.FC<{ activePath?: string }> = ({ activePath = '/' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* モバイルメニューボタン */}
      <button
        className="lg:hidden fixed top-16 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        style={{ color: '#000000' }}
      >
        {isOpen ? <FaTimes className="w-6 h-6" style={{ color: '#000000' }} /> : <FaBars className="w-6 h-6" style={{ color: '#000000' }} />}
      </button>

      {/* モバイルオーバーレイ */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* モバイルナビゲーション */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Rally Net" width={32} height={32} className="mr-3" />
              <span className="text-xl font-bold text-gray-800">Rally Net</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  {item.disabled ? (
                    <div className="flex items-center justify-between w-full px-3 py-3 rounded-lg text-gray-400 cursor-not-allowed">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {item.badge && (
                          <span className="text-xs bg-gray-300 text-gray-500 px-1.5 py-0.5 rounded text-xs leading-tight">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium leading-tight">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  ) : (item.path === '/matches' || item.path === '/friends') ? (
                    <NotificationBadge path={item.path}>
                      <button
                        className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors duration-150 ${
                          activePath === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => handleNavClick(item.path)}
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </NotificationBadge>
                  ) : (
                    <button
                      className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-colors duration-150 ${
                        activePath === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleNavClick(item.path)}
                    >
                      <div className="flex items-center">
                        <span className="text-lg mr-3">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* プロフィール */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex flex-col items-center">
              <FaUserCircle className="text-3xl text-gray-400 mb-2" />
              <div className="text-sm font-semibold text-gray-800 mb-1">
                {profile?.name || 'ユーザー'}
              </div>
              {profile?.playRegion && (
                <div className="text-xs text-gray-500 mb-3">
                  {profile.playRegion}
                </div>
              )}
              <button
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => {
                  router.push('/profile');
                  setIsOpen(false);
                }}
              >
                プロフィール編集
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNav; 