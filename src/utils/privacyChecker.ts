import { UserProfile } from '@/types/userProfile';

export interface PrivacyResult {
  canViewProfile: boolean;
  canViewStats: boolean;
  canViewMatchHistory: boolean;
  canViewAnalysis: boolean;
  reason?: string;
}

export class PrivacyChecker {
  /**
   * 他のユーザーの情報を閲覧する権限をチェック
   */
  static canViewUserInfo(
    targetProfile: UserProfile,
    viewerUserId: string | null,
    isFriend: boolean = false
  ): PrivacyResult {
    // 自分自身の情報は常に閲覧可能
    if (viewerUserId === targetProfile.id) {
      return {
        canViewProfile: true,
        canViewStats: true,
        canViewMatchHistory: true,
        canViewAnalysis: true
      };
    }

    const settings = targetProfile.privacySettings;
    
    // プライバシー設定がない場合はデフォルトで公開
    if (!settings) {
      return {
        canViewProfile: true,
        canViewStats: true,
        canViewMatchHistory: true,
        canViewAnalysis: true
      };
    }

    // フレンドで、フレンドからの閲覧が許可されている場合
    if (isFriend && settings.allowFriendView) {
      return {
        canViewProfile: true,
        canViewStats: true,
        canViewMatchHistory: true,
        canViewAnalysis: true,
        reason: 'フレンドからの閲覧が許可されています'
      };
    }

    // 一般の公開設定に基づく判定
    return {
      canViewProfile: settings.profilePublic ?? true,
      canViewStats: settings.statsPublic ?? true,
      canViewMatchHistory: settings.matchHistoryPublic ?? true,
      canViewAnalysis: settings.analysisPublic ?? true,
      reason: isFriend ? 'フレンドからの閲覧が制限されています' : '公開設定により制限されています'
    };
  }

  /**
   * プロフィール情報の表示用フィルタリング
   */
  static filterProfileData(
    profile: UserProfile,
    viewerUserId: string | null,
    isFriend: boolean = false
  ): Partial<UserProfile> {
    const privacy = this.canViewUserInfo(profile, viewerUserId, isFriend);
    
    if (!privacy.canViewProfile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        // 基本情報のみ返す
      };
    }

    return profile;
  }

  /**
   * 統計情報の表示可否チェック
   */
  static canViewStats(
    profile: UserProfile,
    viewerUserId: string | null,
    isFriend: boolean = false
  ): boolean {
    const privacy = this.canViewUserInfo(profile, viewerUserId, isFriend);
    return privacy.canViewStats;
  }

  /**
   * 分析結果の表示可否チェック
   */
  static canViewAnalysis(
    profile: UserProfile,
    viewerUserId: string | null,
    isFriend: boolean = false
  ): boolean {
    const privacy = this.canViewUserInfo(profile, viewerUserId, isFriend);
    return privacy.canViewAnalysis;
  }

  /**
   * 試合履歴の表示可否チェック
   */
  static canViewMatchHistory(
    profile: UserProfile,
    viewerUserId: string | null,
    isFriend: boolean = false
  ): boolean {
    const privacy = this.canViewUserInfo(profile, viewerUserId, isFriend);
    return privacy.canViewMatchHistory;
  }

  /**
   * プライバシー制限のメッセージを生成
   */
  static getPrivacyMessage(
    profile: UserProfile,
    viewerUserId: string | null,
    isFriend: boolean = false
  ): string {
    const privacy = this.canViewUserInfo(profile, viewerUserId, isFriend);
    
    if (privacy.reason) {
      return privacy.reason;
    }
    
    if (viewerUserId === profile.id) {
      return 'あなたの情報です';
    }
    
    return '情報が公開されています';
  }

  /**
   * フレンドかどうかのチェック用のヘルパー
   */
  static async checkIsFriend(
    userId: string,
    targetUserId: string,
    firestoreDb: { getAcceptedFriendships: (userId: string) => Promise<unknown[]> }
  ): Promise<boolean> {
    try {
      const friendships = await firestoreDb.getAcceptedFriendships(userId);
      return friendships.some((friendship: unknown) => {
        const f = friendship as { fromUserId: string; toUserId: string };
        return (f.fromUserId === userId && f.toUserId === targetUserId) ||
               (f.fromUserId === targetUserId && f.toUserId === userId);
      });
    } catch (error) {
      console.error('フレンドシップチェックエラー:', error);
      return false;
    }
  }
}