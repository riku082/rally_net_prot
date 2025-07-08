import { db, storage } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Player } from '@/types/player';
import { Match } from '@/types/match';
import { Shot } from '@/types/shot';
import { UserProfile } from '@/types/userProfile';
import { Friendship, FriendshipStatus } from '@/types/friendship';
import { MatchRequest, MatchRequestStatus } from '@/types/matchRequest';

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
        matchData: matchData, // 試合データ全体をリクエストに含める
      };
      await setDoc(doc(db, 'matchRequests', matchRequestId), newMatchRequest);
    }));
  },
  async deleteMatch(matchId: string, userId: string): Promise<void> {
    if (!userId) {
      console.warn('deleteMatch: userId is undefined or empty');
      return;
    }
    // ユーザーのサブコレクションから試合を削除
    await deleteDoc(doc(db, `users/${userId}/matches`, matchId));
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
  removeUndefinedFields(obj: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
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
};
