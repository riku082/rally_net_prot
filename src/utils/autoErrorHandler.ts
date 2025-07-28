// 自動エラー処理ユーティリティ
import { DevServerMonitor } from './devServerMonitor';

interface ErrorDiagnosis {
  type: 'NETWORK_ERROR' | 'FIREBASE_PERMISSION' | 'TIMEOUT' | 'VALIDATION_ERROR' | 'SERVER_DOWN' | 'UNKNOWN';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestions: string[];
  autoFixable: boolean;
  quickFix?: () => Promise<boolean>;
}

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  context: string;
  message: string;
  data?: any;
  userAgent?: string;
}

export class AutoErrorHandler {
  private static logs: LogEntry[] = [];
  
  // 構造化ログ
  static log(level: LogEntry['level'], context: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    };
    
    this.logs.push(entry);
    
    // 開発環境でのコンソール出力
    if (process.env.NODE_ENV === 'development') {
      const emoji = level === 'ERROR' ? '🚨' : level === 'WARN' ? '⚠️' : '🔍';
      console.log(`${emoji} [${level}] ${context}: ${message}`, data || '');
    }
    
    // ローカルストレージに保存（開発環境のみ）
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const saved = JSON.parse(localStorage.getItem('dev_logs') || '[]');
      saved.push(entry);
      // 最新100件のみ保持
      if (saved.length > 100) saved.splice(0, saved.length - 100);
      localStorage.setItem('dev_logs', JSON.stringify(saved));
    }
  }
  
  // エラー診断
  static diagnoseError(error: any, context?: string): ErrorDiagnosis {
    const errorMessage = error?.message || error?.toString() || '';
    const errorCode = error?.code || '';
    
    // 開発サーバーの状態確認
    const serverStatus = DevServerMonitor.checkServerStatus();
    if (!serverStatus.isRunning && context?.includes('api/')) {
      return {
        type: 'SERVER_DOWN',
        severity: 'CRITICAL',
        suggestions: [
          '開発サーバーが停止しています',
          'npm run dev を実行してサーバーを起動してください',
          'ポート3000が他のプロセスで使用されていないか確認してください'
        ],
        autoFixable: false
      };
    }
    
    // Firebase権限エラー
    if (errorMessage.includes('Missing or insufficient permissions') || 
        errorCode.includes('permission-denied')) {
      return {
        type: 'FIREBASE_PERMISSION',
        severity: 'HIGH',
        suggestions: [
          'Firebaseセキュリティルールを確認してください',
          'ユーザーの認証状態を確認してください',
          'データの所有権を確認してください'
        ],
        autoFixable: false
      };
    }
    
    // ネットワークエラー
    if (errorMessage.includes('fetch') || errorMessage.includes('network') ||
        errorCode.includes('network') || errorMessage.includes('Failed to fetch')) {
      return {
        type: 'NETWORK_ERROR',
        severity: 'MEDIUM',
        suggestions: [
          'インターネット接続を確認してください',
          '数秒後に再試行してください',
          'APIエンドポイントのURLを確認してください'
        ],
        autoFixable: true,
        quickFix: async () => {
          // 3秒待ってから再試行を推奨
          await new Promise(resolve => setTimeout(resolve, 3000));
          return false; // 実際の修復は呼び出し元で行う
        }
      };
    }
    
    // タイムアウトエラー
    if (errorMessage.includes('timeout') || errorCode.includes('timeout')) {
      return {
        type: 'TIMEOUT',
        severity: 'MEDIUM',
        suggestions: [
          'タイムアウト時間を延長してください',
          'より小さなデータサイズで試行してください',
          'サーバーの負荷状況を確認してください'
        ],
        autoFixable: true
      };
    }
    
    return {
      type: 'UNKNOWN',
      severity: 'MEDIUM',
      suggestions: ['エラーログの詳細を確認してください'],
      autoFixable: false
    };
  }
  
  // 自動修復試行
  static async attemptAutoFix(error: any, context: string): Promise<{
    fixed: boolean;
    suggestion: string;
    retryRecommended: boolean;
  }> {
    const diagnosis = this.diagnoseError(error, context);
    
    this.log('INFO', 'AutoFix', `エラー診断: ${diagnosis.type}`, diagnosis);
    
    switch (diagnosis.type) {
      case 'SERVER_DOWN':
        this.log('ERROR', 'AutoFix', '開発サーバーが停止中 - 手動での再起動が必要');
        return {
          fixed: false,
          suggestion: 'npm run dev を実行して開発サーバーを再起動してください',
          retryRecommended: false
        };
        
      case 'NETWORK_ERROR':
        this.log('INFO', 'AutoFix', 'ネットワークエラー - 3秒後に自動再試行を推奨');
        if (diagnosis.quickFix) {
          await diagnosis.quickFix();
        }
        return {
          fixed: false,
          suggestion: '3秒後に自動再試行します',
          retryRecommended: true
        };
        
      case 'FIREBASE_PERMISSION':
        this.log('WARN', 'AutoFix', 'Firebase権限エラー - セキュリティルールの確認が必要');
        return {
          fixed: false,
          suggestion: 'Firebaseセキュリティルールを確認してください',
          retryRecommended: false
        };
        
      default:
        return {
          fixed: false,
          suggestion: '手動での確認が必要です',
          retryRecommended: false
        };
    }
  }
  
  // エラー監視の開始
  static startErrorMonitoring() {
    this.log('INFO', 'Monitor', '自動エラー監視を開始しました');
    DevServerMonitor.startMonitoring(10000); // 10秒間隔で監視
  }
  
  // エラー監視の停止
  static stopErrorMonitoring() {
    this.log('INFO', 'Monitor', '自動エラー監視を停止しました');
    DevServerMonitor.stopMonitoring();
  }
  
  // システム全体の健全性チェック
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    suggestions: string[];
  }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // サーバー状態チェック
    const serverStatus = DevServerMonitor.checkServerStatus();
    if (!serverStatus.isRunning) {
      issues.push('開発サーバーが停止しています');
      suggestions.push('npm run dev を実行してサーバーを起動してください');
    }
    
    // エラーログの集計
    const errorLogs = this.logs.filter(log => log.level === 'ERROR');
    const recentErrors = errorLogs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      return logTime > fiveMinutesAgo;
    });
    
    if (recentErrors.length > 5) {
      issues.push(`過去5分間に${recentErrors.length}件のエラーが発生`);
      suggestions.push('エラーログを確認し、根本原因を調査してください');
    }
    
    // 状態判定
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = issues.some(issue => issue.includes('停止')) ? 'critical' : 'warning';
    }
    
    return { status, issues, suggestions };
  }
  
  // 開発ログの取得
  static getDevLogs(): LogEntry[] {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('dev_logs') || '[]');
    }
    return this.logs;
  }
  
  // ログのクリア
  static clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dev_logs');
    }
  }
}

// グローバルエラーハンドラー
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    AutoErrorHandler.log('ERROR', 'Global', 'Uncaught error', {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    AutoErrorHandler.log('ERROR', 'Global', 'Unhandled promise rejection', {
      reason: event.reason
    });
  });
}