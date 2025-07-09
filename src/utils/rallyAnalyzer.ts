import { Shot, ShotType } from '@/types/shot';
import { Match } from '@/types/match';

export interface RallyStats {
  id: string;
  matchId: string;
  shots: Shot[];
  count: number;
  winner: string;
  startTime: number;
  endTime: number;
  duration: number;
  serveType: ShotType;
  winningShot?: ShotType;
  isWin: boolean; // 自分が勝ったか
}

export interface RallyAnalysisResult {
  averageRallyCount: number;
  maxRallyCount: number;
  minRallyCount: number;
  medianRallyCount: number;
  totalRallies: number;
  winRateByRallyCount: Map<number, { wins: number; total: number; rate: number }>;
  rallyCountDistribution: Map<number, number>;
  serveAnalysis: {
    shortServe: { avgRally: number; winRate: number; count: number };
    longServe: { avgRally: number; winRate: number; count: number };
  };
  rallyRangeAnalysis: {
    short: { range: string; winRate: number; count: number }; // 1-5打
    medium: { range: string; winRate: number; count: number }; // 6-10打
    long: { range: string; winRate: number; count: number }; // 11打以上
  };
}

export class RallyAnalyzer {
  private shots: Shot[];
  private matches: Match[];

  constructor(shots: Shot[], matches: Match[]) {
    this.shots = shots;
    this.matches = matches;
  }

  // ラリーを抽出
  private extractRallies(matchId?: string, playerId?: string): RallyStats[] {
    const targetShots = matchId 
      ? this.shots.filter(shot => shot.matchId === matchId)
      : this.shots;
    
    const matchShots = targetShots.sort((a, b) => a.timestamp - b.timestamp);
    
    const rallies: RallyStats[] = [];
    let currentRally: Shot[] = [];
    let rallyId = 0;
    
    for (const shot of matchShots) {
      // サーブでラリー開始
      if (shot.shotType === 'short_serve' || shot.shotType === 'long_serve') {
        // 前のラリーが未完了の場合は処理
        if (currentRally.length > 0) {
          rallies.push(this.createRallyStats(currentRally, rallyId++, playerId));
        }
        currentRally = [shot];
      } else {
        currentRally.push(shot);
      }
      
      // ラリー終了
      if (shot.result === 'point' || shot.result === 'miss') {
        if (currentRally.length > 0) {
          rallies.push(this.createRallyStats(currentRally, rallyId++, playerId));
          currentRally = [];
        }
      }
    }
    
    return rallies;
  }

  // ラリー統計を作成
  private createRallyStats(shots: Shot[], rallyId: number, playerId?: string): RallyStats {
    const firstShot = shots[0];
    const lastShot = shots[shots.length - 1];
    
    // 勝者を決定
    let winner = '';
    if (lastShot.result === 'point') {
      winner = lastShot.hitPlayer;
    } else if (lastShot.result === 'miss') {
      winner = lastShot.receivePlayer;
    }
    
    // 自分が勝ったかどうか
    const isWin = playerId ? winner === playerId : false;
    
    return {
      id: `rally_${rallyId}`,
      matchId: firstShot.matchId,
      shots,
      count: shots.length,
      winner,
      startTime: firstShot.timestamp,
      endTime: lastShot.timestamp,
      duration: lastShot.timestamp - firstShot.timestamp,
      serveType: firstShot.shotType,
      winningShot: lastShot.shotType,
      isWin
    };
  }

  // 包括的なラリー分析
  public analyzeRallies(matchId?: string, playerId?: string): RallyAnalysisResult {
    const rallies = this.extractRallies(matchId, playerId);
    
    if (rallies.length === 0) {
      return this.getEmptyAnalysisResult();
    }
    
    // 基本統計
    const rallyCounts = rallies.map(rally => rally.count);
    const averageRallyCount = rallyCounts.reduce((sum, count) => sum + count, 0) / rallyCounts.length;
    const maxRallyCount = Math.max(...rallyCounts);
    const minRallyCount = Math.min(...rallyCounts);
    const medianRallyCount = this.calculateMedian(rallyCounts);
    
    // ラリー数別勝率
    const winRateByRallyCount = this.calculateWinRateByRallyCount(rallies, playerId);
    
    // ラリー数分布
    const rallyCountDistribution = this.calculateRallyCountDistribution(rallies);
    
    // サーブ分析
    const serveAnalysis = this.analyzeServeTypes(rallies, playerId);
    
    // ラリー範囲分析
    const rallyRangeAnalysis = this.analyzeRallyRanges(rallies, playerId);
    
    return {
      averageRallyCount,
      maxRallyCount,
      minRallyCount,
      medianRallyCount,
      totalRallies: rallies.length,
      winRateByRallyCount,
      rallyCountDistribution,
      serveAnalysis,
      rallyRangeAnalysis
    };
  }

