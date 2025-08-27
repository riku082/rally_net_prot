'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  getDocs
} from 'firebase/firestore';
import { EventComment } from '@/types/community';
import { 
  MessageCircle,
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  User,
  Clock
} from 'lucide-react';

interface EventCommentsProps {
  eventId: string;
  communityId: string;
}

export default function EventComments({ eventId, communityId }: EventCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<EventComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || !eventId) return;

    const unsubscribe = subscribeToComments();
    return () => unsubscribe();
  }, [user, eventId]);

  const subscribeToComments = () => {
    const commentsQuery = query(
      collection(db, 'event_comments', eventId, 'comments'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(commentsQuery, async (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventComment[];

      // ユーザー名を取得
      const uniqueUserIds = [...new Set(commentsData.map(c => c.userId))];
      const names: Record<string, string> = {};
      
      for (const userId of uniqueUserIds) {
        if (!userNames[userId]) {
          const userDoc = await getDocs(
            query(collection(db, 'users'), where('__name__', '==', userId))
          );
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            names[userId] = userData.displayName || userData.name || 'ユーザー';
          } else {
            names[userId] = 'ユーザー';
          }
        } else {
          names[userId] = userNames[userId];
        }
      }
      
      setUserNames(prev => ({ ...prev, ...names }));
      setComments(commentsData);
    });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);

    try {
      const commentData: Omit<EventComment, 'id'> = {
        eventId,
        userId: user.uid,
        userName: userNames[user.uid] || user.displayName || 'ユーザー',
        content: newComment.trim(),
        createdAt: Date.now()
      };

      await addDoc(collection(db, 'event_comments', eventId, 'comments'), commentData);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('コメントの投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingContent.trim() || submitting) return;

    setSubmitting(true);

    try {
      await updateDoc(
        doc(db, 'event_comments', eventId, 'comments', commentId),
        {
          content: editingContent.trim(),
          updatedAt: Date.now()
        }
      );
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('コメントの編集に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('このコメントを削除してもよろしいですか？')) return;

    try {
      await deleteDoc(doc(db, 'event_comments', eventId, 'comments', commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('コメントの削除に失敗しました');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <MessageCircle className="h-5 w-5 mr-2 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          コメント ({comments.length})
        </h3>
      </div>

      {/* コメント投稿フォーム */}
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || ''}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="コメントを入力..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? '送信中...' : 'コメント'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* コメントリスト */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">まだコメントがありません</p>
          <p className="text-sm text-gray-400 mt-1">
            最初のコメントを投稿してみましょう
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex-shrink-0">
                {comment.userPhotoURL ? (
                  <img
                    src={comment.userPhotoURL}
                    alt={comment.userName || ''}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">
                        {userNames[comment.userId] || comment.userName || 'ユーザー'}
                        {comment.userId === user?.uid && (
                          <span className="ml-2 text-xs text-gray-500">(自分)</span>
                        )}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {formatTime(comment.createdAt)}
                        {comment.updatedAt && ' (編集済み)'}
                      </span>
                    </div>
                    
                    {comment.userId === user?.uid && (
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === comment.id ? null : comment.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </button>
                        
                        {showActions === comment.id && (
                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingContent(comment.content);
                                setShowActions(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              編集
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteComment(comment.id);
                                setShowActions(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              削除
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingContent('');
                          }}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          disabled={!editingContent.trim() || submitting}
                          className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50"
                        >
                          {submitting ? '保存中...' : '保存'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}