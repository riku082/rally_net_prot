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
  headerImageUrl?: string;  // ヘッダー画像URL
  topImageUrl?: string;     // トップ画像（サムネイル）URL
  category?: string;        // コミュニティカテゴリー
  location?: string;        // 活動地域
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

// Phase1で追加する型定義

export interface CommunityEvent {
  id: string;
  communityId: string;
  title: string;
  description?: string;
  startDateTime: string; // ISO 8601形式
  endDateTime: string;   // ISO 8601形式
  location: string;
  maxParticipants?: number;
  minParticipants?: number;
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
  
  // 練習カード関連
  practiceRoutineId?: string; // 関連する練習ルーティン
  practiceCardIds?: string[]; // 使用する練習カードID
  
  // メタ情報
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
  notes?: string;
  
  // ステータス
  status: EventStatus;
  isCancelled?: boolean;
  cancellationReason?: string;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface EventParticipation {
  id: string;
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  registeredAt: number;
  updatedAt?: number;
  
  // 個人カレンダー同期
  syncedToCalendar: boolean;
  personalCalendarId?: string;
  lastSyncAt?: number;
  
  // 追加情報
  comment?: string;
  notificationSettings?: ParticipantNotificationSettings;
}

export enum AttendanceStatus {
  ATTENDING = 'attending',      // 参加
  NOT_ATTENDING = 'not_attending', // 不参加
  MAYBE = 'maybe',              // 未定
  WAITING = 'waiting'           // キャンセル待ち
}

export interface ParticipantNotificationSettings {
  reminder24h: boolean;
  reminder1h: boolean;
  changesNotification: boolean;
}

export interface EventComment {
  id: string;
  eventId: string;
  userId: string;
  userName?: string;
  userPhotoURL?: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  
  // リプライ機能
  parentCommentId?: string;
  replies?: EventComment[];
  
  // リアクション
  reactions?: CommentReaction[];
}

export interface CommentReaction {
  userId: string;
  emoji: string;
  createdAt: number;
}

export interface CalendarSync {
  id: string;
  userId: string;
  eventId: string;
  
  // 同期情報
  syncStatus: SyncStatus;
  lastSyncAt: number;
  nextSyncAt?: number;
  
  // エラー処理
  syncErrors?: SyncError[];
  retryCount: number;
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface SyncError {
  timestamp: number;
  message: string;
  code?: string;
}