'use client';

import React, { useState } from 'react';
import { PracticeCard, PracticeDrill, PracticeDifficulty, SkillCategory, PracticeIntensity, PracticeCourtInfo } from '@/types/practice';
import { FaClock, FaPlus, FaTrash, FaTag, FaTools, FaBullseye } from 'react-icons/fa';
import { FiSave, FiX } from 'react-icons/fi';
import CourtSelector from './CourtSelector';

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
    objectives: card?.objectives || [''],
    drills: card?.drills || [] as PracticeDrill[],
    estimatedDuration: card?.estimatedDuration || 60,
    difficulty: card?.difficulty || 'beginner' as PracticeDifficulty,
    skillCategories: card?.skillCategories || [] as SkillCategory[],
    equipment: card?.equipment || [''],
    courtInfo: card?.courtInfo || undefined,
    notes: card?.notes || '',
    tags: card?.tags || [''],
    isPublic: card?.isPublic || false,
    rating: card?.rating || undefined,
  });

  const difficultyOptions = [
    { value: 'beginner', label: '初級', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: '中級', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: '上級', color: 'bg-red-100 text-red-800' },
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

  const intensityLevels = [
    { value: 'low', label: '軽い' },
    { value: 'medium', label: '普通' },
    { value: 'high', label: 'きつい' },
    { value: 'very_high', label: '非常にきつい' },
  ];

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }));
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
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

  const addDrill = () => {
    const newDrill: PracticeDrill = {
      id: Date.now().toString(),
      name: '',
      description: '',
      duration: 10,
      intensity: 'medium',
      skillCategory: 'serve',
    };
    setFormData(prev => ({
      ...prev,
      drills: [...prev.drills, newDrill]
    }));
  };

  const updateDrill = (index: number, updates: Partial<PracticeDrill>) => {
    setFormData(prev => ({
      ...prev,
      drills: prev.drills.map((drill, i) => 
        i === index ? { ...drill, ...updates } : drill
      )
    }));
  };

  const removeDrill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      drills: prev.drills.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalDuration = () => {
    return formData.drills.reduce((total, drill) => total + drill.duration, 0);
  };

  const handleSkillCategoryChange = (category: SkillCategory, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      skillCategories: checked 
        ? [...prev.skillCategories, category]
        : prev.skillCategories.filter(cat => cat !== category)
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
      objectives: formData.objectives.filter(obj => obj.trim() !== ''),
      equipment: formData.equipment.filter(eq => eq.trim() !== ''),
      tags: formData.tags.filter(tag => tag.trim() !== ''),
      estimatedDuration: calculateTotalDuration() || formData.estimatedDuration,
    };
    
    onSave(filteredData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {card ? '練習カードを編集' : '新しい練習カード'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カードタイトル *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="例: 基礎サーブ練習"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              難易度
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as PracticeDifficulty }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficultyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            練習内容の説明 *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="この練習カードの概要を説明してください"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 練習目標 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              <FaBullseye className="inline w-4 h-4 mr-1" />
              練習目標
            </label>
            <button
              type="button"
              onClick={addObjective}
              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="w-3 h-3 mr-1" />
              目標追加
            </button>
          </div>
          <div className="space-y-2">
            {formData.objectives.map((objective, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => updateObjective(index, e.target.value)}
                  placeholder="練習目標を入力"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 対象スキル */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            対象スキルカテゴリ
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {skillCategories.map(skill => (
              <label key={skill.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.skillCategories.includes(skill.value as SkillCategory)}
                  onChange={(e) => handleSkillCategoryChange(skill.value as SkillCategory, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{skill.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 練習メニュー */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              練習メニュー
            </label>
            <button
              type="button"
              onClick={addDrill}
              className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPlus className="w-3 h-3 mr-1" />
              メニュー追加
            </button>
          </div>
          <div className="space-y-4">
            {formData.drills.map((drill, index) => (
              <div key={drill.id} className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    value={drill.name}
                    onChange={(e) => updateDrill(index, { name: e.target.value })}
                    placeholder="メニュー名"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <FaClock className="w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={drill.duration}
                      onChange={(e) => updateDrill(index, { duration: parseInt(e.target.value) || 0 })}
                      placeholder="時間"
                      min="1"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-500">分</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <select
                    value={drill.skillCategory}
                    onChange={(e) => updateDrill(index, { skillCategory: e.target.value as SkillCategory })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {skillCategories.map(skill => (
                      <option key={skill.value} value={skill.value}>
                        {skill.label}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={drill.intensity}
                    onChange={(e) => updateDrill(index, { intensity: e.target.value as PracticeIntensity })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {intensityLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <textarea
                  value={drill.description}
                  onChange={(e) => updateDrill(index, { description: e.target.value })}
                  placeholder="メニューの詳細説明"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeDrill(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {formData.drills.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <FaClock className="inline w-4 h-4 mr-1" />
                合計練習時間: {calculateTotalDuration()}分
              </p>
            </div>
          )}
        </div>

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
              className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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