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
  const [currentShot, setCurrentShot] = useState<any>(null); // 現在選択中のショット開始点
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(false); // プレイヤーの返球待ち
  const [shotMode, setShotMode] = useState<'knocker' | 'player'>('knocker'); // 現在のショットモード
  
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

  // ショット入力の状態管理
  const [knockerShot, setKnockerShot] = useState<any>(null); // ノッカーのショット
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null); // 選択されたプレイヤー
  const [shotInputMode, setShotInputMode] = useState<'pinpoint' | 'area'>('pinpoint'); // 入力モード
  const [showReturnShotConfig, setShowReturnShotConfig] = useState(false); // 返球設定画面
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]); // 選択されたエリア

  // コートエリア定義（PC版と同じ）
  const COURT_AREAS = [
    // 上側コート（相手側）
    { id: 'opp_fl', name: '相手前左' },
    { id: 'opp_fc', name: '相手前中' },
    { id: 'opp_fr', name: '相手前右' },
    { id: 'opp_ml', name: '相手中左' },
    { id: 'opp_mc', name: '相手中央' },
    { id: 'opp_mr', name: '相手中右' },
    { id: 'opp_bl', name: '相手後左' },
    { id: 'opp_bc', name: '相手後中' },
    { id: 'opp_br', name: '相手後右' },
    // 下側コート（自分側）
    { id: 'own_fl', name: '自分前左' },
    { id: 'own_fc', name: '自分前中' },
    { id: 'own_fr', name: '自分前右' },
    { id: 'own_ml', name: '自分中左' },
    { id: 'own_mc', name: '自分中央' },
    { id: 'own_mr', name: '自分中右' },
    { id: 'own_bl', name: '自分後左' },
    { id: 'own_bc', name: '自分後中' },
    { id: 'own_br', name: '自分後右' },
  ];

  // ショットタイプ定義（PC版と同じ）
  const SHOT_TYPES = [
    { id: 'clear', name: 'クリア', color: '#3B82F6' },
    { id: 'smash', name: 'スマッシュ', color: '#EF4444' },
    { id: 'drop', name: 'ドロップ', color: '#10B981' },
    { id: 'hairpin', name: 'ヘアピン', color: '#F59E0B' },
    { id: 'drive', name: 'ドライブ', color: '#8B5CF6' },
    { id: 'push', name: 'プッシュ', color: '#EC4899' },
    { id: 'lob', name: 'ロブ', color: '#14B8A6' },
    { id: 'receive', name: 'レシーブ', color: '#06B6D4' },
    { id: 'other', name: 'その他', color: '#6B7280' },
  ];

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
            {/* コート表示エリア */}
            <div className="h-1/2 bg-green-50 p-2 overflow-hidden">
              {/* デバッグ情報 */}
              <div className="absolute top-2 left-2 z-10 bg-white/90 p-1 rounded text-xs">
                ショット数: {formData.visualInfo.shotTrajectories?.length || 0}
              </div>
              <div className="h-full w-full flex items-center justify-center">
                <div style={{ transform: 'scale(0.6)', transformOrigin: 'center' }}>
                  <PracticeCardVisualEditor
                    visualInfo={formData.visualInfo}
                    practiceType={formData.practiceType}
                    onUpdate={(visualInfo) => setFormData(prev => ({ ...prev, visualInfo }))}
                    courtType="singles"
                    mobileMode="shots"
                    onShotStart={(coord: any) => {
                      // プレイヤータップの場合
                      if (coord.role) {
                        if (formData.practiceType === 'pattern_practice') {
                          setCurrentShot(coord);
                        } else if (showReturnShotConfig && coord.role === 'player') {
                          // 返球時のプレイヤー選択（返球元）
                          // 通常はすでに移動したプレイヤーから返球
                        }
                        return;
                      }
                      
                      // コートタップ時の処理
                      if (formData.practiceType === 'knock_practice') {
                        if (!knockerShot) {
                          // ①ノッカーの配球設定
                          const knocker = formData.visualInfo.playerPositions?.find(p => p.role === 'knocker');
                          if (knocker) {
                            const newShot = {
                              id: `shot_${Date.now()}`,
                              from: { x: knocker.x, y: knocker.y },
                              to: { x: coord.x, y: coord.y },
                              shotType: 'clear',
                              shotBy: 'knocker' as const,
                              order: (formData.visualInfo.shotTrajectories?.length || 0) + 1,
                              memo: ''
                            };
                            
                            // ②矢印を表示（ショット追加）
                            console.log('Creating knocker shot:', newShot);
                            setFormData(prev => {
                              const updated = {
                                ...prev,
                                visualInfo: {
                                  ...prev.visualInfo,
                                  shotTrajectories: [...(prev.visualInfo.shotTrajectories || []), newShot]
                                }
                              };
                              console.log('Updated formData with shots:', updated.visualInfo.shotTrajectories);
                              return updated;
                            });
                            
                            setKnockerShot(newShot);
                          }
                        } else if (showReturnShotConfig) {
                          // ⑤プレイヤーの返球先設定
                          if (selectedPlayer) {
                            const returnShot = {
                              id: `shot_${Date.now()}`,
                              from: { x: selectedPlayer.x, y: selectedPlayer.y },
                              to: { x: coord.x, y: coord.y },
                              shotType: 'clear',
                              shotBy: 'player' as const,
                              order: (formData.visualInfo.shotTrajectories?.length || 0) + 1,
                              memo: '',
                              targetArea: shotInputMode === 'area' ? selectedAreas.join(',') : undefined
                            };
                            
                            setFormData(prev => ({
                              ...prev,
                              visualInfo: {
                                ...prev.visualInfo,
                                shotTrajectories: [...(prev.visualInfo.shotTrajectories || []), returnShot]
                              }
                            }));
                            
                            // リセット
                            setKnockerShot(null);
                            setSelectedPlayer(null);
                            setShowReturnShotConfig(false);
                            setSelectedAreas([]);
                          }
                        }
                      } else if (currentShot) {
                        // パターン練習
                        const newShot = {
                          id: `shot_${Date.now()}`,
                          from: { x: currentShot.x, y: currentShot.y },
                          to: { x: coord.x, y: coord.y },
                          shotType: 'clear',
                          shotBy: currentShot.role === 'knocker' ? 'knocker' : 'player',
                          order: (formData.visualInfo.shotTrajectories?.length || 0) + 1,
                          memo: ''
                        };
                        
                        setFormData(prev => ({
                          ...prev,
                          visualInfo: {
                            ...prev.visualInfo,
                            shotTrajectories: [...(prev.visualInfo.shotTrajectories || []), newShot]
                          }
                        }));
                        
                        setCurrentShot(null);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* 操作パネル */}
            <div className="h-1/2 bg-white border-t border-gray-200 overflow-y-auto">
              <div className="p-4 space-y-4">
                
                {/* ノック練習フロー */}
                {formData.practiceType === 'knock_practice' && (
                  <>
                    {/* ③プレイヤー選択（ノッカーショット後） */}
                    {knockerShot && !selectedPlayer && !showReturnShotConfig && (
                      <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                        <div className="mb-3 p-2 bg-blue-100 rounded">
                          <p className="text-sm text-blue-800 font-medium">
                            ✅ ノッカーの配球が設定されました
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            コート上に矢印が表示されています
                          </p>
                        </div>
                        <h4 className="font-medium text-blue-900 mb-3">③ 着地点に移動するプレイヤーを選択</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.visualInfo.playerPositions?.filter(p => p.role === 'player').map(player => (
                            <button
                              key={player.id}
                              onClick={() => {
                                // プレイヤーを着地点に移動
                                const updatedPositions = formData.visualInfo.playerPositions?.map(p => 
                                  p.id === player.id 
                                    ? { ...p, x: knockerShot.to.x, y: knockerShot.to.y }
                                    : p
                                ) || [];
                                
                                const movedPlayer = updatedPositions.find(p => p.id === player.id);
                                
                                setFormData(prev => ({
                                  ...prev,
                                  visualInfo: {
                                    ...prev.visualInfo,
                                    playerPositions: updatedPositions
                                  }
                                }));
                                
                                setSelectedPlayer(movedPlayer);
                                setShowReturnShotConfig(true);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium active:bg-blue-700"
                            >
                              {player.label}を移動
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* ④配球方法の選択 */}
                    {showReturnShotConfig && selectedPlayer && (
                      <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                        <h4 className="font-medium text-green-900 mb-3">④ 配球方法の選択</h4>
                        
                        <div className="mb-4">
                          <p className="text-sm text-green-800 mb-2">
                            {selectedPlayer.label}が着地点に移動しました
                          </p>
                        </div>
                        
                        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                          <button
                            onClick={() => {
                              setShotInputMode('pinpoint');
                              setSelectedAreas([]);
                            }}
                            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                              shotInputMode === 'pinpoint' 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600'
                            }`}
                          >
                            ピンポイント
                          </button>
                          <button
                            onClick={() => setShotInputMode('area')}
                            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                              shotInputMode === 'area' 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-600'
                            }`}
                          >
                            エリア
                          </button>
                        </div>
                        
                        {/* エリアモードの場合のエリア選択 */}
                        {shotInputMode === 'area' && (
                          <div className="mb-4">
                            <p className="text-xs text-green-700 mb-2">対象エリアを選択:</p>
                            <div className="grid grid-cols-3 gap-1">
                              {COURT_AREAS.filter(area => area.id.startsWith('opp_')).map(area => (
                                <button
                                  key={area.id}
                                  onClick={() => {
                                    setSelectedAreas(prev => 
                                      prev.includes(area.id)
                                        ? prev.filter(id => id !== area.id)
                                        : [...prev, area.id]
                                    );
                                  }}
                                  className={`py-2 px-1 rounded text-xs font-medium transition ${
                                    selectedAreas.includes(area.id)
                                      ? 'bg-green-600 text-white'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {area.name.replace('相手', '')}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-green-100 rounded p-3">
                          <p className="text-sm text-green-800 font-medium">
                            ⑤ コートをタップして返球先を設定
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            {shotInputMode === 'pinpoint' 
                              ? 'コート上側の特定の位置をタップ'
                              : `選択したエリア内をタップ (${selectedAreas.length}エリア選択中)`}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* 初期状態（ノッカー配球前） */}
                    {!knockerShot && !selectedPlayer && !showReturnShotConfig && (
                      <div className="text-center py-6 bg-blue-50 rounded-lg">
                        <div className="text-5xl mb-3">🏸</div>
                        <h3 className="font-medium text-blue-900 mb-2">① ノッカーの配球</h3>
                        <p className="text-sm text-blue-700">
                          コート下側（自分側）をタップして配球先を設定
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          タップすると矢印が表示されます
                        </p>
                        {/* デバッグ情報 */}
                        <p className="text-xs text-gray-500 mt-2">
                          現在のショット数: {formData.visualInfo.shotTrajectories?.length || 0}
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {/* パターン練習 */}
                {formData.practiceType === 'pattern_practice' && (
                  <>
                    {currentShot ? (
                      <div className="text-center py-6 bg-blue-50 rounded-lg">
                        <div className="text-4xl mb-2">👤</div>
                        <h3 className="font-medium text-blue-900 mb-2">{currentShot.label} を選択中</h3>
                        <p className="text-sm text-blue-700">
                          コートをタップして着地点を設定してください
                        </p>
                        <button
                          onClick={() => setCurrentShot(null)}
                          className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                        >
                          選択解除
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <div className="text-6xl mb-3">🏸</div>
                        <h3 className="font-medium text-gray-900 mb-2">ショット入力</h3>
                        <p className="text-sm">
                          プレイヤーをタップしてからコートをタップ
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {/* ショット履歴 */}
                {formData.visualInfo.shotTrajectories && formData.visualInfo.shotTrajectories.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">ショット履歴</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {formData.visualInfo.shotTrajectories.map((shot, index) => (
                        <div key={shot.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <span>{shot.shotType}</span>
                            <span className="text-gray-500">{shot.shotBy}</span>
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
                              
                              // ノッカーショットを削除した場合、状態をリセット
                              if (knockerShot && shot.id === knockerShot.id) {
                                setKnockerShot(null);
                                setSelectedPlayer(null);
                                setShowReturnShotConfig(false);
                                setSelectedAreas([]);
                                
                                // プレイヤーの位置も元に戻す必要があれば処理
                              }
                            }}
                            className="p-1 text-red-500"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
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