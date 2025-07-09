'use client';

import React from 'react';
import { MBTIType } from '@/types/mbti';

interface MBTIAvatarProps {
  type: MBTIType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const MBTIAvatar: React.FC<MBTIAvatarProps> = ({ type, size = 'md', animated = true }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl'
  };

  // タイプ別の色とグラデーション
  const typeStyles = {
    'ESTJ': 'bg-gradient-to-br from-red-500 to-red-600',
    'ESTP': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'ESFJ': 'bg-gradient-to-br from-green-500 to-green-600',
    'ESFP': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    'ENTJ': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'ENTP': 'bg-gradient-to-br from-pink-500 to-pink-600',
    'ENFJ': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'ENFP': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    'ISTJ': 'bg-gradient-to-br from-gray-600 to-gray-700',
    'ISTP': 'bg-gradient-to-br from-slate-600 to-slate-700',
    'ISFJ': 'bg-gradient-to-br from-emerald-600 to-emerald-700',
    'ISFP': 'bg-gradient-to-br from-teal-600 to-teal-700',
    'INTJ': 'bg-gradient-to-br from-violet-600 to-violet-700',
    'INTP': 'bg-gradient-to-br from-cyan-600 to-cyan-700',
    'INFJ': 'bg-gradient-to-br from-sky-600 to-sky-700',
    'INFP': 'bg-gradient-to-br from-rose-600 to-rose-700'
  };

  // タイプ別のシンボル
  const typeSymbols = {
    'ESTJ': '👑', // キャプテン
    'ESTP': '⚡', // アクション
    'ESFJ': '🤝', // サポート
    'ESFP': '🎭', // エンターテイナー
    'ENTJ': '🏆', // 指揮官
    'ENTP': '💡', // 革新者
    'ENFJ': '🌟', // インスパイア
    'ENFP': '🎨', // 創造者
    'ISTJ': '🛡️', // 職人
    'ISTP': '🔧', // 技術者
    'ISFJ': '💚', // 守護者
    'ISFP': '🌸', // アーティスト
    'INTJ': '🎯', // 戦略家
    'INTP': '🔬', // 理論家
    'INFJ': '🔮', // 洞察者
    'INFP': '🌈'  // 理想主義者
  };

  const baseClasses = `
    ${sizeClasses[size]} 
    ${typeStyles[type]} 
    rounded-full 
    flex 
    items-center 
    justify-center 
    text-white 
    font-bold 
    shadow-lg 
    relative 
    overflow-hidden
    ${animated ? 'hover:scale-110 transition-transform duration-300' : ''}
  `;

  return (
    <div className={baseClasses}>
      {/* 背景のアニメーション効果 */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
      )}
      
      {/* タイプ文字 */}
      <div className="relative z-10 flex flex-col items-center">
        <div className={`${textSizeClasses[size]} font-bold mb-1`}>
          {type}
        </div>
        {size !== 'sm' && (
          <div className="text-xl">
            {typeSymbols[type]}
          </div>
        )}
      </div>
      
      {/* 光る効果 */}
      {animated && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 animate-pulse"></div>
      )}
    </div>
  );
};

export default MBTIAvatar;