'use client';

import React, { useState, useEffect } from 'react';

interface AnimatedProgressBarProps {
  value: number;
  maxValue: number;
  label: string;
  color?: string;
  height?: string;
  duration?: number;
  delay?: number;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  maxValue,
  label,
  color = 'bg-blue-500',
  height = 'h-4',
  duration = 1000,
  delay = 0
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      animateValue();
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const animateValue = () => {
    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // イージング関数（ease-out）
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setAnimatedValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const percentage = (animatedValue / maxValue) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          {Math.round(animatedValue)}/{maxValue}
        </span>
      </div>
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-1000 ease-out flex items-center justify-center relative`}
          style={{ 
            width: `${percentage}%`,
            transform: isVisible ? 'translateX(0)' : 'translateX(-100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedProgressBar;