'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreDb } from '@/utils/db';

interface NotificationBadgeProps {
  path: string;
  children: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ path, children }) => {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.uid) return;

      try {
        if (path === '/matches') {
          // 試合記録ページの場合、試合リクエスト数を取得
          const matchRequests = await firestoreDb.getPendingMatchRequests(user.uid);
          setNotificationCount(matchRequests.length);
        } else if (path === '/friends') {
          // フレンドページの場合、フレンドリクエスト数を取得
          const friendRequests = await firestoreDb.getPendingFriendRequests(user.uid);
          setNotificationCount(friendRequests.length);
        }
      } catch (error) {
        console.error('通知数の取得に失敗しました:', error);
      }
    };

    loadNotifications();
    
    // 5秒ごとに通知数を更新
    const interval = setInterval(loadNotifications, 5000);
    
    return () => clearInterval(interval);
  }, [user?.uid, path]);

  return (
    <div className="relative">
      {children}
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;