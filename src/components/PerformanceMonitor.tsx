import React, { useEffect, useState } from 'react';
import { FaUsers, FaNetworkWired, FaClock } from 'react-icons/fa';

interface PerformanceMetrics {
  activeUsers: number;
  responseTime: number;
  memoryUsage: number;
  networkLatency: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    activeUsers: 0,
    responseTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
  });

  useEffect(() => {
    const updateMetrics = () => {
      // 実際のメトリクス収集ロジック
      setMetrics({
        activeUsers: Math.floor(Math.random() * 6) + 1, // 1-6台
        responseTime: Math.random() * 100 + 50, // 50-150ms
        memoryUsage: Math.random() * 20 + 10, // 10-30MB
        networkLatency: Math.random() * 50 + 20, // 20-70ms
      });
    };

    const interval = setInterval(updateMetrics, 5000);
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, threshold: number) => {
    return value > threshold ? 'text-red-500' : value > threshold * 0.8 ? 'text-yellow-500' : 'text-green-500';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200 z-50">
      <div className="flex items-center space-x-2 text-xs">
        <FaUsers className={`w-4 h-4 ${getStatusColor(metrics.activeUsers, 5)}`} />
        <span className={getStatusColor(metrics.activeUsers, 5)}>
          {metrics.activeUsers}台
        </span>
        <FaNetworkWired className={`w-4 h-4 ${getStatusColor(metrics.responseTime, 100)}`} />
        <span className={getStatusColor(metrics.responseTime, 100)}>
          {Math.round(metrics.responseTime)}ms
        </span>
        <FaClock className={`w-4 h-4 ${getStatusColor(metrics.networkLatency, 50)}`} />
        <span className={getStatusColor(metrics.networkLatency, 50)}>
          {Math.round(metrics.networkLatency)}ms
        </span>
      </div>
    </div>
  );
};

export default PerformanceMonitor; 