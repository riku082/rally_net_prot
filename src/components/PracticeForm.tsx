'use client';

import React, { useState } from 'react';
import { Practice, PracticeType, PracticeCard, PracticeCardExecution, PracticeRoutineExecution } from '@/types/practice';
import { MatchRecord } from '@/types/match';
import { FaClock, FaCalendarAlt, FaLayerGroup } from 'react-icons/fa';
import { FiSave, FiX } from 'react-icons/fi';
import { Trophy, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import RoutineBuilder from './RoutineBuilder';
import MatchRecordForm from './MatchRecordForm';
import { db } from '@/utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface PracticeFormProps {
  practice?: Practice;
  onSave: (
    practice: Omit<Practice, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
    matchRecords?: Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt'>[]
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialDate?: string;
  availableCards?: PracticeCard[];
  communityEventId?: string;
  communityId?: string;
}

const PracticeForm: React.FC<PracticeFormProps> = ({ 
  practice, 
  onSave, 
  onCancel, 
  isLoading = false,
  initialDate,
  availableCards = [],
  communityEventId,
  communityId
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: practice?.date || initialDate || new Date().toISOString().split('T')[0],
    startTime: practice?.startTime || '10:00',
    endTime: practice?.endTime || '12:00',
    type: practice?.type || 'basic_practice' as PracticeType,
    title: practice?.title || '',
    description: practice?.description || '',
    notes: practice?.notes || '',
    goals: practice?.goals || [],
    achievements: practice?.achievements || [],
    routine: practice?.routine || null as PracticeRoutineExecution | null,
  });
  
  const [showMatchRecords, setShowMatchRecords] = useState(false);
  const [matchRecords, setMatchRecords] = useState<Omit<MatchRecord, 'id' | 'createdAt' | 'updatedAt'>[]>([]);
  const [showMatchForm, setShowMatchForm] = useState(false);


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



  const [routineCards, setRoutineCards] = useState<PracticeCardExecution[]>(
    practice?.routine?.cards || []
  );
  const [useRoutine, setUseRoutine] = useState(!!practice?.routine);

  const calculateDuration = () => {
    // 開始時間と終了時間から計算（ルーティンに関係なく）
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60));
  };



  const handleRoutineCardsChange = (cards: PracticeCardExecution[]) => {
    setRoutineCards(cards);
    
    // ルーティンを使用している場合、タイトルと目標のみを更新
    if (useRoutine && cards.length > 0) {
      setFormData(prev => ({
        ...prev,
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
    
    const practiceData: Omit<Practice, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      duration,
      routine,
      skills: [],
    };
    
    // コミュニティイベントとの連携
    if (communityEventId) {
      practiceData.communityEventId = communityEventId;
    }
    if (communityId) {
      practiceData.communityId = communityId;
    }
    
    // 試合記録がある場合は一緒に保存
    if (showMatchRecords && matchRecords.length > 0) {
      onSave(practiceData, matchRecords);
    } else {
      onSave(practiceData);
    }
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
              required
              style={{ color: '#000000' }}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
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

        {/* 練習タイプ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            練習タイプ
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PracticeType }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
          >
            {practiceTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
            style={{ color: '#000000' }}
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
                className="rounded border-gray-300 text-theme-primary-600 focus:ring-theme-primary-500 mt-0.5 sm:mt-0"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
            style={{ color: '#000000' }}
          />
        </div>

        {/* 試合記録セクション */}
        <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showMatchRecords}
                onChange={(e) => setShowMatchRecords(e.target.checked)}
                className="rounded border-gray-300 text-theme-primary-600 focus:ring-theme-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <Trophy className="w-4 h-4 mr-1 sm:mr-2" />
                試合記録を追加
              </span>
            </label>
              
              {showMatchRecords && (
                <button
                  type="button"
                  onClick={() => setShowMatchForm(!showMatchForm)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  {showMatchForm ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      閉じる
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      展開
                    </>
                  )}
                </button>
              )}
            </div>
            
            {showMatchRecords && (
              <div>
                {/* 既存の試合記録リスト */}
                {matchRecords.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {matchRecords.map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Trophy className="h-4 w-4 text-green-600" />
                          <div className="text-sm">
                            <span className="font-medium">
                              {match.team1.players.map(p => p.name).join('・')}
                            </span>
                            <span className="mx-2 text-gray-500">vs</span>
                            <span className="font-medium">
                              {match.team2.players.map(p => p.name).join('・')}
                            </span>
                            <span className="ml-3 text-xs text-gray-500">
                              {match.scores.map(s => `${s.team1Score}-${s.team2Score}`).join(' / ')}
                            </span>
                            <span className={`ml-2 text-xs font-semibold ${
                              match.winner === 'team1' ? 'text-green-600' :
                              match.winner === 'team2' ? 'text-blue-600' :
                              'text-gray-500'
                            }`}>
                              {match.winner === 'team1' ? '勝利' :
                               match.winner === 'team2' ? '敗北' :
                               '引き分け'}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMatchRecords(matchRecords.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 新規試合記録追加ボタン */}
                {!showMatchForm && (
                  <button
                    type="button"
                    onClick={() => setShowMatchForm(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    試合記録を追加
                  </button>
                )}
                
                {/* 試合記録フォーム */}
                {showMatchForm && (
                  <div className="mt-4">
                    <MatchRecordForm
                      practiceId={practice?.id}
                      communityId={communityId}
                      communityEventId={communityEventId}
                      date={formData.date}
                      onSave={(match) => {
                        setMatchRecords([...matchRecords, match]);
                        setShowMatchForm(false);
                      }}
                      onCancel={() => setShowMatchForm(false)}
                    />
                  </div>
                )}
              </div>
            )}
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
            className="flex items-center justify-center px-6 py-2 bg-theme-primary-600 text-white rounded-lg hover:bg-theme-primary-700 transition-colors disabled:opacity-50 order-1 sm:order-2"
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