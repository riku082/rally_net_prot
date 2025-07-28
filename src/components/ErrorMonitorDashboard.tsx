'use client';

import React, { useState, useEffect } from 'react';
import { AutoErrorHandler } from '@/utils/autoErrorHandler';
import { DevServerMonitor } from '@/utils/devServerMonitor';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  suggestions: string[];
}

export function ErrorMonitorDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [health, setHealth] = useState<HealthStatus>({ status: 'healthy', issues: [], suggestions: [] });
  const [logs, setLogs] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // 開発環境でのみ表示
    if (process.env.NODE_ENV === 'development') {
      // Ctrl+Shift+E でダッシュボードを表示/非表示
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
          setIsVisible(!isVisible);
          if (!isVisible) {
            refreshHealthCheck();
            refreshLogs();
          }
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isVisible]);

  const refreshHealthCheck = async () => {
    try {
      const healthStatus = await AutoErrorHandler.performHealthCheck();
      setHealth(healthStatus);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const refreshLogs = () => {
    const logs = AutoErrorHandler.getDevLogs();
    setLogs(logs.slice(-20)); // 最新20件のみ表示
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      AutoErrorHandler.stopErrorMonitoring();
    } else {
      AutoErrorHandler.startErrorMonitoring();
    }
    setIsMonitoring(!isMonitoring);
  };

  const clearLogs = () => {
    AutoErrorHandler.clearLogs();
    setLogs([]);
  };

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600';
      case 'WARN': return 'text-yellow-600';
      case 'INFO': return 'text-blue-600';
      case 'DEBUG': return 'text-gray-600';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 w-96 bg-white shadow-lg border rounded-lg z-50 max-h-96 overflow-hidden">
      <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">🔧 エラー監視ダッシュボード</span>
          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(health.status)}`}>
            {health.status.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-white text-lg"
        >
          ×
        </button>
      </div>

      <div className="p-4 max-h-80 overflow-y-auto">
        {/* 操作ボタン */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={toggleMonitoring}
            className={`px-3 py-1 rounded text-xs ${
              isMonitoring 
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isMonitoring ? '監視停止' : '監視開始'}
          </button>
          <button
            onClick={refreshHealthCheck}
            className="px-3 py-1 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            ヘルスチェック
          </button>
          <button
            onClick={refreshLogs}
            className="px-3 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            ログ更新
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
          >
            ログクリア
          </button>
        </div>

        {/* ヘルス状態 */}
        {health.issues.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">🚨 検出された問題</h3>
            <div className="space-y-1">
              {health.issues.map((issue, index) => (
                <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                  {issue}
                </div>
              ))}
            </div>
            {health.suggestions.length > 0 && (
              <div className="mt-2">
                <h4 className="text-xs font-medium text-gray-700 mb-1">💡 推奨対処法</h4>
                <div className="space-y-1">
                  {health.suggestions.map((suggestion, index) => (
                    <div key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ログ表示 */}
        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-2">📋 最新ログ</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-xs text-gray-500">ログはありません</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs border-l-2 border-gray-200 pl-2 py-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${getLogLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-gray-600 font-medium">
                      [{log.context}]
                    </span>
                  </div>
                  <div className="text-gray-800 mt-1">
                    {log.message}
                  </div>
                  {log.data && (
                    <div className="text-gray-500 mt-1 font-mono text-xs bg-gray-50 p-1 rounded">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 使用方法 */}
        <div className="mt-4 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <span className="font-medium">使用方法:</span> Ctrl+Shift+E でダッシュボード表示/非表示
          </div>
        </div>
      </div>
    </div>
  );
}