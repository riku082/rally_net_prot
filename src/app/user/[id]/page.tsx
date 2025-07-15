'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import AuthGuard from '@/components/AuthGuard';
import { UserProfile } from '@/types/userProfile';
import { Practice, PracticeStats } from '@/types/practice';
import { MBTIResult, MBTIType } from '@/types/mbti';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { badmintonMBTITypes } from '@/data/badmintonMBTITypes';
import AchievementBadges, { Achievement } from '@/components/AchievementBadges';
import MatchResultsDisplay, { MatchResult } from '@/components/MatchResultsDisplay';
import { 
  FiArrowLeft,
  FiUser, 
  FiMapPin, 
  FiActivity, 
  FiCalendar,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiEye,
  FiEyeOff,
  FiZap,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiTrash2
} from 'react-icons/fi';

const UserProfilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const userId = params.id as string;
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [practiceStats, setPracticeStats] = useState<PracticeStats | null>(null);
  const [recentPractices, setRecentPractices] = useState<Practice[]>([]);
  const [mbtiResult, setMbtiResult] = useState<MBTIResult | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted' | 'declined'>('none');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);

  // MBTI結果を取得する関数
  const loadMBTIResult = async (userId: string) => {
    try {
      const { db } = await import('@/utils/firebase');
      const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
      
      const mbtiCollection = collection(db, 'mbtiResults');
      const q = query(
        mbtiCollection,
        where('userId', '==', userId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        setMbtiResult({ id: doc.id, ...data } as MBTIResult);
      }
    } catch (error) {
      console.error('MBTI結果の読み込みエラー:', error);
    }
  };

  // プロフィールの主な戦績から実績メダルを生成する関数
  const generateAchievementsFromProfile = (profileAchievements: string[], achievementRanks?: string[]): Achievement[] => {
    const achievements: Achievement[] = [];
    
    // 戦績テキストを解析してメダルを生成
    profileAchievements.forEach((achievement, index) => {
      const lowerAchievement = achievement.toLowerCase();
      const rank = achievementRanks && achievementRanks[index] ? achievementRanks[index] : null;
      let type: Achievement['type'] = 'bronze';
      let category: Achievement['category'] = 'tournament';
      let description = `${achievement}の成績を収めました`;
      
      // まず順位情報でメダル判定を行う（achievementRanksが存在する場合）
      if (rank) {
        switch (rank) {
          case '1':
            if (lowerAchievement.includes('全国') || lowerAchievement.includes('国際') || lowerAchievement.includes('世界')) {
              type = 'special';
              description = `${achievement}で優勝！素晴らしい成果です`;
            } else {
              type = 'gold';
              description = `${achievement}で優勝しました`;
            }
            break;
          case '2':
            if (lowerAchievement.includes('全国') || lowerAchievement.includes('国際') || lowerAchievement.includes('世界')) {
              type = 'special';
              description = `${achievement}で準優勝！大変優秀な成績です`;
            } else {
              type = 'silver';
              description = `${achievement}で準優勝しました`;
            }
            break;
          case '3':
            type = 'silver';
            description = `${achievement}で3位入賞しました`;
            break;
          case '4':
            type = 'silver';
            description = `${achievement}でベスト4の成績を残しました`;
            break;
          case '8':
            type = 'bronze';
            description = `${achievement}でベスト8に進出しました`;
            break;
          case '16':
          case '32':
            type = 'bronze';
            description = `${achievement}で上位進出を果たしました`;
            break;
          case 'other':
            type = 'bronze';
            description = `${achievement}に参加しました`;
            break;
          default:
            // 順位情報が不明な場合は、従来のテキスト解析にフォールバック
            type = 'bronze';
            break;
        }
      } else {
        // 従来のテキスト解析による判定（順位情報がない場合）
        if (lowerAchievement.includes('優勝') || lowerAchievement.includes('1位') || lowerAchievement.includes('チャンピオン')) {
          if (lowerAchievement.includes('全国') || lowerAchievement.includes('国際') || lowerAchievement.includes('世界')) {
            type = 'special';
            description = `${achievement}！素晴らしい成果です`;
          } else if (lowerAchievement.includes('県') || lowerAchievement.includes('都道府県') || lowerAchievement.includes('地方')) {
            type = 'gold';
            description = `${achievement}を達成しました`;
          } else {
            type = 'gold';
            description = `${achievement}を獲得しました`;
          }
        } else if (lowerAchievement.includes('準優勝') || lowerAchievement.includes('2位') || lowerAchievement.includes('ファイナリスト')) {
          if (lowerAchievement.includes('全国') || lowerAchievement.includes('国際')) {
            type = 'special';
            description = `${achievement}！大変優秀な成績です`;
          } else {
            type = 'silver';
            description = `${achievement}を獲得しました`;
          }
        } else if (lowerAchievement.includes('3位') || lowerAchievement.includes('ベスト4') || lowerAchievement.includes('準決勝')) {
          type = 'silver';
          description = `${achievement}の成績を残しました`;
        } else if (lowerAchievement.includes('ベスト8') || lowerAchievement.includes('8強') || lowerAchievement.includes('入賞')) {
          type = 'bronze';
          description = `${achievement}を達成しました`;
        } else if (lowerAchievement.includes('出場') || lowerAchievement.includes('参加')) {
          type = 'bronze';
          category = 'milestone';
          description = `${achievement}を果たしました`;
        }
      }

      // カテゴリの判定
      if (lowerAchievement.includes('大会') || lowerAchievement.includes('選手権') || lowerAchievement.includes('トーナメント')) {
        category = 'tournament';
      } else if (lowerAchievement.includes('級') || lowerAchievement.includes('段') || lowerAchievement.includes('認定')) {
        category = 'skill';
      } else if (lowerAchievement.includes('記録') || lowerAchievement.includes('達成')) {
        category = 'milestone';
      }

      // 日付の推定（実際の実装では正確な日付を保存すべき）
      const earnedDate = new Date();
      earnedDate.setMonth(earnedDate.getMonth() - (index + 1) * 2); // 2ヶ月ずつ前の日付を設定

      achievements.push({
        id: `profile-achievement-${index + 1}`,
        title: achievement.length > 20 ? achievement.substring(0, 20) + '...' : achievement,
        description: description,
        type: type,
        earnedAt: earnedDate.toISOString().split('T')[0],
        category: category
      });
    });

    return achievements.sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime());
  };

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      checkFriendshipStatus();
    }
  }, [userId, user?.uid]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      // ユーザープロフィールを取得
      const profile = await firestoreDb.getUserProfile(userId);
      if (!profile) {
        setError('ユーザーが見つかりません。');
        return;
      }
      setUserProfile(profile);

      // プロフィールの主な戦績から実績メダルを生成（基本情報が表示可能な場合）
      const canViewProfile = profile.privacySettings?.profilePublic || profile.privacySettings?.allowFriendView || !profile.privacySettings;
      if (canViewProfile && profile.achievements && profile.achievements.length > 0) {
        const generatedAchievements = generateAchievementsFromProfile(profile.achievements, profile.achievementRanks);
        setAchievements(generatedAchievements);
      }

      // プライバシー設定をチェック
      const canViewStats = profile.privacySettings?.statsPublic || profile.privacySettings?.allowFriendView;
      const canViewAnalysis = profile.privacySettings?.analysisPublic || profile.privacySettings?.allowFriendView;

      // 練習統計を取得
      if (canViewStats) {
        const stats = await firestoreDb.getPracticeStats(userId);
        setPracticeStats(stats);

        // 最近の練習を取得
        const practices = await firestoreDb.getPractices(userId);
        const sortedPractices = practices
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentPractices(sortedPractices);
      }

      // MBTI結果を取得 - userProfilesから同期済みデータを確認し、なければmbtiResultsから直接取得
      if (canViewAnalysis) {
        const mbti = await firestoreDb.getMBTIResult(userId);
        if (mbti) {
          setMbtiResult(mbti);
        } else {
          // userProfilesに結果がない場合は、mbtiResultsから直接取得して同期
          await loadMBTIResult(userId);
          // 同期処理を実行してuserProfilesも更新
          try {
            const syncResponse = await fetch('/api/mbti/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
            });
            if (syncResponse.ok) {
              console.log('🔧 MBTI data synchronized for user:', userId);
            }
          } catch (syncError) {
            console.warn('MBTI同期に失敗しましたが、表示は継続します:', syncError);
          }
        }
      }

      // 実績と試合結果を取得（公開設定または友達の場合）
      if (canViewStats) {
        // 試合結果機能は現在Coming Soon状態のため、データを設定しない
        // TODO: 将来的にFirestoreから試合結果を取得する実装を追加
        setMatchResults([]);
      }
    } catch (error) {
      console.error('ユーザープロフィールの取得に失敗しました:', error);
      setError('プロフィールの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const checkFriendshipStatus = async () => {
    if (!user?.uid || userId === user.uid) return;

    try {
      // 承認済みフレンドシップをチェック
      const acceptedFriendships = await firestoreDb.getAcceptedFriendships(user.uid);
      const acceptedFriendship = acceptedFriendships.find(f => 
        f.fromUserId === userId || f.toUserId === userId
      );
      
      if (acceptedFriendship) {
        setFriendshipStatus('accepted');
        setFriendshipId(acceptedFriendship.id);
        return;
      }

      // 保留中リクエストをチェック
      const pendingRequests = await firestoreDb.getPendingFriendRequests(user.uid);
      const hasPendingRequest = pendingRequests.some(r => r.fromUserId === userId);
      
      if (hasPendingRequest) {
        setFriendshipStatus('pending');
        return;
      }

      setFriendshipStatus('none');
    } catch (error) {
      console.error('フレンドシップ状態の確認に失敗しました:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!user?.uid || !userId) return;

    try {
      await firestoreDb.sendFriendRequest(user.uid, userId);
      setFriendshipStatus('pending');
    } catch (error) {
      console.error('フレンドリクエストの送信に失敗しました:', error);
    }
  };

  const handleDeleteFriendship = async () => {
    if (!friendshipId) return;
    
    if (!window.confirm('このフレンドを削除してもよろしいですか？')) return;
    
    try {
      await firestoreDb.deleteFriendship(friendshipId);
      setFriendshipStatus('none');
      setFriendshipId(null);
    } catch (error) {
      console.error('フレンド削除に失敗しました:', error);
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
    if (!userProfile) return false;
    return userProfile.privacySettings?.profilePublic || 
           userProfile.privacySettings?.allowFriendView ||
           !userProfile.privacySettings ||
           friendshipStatus === 'accepted';
  };

  const canViewStats = () => {
    if (!userProfile) return false;
    return userProfile.privacySettings?.statsPublic || 
           userProfile.privacySettings?.allowFriendView ||
           !userProfile.privacySettings ||
           friendshipStatus === 'accepted';
  };

  const canViewAnalysis = () => {
    if (!userProfile) return false;
    return userProfile.privacySettings?.analysisPublic || 
           userProfile.privacySettings?.allowFriendView ||
           !userProfile.privacySettings ||
           friendshipStatus === 'accepted';
  };

  const renderFriendButton = () => {
    if (!user?.uid || userId === user.uid) return null;

    switch (friendshipStatus) {
      case 'accepted':
        return (
          <div className="flex items-center space-x-2">
            <div className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <FiUserCheck className="mr-2" />
              フレンド
            </div>
            <button
              onClick={handleDeleteFriendship}
              className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              title="フレンドを削除"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
            <FiClock className="mr-2" />
            リクエスト送信済み
          </div>
        );
      case 'declined':
        return (
          <div className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg">
            <FiUserX className="mr-2" />
            リクエスト拒否済み
          </div>
        );
      default:
        return (
          <button
            onClick={handleSendFriendRequest}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiUserPlus className="mr-2" />
            フレンド申請
          </button>
        );
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar activePath="/friends" />
          <MobileNav activePath="/friends" />
          <div className="flex-1 flex flex-col">
            <Topbar />
            <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !userProfile) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar activePath="/friends" />
          <MobileNav activePath="/friends" />
          <div className="flex-1 flex flex-col">
            <Topbar />
            <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
              <div className="text-center">
                <FiEyeOff className="mx-auto text-6xl text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ユーザーが見つかりません</h2>
                <p className="text-gray-600 mb-4">{error || 'このユーザーは存在しないか、プロフィールが非公開です。'}</p>
                <button
                  onClick={() => router.back()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <FiArrowLeft className="mr-2" />
                  戻る
                </button>
              </div>
            </main>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar activePath="/friends" />
        <MobileNav activePath="/friends" />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-3 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center">
                  <button
                    onClick={() => router.back()}
                    className="mr-2 sm:mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">プロフィール</h1>
                </div>
                <div className="flex-shrink-0">
                  {renderFriendButton()}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* プロフィール基本情報 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 sm:space-y-6 md:space-y-0 md:space-x-8">
                    <img
                      src={userProfile.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${userProfile.name || 'A'}`}
                      alt="Avatar"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="flex-grow text-center md:text-left">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">{userProfile.name || '名無し'}</h2>
                      <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                        {canViewContent() ? (
                          <>
                            {userProfile.playRegion && (
                              <div className="flex items-center justify-center md:justify-start text-gray-600">
                                <FiMapPin className="mr-2" />
                                {userProfile.playRegion}
                              </div>
                            )}
                            {userProfile.age && (
                              <div className="flex items-center justify-center md:justify-start text-gray-600">
                                <FiUser className="mr-2" />
                                {userProfile.age}歳
                              </div>
                            )}
                            {userProfile.playStyle && (
                              <div className="flex items-center justify-center md:justify-start text-gray-600">
                                <FiActivity className="mr-2" />
                                {getPlayStyleName(userProfile.playStyle)}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="col-span-2 flex items-center justify-center text-gray-500">
                            <FiEyeOff className="mr-2" />
                            プロフィールは非公開です
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {canViewContent() && userProfile.bio && (
                    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3">自己紹介</h3>
                      <p className="text-gray-600">{userProfile.bio}</p>
                    </div>
                  )}
                </div>

                {/* BPSI診断結果 */}
                {canViewAnalysis() && mbtiResult && (
                  <div className="bg-white border rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FiActivity className="mr-2 text-purple-600" />
                      BPSI診断結果
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-lg border border-blue-200">
                      {(() => {
                        const mbtiData = badmintonMBTITypes[mbtiResult.result as MBTIType];
                        if (!mbtiData) {
                          // フォールバック表示
                          return (
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                  <span className="text-3xl font-bold text-purple-700">{mbtiResult.result}</span>
                                </div>
                                {mbtiResult.createdAt && (
                                  <p className="text-sm text-gray-500">
                                    {new Date(mbtiResult.createdAt).toLocaleDateString('ja-JP')} 診断完了
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 leading-tight">{mbtiData.title}</h4>
                                <div className="text-2xl sm:text-3xl lg:text-4xl">🧠</div>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600">タイプ: {mbtiResult.result}</p>
                              {mbtiResult.createdAt && (
                                <p className="text-xs text-gray-500">
                                  診断日時: {new Date(mbtiResult.createdAt).toLocaleDateString('ja-JP')}
                                </p>
                              )}
                            </div>
                            
                            <p className="text-xs sm:text-sm lg:text-base text-gray-700 leading-relaxed">{mbtiData.description}</p>
                            
                            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
                              <div className="bg-green-50 p-3 rounded-lg">
                                <h5 className="font-semibold text-green-700 mb-2 text-xs sm:text-sm">🌟 強み</h5>
                                <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                                  {mbtiData.strengths.slice(0, 3).map((strength, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-green-500 mr-1 flex-shrink-0 text-xs">•</span>
                                      <span className="break-words leading-relaxed">{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-lg">
                                <h5 className="font-semibold text-orange-700 mb-2 text-xs sm:text-sm">⚠️ 注意点</h5>
                                <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                                  {mbtiData.weaknesses.slice(0, 3).map((weakness, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-orange-500 mr-1 flex-shrink-0 text-xs">•</span>
                                      <span className="break-words leading-relaxed">{weakness}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h5 className="font-semibold text-blue-700 mb-2 text-xs sm:text-sm">🎯 プレースタイル</h5>
                              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
                                {mbtiData.playStyle}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* バドミントン詳細情報 */}
                {canViewContent() && (
                  <div className="bg-white border rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FiTarget className="mr-2 text-green-600" />
                      バドミントン情報
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">基本情報</h4>
                        <div className="space-y-3 text-sm">
                          {userProfile.experience && (
                            <p><span className="text-gray-500">経験:</span> {userProfile.experience}</p>
                          )}
                          {userProfile.preferredGameType && (
                            <p><span className="text-gray-500">好きな形式:</span> {getGameTypeName(userProfile.preferredGameType)}</p>
                          )}
                          {userProfile.dominantHand && (
                            <p><span className="text-gray-500">利き手:</span> {userProfile.dominantHand === 'right' ? '右' : '左'}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">技術・戦績</h4>
                        <div className="space-y-3 text-sm">
                          {userProfile.favoriteShots && userProfile.favoriteShots.length > 0 && (
                            <p><span className="text-gray-500">得意ショット:</span> <span className="break-words">{userProfile.favoriteShots.join(', ')}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 練習統計 */}
                {canViewStats() && practiceStats && (
                  <div className="bg-white border rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FiTrendingUp className="mr-2 text-blue-600" />
                      練習統計
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 lg:p-6 bg-blue-50 rounded-lg">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{practiceStats.totalPractices}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">総練習回数</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 lg:p-6 bg-green-50 rounded-lg">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{Math.round(practiceStats.averageDuration)}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">平均練習時間(分)</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 lg:p-6 bg-purple-50 rounded-lg">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{practiceStats.currentStreak}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">連続練習日数</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 lg:p-6 bg-orange-50 rounded-lg">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{practiceStats.longestStreak}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">最長連続日数</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 実績バッジ */}
                {canViewContent() && userProfile.achievements && userProfile.achievements.length > 0 && (
                  <div className="bg-white border rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FiTarget className="mr-2 text-yellow-600" />
                      実績・メダル
                    </h3>
                    <AchievementBadges 
                      achievements={achievements}
                      maxDisplay={6}
                      showDetails={true}
                    />
                  </div>
                )}

                {/* 試合戦績 */}
                {canViewStats() && (
                  <div className="bg-white border rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FiActivity className="mr-2 text-green-600" />
                      試合戦績
                    </h3>
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-4xl sm:text-5xl lg:text-6xl text-gray-300 mb-4">🏸</div>
                      <h4 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">Coming Soon</h4>
                      <p className="text-sm sm:text-base text-gray-500">試合戦績機能は現在開発中です</p>
                    </div>
                  </div>
                )}

                {/* 最近の練習 */}
                {canViewStats() && recentPractices.length > 0 && (
                  <div className="bg-white border rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <FiCalendar className="mr-2 text-indigo-600" />
                      最近の練習
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {recentPractices.map((practice) => (
                        <div key={practice.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0"></div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{practice.type}</p>
                              <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                                <FiClock className="mr-1 flex-shrink-0" />
                                {practice.duration}分
                              </p>
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 pl-6 sm:pl-0">{practice.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* プライバシー制限の表示 */}
                {!canViewStats() && !canViewAnalysis() && (
                  <div className="bg-gray-50 border rounded-xl p-6 sm:p-8 text-center">
                    <FiEyeOff className="mx-auto text-4xl sm:text-5xl lg:text-6xl text-gray-400 mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">詳細情報は非公開です</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      このユーザーは練習データ、実績、試合戦績、MBTI診断結果を非公開に設定しています。
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default UserProfilePage;