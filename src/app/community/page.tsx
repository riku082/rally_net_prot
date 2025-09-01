'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Community, CommunityMember } from '@/types/community';
import { Users, Calendar, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import CreateCommunityModal from '@/components/community/CreateCommunityModal';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import { usePathname } from 'next/navigation';
import InvitationBadge from '@/components/community/InvitationBadge';

export default function CommunityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchUserCommunities();
  }, [user]);

  const fetchUserCommunities = async () => {
    if (!user) return;

    try {
      // ユーザーが所属するコミュニティIDを取得
      const membershipQuery = query(
        collection(db, 'community_members'),
        where('userId', '==', user.uid),
        where('isActive', '==', true)
      );
      const membershipSnapshot = await getDocs(membershipQuery);
      const communityIds = membershipSnapshot.docs.map(doc => 
        (doc.data() as CommunityMember).communityId
      );

      if (communityIds.length === 0) {
        setCommunities([]);
        setLoading(false);
        return;
      }

      // コミュニティ情報を取得
      const communitiesData: Community[] = [];
      const counts: Record<string, number> = {};
      
      for (const communityId of communityIds) {
        const communityDoc = await getDocs(
          query(collection(db, 'communities'), where('__name__', '==', communityId))
        );
        
        if (!communityDoc.empty) {
          const community = {
            id: communityDoc.docs[0].id,
            ...communityDoc.docs[0].data()
          } as Community;
          communitiesData.push(community);

          // メンバー数を取得
          const membersQuery = query(
            collection(db, 'community_members'),
            where('communityId', '==', communityId),
            where('isActive', '==', true)
          );
          const membersSnapshot = await getDocs(membersQuery);
          counts[communityId] = membersSnapshot.size;
        }
      }

      setCommunities(communitiesData);
      setMemberCounts(counts);
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activePath={pathname} />
      <MobileNav activePath={pathname} />
      <div className="flex-1 flex flex-col lg:ml-0">
        <Topbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="relative">
            <InvitationBadge />
          </div>
        </div>
      </div>

      {communities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            参加中のコミュニティはありません
          </h3>
          <p className="text-gray-500">
            コミュニティに参加して、練習仲間と予定を共有しましょう
          </p>
        </div>
      ) : (
        <>
          {/* PC版のグリッドレイアウト */}
          <div className="hidden md:grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/community/${community.id}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden"
              >
                {/* トップ画像 */}
                {community.topImageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={community.topImageUrl}
                      alt={community.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors break-words line-clamp-2">
                        {community.name}
                      </h3>
                      {community.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2 break-words">
                          {community.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {community.location && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        📍 {community.location}
                      </span>
                    )}
                    {community.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {community.category === 'beginner' ? '初心者' :
                         community.category === 'intermediate' ? '中級者' :
                         community.category === 'advanced' ? '上級者' :
                         community.category === 'competitive' ? '競技志向' :
                         community.category === 'casual' ? 'カジュアル' : community.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{memberCounts[community.id] || 0} メンバー</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>カレンダー</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {community.isPublic ? '公開' : '非公開'}
                    </span>
                    <span className="text-xs text-green-600 font-medium group-hover:underline">
                      詳細を見る →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* モバイル版のリストレイアウト */}
          <div className="md:hidden space-y-3">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/community/${community.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center p-4">
                  {/* 左側：画像またはアイコン */}
                  <div className="flex-shrink-0 mr-4">
                    {community.topImageUrl ? (
                      <img
                        src={community.topImageUrl}
                        alt={community.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* 中央：コミュニティ情報 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 break-words line-clamp-1">
                      {community.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center flex-shrink-0">
                        <Users className="h-3 w-3 mr-0.5" />
                        {memberCounts[community.id] || 0}
                      </span>
                      {community.location && (
                        <span className="text-xs text-gray-500 truncate max-w-[100px]">
                          📍 {community.location}
                        </span>
                      )}
                      {community.category && (
                        <span className="text-xs text-blue-600 flex-shrink-0">
                          {community.category === 'beginner' ? '初心者' :
                           community.category === 'intermediate' ? '中級者' :
                           community.category === 'advanced' ? '上級者' :
                           community.category === 'competitive' ? '競技' :
                           community.category === 'casual' ? 'カジュアル' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 右側：矢印 */}
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          新しいコミュニティを作成
        </button>
      </div>

      {/* コミュニティ作成モーダル */}
      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(communityId) => {
          setShowCreateModal(false);
          router.push(`/community/${communityId}`);
        }}
      />
        </div>
      </div>
    </div>
  );
}