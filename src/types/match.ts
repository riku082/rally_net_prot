// 試合記録の型定義

export interface MatchRecord {
  id: string;
  practiceId?: string; // 関連する練習記録ID
  communityId?: string; // コミュニティID（コミュニティ内の試合の場合）
  communityEventId?: string; // コミュニティイベントID
  userId: string; // 記録したユーザーID
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime?: string; // HH:mm format
  matchType: MatchType;
  gameType: GameType;
  venue?: string; // 会場
  
  // プレイヤー情報
  team1: TeamInfo;
  team2: TeamInfo;
  
  // スコア
  scores: GameScore[];
  winner: 'team1' | 'team2' | 'draw';
  
  // メタ情報
  tags?: string[]; // タグ（コミュニティ名、選手名など）
  notes?: string; // メモ
  
  // 将来の拡張用
  videoUrl?: string; // 動画URL
  hasRallyData?: boolean; // 配球データの有無
  rallyDataUrl?: string; // 配球データへのリンク
  
  createdAt: number;
  updatedAt: number;
}

export interface TeamInfo {
  players: PlayerInfo[];
  score?: number; // 最終スコア
  games?: number; // 獲得ゲーム数
}

export interface PlayerInfo {
  id: string; // ユーザーID、フレンドID、またはゲストID
  name: string;
  type: 'user' | 'friend' | 'community_member' | 'guest';
  photoURL?: string;
  // 統計用
  matchesPlayed?: number;
  matchesWon?: number;
  winRate?: number;
}

export interface GameScore {
  gameNumber: number;
  team1Score: number;
  team2Score: number;
  duration?: number; // 分
  notes?: string;
}

export type MatchType = 
  | 'practice' // 練習試合
  | 'tournament' // トーナメント
  | 'league' // リーグ戦
  | 'friendly' // 親善試合
  | 'training'; // トレーニングマッチ

export type GameType = 
  | 'singles' // シングルス
  | 'doubles' // ダブルス
  | 'mixed_doubles'; // ミックスダブルス

// 試合統計
export interface MatchStatistics {
  userId: string;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  
  // 対戦相手別統計
  opponentStats?: OpponentStatistics[];
  
  // ゲームタイプ別統計
  singlesStats?: TypeStatistics;
  doublesStats?: TypeStatistics;
  mixedDoublesStats?: TypeStatistics;
  
  // 期間別統計
  monthlyStats?: MonthlyStatistics[];
  
  lastUpdated: number;
}

export interface OpponentStatistics {
  opponentId: string;
  opponentName: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface TypeStatistics {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore?: number;
}

export interface MonthlyStatistics {
  year: number;
  month: number;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
}

// 試合検索フィルター
export interface MatchFilter {
  userId?: string;
  communityId?: string;
  opponentId?: string;
  dateFrom?: string;
  dateTo?: string;
  matchType?: MatchType;
  gameType?: GameType;
  tags?: string[];
}