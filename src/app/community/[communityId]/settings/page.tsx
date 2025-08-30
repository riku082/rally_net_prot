'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/utils/firebase';
import { 
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { 
  Community, 
  CommunityMember,
  CommunityRole
} from '@/types/community';
import Link from 'next/link';
import { 
  ChevronLeft,
  Upload,
  Image,
  Settings,
  Save,
  AlertCircle,
  Loader2,
  X,
  MapPin,
  Globe,
  Lock,
  Tag,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function CommunitySettingsPage() {
  const params = useParams();
  const communityId = params.communityId as string;
  const { user } = useAuth();
  const router = useRouter();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [uploadingTop, setUploadingTop] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [memberRole, setMemberRole] = useState<CommunityRole | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    location: '',
    category: ''
  });

  const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(null);
  const [topImagePreview, setTopImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchCommunityAndCheckPermission();
  }, [user, communityId]);

  const fetchCommunityAndCheckPermission = async () => {
    if (!user) return;

    try {
      // コミュニティ情報を取得
      const communityDoc = await getDoc(doc(db, 'communities', communityId));
      if (!communityDoc.exists()) {
        router.push(`/community/${communityId}`);
        return;
      }

      const communityData = {
        id: communityDoc.id,
        ...communityDoc.data()
      } as Community;
      setCommunity(communityData);
      
      // フォームに既存データをセット
      setFormData({
        name: communityData.name,
        description: communityData.description || '',
        isPublic: communityData.isPublic ?? true,
        location: communityData.location || '',
        category: communityData.category || ''
      });

      setHeaderImagePreview(communityData.headerImageUrl || null);
      setTopImagePreview(communityData.topImageUrl || null);

      // 権限確認（オーナーまたは管理者のみ）
      const memberQuery = query(
        collection(db, 'community_members'),
        where('communityId', '==', communityId),
        where('userId', '==', user.uid),
        where('isActive', '==', true)
      );
      const memberSnapshot = await getDocs(memberQuery);
      
      if (!memberSnapshot.empty) {
        const memberData = memberSnapshot.docs[0].data() as CommunityMember;
        setMemberRole(memberData.role);
        if (memberData.role === CommunityRole.OWNER || memberData.role === CommunityRole.ADMIN) {
          setHasPermission(true);
        }
      }

    } catch (error) {
      console.error('Error fetching community:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'header' | 'top') => {
    if (!file || !user) return;

    const setUploading = type === 'header' ? setUploadingHeader : setUploadingTop;
    const setPreview = type === 'header' ? setHeaderImagePreview : setTopImagePreview;
    
    setUploading(true);

    try {
      // Firebase Storageにアップロード
      const storageRef = ref(
        storage,
        `communities/${communityId}/${type}_${Date.now()}_${file.name}`
      );
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // プレビュー更新
      setPreview(downloadURL);
      
      // 古い画像があれば削除（後で実装）
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('画像のアップロードに失敗しました');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission || saving) return;

    setSaving(true);

    try {
      const updateData: any = {
        name: formData.name,
        isPublic: formData.isPublic,
        updatedAt: Date.now()
      };

      // 空でない値のみ追加
      if (formData.description) {
        updateData.description = formData.description;
      }
      if (formData.location) {
        updateData.location = formData.location;
      }
      if (formData.category) {
        updateData.category = formData.category;
      }

      // 画像URLがプレビューにあれば更新
      if (headerImagePreview !== community?.headerImageUrl) {
        if (headerImagePreview) {
          updateData.headerImageUrl = headerImagePreview;
        } else {
          // 削除する場合はnullを設定
          updateData.headerImageUrl = null;
        }
      }
      if (topImagePreview !== community?.topImageUrl) {
        if (topImagePreview) {
          updateData.topImageUrl = topImagePreview;
        } else {
          // 削除する場合はnullを設定
          updateData.topImageUrl = null;
        }
      }

      await updateDoc(doc(db, 'communities', communityId), updateData);
      
      alert('設定を保存しました');
      router.push(`/community/${communityId}`);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'top') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    await handleImageUpload(file, type);
  };

  const removeImage = (type: 'header' | 'top') => {
    if (type === 'header') {
      setHeaderImagePreview(null);
    } else {
      setTopImagePreview(null);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!community || deleteConfirmText !== community.name || deleting) return;

    setDeleting(true);

    try {
      // 1. コミュニティのすべてのイベントを削除
      const eventsQuery = query(
        collection(db, 'communities', communityId, 'events')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      
      for (const eventDoc of eventsSnapshot.docs) {
        const eventId = eventDoc.id;
        
        // イベント関連データを削除
        // 参加情報
        const participationsQuery = query(
          collection(db, 'event_participations'),
          where('eventId', '==', eventId)
        );
        const participationsSnapshot = await getDocs(participationsQuery);
        for (const doc of participationsSnapshot.docs) {
          await deleteDoc(doc.ref);
        }
        
        // コメント
        const commentsQuery = query(
          collection(db, 'event_comments'),
          where('eventId', '==', eventId)
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        for (const doc of commentsSnapshot.docs) {
          await deleteDoc(doc.ref);
        }
        
        // イベント本体を削除
        await deleteDoc(eventDoc.ref);
      }

      // 2. コミュニティメンバーを削除
      const membersQuery = query(
        collection(db, 'community_members'),
        where('communityId', '==', communityId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      for (const doc of membersSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // 3. コミュニティ招待を削除
      const invitationsQuery = query(
        collection(db, 'community_invitations'),
        where('communityId', '==', communityId)
      );
      const invitationsSnapshot = await getDocs(invitationsQuery);
      for (const doc of invitationsSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // 4. 練習記録（コミュニティに紐付いているもの）を削除
      const practicesQuery = query(
        collection(db, 'practices'),
        where('communityId', '==', communityId)
      );
      const practicesSnapshot = await getDocs(practicesQuery);
      for (const doc of practicesSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // 5. 試合記録（コミュニティに紐付いているもの）を削除
      const matchesQuery = query(
        collection(db, 'matches'),
        where('communityId', '==', communityId)
      );
      const matchesSnapshot = await getDocs(matchesQuery);
      for (const doc of matchesSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // 6. Storage内の画像を削除（必要に応じて）
      // TODO: Firebase Storageから画像を削除する処理を追加

      // 7. 最後にコミュニティ本体を削除
      await deleteDoc(doc(db, 'communities', communityId));

      // 削除完了後、コミュニティ一覧ページへリダイレクト
      window.location.href = '/community';
    } catch (error) {
      console.error('Error deleting community:', error);
      alert('コミュニティの削除に失敗しました');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/community/${communityId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            コミュニティに戻る
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-red-900">
                アクセス権限がありません
              </h2>
              <p className="mt-1 text-sm text-red-700">
                コミュニティの設定を変更する権限がありません。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          href={`/community/${communityId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          コミュニティに戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">
          コミュニティ設定
        </h1>
        <p className="mt-2 text-gray-600">
          {community?.name}の設定を変更します
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ヘッダー画像 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ヘッダー画像
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            コミュニティページ上部に表示される画像です（推奨: 1920x400px）
          </p>

          <div className="space-y-4">
            {headerImagePreview ? (
              <div className="relative">
                <img
                  src={headerImagePreview}
                  alt="ヘッダー画像"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage('header')}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, 'header')}
              className="hidden"
              id="header-image-upload"
            />
            <label
              htmlFor="header-image-upload"
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg cursor-pointer transition-colors"
            >
              {uploadingHeader ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Upload className="h-5 w-5 mr-2" />
              )}
              {uploadingHeader ? 'アップロード中...' : 'ヘッダー画像を選択'}
            </label>
          </div>
        </div>

        {/* トップ画像 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            トップ画像（サムネイル）
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            コミュニティ一覧で表示される画像です（推奨: 800x600px）
          </p>

          <div className="space-y-4">
            {topImagePreview ? (
              <div className="relative inline-block">
                <img
                  src={topImagePreview}
                  alt="トップ画像"
                  className="w-64 h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage('top')}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-64 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, 'top')}
              className="hidden"
              id="top-image-upload"
            />
            <label
              htmlFor="top-image-upload"
              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg cursor-pointer transition-colors"
            >
              {uploadingTop ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Upload className="h-5 w-5 mr-2" />
              )}
              {uploadingTop ? 'アップロード中...' : 'トップ画像を選択'}
            </label>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            基本情報
          </h3>

          <div className="space-y-4">
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
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={4}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                活動地域
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: 東京都渋谷区"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                カテゴリー
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">選択してください</option>
                <option value="beginner">初心者向け</option>
                <option value="intermediate">中級者向け</option>
                <option value="advanced">上級者向け</option>
                <option value="mixed">レベル混合</option>
                <option value="competitive">競技志向</option>
                <option value="casual">カジュアル</option>
                <option value="junior">ジュニア</option>
                <option value="senior">シニア</option>
              </select>
            </div>

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
                  <div>
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
                  <div>
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
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end gap-3">
          <Link
            href={`/community/${communityId}`}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={saving || uploadingHeader || uploadingTop}
            className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                設定を保存
              </>
            )}
          </button>
        </div>
      </form>

      {/* 危険ゾーン - オーナーのみ表示 */}
      {memberRole === CommunityRole.OWNER && (
        <div className="mt-12 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            危険ゾーン
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">コミュニティを削除</h4>
              <p className="text-sm text-gray-600 mb-4">
                コミュニティを削除すると、すべてのデータ（イベント、メンバー情報、投稿など）が完全に削除されます。
                この操作は取り消すことができません。
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                コミュニティを削除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              本当に削除しますか？
            </h3>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 mb-2">
                <strong>警告:</strong> この操作は取り消すことができません。
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• すべてのイベントが削除されます</li>
                <li>• すべてのメンバー情報が削除されます</li>
                <li>• すべての投稿とコメントが削除されます</li>
                <li>• アップロードされた画像が削除されます</li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              削除を実行するには、以下にコミュニティ名「<strong>{community?.name}</strong>」を入力してください。
            </p>
            
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="コミュニティ名を入力"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteCommunity}
                disabled={deleteConfirmText !== community?.name || deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <span className="inline-flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    削除中...
                  </span>
                ) : (
                  '削除する'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}