'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { sendVerificationEmail, checkEmailVerification } from '@/utils/auth';
import { FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (user) {
      setIsVerified(user.emailVerified);
    }
  }, [user]);

  const handleSendVerification = async () => {
    if (!user) return;

    setIsSending(true);
    setMessage('');

    const result = await sendVerificationEmail(user);
    
    if (result.error) {
      setMessage(result.error);
      setMessageType('error');
    } else {
      setMessage('認証メールを送信しました。メールボックスをご確認ください。');
      setMessageType('success');
    }

    setIsSending(false);
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setMessage('');

    const result = await checkEmailVerification();
    
    if (result.error) {
      setMessage(result.error);
      setMessageType('error');
    } else if (result.verified) {
      setIsVerified(true);
      setMessage('メールアドレスの認証が完了しました！');
      setMessageType('success');
    } else {
      setMessage('メールアドレスがまだ認証されていません。メールボックスをご確認ください。');
      setMessageType('info');
    }

    setIsChecking(false);
  };

  // 認証済みまたはユーザーが存在しない場合は非表示
  if (!user || isVerified) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            メールアドレスの認証が必要です
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            アカウントの安全性を確保するため、メールアドレスの認証を行ってください。
            一部の機能は認証完了後に利用できるようになります。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSendVerification}
              disabled={isSending}
              className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSending ? (
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FaEnvelope className="w-4 h-4 mr-2" />
              )}
              {isSending ? '送信中...' : '認証メールを送信'}
            </button>
            
            <button
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isChecking ? (
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FaCheckCircle className="w-4 h-4 mr-2" />
              )}
              {isChecking ? '確認中...' : '認証状況を確認'}
            </button>
          </div>

          {message && (
            <div className={`mt-3 p-2 rounded text-sm ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-800' 
                : messageType === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;