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
  EventStatus,
  EventType
} from '@/types/community';
import { PracticeCard } from '@/types/practice';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Trophy,
  Activity,
  MoreHorizontal,
  FileText,
  Plus
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface EventFormSimpleProps {
  communityId: string;
  event?: CommunityEvent;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EventFormSimple({ 
  communityId, 
  event, 
  onSuccess, 
  onCancel 
}: EventFormSimpleProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [practiceCards, setPracticeCards] = useState<PracticeCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showPracticeCards, setShowPracticeCards] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    eventType: EventType.PRACTICE,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    description: '',
    createPracticeRecord: false
  });

  useEffect(() => {
    // URLパラメータから日付を取得
    const dateParam = searchParams.get('date');
    if (dateParam && !event) {
      setFormData(prev => ({
        ...prev,
        startDate: dateParam,
        endDate: dateParam
      }));
    }
    
    if (event) {
      const startDateTime = new Date(event.startDateTime);
      const endDateTime = new Date(event.endDateTime);
      
      setFormData({
        title: event.title,
        eventType: event.eventType || EventType.PRACTICE,
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5),
        location: event.location,
        maxParticipants: event.maxParticipants?.toString() || '',
        description: event.description || '',
        createPracticeRecord: event.createPracticeRecord || false
      });
      
      if (event.practiceCardIds) {
        setSelectedCards(event.practiceCardIds);
      }
    }
    
    // 練習カードを取得
    if (user) {
      fetchPracticeCards();
    }
  }, [event, user]);

  const fetchPracticeCards = async () => {
    if (!user) return;
    
    try {
      const cardsQuery = query(
        collection(db, 'practiceCards'),
        where('userId', '==', user.uid)
      );
      const cardsSnapshot = await getDocs(cardsQuery);
      const cards = cardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PracticeCard[];
      setPracticeCards(cards);
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
      
      const eventData: any = {
        communityId,
        title: formData.title,
        eventType: formData.eventType,
        startDateTime,
        endDateTime,
        location: formData.location,
        status: EventStatus.PUBLISHED,
        updatedAt: Date.now()
      };

      // 空でない値のみ追加
      if (formData.description) {
        eventData.description = formData.description;
      }
      if (formData.maxParticipants) {
        eventData.maxParticipants = parseInt(formData.maxParticipants);
      }
      
      // 練習イベントの場合
      if (formData.eventType === EventType.PRACTICE) {
        if (selectedCards.length > 0) {
          eventData.practiceCardIds = selectedCards;
        }
        if (formData.createPracticeRecord) {
          eventData.createPracticeRecord = true;
        }
      }
      
      if (event) {
        // 更新
        await updateDoc(doc(db, 'communities', communityId, 'events', event.id), eventData);
      } else {
        // 新規作成
        eventData.createdBy = user.uid;
        eventData.createdAt = Date.now();
        const docRef = await addDoc(collection(db, 'communities', communityId, 'events'), eventData);
        
        // 練習記録を作成する場合
        if (formData.eventType === EventType.PRACTICE && formData.createPracticeRecord) {
          // 練習記録作成ページへリダイレクト（コミュニティIDも含める）
          router.push(`/practice-management?tab=records&date=${formData.startDate}&eventId=${docRef.id}&communityId=${communityId}`);
          return;
        }
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('イベントの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case EventType.PRACTICE:
        return <Activity className="h-4 w-4" />;
      case EventType.MATCH:
        return <Trophy className="h-4 w-4" />;
      case EventType.OTHER:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const getEventTypeLabel = (type: EventType) => {
    switch (type) {
      case EventType.PRACTICE:
        return '練習';
      case EventType.MATCH:
        return '試合';
      case EventType.OTHER:
        return 'その他';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              イベントタイプ *
            </label>
            <div className="flex gap-2">
              {Object.values(EventType).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, eventType: type })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    formData.eventType === type
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {getEventTypeIcon(type)}
                  {getEventTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

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
              placeholder={
                formData.eventType === EventType.PRACTICE ? '例: 週末練習会' :
                formData.eventType === EventType.MATCH ? '例: 地区大会' :
                '例: 親睦会'
              }
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
              placeholder="イベントの詳細や持ち物などを記載"
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
                <Calendar className="inline h-4 w-4 mr-1" />
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
                <Clock className="inline h-4 w-4 mr-1" />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="inline h-4 w-4 mr-1" />
              定員
            </label>
            <input
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="例: 20"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* 練習設定（練習イベントの場合のみ） */}
      {formData.eventType === EventType.PRACTICE && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">練習設定</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="createPracticeRecord"
                checked={formData.createPracticeRecord}
                onChange={(e) => setFormData({ ...formData, createPracticeRecord: e.target.checked })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="createPracticeRecord" className="ml-2 text-sm text-gray-700">
                練習記録を作成する
              </label>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowPracticeCards(!showPracticeCards)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                練習カードを選択 ({selectedCards.length}枚選択中)
              </button>
              
              {showPracticeCards && (
                <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {practiceCards.length === 0 ? (
                    <p className="text-gray-500 text-center">練習カードがありません</p>
                  ) : (
                    <div className="space-y-2">
                      {practiceCards.map((card) => (
                        <label key={card.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={selectedCards.includes(card.id)}
                            onChange={() => {
                              if (selectedCards.includes(card.id)) {
                                setSelectedCards(selectedCards.filter(id => id !== card.id));
                              } else {
                                setSelectedCards([...selectedCards, card.id]);
                              }
                            }}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm">{card.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ボタン */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? '保存中...' : (event ? '更新' : '作成')}
        </button>
      </div>
    </form>
  );
}