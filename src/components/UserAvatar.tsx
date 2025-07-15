'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaUserCircle } from 'react-icons/fa';

interface UserAvatarProps {
  avatar?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  avatar, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-16 sm:h-16',
    xl: 'w-16 h-16 sm:w-20 sm:h-20'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4 sm:w-6 sm:h-6',
    lg: 'w-6 h-6 sm:w-8 sm:h-8',
    xl: 'w-8 h-8 sm:w-10 sm:h-10'
  };

  const imageSizes = {
    sm: 24,
    md: 40,
    lg: 64,
    xl: 80
  };

  // 画像エラーハンドリング
  const handleImageError = () => {
    setImageError(true);
  };

  // アバター画像がある場合（かつエラーでない）
  if (avatar && !imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ${className}`}>
        <Image
          src={avatar}
          alt={`${name}のプロフィール画像`}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="w-full h-full object-cover"
          onError={handleImageError}
          unoptimized={avatar.includes('firebasestorage.googleapis.com')}
        />
      </div>
    );
  }

  // デフォルトアバター（グラデーション + アイコン）
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 ${className}`}>
      <FaUserCircle className={`${iconSizes[size]} text-white`} />
    </div>
  );
};

export default UserAvatar;