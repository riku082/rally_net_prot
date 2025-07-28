'use client';

import React, { useState } from 'react';
import { PracticeCard, PracticeDrill, PracticeDifficulty, SkillCategory, PracticeCourtInfo, PracticeVisualInfo, PlayerPosition, ShotTrajectory, PracticeSharingSettings, CourtZone, PracticeCardCategory } from '@/types/practice';
import { FaClock, FaPlus, FaTrash, FaTag, FaTools, FaBullseye, FaUsers, FaShare, FaEye, FaEyeSlash, FaComment, FaStar, FaCopy, FaEdit } from 'react-icons/fa';
import { FiSave, FiX, FiMove, FiTarget, FiMapPin } from 'react-icons/fi';
import { GiShuttlecock } from 'react-icons/gi';
import PracticeCourtVisualizer from './PracticeCourtVisualizer';

interface EnhancedPracticeCardFormProps {
  card?: PracticeCard;
  onSave: (card: Omit<PracticeCard, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type FormStep = 'basic' | 'visual' | 'sharing';

const EnhancedPracticeCardForm: React.FC<EnhancedPracticeCardFormProps> = ({ 
  card, 
  onSave, 
  onCancel, 
  isLoading = false 
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [selectedAreas, setSelectedAreas] = useState<CourtZone[]>(card?.courtInfo?.targetAreas || []);
  const [focusArea, setFocusArea] = useState<CourtZone | undefined>(card?.courtInfo?.focusArea);
  
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
    courtInfo: card?.courtInfo || {
      targetAreas: [],
      courtType: 'doubles' as const
    } as PracticeCourtInfo,
    visualInfo: card?.visualInfo || {
      playerPositions: [],
      shotTrajectories: [],
      keyPoints: []
    } as PracticeVisualInfo,
    notes: card?.notes || '',
    tags: card?.tags || [''],
    isPublic: card?.isPublic || false,
    sharingSettings: card?.sharingSettings || {
      visibility: 'private' as const,
      allowComments: false,
      allowRating: false,
      allowCopy: false,
      allowModification: false
    } as PracticeSharingSettings,
    rating: card?.rating || undefined,
  });

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

  const categories: Array<{ value: PracticeCardCategory; label: string }> = [
    { value: 'basic_technique', label: '基礎技術' },
    { value: 'footwork', label: 'フットワーク' },
    { value: 'serve_practice', label: 'サーブ練習' },
    { value: 'net_play', label: 'ネットプレイ' },
    { value: 'rally_practice', label: 'ラリー練習' },
    { value: 'match_simulation', label: '試合形式' },
    { value: 'conditioning', label: 'フィジカル' },
    { value: 'strategy', label: '戦術' },
    { value: 'doubles_formation', label: 'ダブルス陣形' },
    { value: 'singles_tactics', label: 'シングルス戦術' },
  ];

  const handleAreaSelect = (area: CourtZone) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
      if (focusArea === area) {
        setFocusArea(undefined);
      }
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
    
    // Update court info
    setFormData(prev => ({
      ...prev,
      courtInfo: {
        ...prev.courtInfo,
        targetAreas: selectedAreas.includes(area) 
          ? selectedAreas.filter(a => a !== area)
          : [...selectedAreas, area],
        focusArea: focusArea
      }
    }));
  };

  const setAreaAsFocus = (area: CourtZone) => {
    if (!selectedAreas.includes(area)) {
      setSelectedAreas([...selectedAreas, area]);
    }
    setFocusArea(area);
    
    setFormData(prev => ({
      ...prev,
      courtInfo: {
        ...prev.courtInfo,
        targetAreas: selectedAreas.includes(area) ? selectedAreas : [...selectedAreas, area],
        focusArea: area
      }
    }));
  };

  const addPlayerPosition = () => {
    const newPosition: PlayerPosition = {
      id: Date.now().toString(),
      x: 200,
      y: 300,
      label: `P${(formData.visualInfo?.playerPositions?.length || 0) + 1}`,
      role: 'player'
    };
    
    setFormData(prev => ({
      ...prev,
      visualInfo: {
        ...prev.visualInfo,
        playerPositions: [...(prev.visualInfo?.playerPositions || []), newPosition]
      }
    }));
  };

  const addShotTrajectory = () => {
    const newTrajectory: ShotTrajectory = {
      id: Date.now().toString(),
      from: { x: 200, y: 400 },
      to: { x: 200, y: 200 },
      shotType: 'clear',
      order: (formData.visualInfo?.shotTrajectories?.length || 0) + 1
    };
    
    setFormData(prev => ({
      ...prev,
      visualInfo: {
        ...prev.visualInfo,
        shotTrajectories: [...(prev.visualInfo?.shotTrajectories || []), newTrajectory]
      }
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    if (!formData.drill.name.trim()) {
      alert('練習名を入力してください');
      return;
    }

    const cardData = {
      ...formData,
      equipment: formData.equipment.filter(item => item.trim() !== ''),
      tags: formData.tags.filter(tag => tag.trim() !== ''),
      courtInfo: {
        ...formData.courtInfo,
        targetAreas: selectedAreas,
        focusArea: focusArea
      }
    };

    onSave(cardData);
  };

  const addEquipmentItem = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, '']
    }));
  };

  const updateEquipmentItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.map((item, i) => i === index ? value : item)
    }));
  };

  const removeEquipmentItem = (index: number) => {
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

  const renderBasicForm = () => (
    <div className="space-y-6">
      {/* 基本情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            練習カードタイトル *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 基礎クリア練習"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            難易度
          </label>
          <div className="grid grid-cols-3 gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, difficulty: option.value as PracticeDifficulty }))}
                className={`p-2 text-sm font-medium rounded-lg transition-colors ${
                  formData.difficulty === option.value
                    ? option.color
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          説明
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="この練習カードの目的や内容を説明してください"
        />
      </div>

      {/* 練習詳細 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <GiShuttlecock className="w-5 h-5 mr-2 text-blue-600" />
          練習詳細
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              練習名 *
            </label>
            <input
              type="text"
              value={formData.drill.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                drill: { ...prev.drill, name: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 後衛からの連続クリア"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaClock className="inline w-3 h-3 mr-1" />
              時間（分）
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.drill.duration}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                drill: { ...prev.drill, duration: parseInt(e.target.value) || 10 }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スキルカテゴリ
            </label>
            <select
              value={formData.drill.skillCategory}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                drill: { ...prev.drill, skillCategory: e.target.value as SkillCategory }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {skillCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コートタイプ
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  courtInfo: { ...prev.courtInfo, courtType: 'singles' }
                }))}
                className={`p-2 text-sm font-medium rounded-lg transition-colors ${
                  formData.courtInfo.courtType === 'singles'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                シングルス
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  courtInfo: { ...prev.courtInfo, courtType: 'doubles' }
                }))}
                className={`p-2 text-sm font-medium rounded-lg transition-colors ${
                  formData.courtInfo.courtType === 'doubles'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ダブルス
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            練習内容詳細
          </label>
          <textarea
            value={formData.drill.description}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              drill: { ...prev.drill, description: e.target.value }
            }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="練習の手順や注意点を詳しく記載してください"
          />
        </div>
      </div>

      {/* 必要用具 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <FaTools className="w-4 h-4 mr-2" />
          必要用具
        </label>
        <div className="space-y-2">
          {formData.equipment.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateEquipmentItem(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: シャトル、コーン"
              />
              <button
                type="button"
                onClick={() => removeEquipmentItem(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addEquipmentItem}
            className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            用具を追加
          </button>
        </div>
      </div>

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <FaTag className="w-4 h-4 mr-2" />
          タグ
        </label>
        <div className="space-y-2">
          {formData.tags.map((tag, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={tag}
                onChange={(e) => updateTag(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 基礎、初心者向け"
              />
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addTag}
            className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            タグを追加
          </button>
        </div>
      </div>
    </div>
  );

  const renderVisualForm = () => (
    <div className="space-y-6">
      {/* コートエリア選択 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaBullseye className="w-5 h-5 mr-2 text-green-600" />
          コートエリア設定
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              練習対象エリア（複数選択可）
            </label>
            <div className="border border-gray-300 rounded-lg p-4">
              <PracticeCourtVisualizer
                selectedAreas={selectedAreas}
                focusArea={focusArea}
                onAreaSelect={handleAreaSelect}
                courtType={formData.courtInfo.courtType}
                interactive={true}
                showLabels={true}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選択されたエリア
              </label>
              <div className="border border-gray-200 rounded-lg p-3 min-h-[100px]">
                {selectedAreas.length === 0 ? (
                  <p className="text-gray-500 text-sm">エリアを選択してください</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAreas.map((area) => (
                      <div key={area} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">{area}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setAreaAsFocus(area)}
                            className={`px-2 py-1 text-xs rounded ${
                              focusArea === area
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-red-200'
                            }`}
                          >
                            {focusArea === area ? 'フォーカス中' : 'フォーカスに設定'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* プレイヤー位置とショット軌道 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <FaUsers className="w-4 h-4 mr-2 text-blue-600" />
            プレイヤー位置
          </h4>
          <div className="space-y-2">
            {formData.visualInfo?.playerPositions?.map((position, index) => (
              <div key={position.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{position.label}</span>
                <span className="text-xs text-gray-500">({position.x}, {position.y})</span>
              </div>
            ))}
            <button
              type="button"
              onClick={addPlayerPosition}
              className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              プレイヤー位置を追加
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
            <FiMove className="w-4 h-4 mr-2 text-purple-600" />
            ショット軌道
          </h4>
          <div className="space-y-2">
            {formData.visualInfo?.shotTrajectories?.map((trajectory, index) => (
              <div key={trajectory.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{trajectory.shotType}</span>
                <span className="text-xs text-gray-500">
                  ({trajectory.from.x}, {trajectory.from.y}) → ({trajectory.to.x}, {trajectory.to.y})
                </span>
              </div>
            ))}
            <button
              type="button"
              onClick={addShotTrajectory}
              className="flex items-center px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              ショット軌道を追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSharingForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <FaShare className="w-5 h-5 mr-2 text-green-600" />
        共有設定
      </h3>

      {/* 公開設定 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          公開範囲
        </label>
        <div className="space-y-2">
          {[
            { value: 'private', label: 'プライベート', icon: FaEyeSlash, desc: '自分のみ閲覧可能' },
            { value: 'friends', label: 'フレンドのみ', icon: FaUsers, desc: 'フレンドのみ閲覧可能' },
            { value: 'public', label: '公開', icon: FaEye, desc: 'すべてのユーザーが閲覧可能' }
          ].map((option) => {
            const Icon = option.icon;
            return (
              <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={formData.sharingSettings.visibility === option.value}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    sharingSettings: {
                      ...prev.sharingSettings,
                      visibility: e.target.value as 'private' | 'friends' | 'public'
                    }
                  }))}
                  className="mr-3"
                />
                <Icon className="w-4 h-4 mr-2 text-gray-600" />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 詳細設定 */}
      {formData.sharingSettings.visibility !== 'private' && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">詳細設定</h4>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sharingSettings.allowComments}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sharingSettings: {
                    ...prev.sharingSettings,
                    allowComments: e.target.checked
                  }
                }))}
                className="mr-3"
              />
              <FaComment className="w-4 h-4 mr-2 text-gray-600" />
              <span>コメントを許可する</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sharingSettings.allowRating}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sharingSettings: {
                    ...prev.sharingSettings,
                    allowRating: e.target.checked
                  }
                }))}
                className="mr-3"
              />
              <FaStar className="w-4 h-4 mr-2 text-gray-600" />
              <span>評価を許可する</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sharingSettings.allowCopy}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sharingSettings: {
                    ...prev.sharingSettings,
                    allowCopy: e.target.checked
                  }
                }))}
                className="mr-3"
              />
              <FaCopy className="w-4 h-4 mr-2 text-gray-600" />
              <span>コピーを許可する</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.sharingSettings.allowModification}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  sharingSettings: {
                    ...prev.sharingSettings,
                    allowModification: e.target.checked
                  }
                }))}
                className="mr-3"
              />
              <FaEdit className="w-4 h-4 mr-2 text-gray-600" />
              <span>改変を許可する</span>
            </label>
          </div>
        </div>
      )}

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          メモ・補足事項
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="練習時の注意点、コツ、期待される効果など"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {card ? '練習カードを編集' : '新しい練習カードを作成'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          {/* ステップインジケーター */}
          <div className="flex items-center space-x-4 mt-4">
            {[
              { id: 'basic', label: '基本情報' },
              { id: 'visual', label: 'ビジュアル' },
              { id: 'sharing', label: '共有設定' }
            ].map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id as FormStep)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === step.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  currentStep === step.id ? 'border-white' : 'border-gray-400'
                }`}>
                  {index + 1}
                </span>
                <span>{step.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* フォーム内容 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {currentStep === 'basic' && renderBasicForm()}
          {currentStep === 'visual' && renderVisualForm()}
          {currentStep === 'sharing' && renderSharingForm()}
        </div>

        {/* フッター */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {currentStep !== 'basic' && (
                <button
                  onClick={() => {
                    if (currentStep === 'visual') setCurrentStep('basic');
                    if (currentStep === 'sharing') setCurrentStep('visual');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  前へ
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              
              {currentStep !== 'sharing' ? (
                <button
                  onClick={() => {
                    if (currentStep === 'basic') setCurrentStep('visual');
                    if (currentStep === 'visual') setCurrentStep('sharing');
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  次へ
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {isLoading ? '保存中...' : '保存'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPracticeCardForm;