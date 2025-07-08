export interface UserProfile {
  id: string;
  email: string;
  name: string;
  team?: string;
  position?: string;
  experience?: string;
  createdAt: string;
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
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional'; // 競技レベル
  achievements?: string[]; // 主な戦績
  goals?: string; // 目標・モチベーション
  
  // 追加情報
  bio?: string; // 自己紹介
  preferredGameType?: 'singles' | 'doubles' | 'both'; // 好きな試合形式
}
