'use client';

import React, { useState } from 'react';
import { PracticeCard, PracticeCardExecution } from '@/types/practice';
import { FaPlus, FaTrash, FaClock, FaGripVertical } from 'react-icons/fa';

interface RoutineBuilderProps {
  availableCards: PracticeCard[];
  selectedCards: PracticeCardExecution[];
  onCardsChange: (cards: PracticeCardExecution[]) => void;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({
  availableCards,
  selectedCards,
  onCardsChange
}) => {
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addCard = (card: PracticeCard) => {
    const newCardExecution: PracticeCardExecution = {
      cardId: card.id,
      cardTitle: card.title,
      order: selectedCards.length + 1,
      plannedDuration: card.drill.duration,
      completed: false,
    };
    
    const updatedCards = [...selectedCards, newCardExecution].map((card, index) => ({
      ...card,
      order: index + 1
    }));
    
    onCardsChange(updatedCards);
    setShowCardSelector(false);
  };

  const removeCard = (index: number) => {
    const updatedCards = selectedCards
      .filter((_, i) => i !== index)
      .map((card, i) => ({ ...card, order: i + 1 }));
    onCardsChange(updatedCards);
  };

  const updateCard = (index: number, updates: Partial<PracticeCardExecution>) => {
    const updatedCards = selectedCards.map((card, i) => 
      i === index ? { ...card, ...updates } : card
    );
    onCardsChange(updatedCards);
  };

  const moveCard = (fromIndex: number, toIndex: number) => {
    const updatedCards = [...selectedCards];
    const [movedCard] = updatedCards.splice(fromIndex, 1);
    updatedCards.splice(toIndex, 0, movedCard);
    
    // 順序を更新
    const reorderedCards = updatedCards.map((card, index) => ({
      ...card,
      order: index + 1
    }));
    
    onCardsChange(reorderedCards);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveCard(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const totalDuration = selectedCards.reduce((sum, card) => sum + card.plannedDuration, 0);
  const availableCardsToAdd = availableCards.filter(
    card => !selectedCards.some(selected => selected.cardId === card.id)
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <h4 className="text-sm font-medium text-gray-700">練習ルーティン</h4>
        <button
          type="button"
          onClick={() => setShowCardSelector(true)}
          className="flex items-center justify-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="w-3 h-3 mr-1" />
          カード追加
        </button>
      </div>

      {/* 選択されたカード一覧 */}
      <div className="space-y-2">
        {selectedCards.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-gray-500 text-sm">練習カードを追加してルーティンを作成してください</p>
          </div>
        ) : (
          selectedCards.map((cardExecution, index) => {
            const card = availableCards.find(c => c.id === cardExecution.cardId);
            
            return (
              <div
                key={`${cardExecution.cardId}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-gray-50 border rounded-lg p-2 sm:p-3 cursor-move hover:bg-gray-100 transition-colors ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
                  <FaGripVertical className="w-4 h-4 text-gray-400 mt-1 sm:mt-0 flex-shrink-0" />
                  <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {cardExecution.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <h5 className="font-medium text-gray-900 text-sm sm:text-base truncate">{cardExecution.cardTitle}</h5>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <FaClock className="w-3 h-3 mr-1" />
                          {cardExecution.plannedDuration}分
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCard(index)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {card && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{card.description}</p>
                    )}
                  </div>
                </div>

                {/* カスタム設定 */}
                <div className="mt-3 ml-6 sm:ml-10 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">実際の時間（分）</label>
                    <input
                      type="number"
                      value={cardExecution.actualDuration || ''}
                      onChange={(e) => updateCard(index, { 
                        actualDuration: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder={cardExecution.plannedDuration.toString()}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">評価（1-5）</label>
                    <select
                      value={cardExecution.rating || ''}
                      onChange={(e) => updateCard(index, { 
                        rating: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">未評価</option>
                      <option value="1">1 - 悪い</option>
                      <option value="2">2 - 不満</option>
                      <option value="3">3 - 普通</option>
                      <option value="4">4 - 良い</option>
                      <option value="5">5 - 最高</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2 ml-6 sm:ml-10">
                  <textarea
                    value={cardExecution.notes || ''}
                    onChange={(e) => updateCard(index, { notes: e.target.value })}
                    placeholder="このカードに関するメモ"
                    rows={2}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-2 ml-6 sm:ml-10 flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cardExecution.completed}
                      onChange={(e) => updateCard(index, { completed: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700">完了</span>
                  </label>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 合計時間 */}
      {selectedCards.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">合計時間</span>
            <span className="text-blue-800 font-bold">
              <FaClock className="inline w-3 h-3 mr-1" />
              {totalDuration}分
            </span>
          </div>
          <div className="text-xs text-blue-600 mt-1">
            完了: {selectedCards.filter(c => c.completed).length}/{selectedCards.length}カード
          </div>
        </div>
      )}

      {/* カード選択モーダル */}
      {showCardSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">練習カードを選択</h3>
                <button
                  onClick={() => setShowCardSelector(false)}
                  className="text-gray-400 hover:text-gray-600 text-lg"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 max-h-96 overflow-y-auto">
              {availableCardsToAdd.length === 0 ? (
                <p className="text-gray-500 text-center">追加可能な練習カードがありません</p>
              ) : (
                <div className="space-y-2">
                  {availableCardsToAdd.map(card => (
                    <div
                      key={card.id}
                      className="border border-gray-200 rounded-lg p-2 sm:p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => addCard(card)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{card.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{card.description}</p>
                        </div>
                        <div className="text-left sm:text-right flex-shrink-0">
                          <div className="text-xs sm:text-sm text-gray-600 flex items-center">
                            <FaClock className="w-3 h-3 mr-1" />
                            {card.drill.duration}分
                          </div>
                          <div className="text-xs text-gray-500">{card.difficulty}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineBuilder;