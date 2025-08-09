'use client';

import React, { useState, useEffect } from 'react';
import { PracticeCard, PracticeDrill, PracticeDifficulty, SkillCategory, PracticeCourtInfo, PracticeVisualInfo, PracticeMenuType } from '@/types/practice';
import { FaClock, FaPlus, FaTrash, FaTag, FaTools, FaBullseye, FaChevronLeft, FaChevronRight, FaCheck } from 'react-icons/fa';
import { FiSave, FiX } from 'react-icons/fi';
import { MdSportsBaseball } from 'react-icons/md';
import { GiShuttlecock } from 'react-icons/gi';
import CourtSelector from './CourtSelectorSimple';
import PracticeCardVisualEditor from './PracticeCardVisualEditor';

interface PracticeCardFormProps {
  card?: PracticeCard;
  onSave: (card: Omit<PracticeCard, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PracticeCardForm: React.FC<PracticeCardFormProps> = ({ 
  card, 
  onSave, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: card?.title || '',
    description: card?.description || '',
    drill: card?.drill || {
      id: Date.now().toString(),
      name: '',
      description: '',
      duration: 10,
      skillCategory: 'serve' as SkillCategory,
    } as PracticeDrill,
    difficulty: card?.difficulty || 'beginner' as PracticeDifficulty,
    equipment: card?.equipment || [''],
    courtInfo: card?.courtInfo || undefined,
    practiceType: card?.practiceType || undefined,
    visualInfo: card?.visualInfo || undefined,
    notes: card?.notes || '',
    tags: card?.tags || [''],
    isPublic: card?.isPublic || false,
    rating: card?.rating || undefined,
  });
  
  const [useVisualEditor, setUseVisualEditor] = useState(!!card?.visualInfo); // 既存カードの場合のみビジュアルエディタを使用

  const difficultyOptions = [
    { value: 'beginner', label: '軽い', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: '普通', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'きつい', color: 'bg-red-100 text-red-800' },
  ];

  const skillCategories = [
    { value: 'serve', label: 'サーブ' },
    { value: 'receive', label: 'レシーブ' },
    { value: 'clear', label: 'クリア' },
    { value: 'drop', label: 'ドロップ' },
    { value: 'smash', label: 'スマッシュ' },
    { value: 'net_play', label: 'ネットプレイ' },
    { value: 'drive', label: 'ドライブ' },
    { value: 'footwork', label: 'フットワーク' },
    { value: 'defense', label: '守備' },
    { value: 'strategy', label: '戦術' },
    { value: 'physical', label: 'フィジカル' },
    { value: 'mental', label: 'メンタル' },
  ];

  const updateDrill = (updates: Partial<PracticeDrill>) => {
    setFormData(prev => ({
      ...prev,
      drill: { ...prev.drill, ...updates }
    }));
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, '']
    }));
  };

  const updateEquipment = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.map((eq, i) => i === index ? value : eq)
    }));
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleCourtInfoChange = (courtInfo: PracticeCourtInfo) => {
    setFormData(prev => ({
      ...prev,
      courtInfo: courtInfo.targetAreas.length > 0 ? courtInfo : undefined
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // フィルタリングして空の項目を除去
    const filteredData = {
      ...formData,
      equipment: formData.equipment.filter(eq => eq.trim() !== ''),
      tags: formData.tags.filter(tag => tag.trim() !== ''),
      visualInfo: useVisualEditor ? formData.visualInfo : undefined,
      practiceType: useVisualEditor ? formData.practiceType : undefined,
    };
    
    onSave(filteredData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {card ? '練習カードを編集' : '新しい練習カード'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 通常フォーム */}
          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  練習名
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    updateDrill({ name: e.target.value });
                  }}
                  placeholder="例: 基礎サーブ練習"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  練習強度
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as PracticeDifficulty }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                >
                  {difficultyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 練習時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                練習時間
              </label>
              <div className="flex items-center space-x-2 max-w-xs">
                <FaClock className="w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.drill.duration}
                  onChange={(e) => updateDrill({ duration: parseInt(e.target.value) || 0 })}
                  placeholder="時間"
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                />
                <span className="text-sm text-gray-500">分</span>
              </div>
            </div>

            {/* 練習内容の説明 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                練習内容の説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }));
                  updateDrill({ description: e.target.value });
                }}
                placeholder="この練習の内容や手順を詳しく説明してください"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
              />
            </div>

            {/* ビジュアルエディター使用オプション */}
            <div>
              <label className="flex items-start sm:items-center cursor-pointer group bg-gradient-to-r from-purple-50 to-blue-50 p-3 sm:p-4 rounded-xl border-2 border-purple-200">
                <input
                  type="checkbox"
                  checked={useVisualEditor}
                  onChange={(e) => {
                    setUseVisualEditor(e.target.checked);
                    if (!e.target.checked) {
                      setFormData(prev => ({ ...prev, practiceType: undefined, visualInfo: undefined }));
                    }
                  }}
                  className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-purple-600 rounded focus:ring-purple-500 focus:ring-2 flex-shrink-0 mt-0.5 sm:mt-0"
                />
                <div className="flex-1">
                  <span className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                    <MdSportsBaseball className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600" />
                    ビジュアルエディターを使用する
                  </span>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    コート上でプレイヤー配置やショット軌道を視覚的に編雈できます
                  </p>
                </div>
                {useVisualEditor && (
                  <span className="text-xs sm:text-sm text-purple-600 font-medium animate-pulse ml-2 sm:ml-4 flex-shrink-0">
                    ✨ 推奨
                  </span>
                )}
              </label>
            </div>

            {/* ビジュアルエディター */}
            {useVisualEditor && (
              <div className="space-y-4">
                {/* 練習タイプ選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    練習タイプ
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'knock_practice', label: 'ノック練習', description: 'コーチが球出しをして練習' },
                      { value: 'pattern_practice', label: 'パターン練習', description: '決まった配球パターンを反復' },
                      { value: 'footwork_practice', label: 'フットワーク', description: '足運びとポジショニング' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, practiceType: type.value as PracticeMenuType }));
                        }}
                        className={`p-3 sm:p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-1 sm:gap-2 ${
                          formData.practiceType === type.value
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-400'
                            : 'border-gray-300 hover:border-purple-300 bg-white'
                        }`}
                      >
                        <MdSportsBaseball className={`w-6 h-6 sm:w-8 sm:h-8 ${
                          formData.practiceType === type.value ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                        <span className={`text-sm sm:text-base font-medium ${
                          formData.practiceType === type.value ? 'text-purple-700' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                        <span className={`text-[10px] sm:text-xs text-center ${
                          formData.practiceType === type.value ? 'text-purple-600' : 'text-gray-500'
                        }`}>
                          {type.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* ビジュアルエディタ */}
                {formData.practiceType && (
                  <div className="bg-white rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
                    <PracticeCardVisualEditor
                      visualInfo={formData.visualInfo || {}}
                      practiceType={formData.practiceType}
                      onUpdate={(visualInfo) => setFormData(prev => ({ ...prev, visualInfo }))}
                      courtType={formData.courtInfo?.courtType || 'singles'}
                    />
                  </div>
                )}
              </div>
            )}

            {/* コート情報 */}
            <div>
              <CourtSelector
                courtInfo={formData.courtInfo}
                onChange={handleCourtInfoChange}
              />
            </div>

            {/* 必要な用具 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  <FaTools className="inline w-4 h-4 mr-1" />
                  必要な用具
                </label>
                <button
                  type="button"
                  onClick={addEquipment}
                  className="flex items-center px-3 py-1 text-sm bg-theme-primary-600 text-white rounded-lg hover:bg-theme-primary-700 transition-colors"
                >
                  <FaPlus className="w-3 h-3 mr-1" />
                  用具追加
                </button>
              </div>
              <div className="space-y-2">
                {formData.equipment.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateEquipment(index, e.target.value)}
                      placeholder="必要な用具を入力"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                      style={{ color: '#000000' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeEquipment(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* タグ */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  <FaTag className="inline w-4 h-4 mr-1" />
                  タグ
                </label>
                <button
                  type="button"
                  onClick={addTag}
                  className="flex items-center px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <FaPlus className="w-3 h-3 mr-1" />
                  タグ追加
                </button>
              </div>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      placeholder="タグを入力"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                      style={{ color: '#000000' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ・補足事項
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="補足事項や注意点があれば記入してください"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
                style={{ color: '#000000' }}
              />
            </div>
          </div>

        {/* 送信ボタン */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-6 py-2 bg-theme-primary-600 text-white rounded-lg hover:bg-theme-primary-700 transition-colors disabled:opacity-50"
          >
            <FiSave className="w-4 h-4 mr-2" />
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PracticeCardForm;