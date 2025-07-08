import React, { useState } from 'react';
import { firestoreDb } from '@/utils/db';

const BackupPanel: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  const handleExport = async () => {
    try {
      const data = await firestoreDb.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badminton-analysis-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage('バックアップファイルをダウンロードしました');
    } catch (error) {
      setMessage('バックアップのエクスポートに失敗しました');
      console.error(error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as string;
        await firestoreDb.importData(data);
        setMessage('バックアップのインポートが完了しました');
        // ページをリロードして新しいデータを反映
        window.location.reload();
      };
      reader.readAsText(file);
    } catch (error) {
      setMessage('バックアップのインポートに失敗しました');
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-4">データのバックアップ</h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={handleExport}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            バックアップをエクスポート
          </button>
          <p className="text-sm text-gray-500 mt-1">
            現在のデータをJSONファイルとして保存します
          </p>
        </div>

        <div>
          <label className="block">
            <span className="sr-only">バックアップファイルを選択</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </label>
          <p className="text-sm text-gray-500 mt-1">
            JSONファイルからデータを復元します
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded ${
            message.includes('失敗') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupPanel; 