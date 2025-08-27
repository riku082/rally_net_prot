'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/utils/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { 
  CommunityEvent, 
  EventStatus 
} from '@/types/community';
import { PracticeCard } from '@/types/practice';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EventFormProps {
  communityId: string;
  event?: CommunityEvent;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EventForm({ 
  communityId, 
  event, 
  onSuccess, 
  onCancel 
}: EventFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPracticeCards, setShowPracticeCards] = useState(false);
  const [availableCards, setAvailableCards] = useState<PracticeCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    minParticipants: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    equipment: [] as string[],
    tags: [] as string[],
    notes: ''
  });

  const [newEquipment, setNewEquipment] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (event) {
      const startDateTime = new Date(event.startDateTime);
      const endDateTime = new Date(event.endDateTime);
      
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5),
        location: event.location,
        maxParticipants: event.maxParticipants?.toString() || '',
        minParticipants: event.minParticipants?.toString() || '',
        difficulty: event.difficulty || 'intermediate',
        equipment: event.equipment || [],
        tags: event.tags || [],
        notes: event.notes || ''
      });
      
      setSelectedCards(event.practiceCardIds || []);
    }
    
    fetchPracticeCards();
  }, [event]);

  const fetchPracticeCards = async () => {
    if (!user) return;
    
    try {
      const cardsQuery = query(
        collection(db, 'practiceCards'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(cardsQuery);
      const cards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PracticeCard[];
      
      setAvailableCards(cards);
    } catch (error) {
      console.error('Error fetching practice cards:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();
      
      const eventData: Partial<CommunityEvent> = {
        communityId,
        title: formData.title,
        description: formData.description || undefined,
        startDateTime,
        endDateTime,
        location: formData.location,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        minParticipants: formData.minParticipants ? parseInt(formData.minParticipants) : undefined,
        difficulty: formData.difficulty,
        equipment: formData.equipment.length > 0 ? formData.equipment : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        notes: formData.notes || undefined,
        practiceCardIds: selectedCards.length > 0 ? selectedCards : undefined,
        status: EventStatus.PUBLISHED,
        updatedAt: Date.now()
      };
      
      if (event) {
        // 更新
        await updateDoc(doc(db, 'communities', communityId, 'events', event.id), eventData);
      } else {
        // 新規作成
        eventData.createdBy = user.uid;
        eventData.createdAt = Date.now();
        await addDoc(collection(db, 'communities', communityId, 'events'), eventData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('イベントの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addEquipment = () => {
    if (newEquipment.trim()) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()]
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例: 週末練習会"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="練習内容や持ち物などを記載"
            />
          </div>
        </div>
      </div>

      {/* 日時・場所 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">日時・場所</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                開始日 *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline h-4 w-4 mr-1" />
                開始時刻 *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日 *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了時刻 *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="inline h-4 w-4 mr-1" />
              場所 *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例: 市民体育館"
            />
          </div>
        </div>
      </div>

      {/* 参加人数 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <Users className="inline h-5 w-5 mr-2" />
          参加人数
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最小人数
            </label>
            <input
              type="number"
              min="1"
              value={formData.minParticipants}
              onChange={(e) => setFormData({ ...formData, minParticipants: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例: 4"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              定員
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例: 12"
            />
          </div>
        </div>
      </div>

      {/* 練習カード選択 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          type="button"
          onClick={() => setShowPracticeCards(!showPracticeCards)}
          className="flex items-center justify-between w-full"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            練習カード
            {selectedCards.length > 0 && (
              <span className="ml-2 text-sm text-green-600">
                ({selectedCards.length}枚選択中)
              </span>
            )}
          </h3>
          {showPracticeCards ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </button>
        
        {showPracticeCards && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {availableCards.map((card) => (
              <label
                key={card.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCards.includes(card.id)}
                  onChange={() => toggleCardSelection(card.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{card.title}</div>
                  <div className="text-sm text-gray-500">
                    {card.drill.duration}分 • {card.difficulty}
                  </div>
                </div>
              </label>
            ))}
            
            {availableCards.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                練習カードがありません
              </p>
            )}
          </div>
        )}
      </div>

      {/* 詳細設定 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">詳細設定</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              難易度
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">上級</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              必要な用具
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: シャトル"
              />
              <button
                type="button"
                onClick={addEquipment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipment.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeEquipment(index)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タグ
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="例: ダブルス"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 text-green-600 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="inline h-4 w-4 mr-1" />
              メモ
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="参加者への連絡事項など"
            />
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '保存中...' : (event ? '更新' : '作成')}
        </button>
      </div>
    </form>
  );
}