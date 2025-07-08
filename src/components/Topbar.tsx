'use client';

import React, { useState } from 'react';
import { FaBell, FaCog, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { signOutUser } from '@/utils/auth';
import { useRouter } from 'next/navigation';

const Topbar: React.FC = () => {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push('/auth');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const getUserDisplayName = () => {
    if (profile?.name) {
      return profile.name;
    }
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'ユーザー';
  };

  return (
    <header className="w-full h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      <div className="text-lg font-bold text-gray-800">バドミントン解析</div>
      <div className="flex items-center space-x-6">
        <button className="text-gray-500 hover:text-blue-600 text-xl focus:outline-none">
          <FaBell />
        </button>
        <button className="text-gray-500 hover:text-blue-600 text-xl focus:outline-none">
          <FaCog />
        </button>
        
        {/* ユーザーメニュー */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 focus:outline-none"
          >
            <FaUserCircle className="text-2xl" />
            <span className="text-sm font-medium">
              {getUserDisplayName()}
            </span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                {user?.email}
              </div>
              {profile && (
                <div className="px-4 py-2 text-xs text-gray-500 border-b">
                  {profile.team && <div>チーム: {profile.team}</div>}
                  {profile.position && <div>ポジション: {profile.position}</div>}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <FaSignOutAlt className="mr-2" />
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* ドロップダウン外クリックで閉じる */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default Topbar; 