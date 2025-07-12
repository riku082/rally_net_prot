'use client';

import React, { useState } from 'react';
import { CourtZone, PracticeCourtInfo } from '@/types/practice';
import { FaCheck } from 'react-icons/fa';

interface CourtSelectorProps {
  courtInfo?: PracticeCourtInfo;
  onChange: (courtInfo: PracticeCourtInfo) => void;
}

const CourtSelector: React.FC<CourtSelectorProps> = ({ courtInfo, onChange }) => {
  const [selectedAreas, setSelectedAreas] = useState<CourtZone[]>(courtInfo?.targetAreas || []);
  const [courtType, setCourtType] = useState<'singles' | 'doubles'>(courtInfo?.courtType || 'doubles');
  const [notes, setNotes] = useState(courtInfo?.notes || '');

  const courtZones = [
    // コートエリア（相手側のみ）
    { id: 'backcourt_left', name: '後衛左', side: 'top' },
    { id: 'backcourt_center', name: '後衛中央', side: 'top' },
    { id: 'backcourt_right', name: '後衛右', side: 'top' },
    { id: 'midcourt_left', name: '中衛左', side: 'top' },
    { id: 'midcourt_center', name: '中衛中央', side: 'top' },
    { id: 'midcourt_right', name: '中衛右', side: 'top' },
    { id: 'frontcourt_left', name: '前衛左', side: 'top' },
    { id: 'frontcourt_center', name: '前衛中央', side: 'top' },
    { id: 'frontcourt_right', name: '前衛右', side: 'top' },
    
    // 全体
    { id: 'full_court', name: 'コート全体', side: 'both' },
  ] as const;

  const getAllIndividualAreas = (): CourtZone[] => {
    return [
      'backcourt_left', 'backcourt_center', 'backcourt_right',
      'midcourt_left', 'midcourt_center', 'midcourt_right',
      'frontcourt_left', 'frontcourt_center', 'frontcourt_right'
    ];
  };

  const handleAreaToggle = (zoneId: CourtZone) => {
    let newSelectedAreas: CourtZone[];
    
    if (selectedAreas.includes(zoneId)) {
      // エリアの選択を解除
      newSelectedAreas = selectedAreas.filter(area => area !== zoneId);
    } else {
      // エリアを追加
      if (zoneId === 'full_court') {
        // full_courtを選択した場合は、全ての個別エリアを選択する
        newSelectedAreas = getAllIndividualAreas();
      } else {
        // 個別エリアを選択した場合は、既存の選択に追加
        newSelectedAreas = [...selectedAreas, zoneId];
      }
    }
    
    setSelectedAreas(newSelectedAreas);
    updateCourtInfo(newSelectedAreas, undefined, courtType, notes);
  };


  const handleCourtTypeChange = (type: 'singles' | 'doubles') => {
    setCourtType(type);
    updateCourtInfo(selectedAreas, undefined, type, notes);
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    updateCourtInfo(selectedAreas, undefined, courtType, newNotes);
  };

  const updateCourtInfo = (areas: CourtZone[], focus: CourtZone | undefined, type: 'singles' | 'doubles', noteText: string) => {
    onChange({
      targetAreas: areas,
      focusArea: undefined,
      courtType: type,
      notes: noteText.trim() || undefined,
    });
  };

  const clearSelection = () => {
    setSelectedAreas([]);
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
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
          <div className="text-center text-sm text-gray-700 mb-3 font-semibold">コートエリア</div>
          
          {/* 後衛エリア */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['backcourt_left', 'backcourt_center', 'backcourt_right'].map(zoneId => {
              const zone = courtZones.find(z => z.id === zoneId);
              const isSelected = selectedAreas.includes(zoneId as CourtZone);
              
              return (
                <button
                  key={zoneId}
                  onClick={() => handleAreaToggle(zoneId as CourtZone)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-theme-primary-500 bg-theme-primary-200 text-theme-primary-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs">{zone?.name}</div>
                </button>
              );
            })}
          </div>

          {/* 中衛エリア */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['midcourt_left', 'midcourt_center', 'midcourt_right'].map(zoneId => {
              const zone = courtZones.find(z => z.id === zoneId);
              const isSelected = selectedAreas.includes(zoneId as CourtZone);
              
              return (
                <button
                  key={zoneId}
                  onClick={() => handleAreaToggle(zoneId as CourtZone)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-theme-primary-500 bg-theme-primary-200 text-theme-primary-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs">{zone?.name}</div>
                </button>
              );
            })}
          </div>

          {/* 前衛エリア */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['frontcourt_left', 'frontcourt_center', 'frontcourt_right'].map(zoneId => {
              const zone = courtZones.find(z => z.id === zoneId);
              const isSelected = selectedAreas.includes(zoneId as CourtZone);
              
              return (
                <button
                  key={zoneId}
                  onClick={() => handleAreaToggle(zoneId as CourtZone)}
                  className={`p-2 rounded border-2 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-theme-primary-500 bg-theme-primary-200 text-theme-primary-800'
                      : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {isSelected && <FaCheck className="w-3 h-3 mx-auto mb-1" />}
                  <div className="text-xs">{zone?.name}</div>
                </button>
              );
            })}
          </div>

          {/* ネット */}
          <div className="border-t-4 border-gray-800 my-4 relative">
            <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded text-xs text-gray-600 font-semibold shadow">
              ネット
            </div>
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
                      <button
                        onClick={() => handleAreaToggle(areaId as CourtZone)}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        title="エリア削除"
                      >
                        ×
                      </button>
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
                  const newAreas = [...new Set([...selectedAreas, ...allAreas])];
                  setSelectedAreas(newAreas);
                  updateCourtInfo(newAreas, undefined, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-theme-primary-50 text-theme-primary-700 rounded hover:bg-theme-primary-100 transition-colors"
              >
                前衛エリア
              </button>
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['midcourt_left', 'midcourt_center', 'midcourt_right'];
                  const newAreas = [...new Set([...selectedAreas, ...allAreas])];
                  setSelectedAreas(newAreas);
                  updateCourtInfo(newAreas, undefined, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
              >
                中衛エリア
              </button>
              <button
                onClick={() => {
                  const allAreas: CourtZone[] = ['backcourt_left', 'backcourt_center', 'backcourt_right'];
                  const newAreas = [...new Set([...selectedAreas, ...allAreas])];
                  setSelectedAreas(newAreas);
                  updateCourtInfo(newAreas, undefined, courtType, notes);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
              >
                後衛エリア
              </button>
              <button
                onClick={() => {
                  const allAreas = getAllIndividualAreas();
                  setSelectedAreas(allAreas);
                  updateCourtInfo(allAreas, undefined, courtType, notes);
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary-500"
            style={{ color: '#000000' }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourtSelector;