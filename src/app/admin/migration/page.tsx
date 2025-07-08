'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { firestoreDb } from '@/utils/db';
import { useRouter } from 'next/navigation';

const MigrationPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleMigrateCurrentUser = async () => {
    if (!user?.uid) return;
    
    setMigrating(true);
    setResult('');
    
    try {
      const isMigrated = await firestoreDb.isProfileMigrated(user.uid);
      if (isMigrated) {
        setResult('プロフィールは既にマイグレーション済みです。');
      } else {
        await firestoreDb.migrateUserProfile(user.uid);
        setResult('プロフィールのマイグレーションが完了しました。');
      }
    } catch (error) {
      console.error('Migration error:', error);
      setResult(`マイグレーションに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setMigrating(false);
    }
  };

  const handleMigrateAllUsers = async () => {
    setMigrating(true);
    setResult('');
    
    try {
      await firestoreDb.migrateAllUserProfiles();
      setResult('全ユーザーのプロフィールマイグレーションが完了しました。');
    } catch (error) {
      console.error('Migration error:', error);
      setResult(`マイグレーションに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            ← 戻る
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">プロフィールマイグレーション</h1>
            
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">注意</h3>
                <p className="text-yellow-700">
                  このページはプロフィールデータを新しい形式に更新するためのものです。
                  バドミントン特化の新しいフィールドが既存のプロフィールに追加されます。
                </p>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">自分のプロフィールをマイグレーション</h3>
                  <p className="text-gray-600 mb-4">
                    現在ログインしているユーザーのプロフィールのみをマイグレーションします。
                  </p>
                  <button
                    onClick={handleMigrateCurrentUser}
                    disabled={migrating || !user}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {migrating ? 'マイグレーション中...' : '自分のプロフィールをマイグレーション'}
                  </button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">全ユーザーをマイグレーション</h3>
                  <p className="text-gray-600 mb-4">
                    データベース内の全ユーザーのプロフィールをマイグレーションします。
                    <strong className="text-red-600">管理者のみ実行してください。</strong>
                  </p>
                  <button
                    onClick={handleMigrateAllUsers}
                    disabled={migrating}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {migrating ? 'マイグレーション中...' : '全ユーザーをマイグレーション'}
                  </button>
                </div>
              </div>

              {result && (
                <div className={`p-4 rounded-lg ${result.includes('失敗') || result.includes('エラー') 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
                }`}>
                  <p>{result}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationPage;