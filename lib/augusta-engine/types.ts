/**
 * Common interfaces and types for golf data providers
 * This abstraction layer allows swapping between different API providers
 */

// Normalized Golf Data Types
export interface NormalizedGolfer {
  id: string;
  name: string;
  rank?: number;
  country?: string;
  countryCode?: string;
  avatarUrl?: string;
  odds?: string;
  status?: GolferStatus;
  externalId?: string;
  externalSystem?: string;
}

export interface NormalizedTournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  course: string;
  location: string;
  purse?: string;
  status: TournamentStatus;
  currentRound?: number;
  externalId?: string;
  externalSystem?: string;
}

export interface NormalizedLeaderboard {
  tournamentId: string;
  roundId?: number;
  lastUpdated: string;
  cutLine?: number;
  status: TournamentStatus;
  players: NormalizedLeaderboardEntry[];
}

export interface NormalizedLeaderboardEntry {
  golferId: string;
  position: number;
  score: number;
  round1?: number;
  round2?: number;
  round3?: number;
  round4?: number;
  thru?: number;
  today?: number;
  status: GolferStatus;
}

export interface NormalizedSchedule {
  tournaments: NormalizedTournament[];
  season: string;
}

// Enums
export enum GolferStatus {
  ACTIVE = 'active',
  CUT = 'cut',
  WITHDRAWN = 'wd',
  DISQUALIFIED = 'dq'
}

export enum TournamentStatus {
  UPCOMING = 'upcoming',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

// Golf API Provider Interface
export interface GolfAPIProvider {
  // Metadata
  name: string;
  isHealthy: boolean;
  
  // Tournament Methods
  getTournamentSchedule(year: string): Promise<NormalizedSchedule>;
  getTournamentDetails(tournamentId: string, year: string): Promise<NormalizedTournament>;
  
  // Golfer Methods
  getGolferList(tournamentId: string, year: string): Promise<NormalizedGolfer[]>;
  getGolferDetails(golferId: string): Promise<NormalizedGolfer>;
  
  // Leaderboard Methods  
  getLeaderboard(tournamentId: string, year: string, round?: number): Promise<NormalizedLeaderboard>;
  
  // Health Check
  checkHealth(): Promise<boolean>;
} 