'use client';

import React, { useState } from 'react';
import { FiLayers, FiZap, FiArrowRight, FiX } from 'react-icons/fi';
import { FaRegClock, FaRegEdit } from 'react-icons/fa';
import PracticeCardForm from './PracticeCardForm';
import EnhancedPracticeCardForm from './EnhancedPracticeCardForm';
import { PracticeCard } from '@/types/practice';

interface PracticeCardCreationSelectorProps {
  card?: PracticeCard;
  onSave: (card: Omit<PracticeCard, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type CreationMode = 'select' | 'simple' | 'enhanced';

const PracticeCardCreationSelector: React.FC<PracticeCardCreationSelectorProps> = ({
  card,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [mode, setMode] = useState<CreationMode>('select');

  const handleModeSelect = (selectedMode: 'simple' | 'enhanced') => {
    setMode(selectedMode);
  };

  const handleBack = () => {
    setMode('select');
  };

  const handleFormCancel = () => {
    if (card) {
      // 編集モードの場合は直接キャンセル
      onCancel();
    } else {
      // 新規作成の場合は選択画面に戻る
      setMode('select');
    }
  };

  if (mode === 'simple') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          {!card && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 z-10 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiArrowRight className="w-5 h-5 transform rotate-180" />
            </button>
          )}
          <PracticeCardForm
            card={card}
            onSave={onSave}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  if (mode === 'enhanced') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
          {!card && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 z-10 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiArrowRight className="w-5 h-5 transform rotate-180" />
            </button>
          )}
          <EnhancedPracticeCardForm
            card={card}
            onSave={onSave}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  // 作成方法選択画面
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">練習カード作成</h2>
              <p className="text-gray-600 mt-1">作成方法を選択してください</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* シンプル作成 */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleModeSelect('simple')}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <FiZap className="w-8 h-8 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">シンプル作成</h3>
                <p className="text-gray-600 mb-4">
                  基本的な練習カードを素早く作成。必要最小限の情報で効率的に管理できます。
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaRegClock className="w-4 h-4 mr-2 text-blue-500" />
                    約2-3分で完了
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaRegEdit className="w-4 h-4 mr-2 text-blue-500" />
                    基本情報のみ入力
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">含まれる項目:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• タイトル・説明</li>
                    <li>• 練習内容・難易度</li>
                    <li>• 必要な用具</li>
                    <li>• タグ・メモ</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => handleModeSelect('simple')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center group"
                >
                  シンプル作成を開始
                  <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* 作り込み作成 */}
            <div className="group">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => handleModeSelect('enhanced')}
              >
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 group-hover:bg-purple-200 transition-colors">
                  <FiLayers className="w-8 h-8 text-purple-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">作り込み作成</h3>
                <p className="text-gray-600 mb-4">
                  詳細な練習メニューを作成。視覚的な図解や共有設定など、高度な機能を利用できます。
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaRegClock className="w-4 h-4 mr-2 text-purple-500" />
                    約5-10分で完了
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaRegEdit className="w-4 h-4 mr-2 text-purple-500" />
                    詳細設定まで対応
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">含まれる項目:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 基本情報 + 詳細設定</li>
                    <li>• コート図解・視覚的説明</li>
                    <li>• 選手配置・軌道図</li>
                    <li>• 共有設定・公開範囲</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => handleModeSelect('enhanced')}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center group"
                >
                  作り込み作成を開始
                  <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">💡 どちらを選べばいい？</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong className="text-blue-600">シンプル作成がおすすめ:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• 素早く練習メニューを管理したい</li>
                  <li>• 個人用の練習記録として使いたい</li>
                  <li>• 基本的な情報だけで十分</li>
                </ul>
              </div>
              <div>
                <strong className="text-purple-600">作り込み作成がおすすめ:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• 詳細な練習メニューを作成したい</li>
                  <li>• 他の人と共有する予定がある</li>
                  <li>• 視覚的な説明を加えたい</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeCardCreationSelector;