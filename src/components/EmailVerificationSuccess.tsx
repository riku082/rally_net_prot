'use client';

import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface EmailVerificationSuccessProps {
  show: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const EmailVerificationSuccess: React.FC<EmailVerificationSuccessProps> = ({ 
  show, 
  onClose, 
  autoClose = true,
  autoCloseDelay = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsClosing(false);

      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [show, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* モーダルコンテンツ */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-300 ${
          isClosing ? 'scale-95' : 'scale-100'
        }`}
      >
        {/* 成功アイコンアニメーション */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping" />
            <div className="relative bg-green-100 rounded-full p-4">
              <FaCheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
            </div>
          </div>
        </div>

        {/* メッセージ */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            メール認証が完了しました！
          </h2>
          <p className="text-gray-600 mb-6">
            アカウントの認証が正常に完了しました。
            <br />
            すべての機能がご利用いただけるようになりました。
          </p>

          {/* 機能紹介 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              利用可能になった機能：
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <FaCheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                練習カードの作成・編集
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                試合記録の保存
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                フレンド機能
              </li>
              <li className="flex items-center">
                <FaCheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                その他すべての機能
              </li>
            </ul>
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            はじめる
          </button>

          {autoClose && (
            <p className="text-xs text-gray-500 mt-3">
              このメッセージは自動的に閉じます
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;