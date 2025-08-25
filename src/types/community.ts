export interface CommunityPractice {
  id: string;
  communityId?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  scheduledDate?: string;
  scheduledTime?: string;
  endTime?: string;
  duration: number;
  location: string;
  maxParticipants?: number;
  minParticipants?: number;
  currentParticipants?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  level?: string;
  practiceType?: string;
  type?: string;
  tags?: string[];
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: number;
  updatedAt?: number;
  likes?: number;
  comments?: number;
  tags?: string[];
}

export interface CommunityComment {
  id: string;
  postId: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: number;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
  memberCount?: number;
  isPublic?: boolean;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityRole;
  joinedAt: number;
  isActive?: boolean;
}

export interface CommunityInvitation {
  id: string;
  communityId: string;
  invitedBy: string;
  invitedEmail?: string;
  invitedUserId?: string;
  status: CommunityInvitationStatus;
  createdAt: number;
  acceptedAt?: number;
}

export interface CommunityPracticeParticipant {
  id: string;
  practiceId: string;
  userId: string;
  status: ParticipationStatus;
  joinedAt: number;
}

export interface CommunityPracticeResult {
  id: string;
  practiceId: string;
  userId: string;
  score?: number;
  notes?: string;
  createdAt: number;
}

export interface CommunityPracticeFeedback {
  id: string;
  practiceId: string;
  userId: string;
  feedback: string;
  rating?: number;
  createdAt: number;
}

export interface CommunitySharedPractice {
  id: string;
  communityId: string;
  practiceCardId: string;
  sharedBy: string;
  sharedAt: number;
}

export interface CommunityPracticeComment {
  id: string;
  practiceId: string;
  userId: string;
  comment: string;
  createdAt: number;
}

export interface CommunityPracticeReaction {
  id: string;
  practiceId: string;
  userId: string;
  reaction: string;
  createdAt: number;
}

export interface CommunityStats {
  id: string;
  communityId: string;
  totalPractices: number;
  totalMembers: number;
  lastActivityAt?: number;
}

export interface CommunityNotification {
  id: string;
  userId: string;
  communityId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export interface CommunityUserSettings {
  id: string;
  userId: string;
  communityId: string;
  notifications: boolean;
  emailNotifications?: boolean;
}

export enum CommunityRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum CommunityInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined'
}

export enum ParticipationStatus {
  CONFIRMED = 'confirmed',
  TENTATIVE = 'tentative',
  DECLINED = 'declined'
}