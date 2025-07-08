export interface Player {
  id: string;
  name: string;
}

export interface Shot {
  id: string;
  hitPlayer: string;
  hitArea: string;
  timestamp: number;
} 