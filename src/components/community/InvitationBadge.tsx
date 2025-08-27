'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { 
  Bell, 
  Check, 
  X,
  UserPlus
} from 'lucide-react';
import { CommunityInvitation, CommunityMember, CommunityRole } from '@/types/community';

interface InvitationWithDetails extends CommunityInvitation {
  communityName?: string;
  inviterName?: string;
}

export default function InvitationBadge() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<InvitationWithDetails[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadInvitations = async () => {
      try {
        // クエリで pending な招待を取得
        const invitationsQuery = query(
          collection(db, 'community_invitations'),
          where('invitedUserId', '==', user.uid),
          where('status', '==', 'pending')
        );

        const snapshot = await getDocs(invitationsQuery);
        const invitationsData: InvitationWithDetails[] = [];
        
        for (const docSnapshot of snapshot.docs) {
          const invitation = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          } as InvitationWithDetails;
          
          // コミュニティ名を取得
          try {
            const communityDoc = await getDoc(doc(db, 'communities', invitation.communityId));
            if (communityDoc.exists()) {
              invitation.communityName = communityDoc.data().name;
            }
          } catch (error) {
            console.error('Error fetching community:', error);
          }
          
          // 招待者の名前を取得
          try {
            const userProfileDoc = await getDoc(doc(db, 'userProfiles', invitation.inviterId));
            if (userProfileDoc.exists()) {
              invitation.inviterName = userProfileDoc.data().displayName || userProfileDoc.data().name || '友達';
            }
          } catch (error) {
            console.error('Error fetching inviter:', error);
          }
          
          invitationsData.push(invitation);
        }
        
        setInvitations(invitationsData);
      } catch (error) {
        console.error('Failed to load invitations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInvitations();

    // リアルタイム更新の設定（オプショナル）
    let unsubscribe: (() => void) | null = null;
    
    try {
      const invitationsQuery = query(
        collection(db, 'community_invitations'),
        where('invitedUserId', '==', user.uid),
        where('status', '==', 'pending')
      );

      unsubscribe = onSnapshot(
        invitationsQuery, 
        async (snapshot) => {
          const invitationsData: InvitationWithDetails[] = [];
          
          for (const docSnapshot of snapshot.docs) {
            const invitation = {
              id: docSnapshot.id,
              ...docSnapshot.data()
            } as InvitationWithDetails;
            
            // コミュニティ名を取得
            try {
              const communityDoc = await getDoc(doc(db, 'communities', invitation.communityId));
              if (communityDoc.exists()) {
                invitation.communityName = communityDoc.data().name;
              }
            } catch (error) {
              // エラーをサイレントに処理
            }
            
            // 招待者の名前を取得
            try {
              const userProfileDoc = await getDoc(doc(db, 'userProfiles', invitation.inviterId));
              if (userProfileDoc.exists()) {
                invitation.inviterName = userProfileDoc.data().displayName || userProfileDoc.data().name || '友達';
              }
            } catch (error) {
              // エラーをサイレントに処理
            }
            
            invitationsData.push(invitation);
          }
          
          setInvitations(invitationsData);
        },
        (error) => {
          // 権限エラーは無視
          if (error.code !== 'permission-denied') {
            console.error('Snapshot listener error:', error);
          }
        }
      );
    } catch (error) {
      // リアルタイム更新に失敗しても、初期ロードは成功しているので問題なし
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleAccept = async (invitation: InvitationWithDetails) => {
    if (!user || processing.includes(invitation.id)) return;
    
    setProcessing(prev => [...prev, invitation.id]);
    
    try {
      // 既にメンバーかチェック
      const memberQuery = query(
        collection(db, 'community_members'),
        where('communityId', '==', invitation.communityId),
        where('userId', '==', user.uid)
      );
      const existingMemberSnapshot = await getDocs(memberQuery);
      
      if (existingMemberSnapshot.empty) {
        // 新規メンバーとして追加
        const memberData: Omit<CommunityMember, 'id'> = {
          communityId: invitation.communityId,
          userId: user.uid,
          role: CommunityRole.MEMBER,
          joinedAt: Date.now(),
          isActive: true
        };
        
        await addDoc(collection(db, 'community_members'), memberData);
      } else {
        // 既存のメンバーレコードがある場合（退会済みメンバーの再参加）
        const existingMemberDoc = existingMemberSnapshot.docs[0];
        await updateDoc(doc(db, 'community_members', existingMemberDoc.id), {
          isActive: true,
          rejoinedAt: Date.now()
        });
      }
      
      // 招待を承認済みに更新
      await updateDoc(doc(db, 'community_invitations', invitation.id), {
        status: 'accepted',
        respondedAt: Date.now()
      });
      
      // 招待リストから削除
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('招待の承認に失敗しました');
    } finally {
      setProcessing(prev => prev.filter(id => id !== invitation.id));
    }
  };

  const handleReject = async (invitation: InvitationWithDetails) => {
    if (!user || processing.includes(invitation.id)) return;
    
    setProcessing(prev => [...prev, invitation.id]);
    
    try {
      // 招待を拒否済みに更新
      await updateDoc(doc(db, 'community_invitations', invitation.id), {
        status: 'rejected',
        respondedAt: Date.now()
      });
      
      // 招待リストから削除
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      alert('招待の拒否に失敗しました');
    } finally {
      setProcessing(prev => prev.filter(id => id !== invitation.id));
    }
  };

  // ローディング中または招待がない場合は何も表示しない
  if (!user || loading || invitations.length === 0) return null;

  return (
    <>
      {/* 通知バッジ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {invitations.length > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {invitations.length}
          </span>
        )}
      </button>

      {/* 招待リスト（ドロップダウン） */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* ドロップダウンメニュー */}
          <div className="absolute top-12 right-0 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <UserPlus className="h-4 w-4 mr-2" />
                コミュニティ招待 ({invitations.length})
              </h3>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{invitation.inviterName}</span>
                      さんから
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      「{invitation.communityName}」への招待
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(invitation)}
                      disabled={processing.includes(invitation.id)}
                      className="flex-1 flex items-center justify-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      承認
                    </button>
                    <button
                      onClick={() => handleReject(invitation)}
                      disabled={processing.includes(invitation.id)}
                      className="flex-1 flex items-center justify-center px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4 mr-1" />
                      拒否
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}