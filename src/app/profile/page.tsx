'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreDb } from '@/utils/db';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiUsers, FiAward, FiCalendar, FiEdit, FiSave, FiXCircle, FiArrowLeft, FiTarget, FiTrendingUp, FiActivity, FiHeart, FiLock, FiCheckCircle, FiPlus, FiMinus, FiPercent, FiMapPin } from 'react-icons/fi';
import { UserProfile } from '@/types/userProfile';
import PrivacySettings from '@/components/PrivacySettings';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    position: '',
    experience: '',
    avatar: '',
    age: '',
    height: '',
    weight: '',
    playStyle: '',
    dominantHand: '',
    favoriteShots: '',
    weakShots: '',
    tacticalRole: '',
    achievements: [] as string[],
    achievementRanks: [] as string[],
    goals: [] as string[],
    bio: '',
    preferredGameType: '',
    playRegion: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy'>('profile');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        router.push('/signin');
        return;
      }

      try {
        const existingProfile = await firestoreDb.getUserProfile(user.uid);
        if (existingProfile) {
          // プロフィールが新しい形式にマイグレーションされているかチェック
          const isMigrated = await firestoreDb.isProfileMigrated(user.uid);
          if (!isMigrated) {
            // マイグレーションを実行
            await firestoreDb.migrateUserProfile(user.uid);
            // マイグレーション後の最新データを取得
            const migratedProfile = await firestoreDb.getUserProfile(user.uid);
            setProfile(migratedProfile);
            setFormData({
              name: migratedProfile?.name || '',
              team: migratedProfile?.team || '',
              position: migratedProfile?.position || '',
              experience: migratedProfile?.experience || '',
              avatar: migratedProfile?.avatar || '',
              age: migratedProfile?.age?.toString() || '',
              height: migratedProfile?.height?.toString() || '',
              weight: migratedProfile?.weight?.toString() || '',
              playStyle: migratedProfile?.playStyle || '',
              dominantHand: migratedProfile?.dominantHand || '',
              favoriteShots: migratedProfile?.favoriteShots?.join(', ') || '',
              weakShots: migratedProfile?.weakShots?.join(', ') || '',
              tacticalRole: migratedProfile?.tacticalRole || '',
              achievements: Array.isArray(migratedProfile?.achievements) ? migratedProfile.achievements : [],
              achievementRanks: Array.isArray(migratedProfile?.achievementRanks) ? migratedProfile.achievementRanks : [],
              goals: Array.isArray(migratedProfile?.goals) ? migratedProfile.goals : [],
              bio: migratedProfile?.bio || '',
              preferredGameType: migratedProfile?.preferredGameType || '',
              playRegion: migratedProfile?.playRegion || ''
            });
          } else {
            setProfile(existingProfile);
            setFormData({
              name: existingProfile.name || '',
              team: existingProfile.team || '',
              position: existingProfile.position || '',
              experience: existingProfile.experience || '',
              avatar: existingProfile.avatar || '',
              age: existingProfile.age?.toString() || '',
              height: existingProfile.height?.toString() || '',
              weight: existingProfile.weight?.toString() || '',
              playStyle: existingProfile.playStyle || '',
              dominantHand: existingProfile.dominantHand || '',
              favoriteShots: existingProfile.favoriteShots?.join(', ') || '',
              weakShots: existingProfile.weakShots?.join(', ') || '',
              tacticalRole: existingProfile.tacticalRole || '',
              achievements: Array.isArray(existingProfile.achievements) ? existingProfile.achievements : [],
              achievementRanks: Array.isArray(existingProfile.achievementRanks) ? existingProfile.achievementRanks : [],
              goals: Array.isArray(existingProfile.goals) ? existingProfile.goals : [],
              bio: existingProfile.bio || '',
              preferredGameType: existingProfile.preferredGameType || '',
              playRegion: existingProfile.playRegion || ''
            });
          }
        } else {
          // プロフィールが存在しない場合、オンボーディングページへリダイレクト
          // root.tsxでも制御しているが、直接アクセスされた場合を考慮
          router.push('/onboarding/profile');
          return;
        }
      } catch (error) {
        console.error('プロフィールの読み込みに失敗しました:', error);
        // エラー時もオンボーディングページへリダイレクト
        router.push('/onboarding/profile');
        return;
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, ''],
      achievementRanks: [...prev.achievementRanks, '']
    }));
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
      achievementRanks: prev.achievementRanks.filter((_, i) => i !== index)
    }));
  };

  const handleAchievementChange = (index: number, value: string) => {
    setFormData(prev => {
      const newAchievements = [...prev.achievements];
      newAchievements[index] = value;
      return {
        ...prev,
        achievements: newAchievements
      };
    });
  };

  const handleRankingChange = (index: number, rank: string) => {
    setFormData(prev => {
      const newRanks = [...prev.achievementRanks];
      newRanks[index] = rank;
      return {
        ...prev,
        achievementRanks: newRanks
      };
    });
  };

  const handleAddGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, '']
    }));
  };

  const handleRemoveGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const handleGoalChange = (index: number, value: string) => {
    setFormData(prev => {
      const newGoals = [...prev.goals];
      newGoals[index] = value;
      return {
        ...prev,
        goals: newGoals
      };
    });
  };

  // プロフィール入力完了率を計算
  const calculateCompletionRate = (data: typeof formData) => {
    const fields = [
      { key: 'name', weight: 10 },
      { key: 'team', weight: 5 },
      { key: 'age', weight: 5 },
      { key: 'height', weight: 5 },
      { key: 'weight', weight: 5 },
      { key: 'playStyle', weight: 8 },
      { key: 'dominantHand', weight: 8 },
      { key: 'experience', weight: 8 },
      { key: 'favoriteShots', weight: 7 },
      { key: 'weakShots', weight: 7 },
      { key: 'tacticalRole', weight: 5 },
      { key: 'preferredGameType', weight: 8 },
      { key: 'playRegion', weight: 6 },
      { key: 'bio', weight: 10 },
      { key: 'achievements', weight: 9, isArray: true },
      { key: 'goals', weight: 10, isArray: true }
    ];

    let totalWeight = 0;
    let completedWeight = 0;

    fields.forEach(field => {
      totalWeight += field.weight;
      const value = data[field.key as keyof typeof data];
      
      if (field.isArray) {
        if (Array.isArray(value) && value.length > 0 && value.some(item => item && item.trim())) {
          completedWeight += field.weight;
        }
      } else {
        if (value && String(value).trim()) {
          completedWeight += field.weight;
        }
      }
    });

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!user?.uid || !profile) return; // profileがnullの場合は保存しない

    setSaving(true);
    let avatarUrlToSave = formData.avatar;

    try {
      if (avatarFile) {
        setUploadingAvatar(true);
        avatarUrlToSave = await firestoreDb.uploadAvatar(user.uid, avatarFile);
        setUploadingAvatar(false);
      }

      // undefined値を除外してプロフィールを構築
      const updatedProfile: Partial<UserProfile> = {
        id: user.uid,
        email: user.email || '',
        name: formData.name,
        createdAt: profile.createdAt,
        avatar: avatarUrlToSave,
      };

      // 基本フィールドも値がある場合のみ追加
      if (formData.team && formData.team.trim()) {
        updatedProfile.team = formData.team;
      }
      if (formData.position && formData.position.trim()) {
        updatedProfile.position = formData.position;
      }
      if (formData.experience && formData.experience.trim()) {
        updatedProfile.experience = formData.experience;
      }

      // 新しいフィールドは値がある場合のみ追加
      if (formData.age && formData.age.trim()) {
        const ageNum = parseInt(formData.age);
        if (!isNaN(ageNum)) {
          updatedProfile.age = ageNum;
        }
      }
      if (formData.height && formData.height.trim()) {
        const heightNum = parseInt(formData.height);
        if (!isNaN(heightNum)) {
          updatedProfile.height = heightNum;
        }
      }
      if (formData.weight && formData.weight.trim()) {
        const weightNum = parseInt(formData.weight);
        if (!isNaN(weightNum)) {
          updatedProfile.weight = weightNum;
        }
      }
      if (formData.playStyle && formData.playStyle.trim()) {
        updatedProfile.playStyle = formData.playStyle as 'aggressive' | 'defensive' | 'all-round';
      }
      if (formData.dominantHand && formData.dominantHand.trim()) {
        updatedProfile.dominantHand = formData.dominantHand as 'right' | 'left';
      }
      if (formData.favoriteShots && formData.favoriteShots.trim()) {
        const shots = formData.favoriteShots.split(', ').filter(s => s.trim());
        if (shots.length > 0) {
          updatedProfile.favoriteShots = shots;
        }
      }
      if (formData.weakShots && formData.weakShots.trim()) {
        const shots = formData.weakShots.split(', ').filter(s => s.trim());
        if (shots.length > 0) {
          updatedProfile.weakShots = shots;
        }
      }
      if (formData.tacticalRole && formData.tacticalRole.trim()) {
        updatedProfile.tacticalRole = formData.tacticalRole;
      }
      if (formData.achievements && Array.isArray(formData.achievements) && formData.achievements.length > 0) {
        const filteredAchievements = formData.achievements.filter(a => a && a.trim());
        updatedProfile.achievements = filteredAchievements;
        
        // achievementRanksをachievementsの長さに合わせて調整
        if (formData.achievementRanks && Array.isArray(formData.achievementRanks)) {
          const adjustedRanks = filteredAchievements.map((_, index) => 
            formData.achievementRanks[index] || ''
          ).filter(r => r && r.trim());
          if (adjustedRanks.length > 0) {
            updatedProfile.achievementRanks = adjustedRanks;
          }
        }
      }
      if (formData.goals && Array.isArray(formData.goals) && formData.goals.length > 0) {
        updatedProfile.goals = formData.goals.filter(g => g && g.trim());
      }
      if (formData.bio && formData.bio.trim()) {
        updatedProfile.bio = formData.bio;
      }
      if (formData.preferredGameType && formData.preferredGameType.trim()) {
        updatedProfile.preferredGameType = formData.preferredGameType as 'singles' | 'doubles' | 'both';
      }
      if (formData.playRegion && formData.playRegion.trim()) {
        updatedProfile.playRegion = formData.playRegion;
      }

      // undefined値を完全に除去するヘルパー関数
      const cleanProfile = (obj: any): any => {
        const cleaned: any = {};
        Object.keys(obj).forEach(key => {
          if (obj[key] !== undefined && obj[key] !== null) {
            if (Array.isArray(obj[key])) {
              const filteredArray = obj[key].filter((item: any) => item !== undefined && item !== null && item !== '');
              if (filteredArray.length > 0) {
                cleaned[key] = filteredArray;
              }
            } else if (typeof obj[key] === 'object') {
              const cleanedObj = cleanProfile(obj[key]);
              if (Object.keys(cleanedObj).length > 0) {
                cleaned[key] = cleanedObj;
              }
            } else {
              cleaned[key] = obj[key];
            }
          }
        });
        return cleaned;
      };

      const finalProfile = cleanProfile(updatedProfile);

      await firestoreDb.saveUserProfile(finalProfile as UserProfile);
      setProfile(finalProfile as UserProfile);
      setIsEditing(false);
      setAvatarFile(null); // アップロード後ファイルをクリア

    } catch (error) {
      console.error('プロフィールの保存に失敗しました:', error);
      alert(`プロフィールの保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        team: profile.team || '',
        position: profile.position || '',
        experience: profile.experience || '',
        avatar: profile.avatar || '',
        age: profile.age?.toString() || '',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        playStyle: profile.playStyle || '',
        dominantHand: profile.dominantHand || '',
        favoriteShots: profile.favoriteShots?.join(', ') || '',
        weakShots: profile.weakShots?.join(', ') || '',
        tacticalRole: profile.tacticalRole || '',
        achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
        achievementRanks: Array.isArray(profile.achievementRanks) ? profile.achievementRanks : [],
        goals: Array.isArray(profile.goals) ? profile.goals : [],
        bio: profile.bio || '',
        preferredGameType: profile.preferredGameType || '',
        playRegion: profile.playRegion || ''
      });
    }
    setIsEditing(false);
    setAvatarFile(null);
  };

  const handlePrivacyUpdated = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  // プロフィールが読み込まれていない場合は何も表示しないか、リダイレクトを待つ
  if (!profile) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-6 sm:mb-0">
                <div className="relative mr-4">
                  <img
                    src={profile?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${profile?.name || 'A'}`}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-md"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{profile.name || '未設定'}</h1>
                  <p className="text-md text-gray-500">{profile.email}</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out"
                >
                  <FiEdit className="mr-2" />
                  プロフィールを編集
                </button>
              )}
            </div>

            {/* タブナビゲーション */}
            <div className="flex border-b border-gray-200 mt-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiUser className="inline mr-2" />
                プロフィール
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'privacy'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiLock className="inline mr-2" />
                プライバシー設定
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="p-6 sm:p-8 bg-gray-50">
              {/* プロフィール入力完了率 */}
              <div className="mb-8 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FiPercent className="w-5 h-5 mr-2" />
                    プロフィール入力完了率
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">{calculateCompletionRate(formData)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${calculateCompletionRate(formData)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {calculateCompletionRate(formData) < 50 
                    ? "もう少し詳細を入力して、より充実したプロフィールを作りましょう！" 
                    : calculateCompletionRate(formData) < 80 
                    ? "良いペースです！あと少しで完璧なプロフィールになります。" 
                    : calculateCompletionRate(formData) < 100
                    ? "素晴らしい！ほぼ完成です。最後の仕上げをしましょう。"
                    : "完璧なプロフィールが完成しました！🎉"
                  }
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名前 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">チーム</label>
                    <div className="relative">
                      <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" name="team" value={formData.team} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                    </div>
                  </div>
                  {/* アバターファイル入力フィールド */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">アバター画像</label>
                    <div className="relative flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      {uploadingAvatar && (
                        <div className="ml-4 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      )}
                    </div>
                    {avatarFile && <p className="text-xs text-gray-500 mt-1">選択中: {avatarFile.name}</p>}
                    {formData.avatar && !avatarFile && (
                      <p className="text-xs text-gray-500 mt-1">現在の画像: <a href={formData.avatar} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">表示</a></p>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="年齢を入力" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">身長 (cm)</label>
                    <div className="relative">
                      <FiTrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="身長を入力" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">体重 (kg)</label>
                    <div className="relative">
                      <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="体重を入力" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">プレイスタイル</label>
                    <div className="relative">
                      <FiTarget className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select name="playStyle" value={formData.playStyle} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                        <option value="">選択してください</option>
                        <option value="aggressive">攻撃型</option>
                        <option value="defensive">守備型</option>
                        <option value="all-round">オールラウンド</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">利き手</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select name="dominantHand" value={formData.dominantHand} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                        <option value="">選択してください</option>
                        <option value="right">右利き</option>
                        <option value="left">左利き</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">好きな試合形式</label>
                    <div className="relative">
                      <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select name="preferredGameType" value={formData.preferredGameType} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                        <option value="">選択してください</option>
                        <option value="singles">シングルス</option>
                        <option value="doubles">ダブルス</option>
                        <option value="both">両方</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">主なプレイ地域</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select name="playRegion" value={formData.playRegion} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                        <option value="">選択してください</option>
                        <option value="北海道">北海道</option>
                        <option value="青森県">青森県</option>
                        <option value="岩手県">岩手県</option>
                        <option value="宮城県">宮城県</option>
                        <option value="秋田県">秋田県</option>
                        <option value="山形県">山形県</option>
                        <option value="福島県">福島県</option>
                        <option value="茨城県">茨城県</option>
                        <option value="栃木県">栃木県</option>
                        <option value="群馬県">群馬県</option>
                        <option value="埼玉県">埼玉県</option>
                        <option value="千葉県">千葉県</option>
                        <option value="東京都">東京都</option>
                        <option value="神奈川県">神奈川県</option>
                        <option value="新潟県">新潟県</option>
                        <option value="富山県">富山県</option>
                        <option value="石川県">石川県</option>
                        <option value="福井県">福井県</option>
                        <option value="山梨県">山梨県</option>
                        <option value="長野県">長野県</option>
                        <option value="岐阜県">岐阜県</option>
                        <option value="静岡県">静岡県</option>
                        <option value="愛知県">愛知県</option>
                        <option value="三重県">三重県</option>
                        <option value="滋賀県">滋賀県</option>
                        <option value="京都府">京都府</option>
                        <option value="大阪府">大阪府</option>
                        <option value="兵庫県">兵庫県</option>
                        <option value="奈良県">奈良県</option>
                        <option value="和歌山県">和歌山県</option>
                        <option value="鳥取県">鳥取県</option>
                        <option value="島根県">島根県</option>
                        <option value="岡山県">岡山県</option>
                        <option value="広島県">広島県</option>
                        <option value="山口県">山口県</option>
                        <option value="徳島県">徳島県</option>
                        <option value="香川県">香川県</option>
                        <option value="愛媛県">愛媛県</option>
                        <option value="高知県">高知県</option>
                        <option value="福岡県">福岡県</option>
                        <option value="佐賀県">佐賀県</option>
                        <option value="長崎県">長崎県</option>
                        <option value="熊本県">熊本県</option>
                        <option value="大分県">大分県</option>
                        <option value="宮崎県">宮崎県</option>
                        <option value="鹿児島県">鹿児島県</option>
                        <option value="沖縄県">沖縄県</option>
                        <option value="海外">海外</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">経験年数</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select name="experience" value={formData.experience} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                        <option value="">選択してください</option>
                        <option value="1年未満">1年未満</option>
                        <option value="1-3年">1-3年</option>
                        <option value="3-5年">3-5年</option>
                        <option value="5-10年">5-10年</option>
                        <option value="10年以上">10年以上</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">得意ショット</label>
                    <input type="text" name="favoriteShots" value={formData.favoriteShots} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="例: スマッシュ, クリア, ドロップ" />
                    <p className="text-xs text-gray-500 mt-1">カンマ区切りで複数入力可能</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">苦手ショット</label>
                    <input type="text" name="weakShots" value={formData.weakShots} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="例: ネットショット, ハイクリア" />
                    <p className="text-xs text-gray-500 mt-1">カンマ区切りで複数入力可能</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">戦術的役割</label>
                    <input type="text" name="tacticalRole" value={formData.tacticalRole} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="例: フォア前, バック後" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">大会戦績</label>
                    <button
                      type="button"
                      onClick={handleAddAchievement}
                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FiPlus className="w-4 h-4 mr-1" />
                      戦績追加
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="text"
                          value={achievement}
                          onChange={(e) => handleAchievementChange(index, e.target.value)}
                          placeholder="大会名を入力（例：全日本選手権、県大会など）"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={formData.achievementRanks[index] || ''}
                          onChange={(e) => handleRankingChange(index, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">順位選択</option>
                          {RANKS.map((rank) => (
                            <option key={rank.value} value={rank.value}>
                              {rank.label}
                            </option>
                          ))}
                        </select>
                        {formData.achievementRanks[index] && (
                          <div className="flex items-center">
                            {getRankBadge(formData.achievementRanks[index])}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievement(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.achievements.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FiAward className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>まだ戦績が追加されていません</p>
                        <p className="text-sm">「戦績追加」ボタンから追加してください</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">目標・モチベーション</label>
                    <button
                      type="button"
                      onClick={handleAddGoal}
                      className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <FiPlus className="w-4 h-4 mr-1" />
                      目標追加
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.goals.map((goal, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => handleGoalChange(index, e.target.value)}
                          placeholder="目標を入力（例：全国大会出場、技術向上など）"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.goals.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FiTarget className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>まだ目標が追加されていません</p>
                        <p className="text-sm">「目標追加」ボタンから追加してください</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none" placeholder="自己紹介やバドミントンへの思いを入力してください"></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button onClick={handleCancel} className="flex items-center px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all">
                  <FiXCircle className="mr-2" />
                  キャンセル
                </button>
                <button onClick={handleSave} disabled={saving || uploadingAvatar || !formData.name.trim()} className="flex items-center px-5 py-2.5 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all">
                  <FiSave className="mr-2" />
                  {saving || uploadingAvatar ? '保存中...' : '変更を保存'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 border-t border-gray-200">
              {activeTab === 'profile' ? (
                // プロフィール表示部分
                <div className="space-y-8">
                  {/* 基本情報 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">基本情報</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <InfoItem icon={<FiUser />} label="名前" value={profile.name} />
                      <InfoItem icon={<FiMail />} label="メールアドレス" value={profile.email} />
                      <InfoItem icon={<FiUsers />} label="チーム" value={profile.team} />
                      <InfoItem icon={<FiCalendar />} label="登録日" value={new Date(profile.createdAt).toLocaleDateString('ja-JP')} />
                      {profile.age && <InfoItem icon={<FiUser />} label="年齢" value={`${profile.age}歳`} />}
                      {profile.height && <InfoItem icon={<FiTrendingUp />} label="身長" value={`${profile.height}cm`} />}
                      {profile.weight && <InfoItem icon={<FiActivity />} label="体重" value={`${profile.weight}kg`} />}
                    </div>
                  </div>
                  
                  {/* バドミントン情報 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">バドミントン情報</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <InfoItem icon={<FiTarget />} label="プレイスタイル" value={
                        profile.playStyle === 'aggressive' ? '攻撃型' :
                        profile.playStyle === 'defensive' ? '守備型' :
                        profile.playStyle === 'all-round' ? 'オールラウンド' : undefined
                      } />
                      <InfoItem icon={<FiUser />} label="利き手" value={
                        profile.dominantHand === 'right' ? '右利き' :
                        profile.dominantHand === 'left' ? '左利き' : undefined
                      } />
                      <InfoItem icon={<FiUsers />} label="好きな試合形式" value={
                        profile.preferredGameType === 'singles' ? 'シングルス' :
                        profile.preferredGameType === 'doubles' ? 'ダブルス' :
                        profile.preferredGameType === 'both' ? '両方' : undefined
                      } />
                      <InfoItem icon={<FiMapPin />} label="主なプレイ地域" value={profile.playRegion} />
                      <InfoItem icon={<FiCalendar />} label="経験年数" value={profile.experience} />
                      <InfoItem icon={<FiTarget />} label="戦術的役割" value={profile.tacticalRole} />
                    </div>
                  </div>
                  
                  {/* 技術情報 */}
                  {(profile.favoriteShots || profile.weakShots) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">技術情報</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {profile.favoriteShots && (
                          <InfoItem icon={<FiHeart />} label="得意ショット" value={profile.favoriteShots.join(', ')} />
                        )}
                        {profile.weakShots && (
                          <InfoItem icon={<FiTarget />} label="苦手ショット" value={profile.weakShots.join(', ')} />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 戦績・目標 */}
                  {(profile.achievements?.length || profile.goals?.length) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">戦績・目標</h3>
                      <div className="space-y-6">
                        {profile.achievements?.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-500">大会戦績</h4>
                            {profile.achievements.map((achievement, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-800">{achievement}</span>
                                {profile.achievementRanks?.[index] && (
                                  <div className="flex items-center">
                                    {getRankBadge(profile.achievementRanks[index])}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {profile.goals?.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-500">目標・モチベーション</h4>
                            <div className="space-y-2">
                              {profile.goals.map((goal, index) => (
                                <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                                  <FiTarget className="w-4 h-4 text-blue-600 mr-3 flex-shrink-0" />
                                  <span className="text-gray-800">{goal}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 自己紹介 */}
                  {profile.bio && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">自己紹介</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // プライバシー設定
                <PrivacySettings 
                  userProfile={profile} 
                  onPrivacyUpdated={handlePrivacyUpdated} 
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 h-6 w-6 text-blue-500">{icon}</div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value || '未設定'}</p>
    </div>
  </div>
);

// 順位一覧
const RANKS = [
  { value: '1', label: '優勝', color: 'bg-yellow-100 text-yellow-800' },
  { value: '2', label: '準優勝', color: 'bg-gray-100 text-gray-800' },
  { value: '3', label: '3位', color: 'bg-orange-100 text-orange-800' },
  { value: '4', label: 'ベスト4', color: 'bg-blue-100 text-blue-800' },
  { value: '8', label: 'ベスト8', color: 'bg-green-100 text-green-800' },
  { value: '16', label: 'ベスト16', color: 'bg-purple-100 text-purple-800' },
  { value: '32', label: 'ベスト32', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'other', label: 'その他', color: 'bg-gray-100 text-gray-800' }
];

// メダル取得関数
const getMedalIcon = (rank: string) => {
  switch (rank) {
    case '1':
      return '🥇';
    case '2':
      return '🥈';
    case '3':
      return '🥉';
    default:
      return null;
  }
};

// ランクバッジ表示関数
const getRankBadge = (rank: string) => {
  const rankInfo = RANKS.find(r => r.value === rank);
  if (!rankInfo) return null;
  
  const medal = getMedalIcon(rank);
  
  return (
    <div className="flex items-center space-x-2">
      {medal && <span className="text-lg">{medal}</span>}
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rankInfo.color}`}>
        {rankInfo.label}
      </span>
    </div>
  );
};


export default ProfilePage;