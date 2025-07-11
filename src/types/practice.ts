export interface Practice {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // minutes
  type: PracticeType;
  intensity: PracticeIntensity;
  title: string;
  description?: string;
  notes?: string;
  skills: PracticeSkill[];
  goals?: string[];
  achievements?: string[];
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export type PracticeType = 
  | 'basic_practice'    // 基礎練習
  | 'game_practice'     // ゲーム練習
  | 'physical_training' // フィジカル
  | 'technical_drill'   // テクニカル
  | 'strategy_practice' // 戦術練習
  | 'match_simulation'  // 試合形式
  | 'individual_practice' // 個人練習
  | 'group_practice';   // グループ練習

export type PracticeIntensity = 
  | 'low'      // 軽い
  | 'medium'   // 普通
  | 'high'     // きつい
  | 'very_high'; // 非常にきつい

export interface PracticeSkill {
  id: string;
  name: string;
  category: SkillCategory;
  rating: number; // 1-5 stars
  improvement: number; // -2 to +2 (improvement from last practice)
  notes?: string;
}

export type SkillCategory = 
  | 'serve'        // サーブ
  | 'receive'      // レシーブ
  | 'clear'        // クリア
  | 'drop'         // ドロップ
  | 'smash'        // スマッシュ
  | 'net_play'     // ネットプレイ
  | 'drive'        // ドライブ
  | 'footwork'     // フットワーク
  | 'defense'      // 守備
  | 'strategy'     // 戦術
  | 'physical'     // フィジカル
  | 'mental';      // メンタル

export interface PracticeGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string; // 'times', 'minutes', 'hours', etc.
  category: SkillCategory;
  targetDate: string; // YYYY-MM-DD
  isCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PracticeStats {
  userId: string;
  totalPractices: number;
  totalDuration: number; // minutes
  averageDuration: number; // minutes
  practicesByType: Record<PracticeType, number>;
  practicesByIntensity: Record<PracticeIntensity, number>;
  skillAverages: Record<SkillCategory, number>;
  improvementTrends: Record<SkillCategory, number[]>; // last 10 practices
  monthlyStats: {
    month: string; // YYYY-MM
    practices: number;
    duration: number;
  }[];
  currentStreak: number; // consecutive days with practice
  longestStreak: number;
  lastPracticeDate?: string;
}

// 練習カード関連の型定義（単一練習用）
export interface PracticeCard {
  id: string;
  userId: string;
  title: string; // 例: "基礎うち", "クリア練習", "ネット前ドロップ"
  description: string;
  drill: PracticeDrill; // 単一の練習メニュー
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skillCategories: SkillCategory[]; // 対象スキル
  equipment: string[]; // 必要な用具
  courtInfo?: PracticeCourtInfo; // コート情報
  notes?: string;
  tags: string[];
  isPublic: boolean; // 将来的なコミュニティ共有用
  usageCount: number; // 使用回数
  lastUsed?: string; // 最後に使用した日付
  rating?: number; // 1-5の評価
  createdAt: number;
  updatedAt: number;
}

// 練習ルーティン（複数のカードを組み合わせ）
export interface PracticeRoutine {
  id: string;
  userId: string;
  title: string;
  description: string;
  cardSequence: PracticeRoutineItem[]; // カードの順序と設定
  totalDuration: number; // 総時間（分）
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[]; // 全体的な練習目標
  notes?: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  lastUsed?: string;
  rating?: number;
  createdAt: number;
  updatedAt: number;
}

// ルーティン内のカード項目
export interface PracticeRoutineItem {
  cardId: string;
  order: number; // 実行順序
  repetitions?: number; // 繰り返し回数
  restTime?: number; // 次のカードまでの休憩時間（秒）
  customDuration?: number; // カスタム時間（分）オリジナルと異なる場合
  notes?: string; // この項目特有のメモ
}

export interface PracticeDrill {
  id: string;
  name: string;
  description: string;
  duration: number; // 分
  sets?: number; // セット数
  reps?: number; // 回数
  restTime?: number; // 休憩時間（秒）
  intensity: PracticeIntensity;
  skillCategory: SkillCategory;
  notes?: string;
  videoUrl?: string; // 参考動画URL
}

export type PracticeDifficulty = 'beginner' | 'intermediate' | 'advanced';

// コートエリア関連の型定義
export interface CourtArea {
  id: string;
  name: string;
  description: string;
  color: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type CourtZone = 
  // 相手側コート
  | 'frontcourt_left'      // 前衛左
  | 'frontcourt_center'    // 前衛中央
  | 'frontcourt_right'     // 前衛右
  | 'midcourt_left'        // 中衛左
  | 'midcourt_center'      // 中衛中央
  | 'midcourt_right'       // 中衛右
  | 'backcourt_left'       // 後衛左
  | 'backcourt_center'     // 後衛中央
  | 'backcourt_right'      // 後衛右
  | 'service_box_left'     // 左サービスボックス
  | 'service_box_right'    // 右サービスボックス
  
  // 自分側コート（対称）
  | 'frontcourt_left_own'      // 前衛左（自分側）
  | 'frontcourt_center_own'    // 前衛中央（自分側）
  | 'frontcourt_right_own'     // 前衛右（自分側）
  | 'midcourt_left_own'        // 中衛左（自分側）
  | 'midcourt_center_own'      // 中衛中央（自分側）
  | 'midcourt_right_own'       // 中衛右（自分側）
  | 'backcourt_left_own'       // 後衛左（自分側）
  | 'backcourt_center_own'     // 後衛中央（自分側）
  | 'backcourt_right_own'      // 後衛右（自分側）
  | 'service_box_left_own'     // 左サービスボックス（自分側）
  | 'service_box_right_own'    // 右サービスボックス（自分側）
  
  // 廃止されたエリア（後方互換性のため）
  | 'net_left'             // ネット際左
  | 'net_center'           // ネット際中央
  | 'net_right'            // ネット際右
  | 'baseline'             // ベースライン
  | 'sideline_left'        // 左サイドライン
  | 'sideline_right'       // 右サイドライン
  
  // 全体
  | 'full_court';          // コート全体

export interface PracticeCourtInfo {
  targetAreas: CourtZone[];
  focusArea?: CourtZone; // メインとなるエリア
  courtType: 'singles' | 'doubles'; // シングルス/ダブルス
  notes?: string;
}

// 練習カードのフィルタリング用
export interface PracticeCardFilter {
  difficulty?: PracticeDifficulty;
  skillCategories?: SkillCategory[];
  maxDuration?: number; // 最大時間
  minDuration?: number; // 最小時間
  tags?: string[];
  searchTerm?: string;
}