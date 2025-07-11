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
    // 上側コート（相手側）
    { id: 'backcourt_left', name: '後衛左', side: 'top' },
    { id: 'backcourt_center', name: '後衛中央', side: 'top' },
    { id: 'backcourt_right', name: '後衛右', side: 'top' },
    { id: 'midcourt_left', name: '中衛左', side: 'top' },
    { id: 'midcourt_center', name: '中衛中央', side: 'top' },
    { id: 'midcourt_right', name: '中衛右', side: 'top' },
    { id: 'frontcourt_left', name: '前衛左', side: 'top' },
    { id: 'frontcourt_center', name: '前衛中央', side: 'top' },
    { id: 'frontcourt_right', name: '前衛右', side: 'top' },
    { id: 'service_box_left', name: '左サービスボックス', side: 'top' },
    { id: 'service_box_right', name: '右サービスボックス', side: 'top' },
    
    // 下側コート（自分側）- 上側と対称
    { id: 'frontcourt_left_own', name: '前衛左（自分側）', side: 'bottom' },
    { id: 'frontcourt_center_own', name: '前衛中央（自分側）', side: 'bottom' },
    { id: 'frontcourt_right_own', name: '前衛右（自分側）', side: 'bottom' },
    { id: 'service_box_left_own', name: '左サービスボックス（自分側）', side: 'bottom' },
    { id: 'service_box_right_own', name: '右サービスボックス（自分側）', side: 'bottom' },
    { id: 'midcourt_left_own', name: '中衛左（自分側）', side: 'bottom' },
    { id: 'midcourt_center_own', name: '中衛中央（自分側）', side: 'bottom' },
    { id: 'midcourt_right_own', name: '中衛右（自分側）', side: 'bottom' },
    { id: 'backcourt_left_own', name: '後衛左（自分側）', side: 'bottom' },
    { id: 'backcourt_center_own', name: '後衛中央（自分側）', side: 'bottom' },
    { id: 'backcourt_right_own', name: '後衛右（自分側）', side: 'bottom' },
    
    // 全体
    { id: 'full_court', name: 'コート全体', side: 'both' },
  ] as const;

  const handleAreaToggle = (zoneId: CourtZone) => {
    const newSelectedAreas = selectedAreas.includes(zoneId)
      ? selectedAreas.filter(area => area !== zoneId)
      : [...selectedAreas, zoneId];
    
    setSelectedAreas(newSelectedAreas);
    
    if (!newSelectedAreas.includes(zoneId) && focusArea === zoneId) {
      setFocusArea(undefined);
    }
    
    updateCourtInfo(newSelectedAreas, focusArea, courtType, notes);
  };

  const handleFocusAreaChange = (zoneId: CourtZone) => {
    const newFocusArea = focusArea === zoneId ? undefined : zoneId;
    setFocusArea(newFocusArea);
    
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

        {/* 対称的なコート図 */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
          <div className="text-center text-sm text-gray-700 mb-3 font-semibold">相手側コート</div>
          
          {/* 上側コート - 後衛 */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['backcourt_left', 'backcourt_center', 'backcourt_right'].map(zoneId => {
              const zone = courtZones.find(z => z.id === zoneId);
              const isSelected = selectedAreas.includes(zoneId as CourtZone);
              const isFocus = focusArea === zoneId;
              
              return (
                <button
                  key={zoneId}
                  onClick={() => handleAreaToggle(zoneId as CourtZone)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? isFocus
                        ? 'border-red-500 bg-red-200 text-red-800'
                        : 'border-blue-500 bg-blue-200 text-blue-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs">{zone?.name}</div>
                </button>
              );
            })}
          </div>

          {/* 上側コート - 中衛 */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['midcourt_left', 'midcourt_center', 'midcourt_right'].map(zoneId => {
              const zone = courtZones.find(z => z.id === zoneId);
              const isSelected = selectedAreas.includes(zoneId as CourtZone);
              const isFocus = focusArea === zoneId;
              
              return (
                <button
                  key={zoneId}
                  onClick={() => handleAreaToggle(zoneId as CourtZone)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? isFocus
                        ? 'border-red-500 bg-red-200 text-red-800'
                        : 'border-blue-500 bg-blue-200 text-blue-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs">{zone?.name}</div>
                </button>
              );
            })}
          </div>

          {/* 上側コート - 前衛 */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['frontcourt_left', 'frontcourt_center', 'frontcourt_right'].map(zoneId => {
              const zone = courtZones.find(z => z.id === zoneId);
              const isSelected = selectedAreas.includes(zoneId as CourtZone);
              const isFocus = focusArea === zoneId;
              
              return (
                <button
                  key={zoneId}
                  onClick={() => handleAreaToggle(zoneId as CourtZone)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? isFocus
                        ? 'border-red-500 bg-red-200 text-red-800'
                        : 'border-blue-500 bg-blue-200 text-blue-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs">{zone?.name}</div>
                </button>
              );
            })}
          </div>

          {/* 上側コート - サービスボックス */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => handleAreaToggle('service_box_left' as CourtZone)}
              className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                selectedAreas.includes('service_box_left' as CourtZone)
                  ? focusArea === 'service_box_left'
                    ? 'border-red-500 bg-red-200 text-red-800'
                    : 'border-blue-500 bg-blue-200 text-blue-800'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {selectedAreas.includes('service_box_left' as CourtZone) && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
              <div className="text-xs">左サービス</div>
            </button>
            <div></div>
            <button
              onClick={() => handleAreaToggle('service_box_right' as CourtZone)}
              className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                selectedAreas.includes('service_box_right' as CourtZone)
                  ? focusArea === 'service_box_right'
                    ? 'border-red-500 bg-red-200 text-red-800'
                    : 'border-blue-500 bg-blue-200 text-blue-800'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {selectedAreas.includes('service_box_right' as CourtZone) && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
              <div className="text-xs">右サービス</div>
            </button>
          </div>

          {/* ネット */}
          <div className="border-t-4 border-gray-800 my-4 relative">
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded text-xs text-gray-600 font-semibold shadow">
              ネット
            </div>
          </div>

          <div className="text-center text-sm text-gray-700 mb-3 font-semibold">自分側コート</div>

          {/* 下側コート - サービスボックス */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button
              onClick={() => handleAreaToggle('service_box_left_own' as CourtZone)}
              className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                selectedAreas.includes('service_box_left_own' as CourtZone)
                  ? focusArea === 'service_box_left_own'
                    ? 'border-red-500 bg-red-200 text-red-800'
                    : 'border-blue-500 bg-blue-200 text-blue-800'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {selectedAreas.includes('service_box_left_own' as CourtZone) && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
              <div className="text-xs">左サービス</div>
            </button>
            <div></div>
            <button
              onClick={() => handleAreaToggle('service_box_right_own' as CourtZone)}
              className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                selectedAreas.includes('service_box_right_own' as CourtZone)
                  ? focusArea === 'service_box_right_own'
                    ? 'border-red-500 bg-red-200 text-red-800'
                    : 'border-blue-500 bg-blue-200 text-blue-800'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {selectedAreas.includes('service_box_right_own' as CourtZone) && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
              <div className="text-xs">右サービス</div>
            </button>
          </div>

          {/* 下側コート - 前衛 */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['frontcourt_left_own', 'frontcourt_center_own', 'frontcourt_right_own'].map(zoneId => {
              const zone = courtZones.find(z => z.id === zoneId);
              const isSelected = selectedAreas.includes(zoneId as CourtZone);
              const isFocus = focusArea === zoneId;
              
              return (
                <button
                  key={zoneId}
                  onClick={() => handleAreaToggle(zoneId as CourtZone)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? isFocus
                        ? 'border-red-500 bg-red-200 text-red-800'
                        : 'border-blue-500 bg-blue-200 text-blue-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs">{zone?.name}</div>
                </button>
              );
            })}
          </div>

          {/* 下側コート - 中衛 */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['midcourt_left_own', 'midcourt_center_own', 'midcourt_right_own'].map(zoneId => {
              const zone = courtZones.find(z => z.id === zoneId);
              const isSelected = selectedAreas.includes(zoneId as CourtZone);
              const isFocus = focusArea === zoneId;
              
              return (
                <button
                  key={zoneId}
                  onClick={() => handleAreaToggle(zoneId as CourtZone)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? isFocus
                        ? 'border-red-500 bg-red-200 text-red-800'
                        : 'border-blue-500 bg-blue-200 text-blue-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs">{zone?.name}</div>
                </button>
              );
            })}
          </div>

          {/* 下側コート - 後衛 */}
          <div className="grid grid-cols-3 gap-2">
            {['backcourt_left_own', 'backcourt_center_own', 'backcourt_right_own'].map(zoneId => {
              const zone = courtZones.find(z => z.id === zoneId);
              const isSelected = selectedAreas.includes(zoneId as CourtZone);
              const isFocus = focusArea === zoneId;
              
              return (
                <button
                  key={zoneId}
                  onClick={() => handleAreaToggle(zoneId as CourtZone)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? isFocus
                        ? 'border-red-500 bg-red-200 text-red-800'
                        : 'border-blue-500 bg-blue-200 text-blue-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs">{zone?.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 選択済みエリアとクイック選択 */}
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
                相手側前衛エリア
              </button>
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['frontcourt_left_own', 'frontcourt_center_own', 'frontcourt_right_own'];
                  setSelectedAreas(allAreas);
                  updateCourtInfo(allAreas, focusArea, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                自分側前衛エリア
              </button>
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['backcourt_left', 'backcourt_center', 'backcourt_right'];
                  setSelectedAreas(allAreas);
                  updateCourtInfo(allAreas, focusArea, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
              >
                相手側後衛エリア
              </button>
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['backcourt_left_own', 'backcourt_center_own', 'backcourt_right_own'];
                  setSelectedAreas(allAreas);
                  updateCourtInfo(allAreas, focusArea, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
              >
                自分側後衛エリア
              </button>
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['service_box_left', 'service_box_right', 'service_box_left_own', 'service_box_right_own'];
                  setSelectedAreas(allAreas);
                  updateCourtInfo(allAreas, focusArea, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
              >
                全サービスエリア
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