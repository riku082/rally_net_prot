// @ts-nocheck
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
    // 後衛エリア（上側）
    { id: 'backcourt_left', name: '後衛左', category: 'back', x: 15, y: 5, width: 25, height: 15 },
    { id: 'backcourt_center', name: '後衛中央', category: 'back', x: 40, y: 5, width: 20, height: 15 },
    { id: 'backcourt_right', name: '後衛右', category: 'back', x: 60, y: 5, width: 25, height: 15 },
    
    // 中衛エリア
    { id: 'midcourt_left', name: '中衛左', category: 'mid', x: 15, y: 20, width: 25, height: 15 },
    { id: 'midcourt_center', name: '中衛中央', category: 'mid', x: 40, y: 20, width: 20, height: 15 },
    { id: 'midcourt_right', name: '中衛右', category: 'mid', x: 60, y: 20, width: 25, height: 15 },
    
    // 前衛エリア
    { id: 'frontcourt_left', name: '前衛左', category: 'front', x: 15, y: 35, width: 25, height: 13 },
    { id: 'frontcourt_center', name: '前衛中央', category: 'front', x: 40, y: 35, width: 20, height: 13 },
    { id: 'frontcourt_right', name: '前衛右', category: 'front', x: 60, y: 35, width: 25, height: 13 },
    
    // ネット際エリア
    { id: 'net_left', name: 'ネット際左', category: 'net', x: 15, y: 48, width: 25, height: 4 },
    { id: 'net_center', name: 'ネット際中央', category: 'net', x: 40, y: 48, width: 20, height: 4 },
    { id: 'net_right', name: 'ネット際右', category: 'net', x: 60, y: 48, width: 25, height: 4 },
    
    // サービスボックス（下側）
    { id: 'service_box_left', name: '左サービスボックス', category: 'service', x: 15, y: 52, width: 25, height: 20 },
    { id: 'service_box_right', name: '右サービスボックス', category: 'service', x: 60, y: 52, width: 25, height: 20 },
    
    // ベースライン
    { id: 'baseline', name: 'ベースライン', category: 'line', x: 10, y: 75, width: 80, height: 20 },
    
    // サイドライン
    { id: 'sideline_left', name: '左サイドライン', category: 'line', x: 5, y: 5, width: 10, height: 90 },
    { id: 'sideline_right', name: '右サイドライン', category: 'line', x: 85, y: 5, width: 10, height: 90 },
    
    // 全体
    { id: 'full_court', name: 'コート全体', category: 'full', x: 10, y: 5, width: 80, height: 90 },
  ] as const;


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
          <div className="relative w-full bg-green-100 rounded border-2 border-green-300 overflow-hidden" style={{ height: '500px' }}>
            {/* コートの背景 */}
            <div className="absolute inset-4 bg-green-200 border-2 border-white"></div>
            
            {/* ネット */}
            <div 
              className="absolute bg-gray-800 z-40" 
              style={{ 
                top: '50%', 
                left: '16px',
                right: '16px',
                transform: 'translateY(-50%)',
                height: '4px'
              }}
            ></div>
            <div 
              className="absolute text-xs text-gray-600 font-semibold z-50 bg-white px-2 py-1 rounded shadow-sm" 
              style={{ 
                top: '46%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)' 
              }}
            >
              ネット
            </div>
            
            {/* コートライン */}
            <div className="absolute inset-4">
              {/* 外枠 */}
              <div className="absolute inset-0 border-2 border-white"></div>
              
              {/* センターライン */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white transform -translate-x-0.5"></div>
              
              {/* サービスライン */}
              <div className="absolute left-0 right-0 top-1/4 h-0.5 bg-white"></div>
              <div className="absolute left-0 right-0 bottom-1/4 h-0.5 bg-white"></div>
            </div>
            
            {/* コートエリア */}
            {courtZones.map((zone) => {
              const isSelected = selectedAreas.includes(zone.id as CourtZone);
              const isFocus = focusArea === zone.id;
              
              return (
                <div
                  key={zone.id}
                  className={`absolute border-2 rounded cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium ${
                    isSelected
                      ? isFocus
                        ? 'border-red-500 bg-red-300 bg-opacity-80 text-red-800 z-30'
                        : 'border-blue-500 bg-blue-300 bg-opacity-80 text-blue-800 z-20'
                      : 'border-gray-400 bg-gray-100 bg-opacity-60 text-gray-700 hover:bg-gray-200 hover:bg-opacity-80 z-10'
                  }`}
                  style={{
                    left: `${16 + (zone.x * (500 - 32) / 100)}px`,
                    top: `${16 + (zone.y * (500 - 32) / 100)}px`,
                    width: `${(zone.width * (500 - 32) / 100)}px`,
                    height: `${(zone.height * (500 - 32) / 100)}px`,
                    minHeight: '35px',
                    minWidth: '70px',
                  }}
                  onClick={() => handleAreaToggle(zone.id as CourtZone)}
                  title={zone.name}
                >
                  <div className="flex items-center justify-center text-center px-1">
                    {isSelected && (
                      <FaCheck className={`w-3 h-3 mr-1 flex-shrink-0 ${isFocus ? 'text-red-600' : 'text-blue-600'}`} />
                    )}
                    <span className="text-xs leading-tight">{zone.name}</span>
                  </div>
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