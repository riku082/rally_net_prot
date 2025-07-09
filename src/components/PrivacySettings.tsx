'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/userProfile';
import { firestoreDb } from '@/utils/db';
import { useAuth } from '@/context/AuthContext';
import { FiLock, FiUnlock, FiUsers, FiBarChart2, FiActivity, FiUser, FiSave, FiEye, FiEyeOff } from 'react-icons/fi';

interface PrivacySettingsProps {
  userProfile: UserProfile;
  onPrivacyUpdated: (profile: UserProfile) => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ userProfile, onPrivacyUpdated }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    profilePublic: userProfile.privacySettings?.profilePublic ?? true,
    statsPublic: userProfile.privacySettings?.statsPublic ?? true,
    matchHistoryPublic: userProfile.privacySettings?.matchHistoryPublic ?? true,
    analysisPublic: userProfile.privacySettings?.analysisPublic ?? true,
    allowFriendView: userProfile.privacySettings?.allowFriendView ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        privacySettings: settings
      };
      
      await firestoreDb.saveUserProfile(updatedProfile);
      onPrivacyUpdated(updatedProfile);
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('プライバシー設定の保存に失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const privacyOptions = [
    {
      key: 'profilePublic' as const,
      icon: FiUser,
      title: 'プロフィール公開',
      description: '基本情報、競技レベル、自己紹介など',
      warningText: '非公開にするとフレンドからも閲覧できなくなります'
    },
    {
      key: 'statsPublic' as const,
      icon: FiBarChart2,
      title: '統計情報公開',
      description: 'ショット成功率、ミス率、得点率など',
      warningText: '統計情報が他のユーザーに表示されなくなります'
    },
    {
      key: 'matchHistoryPublic' as const,
      icon: FiActivity,
      title: '試合履歴公開',
      description: '過去の試合結果、スコア履歴など',
      warningText: '試合記録の詳細が他のユーザーに表示されなくなります'
    },
    {
      key: 'analysisPublic' as const,
      icon: FiBarChart2,
      title: '分析結果公開',
      description: 'ラリー分析、配球パターン、戦術分析など',
      warningText: '詳細な分析データが他のユーザーに表示されなくなります'
    },
    {
      key: 'allowFriendView' as const,
      icon: FiUsers,
      title: 'フレンドからの閲覧許可',
      description: 'フレンドが公開設定に関係なく情報を閲覧可能',
      warningText: '無効にするとフレンドからも情報が見えなくなります'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <FiLock className="w-6 h-6 text-purple-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">プライバシー設定</h3>
      </div>

      <div className="space-y-6">
        {privacyOptions.map((option) => {
          const Icon = option.icon;
          const isEnabled = settings[option.key];
          
          return (
            <div key={option.key} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 mr-3 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <h4 className="font-semibold text-gray-800">{option.title}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center text-sm">
                {isEnabled ? (
                  <div className="flex items-center text-green-600">
                    <FiEye className="w-4 h-4 mr-1" />
                    <span>公開中</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <FiEyeOff className="w-4 h-4 mr-1" />
                    <span>非公開</span>
                  </div>
                )}
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-gray-500">{option.warningText}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 保存ボタン */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            isSaved
              ? 'bg-green-600 text-white'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              保存中...
            </>
          ) : isSaved ? (
            <>
              <FiSave className="w-4 h-4 mr-2" />
              保存完了
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4 mr-2" />
              設定を保存
            </>
          )}
        </button>
      </div>

      {/* 説明文 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <FiUnlock className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">プライバシー設定について</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 各項目を個別に公開・非公開を選択できます</li>
              <li>• 「フレンドからの閲覧許可」が有効な場合、フレンドは他の設定に関係なく情報を閲覧できます</li>
              <li>• 非公開設定は即座に反映され、他のユーザーから見えなくなります</li>
              <li>• 設定はいつでも変更可能です</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;