  // ラリー数別勝率計算
  private calculateWinRateByRallyCount(rallies: RallyStats[], playerId?: string): Map<number, { wins: number; total: number; rate: number }> {
    const stats = new Map<number, { wins: number; total: number; rate: number }>();
    
    rallies.forEach(rally => {
      const count = rally.count;
      const isWin = playerId ? rally.winner === playerId : false;
      
      if (!stats.has(count)) {
        stats.set(count, { wins: 0, total: 0, rate: 0 });
      }
      
      const stat = stats.get(count)!;
      stat.total++;
      if (isWin) stat.wins++;
      stat.rate = stat.wins / stat.total;
    });
    
    return stats;
  }

  // ラリー数分布計算
  private calculateRallyCountDistribution(rallies: RallyStats[]): Map<number, number> {
    const distribution = new Map<number, number>();
    
    rallies.forEach(rally => {
      const count = rally.count;
      distribution.set(count, (distribution.get(count) || 0) + 1);
    });
    
    return distribution;
  }

  // サーブタイプ別分析
  private analyzeServeTypes(rallies: RallyStats[], playerId?: string) {
    const shortServeRallies = rallies.filter(rally => rally.serveType === 'short_serve');
    const longServeRallies = rallies.filter(rally => rally.serveType === 'long_serve');
    
    const analyzeServeType = (rallies: RallyStats[]) => {
      if (rallies.length === 0) return { avgRally: 0, winRate: 0, count: 0 };
      
      const avgRally = rallies.reduce((sum, rally) => sum + rally.count, 0) / rallies.length;
      const wins = playerId ? rallies.filter(rally => rally.winner === playerId).length : 0;
      const winRate = rallies.length > 0 ? wins / rallies.length : 0;
      
      return {
        avgRally,
        winRate,
        count: rallies.length
      };
    };
    
    return {
      shortServe: analyzeServeType(shortServeRallies),
      longServe: analyzeServeType(longServeRallies)
    };
  }

  // ラリー範囲別分析
  private analyzeRallyRanges(rallies: RallyStats[], playerId?: string) {
    const shortRallies = rallies.filter(rally => rally.count <= 5);
    const mediumRallies = rallies.filter(rally => rally.count >= 6 && rally.count <= 10);
    const longRallies = rallies.filter(rally => rally.count >= 11);
    
    const analyzeRange = (rallies: RallyStats[], range: string) => {
      if (rallies.length === 0) return { range, winRate: 0, count: 0 };
      
      const wins = playerId ? rallies.filter(rally => rally.winner === playerId).length : 0;
      const winRate = rallies.length > 0 ? wins / rallies.length : 0;
      
      return {
        range,
        winRate,
        count: rallies.length
      };
    };
    
    return {
      short: analyzeRange(shortRallies, '1-5打'),
      medium: analyzeRange(mediumRallies, '6-10打'),
      long: analyzeRange(longRallies, '11打以上')
    };
  }

  // 中央値計算
  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  // 空の分析結果
  private getEmptyAnalysisResult(): RallyAnalysisResult {
    return {
      averageRallyCount: 0,
      maxRallyCount: 0,
      minRallyCount: 0,
      medianRallyCount: 0,
      totalRallies: 0,
      winRateByRallyCount: new Map(),
      rallyCountDistribution: new Map(),
      serveAnalysis: {
        shortServe: { avgRally: 0, winRate: 0, count: 0 },
        longServe: { avgRally: 0, winRate: 0, count: 0 }
      },
      rallyRangeAnalysis: {
        short: { range: '1-5打', winRate: 0, count: 0 },
        medium: { range: '6-10打', winRate: 0, count: 0 },
        long: { range: '11打以上', winRate: 0, count: 0 }
      }
    };
  }
}