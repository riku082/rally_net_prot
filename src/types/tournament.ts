export interface Tournament {
  id: string;
  title: string;
  date: string;
  location: string;
  region: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  category: 'singles' | 'doubles' | 'mixed' | 'team' | 'other';
  registrationDeadline?: string;
  fee?: number;
  maxParticipants?: number;
  organizerInfo: {
    name: string;
    contact?: string;
    website?: string;
  };
  description: string;
  isOfficial: boolean;
  sourceUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TournamentFilter {
  region?: string;
  level?: Tournament['level'];
  category?: Tournament['category'];
  startDate?: string;
  endDate?: string;
}