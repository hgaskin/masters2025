/**
 * THE AUGUSTA ENGINE
 * 
 * A unified system for golf data integration, normalization, and synchronization.
 * This module exports all components of the AUGUSTA ENGINE.
 */

// Core Service
export { GolfAPIService } from './api-service';

// API Providers
export { SlashGolfProvider } from './slashgolf-provider';
export { SportradarProvider } from './sportradar-provider';

// Data Types
export type {
  GolfAPIProvider,
  NormalizedGolfer,
  NormalizedLeaderboard,
  NormalizedLeaderboardEntry,
  NormalizedSchedule,
  NormalizedTournament
} from './types';

// Enums
export { 
  GolferStatus, 
  TournamentStatus 
} from './types';

// Scheduled Updates
export {
  UpdateSchedules,
  executeSyncJob,
  updateTournamentData
} from './scheduled-updates'; 