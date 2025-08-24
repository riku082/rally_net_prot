'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '@/utils/auth';
import { firestoreDb } from '@/utils/db';
import { UserProfile } from '@/types/userProfile'; // typesからUserProfileをインポート

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean; // Firebase認証状態の読み込み中
  profileLoading: boolean; // プロフィール情報の読み込み中
  isEmailVerified: boolean; // メール認証済みかどうか
  refreshProfile: () => Promise<void>;
  setProfileDirectly: (profile: UserProfile | null) => void;
  refreshEmailVerification: () => Promise<void>; // メール認証状態を更新
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: true,
  isEmailVerified: false,
  refreshProfile: async () => {},
  setProfileDirectly: () => {},
  refreshEmailVerification: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const refreshProfile = async () => {
    if (user) {
      setProfileLoading(true);
      try {
        const userProfile = await firestoreDb.getUserProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    }
  };

  const setProfileDirectly = (newProfile: UserProfile | null) => {
    setProfile(newProfile);
    setProfileLoading(false);
  };

  const refreshEmailVerification = async () => {
    if (user) {
      await user.reload();
      setIsEmailVerified(user.emailVerified);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // メール認証状態を設定
        setIsEmailVerified(user.emailVerified);
        
        // ユーザーがログインしている場合、プロフィールを取得
        setProfileLoading(true);
        try {
          const userProfile = await firestoreDb.getUserProfile(user.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error('プロフィール取得エラー:', error);
          setProfile(null); // エラー時もプロフィールをnullに設定
        } finally {
          setProfileLoading(false);
        }
      } else {
        // ユーザーがログアウトしている場合、プロフィールとメール認証状態をクリア
        setProfile(null);
        setIsEmailVerified(false);
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, isEmailVerified, refreshProfile, setProfileDirectly, refreshEmailVerification }}>
      {children}
    </AuthContext.Provider>
  );
};