import { Match } from './match';

export type MatchRequestStatus = 'pending' | 'accepted' | 'declined';

export interface MatchRequest {
  id: string; // Firestore document ID (例: matchId_toUserId)
  matchId: string; // リクエスト対象の試合ID
  fromUserId: string; // リクエストを送信したユーザーのID (試合の記録者)
  toUserId: string; // リクエストを受け取ったユーザーのID (タグ付けされたフレンド)
  status: MatchRequestStatus;
  createdAt: number;
  updatedAt: number;
  matchData: Match; // リクエスト対象の試合データ全体
}
