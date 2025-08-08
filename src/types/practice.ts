export interface Practice {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // minutes
  type: PracticeType;
  title: string;
  description?: string;
  notes?: string;
  skills: PracticeSkill[];
  goals?: string[];
  achievements?: string[];
  routine?: PracticeRoutineExecution; // 練習カードのルーティン情報
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

// 練習記録内でのルーティン実行情報
export interface PracticeRoutineExecution {
  cards: PracticeCardExecution[]; // 実行した練習カード
  totalPlannedDuration: number; // 計画された総時間
  totalActualDuration: number; // 実際の総時間
  completedCards: number; // 完了したカード数
  notes?: string; // ルーティン全体のメモ
}

// 練習記録内での個別カード実行情報
export interface PracticeCardExecution {
  cardId: string;
  cardTitle: string;
  order: number; // 実行順序
  plannedDuration: number; // 計画時間
  actualDuration?: number; // 実際の時間
  completed: boolean; // 完了したかどうか
  notes?: string; // このカード特有のメモ
  rating?: number; // このカードの評価（1-5）
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

// 練習メニュータイプ（練習カード作り込み用）
export type PracticeMenuType = 
  | 'knock_practice'    // ノック練習
  | 'pattern_practice'  // パターン練習
  | 'footwork_practice' // フットワーク練習
  | 'serve_practice'    // サーブ練習
  | 'game_practice';    // ゲーム形式練習


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
  practiceType?: PracticeMenuType; // 練習メニュータイプ
  drill: PracticeDrill; // 単一の練習メニュー
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[]; // 必要な用具
  courtInfo?: PracticeCourtInfo; // コート情報
  visualInfo?: PracticeVisualInfo; // ビジュアル情報（新規追加）
  notes?: string;
  tags: string[];
  isPublic: boolean; // コミュニティ共有用
  sharingSettings?: PracticeSharingSettings; // 共有設定（新規追加）
  usageCount: number; // 使用回数
  lastUsed?: string; // 最後に使用した日付
  rating?: number; // 1-5の評価
  userRatings?: PracticeUserRating[]; // ユーザー評価（新規追加）
  createdAt: number;
  updatedAt: number;
  createdBy?: string; // 作成者情報（共有用）
  originalCardId?: string; // 元カードID（コピー/フォーク用）
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
  maxDuration?: number; // 最大時間
  minDuration?: number; // 最小時間
  tags?: string[];
  searchTerm?: string;
  sortBy?: 'updated' | 'usage' | 'duration' | 'rating' | 'popular';
  showPublicOnly?: boolean; // 公開カードのみ表示
  createdBy?: string; // 特定ユーザーの作成カード
}

// ビジュアル情報（コートグラフィック用）
export interface PracticeVisualInfo {
  playerPositions?: PlayerPosition[]; // プレイヤー位置
  shotTrajectories?: ShotTrajectory[]; // ショット軌道
  movementPatterns?: MovementPattern[]; // 移動パターン
  equipmentPositions?: EquipmentPosition[]; // 用具配置
  keyPoints?: PracticeKeyPoint[]; // 重要ポイント
  sequence?: PracticeSequenceStep[]; // 練習手順
}

// プレイヤー位置
export interface PlayerPosition {
  id: string;
  x: number; // コート座標（0-400）
  y: number; // コート座標（0-600）
  label: string; // 'P1', 'P2', 'コーチ' など
  role?: 'player' | 'opponent' | 'coach' | 'feeder' | 'knocker';
  color?: string;
  direction?: 'north' | 'northeast' | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest';
  icon?: string; // カスタムアイコン
}

// ショット軌道
export interface ShotTrajectory {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  shotType: string; // 'smash', 'clear', 'drop' など（主要なタイプ）
  shotTypes?: string[]; // 複数のショットタイプ（同じコースに複数の球種がある場合）
  shotBy?: 'knocker' | 'player' | 'opponent'; // 誰が打ったか
  order?: number; // 練習手順での順序
  description?: string;
  targetArea?: string; // エリア選択時のターゲットエリアID
  memo?: string; // ユーザーがつけるメモ
}

// 移動パターン
export interface MovementPattern {
  id: string;
  playerId: string; // PlayerPosition.id
  path: { x: number; y: number }[]; // 移動経路
  timing?: number; // タイミング（秒）
  description?: string;
}

// 用具配置
export interface EquipmentPosition {
  id: string;
  x: number;
  y: number;
  type: string; // 'cone', 'shuttle', 'target' など
  label?: string;
  color?: string;
}

// 重要ポイント
export interface PracticeKeyPoint {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  type: 'technique' | 'positioning' | 'timing' | 'strategy';
  icon?: string;
}

// 練習手順ステップ
export interface PracticeSequenceStep {
  id: string;
  order: number;
  title: string;
  description: string;
  duration?: number; // 秒
  visualElements?: string[]; // 表示する要素のID
}

// 共有設定
export interface PracticeSharingSettings {
  visibility: 'private' | 'friends' | 'public';
  allowComments: boolean;
  allowRating: boolean;
  allowCopy: boolean; // コピー/フォーク許可
  allowModification: boolean; // 改変許可
  tags?: string[]; // 検索用追加タグ
}

// ユーザー評価
export interface PracticeUserRating {
  userId: string;
  rating: number; // 1-5
  comment?: string;
  difficulty?: 'easier' | 'as_expected' | 'harder';
  effectiveness?: number; // 1-5
  createdAt: number;
}

// 公開練習カード（コミュニティ用）
export interface PublicPracticeCard extends Omit<PracticeCard, 'userId'> {
  createdByName?: string; // 作成者表示名
  downloads: number; // ダウンロード数
  favorites: number; // お気に入り数
  comments?: PracticeCardComment[];
  category?: PracticeCardCategory;
}

// 練習カードコメント
export interface PracticeCardComment {
  id: string;
  userId: string;
  userName?: string;
  content: string;
  rating?: number;
  createdAt: number;
  replies?: PracticeCardComment[];
}

// 練習カードカテゴリ
export type PracticeCardCategory = 
  | 'basic_technique'    // 基礎技術
  | 'footwork'          // フットワーク
  | 'serve_practice'    // サーブ練習
  | 'net_play'          // ネットプレイ
  | 'rally_practice'    // ラリー練習
  | 'match_simulation'  // 試合形式
  | 'conditioning'      // フィジカル
  | 'strategy'          // 戦術
  | 'doubles_formation' // ダブルス陣形
  | 'singles_tactics';  // シングルス戦術