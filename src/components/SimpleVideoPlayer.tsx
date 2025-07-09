'use client';

import React from 'react';
import { FiX } from 'react-icons/fi';

interface SimpleVideoPlayerProps {
  videoId: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({ 
  videoId, 
  title, 
  onClose,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
          <h3 className="font-medium text-gray-800 truncate">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <FiX className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      )}
      <div className="relative aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0`}
          title={title || 'YouTube video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default SimpleVideoPlayer;