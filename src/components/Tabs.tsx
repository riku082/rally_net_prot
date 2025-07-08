"use client";

import React from 'react';

interface TabsProps {
  activeTab: 'players' | 'matches' | 'shots' | 'analysis' | 'management' | 'backup';
  onTabChange: (tab: 'players' | 'matches' | 'shots' | 'analysis' | 'management' | 'backup') => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          onClick={() => onTabChange('players')}
          className={`${
            activeTab === 'players'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          選手
        </button>
        <button
          onClick={() => onTabChange('matches')}
          className={`${
            activeTab === 'matches'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          試合
        </button>
        <button
          onClick={() => onTabChange('shots')}
          className={`${
            activeTab === 'shots'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          配球
        </button>
        <button
          onClick={() => onTabChange('analysis')}
          className={`${
            activeTab === 'analysis'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          分析
        </button>
        <button
          onClick={() => onTabChange('management')}
          className={`${
            activeTab === 'management'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          管理
        </button>
        <button
          onClick={() => onTabChange('backup')}
          className={`${
            activeTab === 'backup'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          バックアップ
        </button>
      </nav>
    </div>
  );
};

export default Tabs; 