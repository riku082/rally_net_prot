'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types/userProfile';
import { Practice, PracticeStats } from '@/types/practice';
import { MBTIResult } from '@/types/mbti';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { 
  FiX, 
  FiUser, 
  FiMapPin, 
  FiActivity, 
  FiCalendar,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiEye,
  FiEyeOff,
  FiZap
} from 'react-icons/fi';

interface FriendDetailModalProps {
  friend: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

const FriendDetailModal: React.FC<FriendDetailModalProps> = ({ friend, isOpen, onClose }) => {
  const { user } = useAuth();
  const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(null);
  const [recentPractices, setRecentPractices] = useState<Practice[]>([]);
  const [mbtiResult, setMbtiResult] = useState<MBTIResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && friend.id) {
      loadFriendData();
    }
  }, [isOpen, friend.id]);

  const loadFriendData = async () => {
    setLoading(true);
    try {
      // プライバシー設定をチェック
      const canViewStats = friend.privacySettings?.statsPublic || friend.privacySettings?.allowFriendView;
      const canViewAnalysis = friend.privacySettings?.analysisPublic || friend.privacySettings?.allowFriendView;

      // 練習統計を取得
      if (canViewStats) {
        const stats = await firestoreDb.getPracticeStats(friend.id);
        setPracticeStats(stats);

        // 最近の練習を取得
        const practices = await firestoreDb.getPractices(friend.id);
        const sortedPractices = practices
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentPractices(sortedPractices);
      }

      // MBTI結果を取得
      if (canViewAnalysis) {
        const mbti = await firestoreDb.getMBTIResult(friend.id);
        setMbtiResult(mbti);
      }
    } catch (error) {
      console.error('フレンドデータの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlayStyleName = (style: string) => {
    const styles = {
      'aggressive': 'アグレッシブ',
      'defensive': 'ディフェンシブ',
      'all-round': 'オールラウンド'
    };
    return styles[style as keyof typeof styles] || style;
  };

  const getGameTypeName = (type: string) => {
    const types = {
      'singles': 'シングルス',
      'doubles': 'ダブルス',
      'both': '両方'
    };
    return types[type as keyof typeof types] || type;
  };

  const canViewContent = () => {
    return friend.privacySettings?.profilePublic || 
           friend.privacySettings?.allowFriendView ||
           !friend.privacySettings; // プライバシー設定がない場合はデフォルトで公開
  };

  const canViewStats = () => {
    return friend.privacySettings?.statsPublic || 
           friend.privacySettings?.allowFriendView ||
           !friend.privacySettings;
  };

  const canViewAnalysis = () => {
    return friend.privacySettings?.analysisPublic || 
           friend.privacySettings?.allowFriendView ||
           !friend.privacySettings;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">フレンド詳細</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.location.href = `/user/${friend.id}`}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              title="プロフィールページを開く"
            >
              <FiEye className="mr-2 w-4 h-4" />
              詳細ページ
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-theme-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* プロフィール基本情報 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center space-x-6">
                <img
                  src={friend.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${friend.name || 'A'}`}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{friend.name || '名無し'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {canViewContent() ? (
                      <>
                        {friend.playRegion && (
                          <div className="flex items-center text-gray-600">
                            <FiMapPin className="mr-2" />
                            {friend.playRegion}
                          </div>
                        )}
                        {friend.age && (
                          <div className="flex items-center text-gray-600">
                            <FiUser className="mr-2" />
                            {friend.age}歳
                          </div>
                        )}
                        {friend.playStyle && (
                          <div className="flex items-center text-gray-600">
                            <FiActivity className="mr-2" />
                            {getPlayStyleName(friend.playStyle)}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <FiEyeOff className="mr-2" />
                        プロフィールは非公開です
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {canViewContent() && friend.bio && (
                <div className="mt-4 p-4 bg-white rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">自己紹介</h4>
                  <p className="text-gray-600">{friend.bio}</p>
                </div>
              )}
            </div>

            {/* BPSI診断結果 */}
            {canViewAnalysis() && friend.mbtiResult && (
              <div className="bg-white border rounded-xl p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiZap className="mr-2 text-purple-600" />
                  BPSI診断結果
                </h4>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                      <span className="text-2xl font-bold text-purple-700">{friend.mbtiResult}</span>
                    </div>
                    {friend.mbtiCompletedAt && (
                      <p className="text-sm text-gray-500">
                        {new Date(friend.mbtiCompletedAt).toLocaleDateString('ja-JP')} 診断完了
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* バドミントン詳細情報 */}
            {canViewContent() && (
              <div className="bg-white border rounded-xl p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiTarget className="mr-2 text-green-600" />
                  バドミントン情報
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">基本情報</h5>
                    <div className="space-y-2 text-sm">
                      {friend.experience && (
                        <p><span className="text-gray-500">経験:</span> {friend.experience}</p>
                      )}
                      {friend.preferredGameType && (
                        <p><span className="text-gray-500">好きな形式:</span> {getGameTypeName(friend.preferredGameType)}</p>
                      )}
                      {friend.dominantHand && (
                        <p><span className="text-gray-500">利き手:</span> {friend.dominantHand === 'right' ? '右' : '左'}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">技術・戦績</h5>
                    <div className="space-y-2 text-sm">
                      {friend.favoriteShots && friend.favoriteShots.length > 0 && (
                        <p><span className="text-gray-500">得意ショット:</span> {friend.favoriteShots.join(', ')}</p>
                      )}
                      {friend.achievements && friend.achievements.length > 0 && (
                        <p><span className="text-gray-500">主な戦績:</span> {friend.achievements.slice(0, 2).join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 練習統計 */}
            {canViewStats() && practiceStats && (
              <div className="bg-white border rounded-xl p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiTrendingUp className="mr-2 text-blue-600" />
                  練習統計
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{practiceStats.totalPractices}</div>
                    <div className="text-sm text-gray-600">総練習回数</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{Math.round(practiceStats.averageDuration)}</div>
                    <div className="text-sm text-gray-600">平均練習時間(分)</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{practiceStats.currentStreak}</div>
                    <div className="text-sm text-gray-600">連続練習日数</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{practiceStats.longestStreak}</div>
                    <div className="text-sm text-gray-600">最長連続日数</div>
                  </div>
                </div>
              </div>
            )}

            {/* 最近の練習 */}
            {canViewStats() && recentPractices.length > 0 && (
              <div className="bg-white border rounded-xl p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiCalendar className="mr-2 text-indigo-600" />
                  最近の練習
                </h4>
                <div className="space-y-3">
                  {recentPractices.map((practice) => (
                    <div key={practice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-800">{practice.type}</p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <FiClock className="mr-1" />
                            {practice.duration}分
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">{practice.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* プライバシー制限の表示 */}
            {!canViewStats() && !canViewAnalysis() && (
              <div className="bg-gray-50 border rounded-xl p-6 text-center">
                <FiEyeOff className="mx-auto text-4xl text-gray-400 mb-3" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">詳細情報は非公開です</h4>
                <p className="text-sm text-gray-500">
                  このユーザーは練習データやMBTI診断結果を非公開に設定しています。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendDetailModal;