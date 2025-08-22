'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PlayerPosition, 
  ShotTrajectory, 
  PracticeVisualInfo,
  PracticeMenuType,
  PracticeCard,
  PracticeDifficulty,
  SkillCategory
} from '@/types/practice';
import { FiChevronLeft, FiChevronRight, FiX, FiCheck } from 'react-icons/fi';
import { MdSportsBaseball, MdPerson } from 'react-icons/md';
import { FaUndo, FaTrash, FaClock, FaTag } from 'react-icons/fa';
import { GiShuttlecock } from 'react-icons/gi';
import PracticeCardVisualEditor from './PracticeCardVisualEditor';
import CourtSelectorSimple from './CourtSelectorSimple';

// モバイル用のステップ定義
type MobileEditStep = 'basic' | 'players' | 'shots' | 'preview';

interface PracticeCardMobileEditorProps {
  card?: PracticeCard;
  onSave: (card: Omit<PracticeCard, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PracticeCardMobileEditor: React.FC<PracticeCardMobileEditorProps> = ({
  card,
  onSave,
  onCancel,
  isLoading = false
}) => {
  // ステップ管理
  const [currentStep, setCurrentStep] = useState<MobileEditStep>('basic');
  
  // フォームデータ
  const [formData, setFormData] = useState({
    title: card?.title || '',
    description: card?.description || '',
    difficulty: card?.difficulty || 'beginner' as PracticeDifficulty,
    duration: card?.drill?.duration || 10,
    practiceType: card?.practiceType || 'knock_practice' as PracticeMenuType,
    visualInfo: card?.visualInfo || { shotTrajectories: [], playerPositions: [] },
    tags: card?.tags || [],
    equipment: card?.equipment || [],
    notes: card?.notes || '',
    courtInfo: card?.courtInfo || undefined,
  });

  // ステップインジケーター
  const steps = [
    { id: 'basic', label: '基本情報', icon: '📝' },
    { id: 'players', label: 'プレイヤー', icon: '👥' },
    { id: 'shots', label: 'ショット', icon: '🏸' },
    { id: 'preview', label: '確認', icon: '✅' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // ステップ変更の処理
  const goToStep = (step: MobileEditStep) => {
    // 基本情報が未入力の場合は次へ進めない
    if (step !== 'basic' && !formData.title) {
      alert('練習名を入力してください');
      return;
    }
    setCurrentStep(step);
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      goToStep(steps[nextIndex].id as MobileEditStep);
    }
  };

  const goPrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(steps[prevIndex].id as MobileEditStep);
    }
  };

  // 保存処理
  const handleSave = () => {
    const saveData = {
      title: formData.title,
      description: formData.description,
      drill: {
        id: Date.now().toString(),
        name: formData.title,
        description: formData.description,
        duration: formData.duration,
        skillCategory: 'strategy' as SkillCategory,
      },
      difficulty: formData.difficulty,
      equipment: formData.equipment,
      tags: formData.tags,
      notes: formData.notes,
      courtInfo: formData.courtInfo,
      practiceType: formData.practiceType,
      visualInfo: formData.visualInfo,
      isPublic: false,
    };
    
    onSave(saveData);
  };

  // 難易度オプション
  const difficultyOptions = [
    { value: 'beginner', label: '軽い', color: 'bg-green-500' },
    { value: 'intermediate', label: '普通', color: 'bg-yellow-500' },
    { value: 'advanced', label: 'きつい', color: 'bg-red-500' },
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* ヘッダー */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        {/* タイトルバー */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onCancel}
            className="p-2 -ml-2 text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">
            {card ? '練習カード編集' : '新規練習カード'}
          </h1>
          <div className="w-10" /> {/* スペーサー */}
        </div>

        {/* ステップインジケーター */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => goToStep(step.id as MobileEditStep)}
                  className={`flex flex-col items-center flex-1 ${
                    currentStep === step.id 
                      ? 'text-blue-600' 
                      : index < currentStepIndex 
                        ? 'text-green-600' 
                        : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                    currentStep === step.id 
                      ? 'bg-blue-100' 
                      : index < currentStepIndex 
                        ? 'bg-green-100' 
                        : 'bg-gray-100'
                  }`}>
                    <span className="text-sm">{step.icon}</span>
                  </div>
                  <span className="text-xs">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-hidden">
        {/* ステップ1: 基本情報 */}
        {currentStep === 'basic' && (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                練習名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="例: ネット前ドロップ練習"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="練習の内容を説明してください"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                練習強度
              </label>
              <div className="grid grid-cols-3 gap-2">
                {difficultyOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({ ...prev, difficulty: option.value as PracticeDifficulty }))}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      formData.difficulty === option.value
                        ? `${option.color} text-white ring-2 ring-offset-2 ring-${option.color}`
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                練習時間
              </label>
              <div className="flex items-center space-x-2">
                <FaClock className="w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">分</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                練習タイプ
              </label>
              <div className="space-y-2">
                {[
                  { value: 'knock_practice', label: 'ノック練習', desc: 'コーチが球出し' },
                  { value: 'pattern_practice', label: 'パターン練習', desc: '決まった配球パターン' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFormData(prev => ({ ...prev, practiceType: type.value as PracticeMenuType }))}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      formData.practiceType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タグ
              </label>
              <div className="flex flex-wrap gap-2">
                {['基礎', 'クリア', 'ドロップ', 'スマッシュ', 'ネット', 'フットワーク'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag)
                          ? prev.tags.filter(t => t !== tag)
                          : [...prev.tags, tag]
                      }));
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      formData.tags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ステップ2: プレイヤー配置 */}
        {currentStep === 'players' && (
          <div className="h-full flex flex-col">
            {/* コート表示エリア (55%) */}
            <div className="h-[55%] bg-green-50 p-2 overflow-hidden">
              <div className="h-full w-full flex items-center justify-center">
                <div style={{ transform: 'scale(0.65)', transformOrigin: 'center' }}>
                  <PracticeCardVisualEditor
                    visualInfo={formData.visualInfo}
                    practiceType={formData.practiceType}
                    onUpdate={(visualInfo) => setFormData(prev => ({ ...prev, visualInfo }))}
                    courtType="singles"
                    mobileMode="players" // プレイヤー配置モード
                  />
                </div>
              </div>
            </div>
            
            {/* 操作パネル (45%) */}
            <div className="h-[45%] bg-white border-t border-gray-200 overflow-y-auto">
              {formData.practiceType === 'knock_practice' ? (
                // ノック練習の場合
                <div className="p-4 space-y-4">
                  {/* ノッカー配置 */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900">
                        ① ノッカー配置
                      </h4>
                      <span className="text-sm text-blue-700">
                        {formData.visualInfo.playerPositions?.filter(p => p.role === 'knocker').length || 0}/1
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mb-2">
                      コート上側（相手側）をタップしてノッカーを配置
                    </p>
                    <button
                      onClick={() => {
                        // ノッカーを自動配置（上側中央）
                        const newKnocker = {
                          id: `knocker_${Date.now()}`,
                          x: 122, // 中央
                          y: 50, // 上側
                          label: 'K1',
                          role: 'knocker' as const,
                          color: '#3B82F6'
                        };
                        const newPositions = [
                          ...formData.visualInfo.playerPositions?.filter(p => p.role !== 'knocker') || [],
                          newKnocker
                        ];
                        setFormData(prev => ({
                          ...prev,
                          visualInfo: {
                            ...prev.visualInfo,
                            playerPositions: newPositions
                          }
                        }));
                      }}
                      disabled={formData.visualInfo.playerPositions?.some(p => p.role === 'knocker')}
                      className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors ${
                        formData.visualInfo.playerPositions?.some(p => p.role === 'knocker')
                          ? 'bg-gray-200 text-gray-400'
                          : 'bg-blue-600 text-white active:bg-blue-700'
                      }`}
                    >
                      {formData.visualInfo.playerPositions?.some(p => p.role === 'knocker')
                        ? '✅ 配置済み'
                        : 'ノッカーを配置'}
                    </button>
                  </div>

                  {/* プレイヤー配置 */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-900">
                        ② プレイヤー配置
                      </h4>
                      <span className="text-sm text-green-700">
                        {formData.visualInfo.playerPositions?.filter(p => p.role === 'player').length || 0}人
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mb-2">
                      コート下側（自分側）をタップしてプレイヤーを配置
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // プレイヤーを追加（下側）
                          const playerCount = formData.visualInfo.playerPositions?.filter(p => p.role === 'player').length || 0;
                          const positions = [
                            { x: 122, y: 400 }, // 中央
                            { x: 61, y: 400 },  // 左
                            { x: 183, y: 400 }, // 右
                            { x: 122, y: 450 }, // 後方中央
                          ];
                          const pos = positions[playerCount % positions.length];
                          const newPlayer = {
                            id: `player_${Date.now()}`,
                            x: pos.x,
                            y: pos.y,
                            label: `P${playerCount + 1}`,
                            role: 'player' as const,
                            color: '#10B981'
                          };
                          const newPositions = [
                            ...formData.visualInfo.playerPositions || [],
                            newPlayer
                          ];
                          setFormData(prev => ({
                            ...prev,
                            visualInfo: {
                              ...prev.visualInfo,
                              playerPositions: newPositions
                            }
                          }));
                        }}
                        className="flex-1 py-2 px-3 bg-green-600 text-white rounded text-sm font-medium active:bg-green-700"
                      >
                        プレイヤー追加
                      </button>
                      <button
                        onClick={() => {
                          // 最後のプレイヤーを削除
                          const players = formData.visualInfo.playerPositions?.filter(p => p.role === 'player') || [];
                          if (players.length > 0) {
                            const lastPlayer = players[players.length - 1];
                            const newPositions = formData.visualInfo.playerPositions?.filter(p => p.id !== lastPlayer.id) || [];
                            setFormData(prev => ({
                              ...prev,
                              visualInfo: {
                                ...prev.visualInfo,
                                playerPositions: newPositions
                              }
                            }));
                          }
                        }}
                        disabled={!formData.visualInfo.playerPositions?.some(p => p.role === 'player')}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          formData.visualInfo.playerPositions?.some(p => p.role === 'player')
                            ? 'bg-red-100 text-red-700 active:bg-red-200'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  {/* ヒント */}
                  <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    💡 コート上のプレイヤーをタップして位置を調整できます
                  </div>
                </div>
              ) : (
                // パターン練習の場合
                <div className="p-4 space-y-4">
                  {/* 自チーム配置 */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-900">
                        自チーム
                      </h4>
                      <span className="text-sm text-green-700">
                        {formData.visualInfo.playerPositions?.filter(p => p.role === 'player').length || 0}人
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const playerCount = formData.visualInfo.playerPositions?.filter(p => p.role === 'player').length || 0;
                        const positions = [
                          { x: 61, y: 400 },  // 左前
                          { x: 183, y: 400 }, // 右前
                        ];
                        const pos = positions[playerCount % positions.length];
                        const newPlayer = {
                          id: `player_${Date.now()}`,
                          x: pos.x,
                          y: pos.y,
                          label: `P${playerCount + 1}`,
                          role: 'player' as const,
                          color: '#10B981',
                          team: 'green' as const
                        };
                        setFormData(prev => ({
                          ...prev,
                          visualInfo: {
                            ...prev.visualInfo,
                            playerPositions: [...prev.visualInfo.playerPositions || [], newPlayer]
                          }
                        }));
                      }}
                      className="w-full py-2 px-3 bg-green-600 text-white rounded text-sm font-medium active:bg-green-700"
                    >
                      プレイヤー追加
                    </button>
                  </div>

                  {/* 相手チーム配置 */}
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-red-900">
                        相手チーム
                      </h4>
                      <span className="text-sm text-red-700">
                        {formData.visualInfo.playerPositions?.filter(p => p.role === 'opponent').length || 0}人
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const opponentCount = formData.visualInfo.playerPositions?.filter(p => p.role === 'opponent').length || 0;
                        const playerCount = formData.visualInfo.playerPositions?.filter(p => p.role === 'player').length || 0;
                        const positions = [
                          { x: 61, y: 136 },  // 左前
                          { x: 183, y: 136 }, // 右前
                        ];
                        const pos = positions[opponentCount % positions.length];
                        const newOpponent = {
                          id: `opponent_${Date.now()}`,
                          x: pos.x,
                          y: pos.y,
                          label: `P${playerCount + opponentCount + 1}`,
                          role: 'opponent' as const,
                          color: '#EF4444',
                          team: 'red' as const
                        };
                        setFormData(prev => ({
                          ...prev,
                          visualInfo: {
                            ...prev.visualInfo,
                            playerPositions: [...prev.visualInfo.playerPositions || [], newOpponent]
                          }
                        }));
                      }}
                      className="w-full py-2 px-3 bg-red-600 text-white rounded text-sm font-medium active:bg-red-700"
                    >
                      相手追加
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ステップ3: ショット入力 */}
        {currentStep === 'shots' && (
          <div className="h-full flex flex-col">
            {/* コート表示エリア (50%) */}
            <div className="h-1/2 bg-green-50 p-2 overflow-hidden">
              <div className="h-full w-full flex items-center justify-center">
                <div style={{ transform: 'scale(0.6)', transformOrigin: 'center' }}>
                  <PracticeCardVisualEditor
                    visualInfo={formData.visualInfo}
                    practiceType={formData.practiceType}
                    onUpdate={(visualInfo) => setFormData(prev => ({ ...prev, visualInfo }))}
                    courtType="singles"
                    mobileMode="shots" // ショット入力モード
                  />
                </div>
              </div>
            </div>
            
            {/* ショット履歴 (50%) */}
            <div className="h-1/2 bg-white border-t border-gray-200 p-4 overflow-y-auto">
              <h3 className="font-medium text-gray-900 mb-3">ショット履歴</h3>
              
              {formData.visualInfo.shotTrajectories && formData.visualInfo.shotTrajectories.length > 0 ? (
                <div className="space-y-2">
                  {formData.visualInfo.shotTrajectories.map((shot, index) => (
                    <div key={shot.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm">
                          {shot.shotBy === 'knocker' ? 'ノック' : 'プレイヤー'}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {shot.shotType}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const newShots = formData.visualInfo.shotTrajectories?.filter(s => s.id !== shot.id) || [];
                          setFormData(prev => ({
                            ...prev,
                            visualInfo: {
                              ...prev.visualInfo,
                              shotTrajectories: newShots
                            }
                          }));
                        }}
                        className="p-1 text-red-500"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <GiShuttlecock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">まだショットがありません</p>
                  <p className="text-xs mt-1">プレイヤーをタップして開始</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ステップ4: プレビュー・確認 */}
        {currentStep === 'preview' && (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">練習カード確認</h3>
              
              {/* 基本情報 */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">練習名</div>
                  <div className="font-medium">{formData.title || '未設定'}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">説明</div>
                  <div className="text-sm">{formData.description || '未設定'}</div>
                </div>
                
                <div className="flex space-x-4">
                  <div>
                    <div className="text-xs text-gray-500">強度</div>
                    <div className="text-sm font-medium">
                      {difficultyOptions.find(o => o.value === formData.difficulty)?.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">時間</div>
                    <div className="text-sm font-medium">{formData.duration}分</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">タイプ</div>
                    <div className="text-sm font-medium">
                      {formData.practiceType === 'knock_practice' ? 'ノック練習' : 'パターン練習'}
                    </div>
                  </div>
                </div>
                
                {/* コートプレビュー */}
                <div className="mt-4 p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-2">コート配置</div>
                  <div className="flex justify-center">
                    <div style={{ transform: 'scale(0.4)', transformOrigin: 'center', marginTop: '-60px', marginBottom: '-60px' }}>
                      <PracticeCardVisualEditor
                        visualInfo={formData.visualInfo}
                        practiceType={formData.practiceType}
                        onUpdate={() => {}} // プレビューなので更新不要
                        courtType="singles"
                        mobileMode="preview" // プレビューモード
                      />
                    </div>
                  </div>
                </div>
                
                {/* 統計 */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="text-xs text-blue-600">プレイヤー数</div>
                    <div className="font-medium text-blue-900">
                      {formData.visualInfo.playerPositions?.length || 0}人
                    </div>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-xs text-green-600">ショット数</div>
                    <div className="font-medium text-green-900">
                      {formData.visualInfo.shotTrajectories?.length || 0}本
                    </div>
                  </div>
                </div>
                
                {/* タグ */}
                {formData.tags.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">タグ</div>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* フッター・ナビゲーション */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              currentStepIndex === 0
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-200 text-gray-700 active:bg-gray-300'
            }`}
          >
            <FiChevronLeft className="w-5 h-5 mr-1" />
            戻る
          </button>

          {currentStep === 'preview' ? (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg font-medium active:bg-blue-600 disabled:opacity-50"
            >
              <FiCheck className="w-5 h-5 mr-1" />
              {isLoading ? '保存中...' : '保存'}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg font-medium active:bg-blue-600"
            >
              次へ
              <FiChevronRight className="w-5 h-5 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeCardMobileEditor;