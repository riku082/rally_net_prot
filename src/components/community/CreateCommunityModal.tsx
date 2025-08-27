'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { Community, CommunityMember, CommunityRole } from '@/types/community';
import { X, Users, Lock, Globe } from 'lucide-react';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (communityId: string) => void;
}

export default function CreateCommunityModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateCommunityModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || loading) return;

    setLoading(true);

    try {
      // コミュニティを作成
      const communityData: Omit<Community, 'id'> = {
        name: formData.name,
        description: formData.description || undefined,
        createdBy: user.uid,
        createdAt: Date.now(),
        memberCount: 1,
        isPublic: formData.isPublic
      };

      const communityRef = await addDoc(collection(db, 'communities'), communityData);

      // 作成者をオーナーとして登録
      const memberData: Omit<CommunityMember, 'id'> = {
        communityId: communityRef.id,
        userId: user.uid,
        role: CommunityRole.OWNER,
        joinedAt: Date.now(),
        isActive: true
      };

      await addDoc(collection(db, 'community_members'), memberData);

      // 成功時の処理
      onSuccess?.(communityRef.id);
      onClose();
      
      // フォームをリセット
      setFormData({
        name: '',
        description: '',
        isPublic: true
      });

    } catch (error) {
      console.error('Error creating community:', error);
      alert('コミュニティの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">
              新しいコミュニティを作成
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* コミュニティ名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                コミュニティ名 *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: 週末バドミントンクラブ"
                maxLength={50}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/50文字
              </p>
            </div>

            {/* 説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="コミュニティの目的や活動内容を記載"
                rows={4}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500文字
              </p>
            </div>

            {/* 公開設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                公開設定
              </label>
              <div className="space-y-3">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: true })}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 text-green-600 mr-2" />
                      <span className="font-medium text-gray-900">公開</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      誰でも参加リクエストを送ることができます
                    </p>
                  </div>
                </label>

                <label className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: false })}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">非公開</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      招待された人のみ参加できます
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>注意:</strong> コミュニティを作成すると、あなたが自動的にオーナーになります。
                オーナーは管理者の任命やコミュニティ設定の変更が可能です。
              </p>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '作成中...' : 'コミュニティを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}