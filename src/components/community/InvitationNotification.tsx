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
  deleteDoc,
  getDoc,
  addDoc
} from 'firebase/firestore';
import { 
  Bell, 
  Users, 
  Check, 
  X,
  UserPlus
} from 'lucide-react';
import { CommunityInvitation, CommunityMember, CommunityRole } from '@/types/community';

interface InvitationWithCommunity extends CommunityInvitation {
  communityName?: string;
  inviterName?: string;
}

export default function InvitationNotification() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<InvitationWithCommunity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState<string[]>([]);
  const [isListenerActive, setIsListenerActive] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsListenerActive(false);
      return;
    }

    // リアルタイムで招待を監視
    const invitationsQuery = query(
      collection(db, 'community_invitations'),
      where('invitedUserId', '==', user.uid),
      where('status', '==', 'pending')
    );

    let unsubscribe: (() => void) | null = null;

    // 少し遅延してからリスナーを設定（初期ロード時のエラーを回避）
    const timer = setTimeout(() => {
      try {
        unsubscribe = onSnapshot(
          invitationsQuery, 
          async (snapshot) => {
            setIsListenerActive(true);
            const invitationsData: InvitationWithCommunity[] = [];
            
            for (const docSnapshot of snapshot.docs) {
              const invitation = {
                id: docSnapshot.id,
                ...docSnapshot.data()
              } as InvitationWithCommunity;
              
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
          },
          (error) => {
            // 権限エラーをサイレントに処理
            if (error.code === 'permission-denied') {
              // 権限がない場合は招待がないものとして扱う
              setIsListenerActive(false);
            }
            setInvitations([]);
          }
        );
      } catch (error) {
        console.log('Failed to set up invitations listener:', error);
        setIsListenerActive(false);
      }
    }, 1000); // 1秒の遅延

    return () => {
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleAccept = async (invitation: InvitationWithCommunity) => {
    if (!user || processing.includes(invitation.id)) return;
    
    setProcessing(prev => [...prev, invitation.id]);
    
    try {
      // メンバーとして追加
      const memberData: Omit<CommunityMember, 'id'> = {
        communityId: invitation.communityId,
        userId: user.uid,
        role: CommunityRole.MEMBER,
        joinedAt: Date.now(),
        isActive: true
      };
      
      await addDoc(collection(db, 'community_members'), {
        ...memberData,
        id: `${user.uid}_${invitation.communityId}`
      });
      
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

  const handleReject = async (invitation: InvitationWithCommunity) => {
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

  // ユーザーがログインしていない、またはリスナーがアクティブでない、または招待がない場合は何も表示しない
  if (!user || !isListenerActive || invitations.length === 0) return null;

  return (
    <>
      {/* 通知アイコン */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        >
          <Bell className="h-6 w-6" />
          {invitations.length > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {invitations.length}
            </span>
          )}
        </button>
      </div>

      {/* 招待リスト */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                コミュニティ招待
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="mb-3">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{invitation.inviterName}</span>
                    さんから
                  </p>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {invitation.communityName}
                  </p>
                  <p className="text-sm text-gray-600">
                    への招待が届いています
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(invitation)}
                    disabled={processing.includes(invitation.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    承認
                  </button>
                  <button
                    onClick={() => handleReject(invitation)}
                    disabled={processing.includes(invitation.id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4 mr-1" />
                    拒否
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}