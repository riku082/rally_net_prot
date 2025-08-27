'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  Community, 
  CommunityMember,
  CommunityRole
} from '@/types/community';
import Link from 'next/link';
import { 
  ChevronLeft,
  Users,
  User,
  Crown,
  Shield,
  Mail,
  Search,
  UserPlus,
  MoreVertical,
  UserX,
  Settings,
  ExternalLink
} from 'lucide-react';
import { UserProfile } from '@/types/userProfile';

interface MemberInfo {
  member: CommunityMember;
  userInfo: {
    userId: string;
    name: string;
    email?: string;
    photoURL?: string;
    playRegion?: string;
    bio?: string;
    mbtiResult?: string;
    achievements?: string[];
  };
}

export default function MembersPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberInfo[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchMembersData();
  }, [user, communityId]);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm]);

  const fetchMembersData = async () => {
    if (!user) return;

    try {
      // コミュニティ情報を取得
      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      if (!communityDoc.exists()) {
        router.push('/community');
        return;
      }

      const communityData = {
        id: communityDoc.id,
        ...communityDoc.data()
      } as Community;
      setCommunity(communityData);

      // メンバー一覧を取得
      const membersQuery = query(
        collection(db, 'community_members'),
        where('communityId', '==', communityId),
        where('isActive', '==', true)
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      // 各メンバーのユーザー情報を取得
      const memberInfos: MemberInfo[] = [];
      let userRole = '';
      
      for (const memberDoc of membersSnapshot.docs) {
        const memberData = {
          id: memberDoc.id,
          ...memberDoc.data()
        } as CommunityMember;

        // 現在のユーザーのロールを保存
        if (memberData.userId === user.uid) {
          userRole = memberData.role;
          setCurrentUserRole(memberData.role);
        }

        // ユーザー情報を取得（まずusersコレクションから）
        const userQuery = query(
          collection(db, 'users'),
          where('__name__', '==', memberData.userId)
        );
        const userSnapshot = await getDocs(userQuery);
        
        // 次にuserProfilesコレクションから詳細情報を取得
        const profileQuery = query(
          collection(db, 'userProfiles'),
          where('__name__', '==', memberData.userId)
        );
        const profileSnapshot = await getDocs(profileQuery);
        
        let userInfo = {
          userId: memberData.userId,
          name: 'ユーザー',
          email: undefined as string | undefined,
          photoURL: undefined as string | undefined,
          playRegion: undefined as string | undefined,
          bio: undefined as string | undefined,
          mbtiResult: undefined as string | undefined,
          achievements: undefined as string[] | undefined
        };

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          userInfo.name = userData.displayName || userData.name || 'ユーザー';
          userInfo.email = userData.email;
          userInfo.photoURL = userData.photoURL;
        }
        
        if (!profileSnapshot.empty) {
          const profileData = profileSnapshot.docs[0].data() as UserProfile;
          userInfo.playRegion = profileData.playRegion;
          userInfo.bio = profileData.bio;
          userInfo.mbtiResult = profileData.mbtiResult;
          userInfo.achievements = profileData.achievements;
          
          // photoURLがなければavatarを使用
          if (!userInfo.photoURL && profileData.avatar) {
            userInfo.photoURL = profileData.avatar;
          }
        }

        memberInfos.push({
          member: memberData,
          userInfo
        });
      }

      // ロール順にソート（Owner > Admin > Member）、次に参加日順
      memberInfos.sort((a, b) => {
        const roleOrder = {
          [CommunityRole.OWNER]: 0,
          [CommunityRole.ADMIN]: 1,
          [CommunityRole.MEMBER]: 2
        };
        
        const roleCompare = roleOrder[a.member.role] - roleOrder[b.member.role];
        if (roleCompare !== 0) return roleCompare;
        
        return a.member.joinedAt - b.member.joinedAt;
      });

      setMembers(memberInfos);
      setFilteredMembers(memberInfos);

    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    if (!searchTerm) {
      setFilteredMembers(members);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = members.filter(({ userInfo }) =>
      userInfo.name.toLowerCase().includes(searchLower) ||
      userInfo.email?.toLowerCase().includes(searchLower) ||
      userInfo.playRegion?.toLowerCase().includes(searchLower)
    );
    
    setFilteredMembers(filtered);
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      await updateDoc(doc(db, 'community_members', memberId), {
        role: CommunityRole.ADMIN
      });
      
      await fetchMembersData();
      setShowActionMenu(null);
    } catch (error) {
      console.error('Error promoting member:', error);
      alert('メンバーの昇格に失敗しました');
    }
  };

  const handleDemoteToMember = async (memberId: string) => {
    try {
      await updateDoc(doc(db, 'community_members', memberId), {
        role: CommunityRole.MEMBER
      });
      
      await fetchMembersData();
      setShowActionMenu(null);
    } catch (error) {
      console.error('Error demoting member:', error);
      alert('権限の変更に失敗しました');
    }
  };

  const handleRemoveMember = async (memberId: string, userName: string) => {
    if (!confirm(`${userName}さんをコミュニティから削除してもよろしいですか？`)) {
      return;
    }

    try {
      await updateDoc(doc(db, 'community_members', memberId), {
        isActive: false,
        leftAt: Date.now()
      });
      
      await fetchMembersData();
      setShowActionMenu(null);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('メンバーの削除に失敗しました');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case CommunityRole.OWNER:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            <Crown className="h-3 w-3 mr-1" />
            オーナー
          </span>
        );
      case CommunityRole.ADMIN:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Shield className="h-3 w-3 mr-1" />
            管理者
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            メンバー
          </span>
        );
    }
  };

  const canManageMembers = currentUserRole === CommunityRole.OWNER || currentUserRole === CommunityRole.ADMIN;
  const canPromoteMembers = currentUserRole === CommunityRole.OWNER;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!community) {
    return <div>コミュニティが見つかりません</div>;
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          href={`/community/${communityId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          {community.name}に戻る
        </Link>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              メンバー一覧
            </h1>
            <p className="mt-2 text-gray-600">
              {community.name}のメンバー（{members.length}名）
            </p>
          </div>

          {canManageMembers && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              メンバーを招待
            </button>
          )}
        </div>
      </div>

      {/* ナビゲーションタブ */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <Link
            href={`/community/${communityId}`}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ホーム
          </Link>
          <Link
            href={`/community/${communityId}/calendar`}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            カレンダー
          </Link>
          <Link
            href={`/community/${communityId}/events`}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            イベント一覧
          </Link>
          <Link
            href={`/community/${communityId}/members`}
            className="px-6 py-3 text-sm font-medium text-green-600 border-b-2 border-green-600"
          >
            メンバー
          </Link>
          {canManageMembers && (
            <Link
              href={`/community/${communityId}/settings`}
              className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              設定
            </Link>
          )}
        </div>
      </div>

      {/* 検索ボックス */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="メンバーを検索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* メンバーリスト */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            メンバーが見つかりません
          </h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredMembers.map(({ member, userInfo }) => (
              <div
                key={member.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* アバター */}
                    <div className="flex-shrink-0">
                      {userInfo.photoURL ? (
                        <img
                          src={userInfo.photoURL}
                          alt={userInfo.name}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* メンバー情報 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/profile/${userInfo.userId}`}
                          className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors flex items-center group"
                        >
                          {userInfo.name}
                          {member.userId === user?.uid && (
                            <span className="ml-2 text-sm text-gray-500">(自分)</span>
                          )}
                          <ExternalLink className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        {getRoleBadge(member.role)}
                      </div>
                      
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {userInfo.email && (
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {userInfo.email}
                            </span>
                          )}
                          {userInfo.playRegion && (
                            <span>{userInfo.playRegion}</span>
                          )}
                          <span>
                            {new Date(member.joinedAt).toLocaleDateString('ja-JP')} 参加
                          </span>
                        </div>
                        
                        {/* プロフィール情報 */}
                        {userInfo.bio && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {userInfo.bio}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3">
                          {userInfo.mbtiResult && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              MBTI: {userInfo.mbtiResult}
                            </span>
                          )}
                          {userInfo.achievements && userInfo.achievements.length > 0 && (
                            <span className="text-xs text-gray-600">
                              🏆 {userInfo.achievements[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* アクションメニュー */}
                  {canManageMembers && member.userId !== user?.uid && member.role !== CommunityRole.OWNER && (
                    <div className="relative">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === member.id ? null : member.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>
                      
                      {showActionMenu === member.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          {canPromoteMembers && member.role === CommunityRole.MEMBER && (
                            <button
                              onClick={() => handlePromoteToAdmin(member.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              管理者に昇格
                            </button>
                          )}
                          
                          {canPromoteMembers && member.role === CommunityRole.ADMIN && (
                            <button
                              onClick={() => handleDemoteToMember(member.id)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <User className="h-4 w-4 mr-2" />
                              メンバーに降格
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleRemoveMember(member.id, userInfo.name)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            削除
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 招待モーダル（後で実装） */}
      {showInviteModal && (
        <InviteMemberModal
          communityId={communityId}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            fetchMembersData();
          }}
        />
      )}
    </div>
  );
}

// 招待モーダルコンポーネント（仮実装）
function InviteMemberModal({ 
  communityId, 
  onClose, 
  onSuccess 
}: { 
  communityId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      // TODO: 実際の招待処理を実装
      alert(`${email}に招待を送信しました（未実装）`);
      onSuccess();
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('招待の送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          メンバーを招待
        </h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="user@example.com"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            onClick={handleInvite}
            disabled={loading || !email}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '送信中...' : '招待を送る'}
          </button>
        </div>
      </div>
    </div>
  );
}