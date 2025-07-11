'use client';

import React, { useState } from 'react';
import { CourtZone, PracticeCourtInfo } from '@/types/practice';
import { FaCheck, FaCircle } from 'react-icons/fa';

interface CourtSelectorProps {
  courtInfo?: PracticeCourtInfo;
  onChange: (courtInfo: PracticeCourtInfo) => void;
}

const CourtSelector: React.FC<CourtSelectorProps> = ({ courtInfo, onChange }) => {
  const [selectedAreas, setSelectedAreas] = useState<CourtZone[]>(courtInfo?.targetAreas || []);
  const [focusArea, setFocusArea] = useState<CourtZone | undefined>(courtInfo?.focusArea);
  const [courtType, setCourtType] = useState<'singles' | 'doubles'>(courtInfo?.courtType || 'doubles');
  const [notes, setNotes] = useState(courtInfo?.notes || '');

  const courtZones = [
    // ネット際
    { id: 'net_left', name: 'ネット際左', category: 'net', x: 10, y: 45, width: 25, height: 10 },
    { id: 'net_center', name: 'ネット際中央', category: 'net', x: 35, y: 45, width: 30, height: 10 },
    { id: 'net_right', name: 'ネット際右', category: 'net', x: 65, y: 45, width: 25, height: 10 },
    
    // 前衛
    { id: 'frontcourt_left', name: '前衛左', category: 'front', x: 10, y: 30, width: 25, height: 15 },
    { id: 'frontcourt_center', name: '前衛中央', category: 'front', x: 35, y: 30, width: 30, height: 15 },
    { id: 'frontcourt_right', name: '前衛右', category: 'front', x: 65, y: 30, width: 25, height: 15 },
    
    // 中衛
    { id: 'midcourt_left', name: '中衛左', category: 'mid', x: 10, y: 15, width: 25, height: 15 },
    { id: 'midcourt_center', name: '中衛中央', category: 'mid', x: 35, y: 15, width: 30, height: 15 },
    { id: 'midcourt_right', name: '中衛右', category: 'mid', x: 65, y: 15, width: 25, height: 15 },
    
    // 後衛
    { id: 'backcourt_left', name: '後衛左', category: 'back', x: 10, y: 5, width: 25, height: 10 },
    { id: 'backcourt_center', name: '後衛中央', category: 'back', x: 35, y: 5, width: 30, height: 10 },
    { id: 'backcourt_right', name: '後衛右', category: 'back', x: 65, y: 5, width: 25, height: 10 },
    
    // サービスボックス
    { id: 'service_box_left', name: '左サービスボックス', category: 'service', x: 15, y: 55, width: 20, height: 15 },
    { id: 'service_box_right', name: '右サービスボックス', category: 'service', x: 65, y: 55, width: 20, height: 15 },
    
    // ライン
    { id: 'baseline', name: 'ベースライン', category: 'line', x: 10, y: 0, width: 80, height: 5 },
    { id: 'sideline_left', name: '左サイドライン', category: 'line', x: 5, y: 0, width: 5, height: 70 },
    { id: 'sideline_right', name: '右サイドライン', category: 'line', x: 90, y: 0, width: 5, height: 70 },
    
    // 全体
    { id: 'full_court', name: 'コート全体', category: 'full', x: 5, y: 0, width: 90, height: 70 },
  ] as const;

  const categoryColors = {
    net: '#22c55e',     // 緑
    front: '#3b82f6',   // 青
    mid: '#f59e0b',     // オレンジ
    back: '#ef4444',    // 赤
    service: '#8b5cf6', // 紫
    line: '#6b7280',    // グレー
    full: '#14b8a6',    // ティール
  };

  const handleAreaToggle = (zoneId: CourtZone) => {
    const newSelectedAreas = selectedAreas.includes(zoneId)
      ? selectedAreas.filter(area => area !== zoneId)
      : [...selectedAreas, zoneId];
    
    setSelectedAreas(newSelectedAreas);
    
    // focusAreaが選択解除された場合はクリア
    if (!newSelectedAreas.includes(zoneId) && focusArea === zoneId) {
      setFocusArea(undefined);
    }
    
    updateCourtInfo(newSelectedAreas, focusArea, courtType, notes);
  };

  const handleFocusAreaChange = (zoneId: CourtZone) => {
    const newFocusArea = focusArea === zoneId ? undefined : zoneId;
    setFocusArea(newFocusArea);
    
    // フォーカスエリアが選択されていない場合は追加
    let newSelectedAreas = selectedAreas;
    if (newFocusArea && !selectedAreas.includes(newFocusArea)) {
      newSelectedAreas = [...selectedAreas, newFocusArea];
      setSelectedAreas(newSelectedAreas);
    }
    
    updateCourtInfo(newSelectedAreas, newFocusArea, courtType, notes);
  };

  const handleCourtTypeChange = (type: 'singles' | 'doubles') => {
    setCourtType(type);
    updateCourtInfo(selectedAreas, focusArea, type, notes);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    updateCourtInfo(selectedAreas, focusArea, courtType, newNotes);
  };

  const updateCourtInfo = (areas: CourtZone[], focus: CourtZone | undefined, type: 'singles' | 'doubles', noteText: string) => {
    onChange({
      targetAreas: areas,
      focusArea: focus,
      courtType: type,
      notes: noteText.trim() || undefined,
    });
  };

  const clearSelection = () => {
    setSelectedAreas([]);
    setFocusArea(undefined);
    updateCourtInfo([], undefined, courtType, notes);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">練習対象エリア</h4>
        
        {/* コートタイプ選択 */}
        <div className="mb-4">
          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="courtType"
                value="doubles"
                checked={courtType === 'doubles'}
                onChange={() => handleCourtTypeChange('doubles')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">ダブルス</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="courtType"
                value="singles"
                checked={courtType === 'singles'}
                onChange={() => handleCourtTypeChange('singles')}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">シングルス</span>
            </label>
          </div>
        </div>

        {/* コート図 */}
        <div className="relative bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
          <div className="relative w-full h-80 bg-green-100 rounded border-2 border-green-300">
            {/* ネット */}
            <div className="absolute w-full h-1 bg-gray-800" style={{ top: '50%', transform: 'translateY(-50%)' }}></div>
            <div className="absolute text-xs text-gray-600 font-semibold" style={{ top: '48%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              ネット
            </div>
            
            {/* コートエリア */}
            {courtZones.map(zone => {
              const isSelected = selectedAreas.includes(zone.id as CourtZone);
              const isFocus = focusArea === zone.id;
              const category = zone.category as keyof typeof categoryColors;
              
              return (
                <div
                  key={zone.id}
                  className={`absolute border-2 rounded cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium ${
                    isSelected
                      ? isFocus
                        ? 'border-red-500 bg-red-200 text-red-800'
                        : 'border-blue-500 bg-blue-200 text-blue-800'
                      : 'border-gray-300 bg-white bg-opacity-50 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                  onClick={() => handleAreaToggle(zone.id as CourtZone)}
                  title={zone.name}
                >
                  {isSelected && (
                    <FaCheck className={`w-3 h-3 ${isFocus ? 'text-red-600' : 'text-blue-600'}`} />
                  )}
                  <span className="ml-1 hidden sm:inline">{zone.name}</span>
                </div>
              );
            })}
          </div>
          
          {/* 説明 */}
          <div className="mt-4 text-xs text-gray-600">
            <p><strong>クリック:</strong> エリア選択/解除</p>
            <p><strong>青:</strong> 選択済み、<strong>赤:</strong> メインエリア</p>
          </div>
        </div>

        {/* エリアリスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">選択済みエリア</h5>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedAreas.length === 0 ? (
                <p className="text-sm text-gray-500">エリアが選択されていません</p>
              ) : (
                selectedAreas.map(areaId => {
                  const zone = courtZones.find(z => z.id === areaId);
                  if (!zone) return null;
                  
                  return (
                    <div key={areaId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{zone.name}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFocusAreaChange(areaId as CourtZone)}
                          className={`p-1 rounded ${
                            focusArea === areaId
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={focusArea === areaId ? 'メインエリア解除' : 'メインエリアに設定'}
                        >
                          <FaCircle className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleAreaToggle(areaId as CourtZone)}
                          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          title="エリア削除"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">クイック選択</h5>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['frontcourt_left', 'frontcourt_center', 'frontcourt_right'];
                  setSelectedAreas(allAreas);
                  updateCourtInfo(allAreas, focusArea, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                前衛エリア全体
              </button>
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['backcourt_left', 'backcourt_center', 'backcourt_right'];
                  setSelectedAreas(allAreas);
                  updateCourtInfo(allAreas, focusArea, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
              >
                後衛エリア全体
              </button>
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['service_box_left', 'service_box_right'];
                  setSelectedAreas(allAreas);
                  updateCourtInfo(allAreas, focusArea, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
              >
                サービスエリア
              </button>
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['full_court'];
                  setSelectedAreas(allAreas);
                  setFocusArea('full_court');
                  updateCourtInfo(allAreas, 'full_court', courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
              >
                コート全体
              </button>
              {selectedAreas.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  選択をクリア
                </button>
              )}
            </div>
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            コート配置・配球に関するメモ
          </label>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="配球パターンや立ち位置について記録してください"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default CourtSelector;