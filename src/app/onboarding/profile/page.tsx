'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreDb } from '@/utils/db';
import { useRouter } from 'next/navigation';
import { FiUser, FiUsers, FiAward, FiCalendar, FiSave, FiMail, FiLock } from 'react-icons/fi';
import { UserProfile } from '@/types/userProfile';
import { linkAnonymousWithEmail } from '@/utils/auth';

const OnboardingProfilePage: React.FC = () => {
  const { user, setProfileDirectly } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    position: '',
    experience: '',
    avatar: '',
    email: '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isAnonymousUser, setIsAnonymousUser] = useState(false);

  useEffect(() => {
    // 新規作成ページなので、ユーザーが認証済みであれば読み込み完了
    if (user) {
      setIsAnonymousUser(user.isAnonymous);
      setLoading(false);
      // 既にプロフィールが存在する場合はダッシュボードへリダイレクト
      // （root.tsxで制御されるが、念のためここでもチェック）
      const checkProfile = async () => {
        const existingProfile = await firestoreDb.getUserProfile(user.uid);
        if (existingProfile) {
          router.push('/');
        }
      };
      checkProfile();
    } else {
      // ユーザーが認証されていない場合は認証ページへ
      router.push('/auth');
    }
  }, [user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!user?.uid) {
      console.error('User is not authenticated');
      alert('ユーザー認証が確認できません。再度ログインしてください。');
      return;
    }

    if (!formData.name.trim()) {
      alert('名前を入力してください。');
      return;
    }

    // 匿名ユーザーの場合はメールアドレスとパスワードが必要
    if (isAnonymousUser) {
      if (!formData.email.trim() || !formData.password.trim()) {
        alert('メールアドレスとパスワードを入力してください。');
        return;
      }
      if (formData.password.length < 6) {
        alert('パスワードは6文字以上で入力してください。');
        return;
      }
    }

    console.log('Starting profile creation for user:', user.uid, 'isAnonymous:', user.isAnonymous);
    setSaving(true);
    let avatarUrlToSave = formData.avatar;

    try {
      // 匿名ユーザーの場合、まずアカウントをアップグレード
      if (isAnonymousUser) {
        console.log('Upgrading anonymous account to email account...');
        const { user: upgradedUser, error: linkError } = await linkAnonymousWithEmail(
          formData.email.trim(), 
          formData.password
        );
        
        if (linkError) {
          alert(`アカウントの作成に失敗しました: ${linkError}`);
          return;
        }
        
        if (!upgradedUser) {
          alert('アカウントのアップグレードに失敗しました。');
          return;
        }
        
        console.log('Account upgraded successfully');
      }

      if (avatarFile) {
        setUploadingAvatar(true);
        avatarUrlToSave = await firestoreDb.uploadAvatar(user.uid, avatarFile);
        setUploadingAvatar(false);
      }

      const newProfile: UserProfile = {
        id: user.uid,
        email: isAnonymousUser ? formData.email.trim() : (user.email || ''),
        name: formData.name.trim(),
        team: formData.team || undefined,
        position: formData.position || undefined,
        experience: formData.experience || undefined,
        createdAt: Date.now(), // 新規作成時は現在時刻（number型）
        avatar: avatarUrlToSave || undefined
      };

      console.log('Saving profile:', newProfile);
      await firestoreDb.saveUserProfile(newProfile);
      console.log('Profile saved successfully');
      
      // AuthContextのプロフィールを即座に更新してからリダイレクト
      setProfileDirectly(newProfile);
      console.log('Profile set in AuthContext');
      
      // プロフィール作成後、ダッシュボードへ直接リダイレクト
      console.log('Redirecting to dashboard...');
      router.push('/dashboard');

    } catch (error) {
      console.error('プロフィールの保存に失敗しました:', error);
      alert(`プロフィールの保存に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setSaving(false);
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">プロフィールを作成</h1>
          <p className="text-center text-gray-600 mb-8">バドミントンライフを始めるために、あなたのプロフィールを設定しましょう。</p>

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
              
              {/* 匿名ユーザーの場合のみメールアドレス・パスワード入力を表示 */}
              {isAnonymousUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" required />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">アカウント作成後のログインに使用します</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">パスワード <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" required />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">6文字以上で入力してください</p>
                  </div>
                </>
              )}
              
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
                      file:bg-theme-primary-50 file:text-theme-primary-700
                      hover:file:bg-theme-primary-100"
                  />
                  {uploadingAvatar && (
                    <div className="ml-4 animate-spin rounded-full h-5 w-5 border-b-2 border-theme-primary-500"></div>
                  )}
                </div>
                {avatarFile && <p className="text-xs text-gray-500 mt-1">選択中: {avatarFile.name}</p>}
                {formData.avatar && !avatarFile && (
                  <p className="text-xs text-gray-500 mt-1">現在の画像: <a href={formData.avatar} target="_blank" rel="noopener noreferrer" className="text-theme-primary-500 hover:underline">表示</a></p>
                )}
              </div>
            </div>
            <div className="space-y-6">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ポジション</label>
                <div className="relative">
                  <FiAward className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select name="position" value={formData.position} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                    <option value="">選択してください</option>
                    <option value="シングルス">シングルス</option>
                    <option value="ダブルス">ダブルス</option>
                    <option value="ミックスダブルス">ミックスダブルス</option>
                  </select>
                </div>
              </div>
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
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <button 
              onClick={handleSave} 
              disabled={
                saving || 
                uploadingAvatar || 
                !formData.name.trim() || 
                (isAnonymousUser && (!formData.email.trim() || !formData.password.trim()))
              } 
              className="flex items-center px-8 py-3 bg-theme-primary-600 text-white rounded-lg shadow-md hover:bg-theme-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-500 transition-all"
            >
              <FiSave className="mr-2" />
              {saving || uploadingAvatar ? '保存中...' : 'プロフィールを作成して開始'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProfilePage;
