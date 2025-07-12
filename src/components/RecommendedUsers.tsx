'use client';

import React, { useState, useEffect } from 'react';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/types/userProfile';
import { getRegionDistance } from '@/utils/regionMapping';
import { FiUserPlus, FiMapPin, FiUser, FiStar, FiRefreshCw } from 'react-icons/fi';

interface RecommendedUsersProps {
  onSendRequest: (userId: string) => Promise<void>;
  onMessage: (message: { type: 'success' | 'error'; text: string }) => void;
}

const RecommendedUsers: React.FC<RecommendedUsersProps> = ({ onSendRequest, onMessage }) => {
  const { user } = useAuth();
  const [recommendedUsers, setRecommendedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentUserRegion, setCurrentUserRegion] = useState<string>('');

  const loadRecommendedUsers = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const currentUserProfile = await firestoreDb.getUserProfile(user.uid);
      if (currentUserProfile?.playRegion) {
        setCurrentUserRegion(currentUserProfile.playRegion);
      }
      
      // 既存のフレンドシップ情報を取得
      const [users, acceptedFriendships, pendingRequests, sentRequests] = await Promise.all([
        firestoreDb.getRecommendedUsersByRegion(user.uid, 20), // 多めに取得してフィルタリング
        firestoreDb.getAcceptedFriendships(user.uid),
        firestoreDb.getPendingFriendRequests(user.uid),
        firestoreDb.getSentFriendRequests(user.uid)
      ]);
      
      // 既にフレンド済み、リクエスト済みのユーザーを除外
      const filteredUsers = users.filter(profile => 
        !acceptedFriendships.some(friendship => 
          friendship.fromUserId === profile.id || friendship.toUserId === profile.id
        ) &&
        !pendingRequests.some(req => req.fromUserId === profile.id) &&
        !sentRequests.some(req => req.toUserId === profile.id)
      ).slice(0, 10); // 最終的に10人まで
      
      setRecommendedUsers(filteredUsers);
      setHasSearched(true);
      
      if (filteredUsers.length === 0) {
        if (!currentUserProfile?.playRegion) {
          onMessage({ 
            type: 'error', 
            text: 'プロフィールで地域を設定してからお試しください。' 
          });
        } else {
          onMessage({ 
            type: 'error', 
            text: 'あなたの地域や近隣地域には他のユーザーがいないようです。' 
          });
        }
      }
    } catch (error) {
      console.error('おすすめユーザーの取得に失敗しました:', error);
      onMessage({ type: 'error', text: 'おすすめユーザーの取得に失敗しました。' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendedUsers();
  }, [user?.uid]);

  const handleSendRequest = async (userId: string) => {
    try {
      await onSendRequest(userId);
      // リクエスト送信後、そのユーザーを一覧から削除
      setRecommendedUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      // エラーはonSendRequestで処理される
    }
  };

  const getRecommendationReason = (recommendedUser: UserProfile) => {
    const reasons: string[] = [];
    
    // 地域距離を計算
    if (currentUserRegion && recommendedUser.playRegion) {
      const distance = getRegionDistance(currentUserRegion, recommendedUser.playRegion);
      if (distance === 0) {
        reasons.push('同じ地域');
      } else if (distance === 1) {
        reasons.push('隣接地域');
      } else if (distance <= 3) {
        reasons.push('近隣地域');
      } else {
        reasons.push('遠方地域');
      }
    }
    
    // MBTI類似度をチェック（currentUserRegionが設定されている場合、現在のユーザー情報も取得済み）
    if (currentUserRegion) {
      // ここでは簡略化してlocalStorageから取得（実際の実装では適切な方法を使用）
      const currentUserMbti = localStorage.getItem('currentUserMbti');
      const currentUserPlayStyle = localStorage.getItem('currentUserPlayStyle');
      
      if (currentUserMbti && recommendedUser.mbtiResult && 
          currentUserMbti === recommendedUser.mbtiResult) {
        reasons.push(`同じMBTI (${recommendedUser.mbtiResult})`);
      }
      
      if (currentUserPlayStyle && recommendedUser.playStyle && 
          currentUserPlayStyle === recommendedUser.playStyle) {
        const styleNames = {
          'aggressive': 'アグレッシブ',
          'defensive': 'ディフェンシブ',
          'all-round': 'オールラウンド'
        };
        reasons.push(`同じプレイスタイル (${styleNames[recommendedUser.playStyle]})`);
      }
    }
    
    return reasons.join(' • ');
  };

  if (!hasSearched && !loading) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center whitespace-nowrap">
          <FiMapPin className="mr-1 sm:mr-2 text-blue-600 flex-shrink-0" />
          <span className="whitespace-nowrap">地域のおすすめユーザー</span>
        </h3>
        <button
          onClick={loadRecommendedUsers}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          更新
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">おすすめユーザーを探しています...</span>
        </div>
      ) : recommendedUsers.length === 0 ? (
        <div className="text-center py-8">
          <FiUser className="mx-auto text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500">おすすめのユーザーが見つかりませんでした。</p>
          <p className="text-sm text-gray-400 mt-2">
            プロフィールで地域を設定するか、後でもう一度お試しください。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            {recommendedUsers.length > 0 && currentUserRegion && (
              <>
                {recommendedUsers.some(u => u.playRegion === currentUserRegion) 
                  ? `あなたの地域(${currentUserRegion})から ${recommendedUsers.filter(u => u.playRegion === currentUserRegion).length} 人のユーザーが見つかりました`
                  : `あなたの地域(${currentUserRegion})にはユーザーがいないため、近隣地域から ${recommendedUsers.length} 人のユーザーを表示しています`
                }
              </>
            )}
          </p>
          {recommendedUsers.map((recommendedUser) => (
            <div
              key={recommendedUser.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow space-y-3 sm:space-y-0"
            >
              <div className="flex items-start sm:items-center flex-grow">
                <img
                  src={recommendedUser.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${recommendedUser.name || 'A'}`}
                  alt="Avatar"
                  className="w-12 h-12 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4 border-2 border-white shadow-sm flex-shrink-0"
                />
                <div className="flex-grow min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-1">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate mr-0 sm:mr-2">
                      {recommendedUser.name || '名無し'}
                    </p>
                    {recommendedUser.mbtiResult && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium inline-block mt-1 sm:mt-0 self-start">
                        {recommendedUser.mbtiResult}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center mb-1">
                    <FiMapPin className="mr-1 flex-shrink-0" />
                    <span className="truncate">{recommendedUser.playRegion || '地域未設定'}</span>
                  </p>
                  {recommendedUser.bio && (
                    <p className="text-xs sm:text-sm text-gray-500 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {recommendedUser.bio}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 flex items-center mt-1 sm:mt-2">
                    <FiStar className="mr-1 flex-shrink-0" />
                    <span className="truncate">{getRecommendationReason(recommendedUser)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(recommendedUser.id)}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm font-medium shadow-sm w-full sm:w-auto sm:ml-4"
              >
                <FiUserPlus className="mr-1 sm:mr-2" />
                <span className="whitespace-nowrap">フレンド申請</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedUsers;