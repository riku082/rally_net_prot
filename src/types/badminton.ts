export type ShotType = 'clear' | 'drop' | 'smash' | 'drive' | 'net' | 'lob';

export interface Shot {
  id: string;
  type: ShotType;
  from: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
  timestamp: number;
}

export interface Rally {
  id: string;
  shots: Shot[];
  startTime: number;
  endTime: number;
}

export interface AnalysisData {
  totalRallies: number;
  shotDistribution: Record<ShotType, number>;
  averageRallyLength: number;
  commonPatterns: string[];
} 