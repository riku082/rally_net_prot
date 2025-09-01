// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PracticeCard } from '@/types/practice';
import { 
  X, 
  Clock, 
  Target,
  Users,
  AlertCircle,
  Activity,
  ChevronRight
} from 'lucide-react';
import BadmintonCourt from '@/components/BadmintonCourt';

interface PracticeCardDetailModalProps {
  cardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PracticeCardDetailModal({
  cardId,
  isOpen,
  onClose
}: PracticeCardDetailModalProps) {
  const [card, setCard] = useState<PracticeCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && cardId) {
      loadCardDetails();
    }
  }, [isOpen, cardId]);

  const loadCardDetails = async () => {
    setLoading(true);
    try {
      const cardDoc = await getDoc(doc(db, 'practiceCards', cardId));
      if (cardDoc.exists()) {
        setCard({
          id: cardDoc.id,
          ...cardDoc.data()
        } as PracticeCard);
      }
    } catch (error) {
      console.error('Error loading practice card:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'basic': '基礎練習',
      'footwork': 'フットワーク',
      'shot_practice': 'ショット練習',
      'game_practice': 'ゲーム練習',
      'conditioning': 'トレーニング',
      'other': 'その他'
    };
    return labels[category] || category;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: { [key: string]: string } = {
      'beginner': '初級',
      'intermediate': '中級',
      'advanced': '上級',
      'all': '全レベル'
    };
    return labels[difficulty] || difficulty;
  };

  const getIntensityLabel = (intensity: string) => {
    const labels: { [key: string]: string } = {
      'low': '低',
      'medium': '中',
      'high': '高'
    };
    return labels[intensity] || intensity;
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900">
            {loading ? '読み込み中...' : (card?.title || '練習カード詳細')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : card ? (
          <div className="p-6 space-y-6">
            {/* メタ情報 */}
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {getCategoryLabel(card.category)}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {getDifficultyLabel(card.difficulty)}
              </span>
              {card.intensity && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIntensityColor(card.intensity)}`}>
                  運動強度: {getIntensityLabel(card.intensity)}
                </span>
              )}
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {card.duration}分
              </span>
              {card.participants && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {card.participants}
                </span>
              )}
            </div>

            {/* 説明 */}
            {card.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">説明</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{card.description}</p>
              </div>
            )}

            {/* 目的・効果 */}
            {card.objectives && card.objectives.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  目的・効果
                </h3>
                <ul className="space-y-1">
                  {card.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <ChevronRight className="h-4 w-4 text-blue-600 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 必要な道具 */}
            {card.equipment && card.equipment.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  必要な道具
                </h3>
                <div className="flex flex-wrap gap-2">
                  {card.equipment.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-white border border-green-300 rounded text-sm text-gray-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 注意点 */}
            {card.notes && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  注意点・ポイント
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{card.notes}</p>
              </div>
            )}

            {/* コート配置図 */}
            {card.courtPositions && card.courtPositions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">コート配置</h3>
                <div className="flex justify-center">
                  <BadmintonCourt
                    positions={card.courtPositions}
                    movements={card.movements}
                    width={400}
                    height={600}
                    showAreaLabels={true}
                    interactive={false}
                  />
                </div>
              </div>
            )}

            {/* タグ */}
            {card.tags && card.tags.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">タグ:</span>
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            練習カードが見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
}