export interface UserProfile {
  id: string;
  email: string;
  name: string;
  team?: string;
  position?: string;
  experience?: string;
  createdAt: number;
  avatar?: string;
  
  // バドミントン特化項目
  // 基本情報
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  playStyle?: 'aggressive' | 'defensive' | 'all-round'; // プレイスタイル
  dominantHand?: 'right' | 'left'; // 利き手
  
  // 技術情報
  favoriteShots?: string[]; // 得意ショット
  weakShots?: string[]; // 苦手ショット
  tacticalRole?: string; // 戦術的役割
  
  // 競技情報
  achievements?: string[]; // 主な戦績（大会名）
  achievementRanks?: string[]; // 戦績の順位
  goals?: string[]; // 目標・モチベーション（複数選択）
  
  // 追加情報
  bio?: string; // 自己紹介
  preferredGameType?: 'singles' | 'doubles' | 'both'; // 好きな試合形式
  playRegion?: string; // 主なプレイ地域
  
  // MBTI診断結果
  mbtiResult?: string; // "ESTJ", "INFP" など
  mbtiCompletedAt?: number; // MBTI診断完了日時
  
  // プライバシー設定
  privacySettings?: {
    profilePublic?: boolean; // プロフィール公開
    statsPublic?: boolean; // 統計情報公開
    matchHistoryPublic?: boolean; // 試合履歴公開
    analysisPublic?: boolean; // 分析結果公開
    allowFriendView?: boolean; // フレンドからの閲覧許可
  };
}
