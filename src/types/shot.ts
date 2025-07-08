export type ShotType =
  | 'short_serve'   // ショートサーブ
  | 'long_serve'    // ロングサーブ
  | 'clear'
  | 'smash'
  | 'drop'
  | 'long_return'
  | 'short_return'
  | 'drive'
  | 'lob'
  | 'push'
  | 'hairpin';

export type ShotResult =
  | 'continue'  // 継続
  | 'point'     // 得点
  | 'miss';     // ミス

export type CourtArea =
  | 'LF' // Left Front
  | 'CF' // Center Front
  | 'RF' // Right Front
  | 'LM' // Left Mid
  | 'CM' // Center Mid
  | 'RM' // Right Mid
  | 'LR' // Left Rear
  | 'CR' // Center Rear
  | 'RR'; // Right Rear

export interface Shot {
  id: string;
  matchId: string;
  hitPlayer: string; // プレイヤーID
  receivePlayer: string; // プレイヤーID
  hitArea: CourtArea;
  receiveArea: CourtArea;
  shotType: ShotType;
  result: ShotResult;
  isCross: boolean;
  timestamp: number;
} 