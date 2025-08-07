'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface ShotMemoProps {
  shotId: string;
  memo?: string;
  onUpdateMemo: (shotId: string, memo: string) => void;
}

const ShotMemo: React.FC<ShotMemoProps> = ({ shotId, memo, onUpdateMemo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [memoText, setMemoText] = useState(memo || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onUpdateMemo(shotId, memoText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setMemoText(memo || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // すべてのイベントハンドラでイベントの伝播を停止
  const stopPropagation = (e: React.MouseEvent | React.FocusEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  if (isEditing) {
    return (
      <div 
        className="flex gap-1 mt-2" 
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        onMouseUp={stopPropagation}
      >
        <input
          ref={inputRef}
          type="text"
          value={memoText}
          onChange={(e) => {
            e.stopPropagation();
            setMemoText(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onClick={stopPropagation}
          onFocus={stopPropagation}
          onBlur={(e) => {
            e.stopPropagation();
            // フォーカスが外れてもボタンクリックの場合は保存/キャンセルが実行されるようにする
            setTimeout(() => {
              if (document.activeElement?.closest('.memo-button')) {
                return;
              }
              handleCancel();
            }, 100);
          }}
          className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="メモを入力..."
        />
        <button
          onClick={(e) => {
            stopPropagation(e);
            handleSave();
          }}
          onMouseDown={stopPropagation}
          className="memo-button text-green-600 hover:text-green-800 p-1"
        >
          <FaCheck className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            stopPropagation(e);
            handleCancel();
          }}
          onMouseDown={stopPropagation}
          className="memo-button text-red-600 hover:text-red-800 p-1"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1 mt-2">
      {memo && (
        <div className="flex-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {memo}
        </div>
      )}
      <button
        onClick={(e) => {
          stopPropagation(e);
          setIsEditing(true);
        }}
        onMouseDown={stopPropagation}
        className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
        title={memo ? "メモを編集" : "メモを追加"}
      >
        <FiEdit2 className="w-3 h-3" />
      </button>
    </div>
  );
};

export default ShotMemo;