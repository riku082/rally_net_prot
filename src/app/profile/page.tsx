'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreDb } from '@/utils/db';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiUsers, FiAward, FiCalendar, FiEdit, FiSave, FiXCircle, FiArrowLeft, FiTarget, FiTrendingUp, FiActivity, FiHeart } from 'react-icons/fi';
import { UserProfile } from '@/types/userProfile';

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
    skillLevel: '',
    achievements: '',
    goals: '',
    bio: '',
    preferredGameType: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
              skillLevel: migratedProfile?.skillLevel || '',
              achievements: migratedProfile?.achievements?.join(', ') || '',
              goals: migratedProfile?.goals || '',
              bio: migratedProfile?.bio || '',
              preferredGameType: migratedProfile?.preferredGameType || ''
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
              skillLevel: existingProfile.skillLevel || '',
              achievements: existingProfile.achievements?.join(', ') || '',
              goals: existingProfile.goals || '',
              bio: existingProfile.bio || '',
              preferredGameType: existingProfile.preferredGameType || ''
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

      const updatedProfile: any = {
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
        updatedProfile.age = parseInt(formData.age);
      }
      if (formData.height && formData.height.trim()) {
        updatedProfile.height = parseInt(formData.height);
      }
      if (formData.weight && formData.weight.trim()) {
        updatedProfile.weight = parseInt(formData.weight);
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
      if (formData.skillLevel && formData.skillLevel.trim()) {
        updatedProfile.skillLevel = formData.skillLevel as 'beginner' | 'intermediate' | 'advanced' | 'professional';
      }
      if (formData.achievements && formData.achievements.trim()) {
        const achievements = formData.achievements.split(', ').filter(s => s.trim());
        if (achievements.length > 0) {
          updatedProfile.achievements = achievements;
        }
      }
      if (formData.goals && formData.goals.trim()) {
        updatedProfile.goals = formData.goals;
      }
      if (formData.bio && formData.bio.trim()) {
        updatedProfile.bio = formData.bio;
      }
      if (formData.preferredGameType && formData.preferredGameType.trim()) {
        updatedProfile.preferredGameType = formData.preferredGameType as 'singles' | 'doubles' | 'both';
      }

      await firestoreDb.saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
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
        skillLevel: profile.skillLevel || '',
        achievements: profile.achievements?.join(', ') || '',
        goals: profile.goals || '',
        bio: profile.bio || '',
        preferredGameType: profile.preferredGameType || ''
      });
    }
    setIsEditing(false);
    setAvatarFile(null);
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
          </div>

          {isEditing ? (
            <div className="p-6 sm:p-8 bg-gray-50">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">競技レベル</label>
                    <div className="relative">
                      <FiAward className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select name="skillLevel" value={formData.skillLevel} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                        <option value="">選択してください</option>
                        <option value="beginner">初心者</option>
                        <option value="intermediate">中級者</option>
                        <option value="advanced">上級者</option>
                        <option value="professional">プロ</option>
                      </select>
                    </div>
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">主な戦績</label>
                  <input type="text" name="achievements" value={formData.achievements} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" placeholder="例: 県大会ベスト8, 市民大会優勝" />
                  <p className="text-xs text-gray-500 mt-1">カンマ区切りで複数入力可能</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目標・モチベーション</label>
                  <textarea name="goals" value={formData.goals} onChange={handleInputChange} rows={3} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none" placeholder="バドミントンに対する目標や意気込みを入力してください"></textarea>
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
              {/* プロフィール表示部分 */}
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
                    <InfoItem icon={<FiAward />} label="競技レベル" value={
                      profile.skillLevel === 'beginner' ? '初心者' :
                      profile.skillLevel === 'intermediate' ? '中級者' :
                      profile.skillLevel === 'advanced' ? '上級者' :
                      profile.skillLevel === 'professional' ? 'プロ' : undefined
                    } />
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
                {(profile.achievements || profile.goals) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">戦績・目標</h3>
                    <div className="space-y-6">
                      {profile.achievements && (
                        <InfoItem icon={<FiAward />} label="主な戦績" value={profile.achievements.join(', ')} />
                      )}
                      {profile.goals && (
                        <InfoItem icon={<FiTarget />} label="目標・モチベーション" value={profile.goals} />
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

export default ProfilePage;