export type FriendshipStatus = 'pending' | 'accepted' | 'declined';

export interface Friendship {
  id: string; // Firestore document ID
  fromUserId: string;
  toUserId: string;
  status: FriendshipStatus;
  createdAt: number;
  updatedAt: number;
}