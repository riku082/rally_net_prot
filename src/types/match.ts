export type MatchType = 'singles' | 'doubles';

export interface Match {
  id: string;
  date: string;
  type: MatchType;
  players: {
    player1: string; // プレイヤーID (ローカル選手IDまたはユーザーID)
    player2?: string; // プレイヤーID (ローカル選手IDまたはユーザーID)
    opponent1: string; // プレイヤーID (ローカル選手IDまたはユーザーID)
    opponent2?: string; // プレイヤーID (ローカル選手IDまたはユーザーID)
  };
  ownerUserId: string; // この試合を記録したユーザーのID
  createdAt: number;
}