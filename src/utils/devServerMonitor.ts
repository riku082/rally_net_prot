// 開発サーバー監視ユーティリティ
import { execSync } from 'child_process';

interface ServerStatus {
  isRunning: boolean;
  processId?: number;
  port?: number;
  uptime?: number;
}

interface ServerLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

export class DevServerMonitor {
  private static logs: ServerLog[] = [];
  private static isMonitoring = false;
  private static monitorInterval?: NodeJS.Timeout;

  // Next.js開発サーバーの状態を確認
  static checkServerStatus(): ServerStatus {
    try {
      // Next.jsサーバープロセスを探す
      const output = execSync('ps -ef | grep "next-server" | grep -v grep', { 
        encoding: 'utf8',
        timeout: 5000 
      });
      
      if (output.trim()) {
        const lines = output.trim().split('\n');
        const serverLine = lines.find(line => line.includes('next-server'));
        
        if (serverLine) {
          const parts = serverLine.trim().split(/\s+/);
          const pid = parseInt(parts[1]);
          
          return {
            isRunning: true,
            processId: pid,
            port: 3000, // デフォルトポート
            uptime: this.getProcessUptime(pid)
          };
        }
      }
      
      return { isRunning: false };
    } catch (error) {
      console.warn('Failed to check server status:', error);
      return { isRunning: false };
    }
  }

  // プロセスの稼働時間を取得（macOS対応）
  private static getProcessUptime(pid: number): number {
    try {
      const output = execSync(`ps -o etime= -p ${pid}`, { 
        encoding: 'utf8',
        timeout: 2000 
      });
      
      // "MM:SS" or "HH:MM:SS" or "DD-HH:MM:SS" 形式をパース
      const etimeStr = output.trim();
      const parts = etimeStr.split(/[-:]/);
      
      let seconds = 0;
      if (parts.length === 2) { // MM:SS
        seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      } else if (parts.length === 3) { // HH:MM:SS
        seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      } else if (parts.length === 4) { // DD-HH:MM:SS
        seconds = parseInt(parts[0]) * 86400 + parseInt(parts[1]) * 3600 + 
                 parseInt(parts[2]) * 60 + parseInt(parts[3]);
      }
      
      return seconds;
    } catch (error) {
      return 0;
    }
  }

  // サーバーログの監視開始
  static startMonitoring(intervalMs: number = 5000) {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.log('info', 'Monitoring started');

    this.monitorInterval = setInterval(() => {
      const status = this.checkServerStatus();
      
      if (!status.isRunning) {
        this.log('error', 'Next.js server is not running', status);
      } else {
        this.log('info', `Server running (PID: ${status.processId}, uptime: ${status.uptime}s)`);
      }
    }, intervalMs);
  }

  // 監視停止
  static stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }
    this.isMonitoring = false;
    this.log('info', 'Monitoring stopped');
  }

  // ログ記録
  private static log(level: ServerLog['level'], message: string, details?: any) {
    const entry: ServerLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };

    this.logs.push(entry);

    // 開発環境でのコンソール出力
    if (process.env.NODE_ENV === 'development') {
      const emoji = level === 'error' ? '🚨' : level === 'warn' ? '⚠️' : '🔍';
      console.log(`${emoji} [DevMonitor] ${message}`, details || '');
    }

    // 最新100件のみ保持
    if (this.logs.length > 100) {
      this.logs.splice(0, this.logs.length - 100);
    }
  }

  // Next.jsコンソールログの監視（限定的）
  static captureConsoleOutput(): string[] {
    try {
      // Next.jsプロセスの標準出力を監視するのは技術的に困難
      // 代替として、ログファイルやAPIエラーレスポンスを監視
      
      // .next/trace ファイルや npm ログを確認
      const npmLogs = this.checkNpmLogs();
      return npmLogs;
    } catch (error) {
      this.log('error', 'Failed to capture console output', error);
      return [];
    }
  }

  // NPMログファイルの確認
  private static checkNpmLogs(): string[] {
    try {
      const logDir = process.env.HOME + '/.npm/_logs';
      const output = execSync(`ls -t ${logDir}/*.log | head -1`, { 
        encoding: 'utf8',
        timeout: 2000 
      });
      
      const latestLog = output.trim();
      if (latestLog) {
        const logContent = execSync(`tail -20 "${latestLog}"`, { 
          encoding: 'utf8',
          timeout: 2000 
        });
        return logContent.split('\n').filter(line => line.trim());
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }

  // ログ取得
  static getLogs(): ServerLog[] {
    return [...this.logs];
  }

  // ログクリア
  static clearLogs() {
    this.logs = [];
  }

  // 開発環境でのエラー監視
  static monitorForErrors() {
    const status = this.checkServerStatus();
    if (!status.isRunning) {
      return {
        hasErrors: true,
        error: 'Development server is not running',
        suggestion: 'Run "npm run dev" to start the development server'
      };
    }

    // その他のエラーチェック（ポート使用状況など）
    return {
      hasErrors: false,
      status: 'Server is running normally'
    };
  }
}