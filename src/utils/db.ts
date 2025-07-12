import { db, storage } from './firebase';
import { collection, getDocs, deleteDoc, doc, setDoc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Player } from '@/types/player';
import { Match } from '@/types/match';
import { Shot } from '@/types/shot';
import { UserProfile } from '@/types/userProfile';
import { Friendship, FriendshipStatus } from '@/types/friendship';
import { MatchRequest, MatchRequestStatus } from '@/types/matchRequest';
import { MBTIResult, MBTIDiagnostic } from '@/types/mbti';
import { Practice, PracticeGoal, PracticeStats, PracticeCard } from '@/types/practice';



export const firestoreDb = {
  // 選手
  async getPlayers(userId: string): Promise<Player[]> {
    if (!userId) {
      console.warn('getPlayers: userId is undefined or empty');
      return [];
    }
    const q = query(collection(db, 'players'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
  },
  async savePlayers(players: Player[], userId: string): Promise<void> {
    if (!userId) {
      console.warn('savePlayers: userId is undefined or empty');
      return;
    }
    // 全削除→再登録（簡易実装）
    const q = query(collection(db, 'players'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, 'players', d.id))));
    await Promise.all(players.map(player => setDoc(doc(db, 'players', player.id), { ...player, userId })));
  },
  async addPlayer(player: Player, userId: string): Promise<void> {
    if (!userId) {
      console.warn('addPlayer: userId is undefined or empty');
      return;
    }
    await setDoc(doc(db, 'players', player.id), { ...player, userId });
  },
  async deletePlayer(id: string): Promise<void> {
    await deleteDoc(doc(db, 'players', id));
  },

  // 試合
  async getMatches(userId: string): Promise<Match[]> {
    if (!userId) {
      console.warn('getMatches: userId is undefined or empty');
      return [];
    }
    // 現在のユーザーのサブコレクションから試合を取得
    const q = query(collection(db, `users/${userId}/matches`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
  },
  async saveMatches(matches: Match[], userId: string): Promise<void> {
    if (!userId) {
      console.warn('saveMatches: userId is undefined or empty');
      return;
    }
    // 全削除→再登録（簡易実装）
    const q = query(collection(db, `users/${userId}/matches`));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, `users/${userId}/matches`, d.id))));
    await Promise.all(matches.map(match => {
      const cleanMatch = {
        ...match,
        ownerUserId: userId, // 保存時は必ず現在のユーザーをownerUserIdとする
        players: {
          ...match.players,
          player2: match.players.player2 ?? null,
          opponent2: match.players.opponent2 ?? null,
        }
      };
      return setDoc(doc(db, `users/${userId}/matches`, match.id), cleanMatch);
    }));
  },
  async addMatch(match: Match): Promise<void> {
    // 記録者自身の試合記録を保存
    const matchData = {
      ...match,
      players: {
        ...match.players,
        player2: match.players.player2 ?? null,
        opponent2: match.players.opponent2 ?? null,
      }
    };
    await setDoc(doc(db, `users/${match.ownerUserId}/matches`, match.id), matchData);

    // 試合に参加するフレンドのユーザーIDを収集
    const allPlayerIds = [
      match.players.player1,
      match.players.player2,
      match.players.opponent1,
      match.players.opponent2,
    ].filter(Boolean) as string[];

    const userProfiles = await firestoreDb.getUserProfilesByIds(allPlayerIds);
    const friendUserIds = userProfiles
      .filter(profile => profile.id !== match.ownerUserId) // 記録者自身は除く
      .map(profile => profile.id);

    // 各フレンドに対して試合リクエストを送信
    await Promise.all(friendUserIds.map(async (friendId) => {
      const matchRequestId = `${match.id}_${friendId}`;
      const newMatchRequest: MatchRequest = {
        id: matchRequestId,
        matchId: match.id,
        fromUserId: match.ownerUserId,
        toUserId: friendId,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        matchData: {
          ...matchData,
          players: {
            ...matchData.players,
            player2: matchData.players.player2 || undefined,
            opponent2: matchData.players.opponent2 || undefined,
          }
        }, // 試合データ全体をリクエストに含める
      };
      await setDoc(doc(db, 'matchRequests', matchRequestId), newMatchRequest);
    }));
  },
  async deleteMatch(matchId: string, userId: string): Promise<void> {
    if (!userId) {
      console.warn('deleteMatch: userId is undefined or empty');
      return;
    }
    if (!matchId) {
      console.warn('deleteMatch: matchId is undefined or empty');
      return;
    }
    
    try {
      // 試合が削除権限があるかチェック（作成者のみ削除可能）
      const matchDoc = await getDoc(doc(db, `users/${userId}/matches`, matchId));
      if (!matchDoc.exists()) {
        console.warn('deleteMatch: Match not found or user does not have permission');
        throw new Error('試合が見つからないか、削除権限がありません。');
      }
      
      const matchData = matchDoc.data();
      if (matchData.ownerUserId !== userId) {
        console.warn('deleteMatch: User does not have permission to delete this match');
        throw new Error('この試合を削除する権限がありません。作成者のみが削除できます。');
      }
    
    // 関連するショットを削除（作成者のデータから）
    const shotsQuery = query(
      collection(db, `users/${userId}/shots`), 
      where('matchId', '==', matchId)
    );
    const shotsSnapshot = await getDocs(shotsQuery);
    
    // すべての関連ショットを削除
    const deleteShotPromises = shotsSnapshot.docs.map(shotDoc => 
      deleteDoc(doc(db, `users/${userId}/shots`, shotDoc.id))
    );
    await Promise.all(deleteShotPromises);
    
    // 承認済みのフレンドデータは削除せず、未承認のリクエストのみキャンセル
    const allPlayerIds = [
      matchData.players.player1,
      matchData.players.player2,
      matchData.players.opponent1,
      matchData.players.opponent2,
    ].filter(Boolean) as string[];
    
    const userProfiles = await this.getUserProfilesByIds(allPlayerIds);
    const friendUserIds = userProfiles
      .filter(profile => profile.id !== userId) // 削除実行者自身は除く
      .map(profile => profile.id);
    
    // 未承認の試合リクエストのみ削除
    const pendingMatchRequests = await Promise.all(
      friendUserIds.map(async (friendId) => {
        const matchRequestId = `${matchId}_${friendId}`;
        const matchRequestDoc = await getDoc(doc(db, 'matchRequests', matchRequestId));
        
        if (matchRequestDoc.exists()) {
          const requestData = matchRequestDoc.data();
          // pending状態のリクエストのみ削除
          if (requestData.status === 'pending') {
            await deleteDoc(doc(db, 'matchRequests', matchRequestId));
            console.log(`Deleted pending match request for friend ${friendId}`);
          } else {
            console.log(`Match request for friend ${friendId} is ${requestData.status}, keeping friend data intact`);
          }
        }
      })
    );
    
    await Promise.all(pendingMatchRequests);
    
    // 試合を削除（作成者のデータから）
    await deleteDoc(doc(db, `users/${userId}/matches`, matchId));
    
    // ローカルストレージの一時データも削除
    try {
      localStorage.removeItem(`match_temp_${matchId}`);
      console.log(`Removed temporary data for match ${matchId} from localStorage`);
    } catch (error) {
      console.warn('Failed to remove temporary data from localStorage:', error);
    }
    
      console.log(`Deleted match ${matchId} and ${shotsSnapshot.docs.length} related shots from creator. Cancelled pending requests to ${friendUserIds.length} friends.`);
    } catch (error) {
      console.error('Error deleting match and related data:', error);
      throw error;
    }
  },
  async updateMatchScore(matchId: string, userId: string, score: { player: number; opponent: number }): Promise<void> {
    if (!userId) {
      console.warn('updateMatchScore: userId is undefined or empty');
      return;
    }
    if (!matchId) {
      console.warn('updateMatchScore: matchId is undefined or empty');
      return;
    }
    // ユーザーのサブコレクションで試合のスコアを更新
    await updateDoc(doc(db, `users/${userId}/matches`, matchId), { score });
  },

  // ショット
  async getShots(userId: string): Promise<Shot[]> {
    if (!userId) {
      console.warn('getShots: userId is undefined or empty');
      return [];
    }
    // 現在のユーザーのサブコレクションからショットを取得
    const q = query(collection(db, `users/${userId}/shots`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shot));
  },
  async saveShots(shots: Shot[], userId: string): Promise<void> {
    if (!userId) {
      console.warn('saveShots: userId is undefined or empty');
      return;
    }
    // 全削除→再登録（簡易実装）
    const q = query(collection(db, `users/${userId}/shots`));
    const snapshot = await getDocs(q);
    await Promise.all(snapshot.docs.map(d => deleteDoc(doc(db, `users/${userId}/shots`, d.id))));
    await Promise.all(shots.map(shot => setDoc(doc(db, `users/${userId}/shots`, shot.id), { ...shot, userId })));
  },
  async addShot(shot: Omit<Shot, 'id' | 'timestamp'>, userId: string, matchId: string): Promise<void> {
    if (!userId) {
      console.warn('addShot: userId is undefined or empty');
      return;
    }
    if (!matchId) {
      console.warn('addShot: matchId is undefined or empty');
      return;
    }
    const shotWithId = {
      ...shot,
      userId,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    // 記録者自身のショットを保存
    await setDoc(doc(db, `users/${userId}/shots`, shotWithId.id), shotWithId);

    // 試合の参加者（フレンド）にもショットを共有
    const matchDoc = await getDoc(doc(db, `users/${userId}/matches`, matchId));
    if (matchDoc.exists()) {
      const matchData = matchDoc.data() as Match;
      const allPlayerIds = [
        matchData.players.player1,
        matchData.players.player2,
        matchData.players.opponent1,
        matchData.players.opponent2,
      ].filter(Boolean) as string[];

      const userProfiles = await firestoreDb.getUserProfilesByIds(allPlayerIds);
      const friendUserIds = userProfiles
        .filter(profile => profile.id !== userId) // 記録者自身は除く
        .map(profile => profile.id);

      await Promise.all(friendUserIds.map(async (friendId) => {
        // フレンドのサブコレクションにショットを保存
        await setDoc(doc(db, `users/${friendId}/shots`, shotWithId.id), shotWithId);
      }));
    }
  },
  async deleteShot(id: string): Promise<void> {
    await deleteDoc(doc(db, 'shots', id));
  },

  // undefined値を除外するヘルパー関数
  removeUndefinedFields(obj: unknown): unknown {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  },

  // ユーザープロフィール
  async saveUserProfile(profile: UserProfile): Promise<void> {
    const cleanedProfile = this.removeUndefinedFields(profile);
    await setDoc(doc(db, 'userProfiles', profile.id), cleanedProfile);
  },
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) {
      console.warn('getUserProfile: userId is undefined or empty');
      return null;
    }
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  },

  // フレンド管理
  async searchUsersByEmail(email: string): Promise<UserProfile[]> {
    const q = query(collection(db, 'userProfiles'), where('email', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  },

  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
    const friendshipId = `${fromUserId}_${toUserId}`;
    const existingFriendshipRef = doc(db, 'friendships', friendshipId);
    const existingFriendshipSnap = await getDoc(existingFriendshipRef);

    if (existingFriendshipSnap.exists()) {
      const existingFriendship = existingFriendshipSnap.data() as Friendship;
      if (existingFriendship.status === 'pending') {
        throw new Error('既にフレンドリクエストが送信されています。');
      } else if (existingFriendship.status === 'accepted') {
        throw new Error('既にフレンドです。');
      } else if (existingFriendship.status === 'declined') {
        throw new Error('フレンドリクエストは拒否されました。');
      }
    }

    // 逆方向のフレンドリクエストも確認
    const reverseFriendshipId = `${toUserId}_${fromUserId}`;
    const reverseFriendshipRef = doc(db, 'friendships', reverseFriendshipId);
    const reverseFriendshipSnap = await getDoc(reverseFriendshipRef);

    if (reverseFriendshipSnap.exists()) {
      const reverseFriendship = reverseFriendshipSnap.data() as Friendship;
      if (reverseFriendship.status === 'pending') {
        throw new Error('相手からフレンドリクエストが届いています。承認してください。');
      }
    }

    const newFriendship: Friendship = {
      id: friendshipId,
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, 'friendships', friendshipId), newFriendship);
  },

  async getPendingFriendRequests(userId: string): Promise<Friendship[]> {
    const q = query(
      collection(db, 'friendships'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friendship));
  },

  async getAcceptedFriendships(userId: string): Promise<Friendship[]> {
    const q1 = query(
      collection(db, 'friendships'),
      where('fromUserId', '==', userId),
      where('status', '==', 'accepted')
    );
    const q2 = query(
      collection(db, 'friendships'),
      where('toUserId', '==', userId),
      where('status', '==', 'accepted')
    );
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    const friendships1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friendship));
    const friendships2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friendship));
    return [...friendships1, ...friendships2];
  },

  async updateFriendshipStatus(friendshipId: string, status: FriendshipStatus): Promise<void> {
    const friendshipRef = doc(db, 'friendships', friendshipId);
    await updateDoc(friendshipRef, { status, updatedAt: Date.now() });
  },

  async deleteFriendship(friendshipId: string): Promise<void> {
    await deleteDoc(doc(db, 'friendships', friendshipId));
  },

  async getUserProfilesByIds(userIds: string[]): Promise<UserProfile[]> {
    if (userIds.length === 0) return [];
    // where('id', 'in', ...) は最大10個のIDしか指定できないため、分割して取得
    const results: UserProfile[] = [];
    const chunkSize = 10;
    for (let i = 0; i < userIds.length; i += chunkSize) {
      const chunk = userIds.slice(i, i + chunkSize);
      const q = query(collection(db, 'userProfiles'), where('id', 'in', chunk));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => results.push(doc.data() as UserProfile));
    }
    return results;
  },

  // 試合リクエスト
  async getPendingMatchRequests(userId: string): Promise<MatchRequest[]> {
    const q = query(
      collection(db, 'matchRequests'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchRequest));
  },

  async updateMatchRequestStatus(matchRequestId: string, status: MatchRequestStatus): Promise<void> {
    const matchRequestRef = doc(db, 'matchRequests', matchRequestId);
    await updateDoc(matchRequestRef, { status, updatedAt: Date.now() });
  },

  // アバター画像アップロード
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const avatarRef = ref(storage, `avatars/${userId}/avatar.jpg`);
    const snapshot = await uploadBytes(avatarRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  },

  // プロフィールマイグレーション
  async migrateUserProfile(userId: string): Promise<void> {
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentProfile = docSnap.data() as UserProfile;
      
      // 既存のプロフィールをそのまま保存（新しいフィールドは後で追加される）
      const cleanedProfile = this.removeUndefinedFields(currentProfile);
      await setDoc(docRef, cleanedProfile);
    }
  },

  // 全ユーザーのプロフィールをマイグレーション
  async migrateAllUserProfiles(): Promise<void> {
    const snapshot = await getDocs(collection(db, 'userProfiles'));
    const promises = snapshot.docs.map(doc => 
      this.migrateUserProfile(doc.id)
    );
    await Promise.all(promises);
  },

  // プロフィールが新しい形式かどうかをチェック
  async isProfileMigrated(userId: string): Promise<boolean> {
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const profile = docSnap.data() as UserProfile;
      // 新しいフィールドの存在をチェック（undefinedでも存在とみなす）
      return 'skillLevel' in profile || 'playStyle' in profile || 'bio' in profile;
    }
    return false;
  },

  // MBTI診断関連
  async saveMBTIResult(result: MBTIResult): Promise<void> {
    await setDoc(doc(db, 'mbtiResults', result.id), result);
  },

  async getMBTIResult(userId: string): Promise<MBTIResult | null> {
    const q = query(collection(db, 'mbtiResults'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    // 最新の結果を取得（createdAtでソート）
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MBTIResult));
    return results.sort((a, b) => b.createdAt - a.createdAt)[0];
  },

  async saveMBTIDiagnostic(diagnostic: MBTIDiagnostic): Promise<void> {
    await setDoc(doc(db, 'mbtiDiagnostics', diagnostic.id), diagnostic);
  },

  async getMBTIDiagnostic(userId: string): Promise<MBTIDiagnostic | null> {
    const q = query(collection(db, 'mbtiDiagnostics'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    // 最新の診断を取得
    const diagnostics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MBTIDiagnostic));
    return diagnostics.sort((a, b) => b.createdAt - a.createdAt)[0];
  },

  async updateUserProfileMBTI(userId: string, mbtiResult: string): Promise<void> {
    const userRef = doc(db, 'userProfiles', userId);
    await updateDoc(userRef, {
      mbtiResult,
      mbtiCompletedAt: Date.now()
    });
  },

  // 練習記録関連
  async getPractices(userId: string): Promise<Practice[]> {
    if (!userId) {
      console.warn('getPractices: userId is undefined or empty');
      return [];
    }
    const q = query(collection(db, `users/${userId}/practices`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Practice));
  },

  async addPractice(practice: Practice): Promise<void> {
    const cleanedPractice = this.removeUndefinedFields(practice);
    await setDoc(doc(db, `users/${practice.userId}/practices`, practice.id), cleanedPractice);
  },

  async updatePractice(practice: Practice): Promise<void> {
    const cleanedPractice = this.removeUndefinedFields(practice);
    await setDoc(doc(db, `users/${practice.userId}/practices`, practice.id), cleanedPractice);
  },

  async deletePractice(practiceId: string, userId: string): Promise<void> {
    if (!userId || !practiceId) {
      console.warn('deletePractice: userId or practiceId is undefined or empty');
      return;
    }
    await deleteDoc(doc(db, `users/${userId}/practices`, practiceId));
  },

  async getPracticeStats(userId: string): Promise<PracticeStats | null> {
    if (!userId) {
      console.warn('getPracticeStats: userId is undefined or empty');
      return null;
    }
    
    const practices = await this.getPractices(userId);
    if (practices.length === 0) {
      return null;
    }

    // 統計を計算
    const totalPractices = practices.length;
    const totalDuration = practices.reduce((sum, p) => sum + p.duration, 0);
    const averageDuration = totalDuration / totalPractices;

    // タイプ別練習回数
    const practicesByType = practices.reduce((acc, practice) => {
      acc[practice.type] = (acc[practice.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 強度別練習回数
    const practicesByIntensity = practices.reduce((acc, practice) => {
      acc[practice.intensity] = (acc[practice.intensity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // スキル平均
    const skillAverages = {} as Record<string, number>;
    const skillCounts = {} as Record<string, number>;

    practices.forEach(practice => {
      practice.skills.forEach(skill => {
        if (!skillAverages[skill.category]) {
          skillAverages[skill.category] = 0;
          skillCounts[skill.category] = 0;
        }
        skillAverages[skill.category] += skill.rating;
        skillCounts[skill.category]++;
      });
    });

    Object.keys(skillAverages).forEach(category => {
      skillAverages[category] = skillAverages[category] / skillCounts[category];
    });

    // 月別統計
    const monthlyStats = practices.reduce((acc, practice) => {
      const month = practice.date.substring(0, 7); // YYYY-MM
      const existing = acc.find(m => m.month === month);
      if (existing) {
        existing.practices++;
        existing.duration += practice.duration;
      } else {
        acc.push({
          month,
          practices: 1,
          duration: practice.duration
        });
      }
      return acc;
    }, [] as { month: string; practices: number; duration: number }[]);

    // 連続練習日数を計算
    const sortedDates = [...new Set(practices.map(p => p.date))].sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // 現在の連続日数（今日から逆算）
    const today = new Date().toISOString().split('T')[0];
    const lastPracticeDate = sortedDates[sortedDates.length - 1];
    if (lastPracticeDate === today) {
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const prevDate = new Date(sortedDates[i]);
        const nextDate = new Date(sortedDates[i + 1]);
        const diffDays = (nextDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      userId,
      totalPractices,
      totalDuration,
      averageDuration,
      practicesByType: practicesByType as Record<string, number>,
      practicesByIntensity: practicesByIntensity as Record<string, number>,
      skillAverages: skillAverages as Record<string, number>,
      improvementTrends: {} as Record<string, number[]>, // 今回は簡略化
      monthlyStats,
      currentStreak,
      longestStreak,
      lastPracticeDate: lastPracticeDate || undefined,
    };
  },

  // 練習目標関連
  async getPracticeGoals(userId: string): Promise<PracticeGoal[]> {
    if (!userId) {
      console.warn('getPracticeGoals: userId is undefined or empty');
      return [];
    }
    const q = query(collection(db, `users/${userId}/practiceGoals`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticeGoal));
  },

  async addPracticeGoal(goal: PracticeGoal): Promise<void> {
    const cleanedGoal = this.removeUndefinedFields(goal);
    await setDoc(doc(db, `users/${goal.userId}/practiceGoals`, goal.id), cleanedGoal);
  },

  async updatePracticeGoal(goal: PracticeGoal): Promise<void> {
    const cleanedGoal = this.removeUndefinedFields(goal);
    await setDoc(doc(db, `users/${goal.userId}/practiceGoals`, goal.id), cleanedGoal);
  },

  async deletePracticeGoal(goalId: string, userId: string): Promise<void> {
    if (!userId || !goalId) {
      console.warn('deletePracticeGoal: userId or goalId is undefined or empty');
      return;
    }
    await deleteDoc(doc(db, `users/${userId}/practiceGoals`, goalId));
  },

  // 練習カード関連
  async getPracticeCards(userId: string): Promise<PracticeCard[]> {
    if (!userId) {
      console.warn('getPracticeCards: userId is undefined or empty');
      return [];
    }
    const q = query(collection(db, `users/${userId}/practiceCards`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PracticeCard));
  },

  async addPracticeCard(card: PracticeCard): Promise<void> {
    const cleanedCard = this.removeUndefinedFields(card);
    await setDoc(doc(db, `users/${card.userId}/practiceCards`, card.id), cleanedCard);
  },

  async updatePracticeCard(card: PracticeCard): Promise<void> {
    const cleanedCard = this.removeUndefinedFields(card);
    await setDoc(doc(db, `users/${card.userId}/practiceCards`, card.id), cleanedCard);
  },

  async deletePracticeCard(cardId: string, userId: string): Promise<void> {
    if (!userId || !cardId) {
      console.warn('deletePracticeCard: userId or cardId is undefined or empty');
      return;
    }
    await deleteDoc(doc(db, `users/${userId}/practiceCards`, cardId));
  }
};
