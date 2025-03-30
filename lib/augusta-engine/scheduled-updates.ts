/**
 * Scheduled Updates for the AUGUSTA ENGINE
 * 
 * This module provides utilities for scheduling different types of data updates
 * with appropriate frequencies based on data type and tournament status.
 */

import { TournamentStatus } from './types';

/**
 * Interface for update schedule configuration
 */
interface UpdateConfig {
  intervalMinutes: number;
  finalUpdate?: boolean;
}

/**
 * Schedule configuration for different data types
 */
export const UpdateSchedules: Record<string, Record<TournamentStatus, UpdateConfig>> = {
  /**
   * Player data (infrequent updates)
   * - Before tournament: 1/day
   * - During tournament: 1/day
   * - After tournament: none
   */
  PLAYERS: {
    [TournamentStatus.UPCOMING]: { intervalMinutes: 24 * 60 }, // 1/day
    [TournamentStatus.IN_PROGRESS]: { intervalMinutes: 24 * 60 }, // 1/day
    [TournamentStatus.COMPLETED]: { intervalMinutes: 0 }, // No updates
    [TournamentStatus.CANCELED]: { intervalMinutes: 0 }, // No updates
  },
  
  /**
   * Tournament schedule (infrequent updates)
   * - Before tournament: 1/week
   * - During tournament: 1/day
   * - After tournament: none
   */
  TOURNAMENTS: {
    [TournamentStatus.UPCOMING]: { intervalMinutes: 7 * 24 * 60 }, // 1/week
    [TournamentStatus.IN_PROGRESS]: { intervalMinutes: 24 * 60 }, // 1/day
    [TournamentStatus.COMPLETED]: { intervalMinutes: 0 }, // No updates
    [TournamentStatus.CANCELED]: { intervalMinutes: 0 }, // No updates
  },
  
  /**
   * Leaderboard data (frequent updates during tournament)
   * - Before tournament: 1/day
   * - During tournament: Every 5 minutes
   * - After tournament: 1 final update
   */
  LEADERBOARD: {
    [TournamentStatus.UPCOMING]: { intervalMinutes: 24 * 60 }, // 1/day
    [TournamentStatus.IN_PROGRESS]: { intervalMinutes: 5 }, // Every 5 min
    [TournamentStatus.COMPLETED]: { intervalMinutes: 0, finalUpdate: true }, // One final update
    [TournamentStatus.CANCELED]: { intervalMinutes: 0 }, // No updates
  },
  
  /**
   * Scorecard data (frequent updates during tournament)
   * - Before tournament: none
   * - During tournament: Every 5 minutes
   * - After tournament: 1 final update
   */
  SCORECARDS: {
    [TournamentStatus.UPCOMING]: { intervalMinutes: 0 }, // No updates
    [TournamentStatus.IN_PROGRESS]: { intervalMinutes: 5 }, // Every 5 min
    [TournamentStatus.COMPLETED]: { intervalMinutes: 0, finalUpdate: true }, // One final update
    [TournamentStatus.CANCELED]: { intervalMinutes: 0 }, // No updates
  }
};

/**
 * Execute a sync job with API call to the specified endpoint
 */
export async function executeSyncJob(endpoint: string, params: Record<string, string>) {
  const apiKey = process.env.SYNC_API_KEY;
  if (!apiKey) {
    console.error('Missing SYNC_API_KEY environment variable');
    return false;
  }
  
  const url = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/api/${endpoint}`);
  
  // Add parameters
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // Add API key
  url.searchParams.append('apiKey', apiKey);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error (${response.status}): ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log(`Sync job executed: ${endpoint}`, result.message);
    return true;
  } catch (error) {
    console.error(`Error executing sync job for ${endpoint}:`, error);
    return false;
  }
}

/**
 * Create and execute a tournament data update schedule
 */
export async function updateTournamentData(tournamentId: string, year: string, status: TournamentStatus) {
  // Get configurations based on tournament status
  const playerConfig = UpdateSchedules.PLAYERS[status];
  const tournamentConfig = UpdateSchedules.TOURNAMENTS[status];
  const leaderboardConfig = UpdateSchedules.LEADERBOARD[status];
  const scorecardConfig = UpdateSchedules.SCORECARDS[status];
  
  // Execute sync jobs based on configuration
  const results = {
    players: false,
    tournaments: false,
    leaderboard: false,
    scorecards: false,
  };
  
  // Update players if configured
  if (playerConfig.intervalMinutes > 0 || playerConfig.finalUpdate) {
    results.players = await executeSyncJob('sync-golfers', { 
      tournamentId, 
      year 
    });
  }
  
  // Update tournaments if configured
  if (tournamentConfig.intervalMinutes > 0 || tournamentConfig.finalUpdate) {
    results.tournaments = await executeSyncJob('sync-tournaments', { 
      year 
    });
  }
  
  // Update leaderboard if configured
  if (leaderboardConfig.intervalMinutes > 0 || leaderboardConfig.finalUpdate) {
    results.leaderboard = await executeSyncJob('sync-leaderboard', { 
      tournamentId, 
      year 
    });
  }
  
  // Update scorecards if configured (for future implementation)
  if (scorecardConfig.intervalMinutes > 0 || scorecardConfig.finalUpdate) {
    // This will be implemented in the future
    // results.scorecards = await executeSyncJob('sync-scorecards', { tournamentId, year });
  }
  
  return results;
} 