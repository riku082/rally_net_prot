'use client';

import React, { useState } from 'react';
import { Practice, PracticeType, PracticeIntensity, PracticeSkill, SkillCategory, PracticeCard, PracticeCardExecution, PracticeRoutineExecution } from '@/types/practice';
import { FaClock, FaCalendarAlt, FaStar, FaPlus, FaTrash, FaLayerGroup } from 'react-icons/fa';
import { FiSave, FiX } from 'react-icons/fi';
import RoutineBuilder from './RoutineBuilder';

interface PracticeFormProps {
  practice?: Practice;
  onSave: (practice: Omit<Practice, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialDate?: string;
  availableCards?: PracticeCard[];
}

const PracticeForm: React.FC<PracticeFormProps> = ({ 
  practice, 
  onSave, 
  onCancel, 
  isLoading = false,
  initialDate,
  availableCards = []
}) => {
  const [formData, setFormData] = useState({
    date: practice?.date || initialDate || new Date().toISOString().split('T')[0],
    startTime: practice?.startTime || '10:00',
    endTime: practice?.endTime || '12:00',
    type: practice?.type || 'basic_practice' as PracticeType,
    intensity: practice?.intensity || 'medium' as PracticeIntensity,
    title: practice?.title || '',
    description: practice?.description || '',
    notes: practice?.notes || '',
    skills: practice?.skills || [] as PracticeSkill[],
    goals: practice?.goals || [],
    achievements: practice?.achievements || [],
    routine: practice?.routine || null as PracticeRoutineExecution | null,
  });

  const [routineCards, setRoutineCards] = useState<PracticeCardExecution[]>(
    practice?.routine?.cards || []
  );
  const [useRoutine, setUseRoutine] = useState(!!practice?.routine);

  const practiceTypes = [
    { value: 'basic_practice', label: '基礎練習' },
    { value: 'game_practice', label: 'ゲーム練習' },
    { value: 'physical_training', label: 'フィジカル' },
    { value: 'technical_drill', label: 'テクニカル' },
    { value: 'strategy_practice', label: '戦術練習' },
    { value: 'match_simulation', label: '試合形式' },
    { value: 'individual_practice', label: '個人練習' },
    { value: 'group_practice', label: 'グループ練習' },
  ];

  const intensityLevels = [
    { value: 'low', label: '軽い', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: '普通', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'きつい', color: 'bg-orange-100 text-orange-800' },
    { value: 'very_high', label: '非常にきつい', color: 'bg-red-100 text-red-800' },
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

  const calculateDuration = () => {
    if (useRoutine && routineCards.length > 0) {
      // ルーティンを使用する場合は、カードの合計時間を使用
      return routineCards.reduce((sum, card) => sum + (card.actualDuration || card.plannedDuration), 0);
    }
    
    // 通常の練習の場合は、開始時間と終了時間から計算
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60));
  };

  const handleRoutineCardsChange = (cards: PracticeCardExecution[]) => {
    setRoutineCards(cards);
    
    // ルーティンを使用している場合、時間を自動調整
    if (useRoutine && cards.length > 0) {
      const totalDuration = cards.reduce((sum, card) => sum + card.plannedDuration, 0);
      const startTime = new Date(`2000-01-01T${formData.startTime}:00`);
      const endTime = new Date(startTime.getTime() + totalDuration * 60000);
      
      setFormData(prev => ({
        ...prev,
        endTime: endTime.toTimeString().slice(0, 5),
        title: prev.title || `練習ルーティン (${cards.length}種目)`,
        goals: cards.map(card => card.cardTitle)
      }));
    }
  };

  const toggleRoutineMode = (enabled: boolean) => {
    setUseRoutine(enabled);
    if (!enabled) {
      setRoutineCards([]);
      setFormData(prev => ({ ...prev, routine: null }));
    } else if (routineCards.length === 0) {
      // ルーティンモードを有効にしたときに、タイトルを初期化
      setFormData(prev => ({
        ...prev,
        title: prev.title || '練習ルーティン'
      }));
    }
  };

  const addSkill = () => {
    const newSkill: PracticeSkill = {
      id: Date.now().toString(),
      name: '',
      category: 'serve',
      rating: 3,
      improvement: 0,
      notes: '',
    };
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const updateSkill = (index: number, updates: Partial<PracticeSkill>) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, ...updates } : skill
      )
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration();
    
    let routine: PracticeRoutineExecution | undefined = undefined;
    
    if (useRoutine && routineCards.length > 0) {
      routine = {
        cards: routineCards,
        totalPlannedDuration: routineCards.reduce((sum, card) => sum + card.plannedDuration, 0),
        totalActualDuration: routineCards.reduce((sum, card) => sum + (card.actualDuration || card.plannedDuration), 0),
        completedCards: routineCards.filter(card => card.completed).length,
        notes: formData.notes
      };
    }
    
    onSave({
      ...formData,
      duration,
      routine,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {practice ? '練習記録を編集' : '新しい練習記録'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* 基本情報 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendarAlt className="inline w-4 h-4 mr-1" />
              練習日
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              練習タイトル
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="例: 午前練習、個人練習"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* 時間設定 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaClock className="inline w-4 h-4 mr-1" />
              開始時間
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              終了時間
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              練習時間
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
              {calculateDuration()}分
            </div>
          </div>
        </div>

        {/* 練習タイプと強度 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              練習タイプ
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PracticeType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {practiceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              練習強度
            </label>
            <select
              value={formData.intensity}
              onChange={(e) => setFormData(prev => ({ ...prev, intensity: e.target.value as PracticeIntensity }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {intensityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            練習内容
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="練習メニューや内容を記録してください"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ルーティンモード切り替え */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center justify-between mb-4">
            <label className="flex items-start sm:items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useRoutine}
                onChange={(e) => toggleRoutineMode(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 sm:mt-0"
              />
              <span className="text-sm font-medium text-gray-700 flex items-start sm:items-center">
                <FaLayerGroup className="w-4 h-4 mr-1 sm:mr-2 mt-0.5 sm:mt-0 flex-shrink-0" />
                <span className="leading-tight">練習カードを組み合わせてルーティンを作成</span>
              </span>
            </label>
          </div>
          
          {useRoutine && (
            <div className="mt-4">
              <RoutineBuilder
                availableCards={availableCards}
                selectedCards={routineCards}
                onCardsChange={handleRoutineCardsChange}
              />
            </div>
          )}
          
          {!useRoutine && (
            <p className="text-sm text-gray-500">
              練習カードを選択して組み合わせることで、構造化された練習ルーティンを作成できます。
            </p>
          )}
        </div>

        {/* スキル評価 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              スキル評価
            </label>
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="w-3 h-3 mr-1" />
              スキル追加
            </button>
          </div>

          <div className="space-y-3">
            {formData.skills.map((skill, index) => (
              <div key={skill.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start sm:items-center">
                  <div>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(index, { name: e.target.value })}
                      placeholder="スキル名"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <select
                      value={skill.category}
                      onChange={(e) => updateSkill(index, { category: e.target.value as SkillCategory })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {skillCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-1 sm:justify-center">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => updateSkill(index, { rating })}
                        className={`p-1 ${rating <= skill.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      >
                        <FaStar className="w-4 h-4" />
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end sm:justify-center">
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メモ・反省点
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="練習の反省点や気づいたことを記録してください"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 送信ボタン */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 order-1 sm:order-2"
          >
            <FiSave className="w-4 h-4 mr-2" />
            {isLoading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PracticeForm;