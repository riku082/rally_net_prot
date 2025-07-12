export interface Follow {
  id: string; // Firestore document ID
  followerId: string; // フォローする人
  followingId: string; // フォローされる人
  createdAt: number;
}

export interface FollowWithProfile extends Follow {
  followerProfile?: import('./userProfile').UserProfile;
  followingProfile?: import('./userProfile').UserProfile;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  mutualFollowsCount: number;
}

export interface UserRecommendation {
  user: import('./userProfile').UserProfile;
  reason: 'region' | 'mutual_followers' | 'activity';
  score: number;
}