/**
 * Augusta Engine API Service
 * 
 * This service manages the available golf data providers and implements
 * fallback logic between them. It presents a unified interface to the application.
 */

import { SlashGolfProvider } from './slashgolf-provider';
import { SportradarProvider } from './sportradar-provider';
import { 
  GolfAPIProvider,
  NormalizedGolfer, 
  NormalizedLeaderboard, 
  NormalizedSchedule, 
  NormalizedTournament 
} from './types';

export class GolfAPIService {
  private providers: GolfAPIProvider[] = [];
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes default
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  
  /**
   * Initialize the Augusta Engine API Service with available providers
   */
  constructor(options?: { cacheTTL?: number }) {
    // Set cache TTL if provided
    if (options?.cacheTTL) {
      this.cacheTTL = options.cacheTTL;
    }
    
    // Initialize providers - add more as needed
    if (process.env.SLASHGOLF_API_KEY) {
      this.providers.push(new SlashGolfProvider(process.env.SLASHGOLF_API_KEY));
    }
    
    // Add Sportradar provider when available
    if (process.env.SPORTRADAR_API_KEY) {
      this.providers.push(new SportradarProvider(process.env.SPORTRADAR_API_KEY));
    }
    
    // Check if we have any providers
    if (this.providers.length === 0) {
      console.warn('Augusta Engine: No providers configured. Check environment variables.');
    }
  }
  
  /**
   * Get tournament schedule for a specific year
   * with provider fallback
   */
  async getTournamentSchedule(year: string): Promise<NormalizedSchedule> {
    const cacheKey = `schedule_${year}`;
    
    // Check cache first
    const cachedData = this.getFromCache<NormalizedSchedule>(cacheKey);
    if (cachedData) return cachedData;
    
    // Try each provider in order
    for (const provider of this.providers) {
      try {
        if (provider.isHealthy) {
          const data = await provider.getTournamentSchedule(year);
          this.saveToCache(cacheKey, data);
          return data;
        }
      } catch (error) {
        console.error(`Error getting tournament schedule from ${provider.name}:`, error);
        provider.isHealthy = false;
      }
    }
    
    throw new Error('Augusta Engine: Unable to get tournament schedule from any provider');
  }
  
  /**
   * Get details for a specific tournament
   * with provider fallback
   */
  async getTournamentDetails(tournamentId: string, year: string): Promise<NormalizedTournament> {
    const cacheKey = `tournament_${tournamentId}_${year}`;
    
    // Check cache first
    const cachedData = this.getFromCache<NormalizedTournament>(cacheKey);
    if (cachedData) return cachedData;
    
    // Try each provider in order
    for (const provider of this.providers) {
      try {
        if (provider.isHealthy) {
          const data = await provider.getTournamentDetails(tournamentId, year);
          this.saveToCache(cacheKey, data);
          return data;
        }
      } catch (error) {
        console.error(`Error getting tournament details from ${provider.name}:`, error);
        provider.isHealthy = false;
      }
    }
    
    throw new Error('Augusta Engine: Unable to get tournament details from any provider');
  }
  
  /**
   * Get list of golfers for a tournament
   * with provider fallback
   */
  async getGolferList(tournamentId: string, year: string): Promise<NormalizedGolfer[]> {
    const cacheKey = `golfers_${tournamentId}_${year}`;
    
    // Check cache first
    const cachedData = this.getFromCache<NormalizedGolfer[]>(cacheKey);
    if (cachedData) return cachedData;
    
    // Try each provider in order
    for (const provider of this.providers) {
      try {
        if (provider.isHealthy) {
          const data = await provider.getGolferList(tournamentId, year);
          this.saveToCache(cacheKey, data);
          return data;
        }
      } catch (error) {
        console.error(`Error getting golfer list from ${provider.name}:`, error);
        provider.isHealthy = false;
      }
    }
    
    throw new Error('Augusta Engine: Unable to get golfer list from any provider');
  }
  
  /**
   * Get details for a specific golfer
   * with provider fallback
   */
  async getGolferDetails(golferId: string): Promise<NormalizedGolfer> {
    const cacheKey = `golfer_${golferId}`;
    
    // Check cache first
    const cachedData = this.getFromCache<NormalizedGolfer>(cacheKey);
    if (cachedData) return cachedData;
    
    // Try each provider in order
    for (const provider of this.providers) {
      try {
        if (provider.isHealthy) {
          const data = await provider.getGolferDetails(golferId);
          this.saveToCache(cacheKey, data);
          return data;
        }
      } catch (error) {
        console.error(`Error getting golfer details from ${provider.name}:`, error);
        provider.isHealthy = false;
      }
    }
    
    throw new Error('Augusta Engine: Unable to get golfer details from any provider');
  }
  
  /**
   * Get tournament leaderboard
   * with provider fallback
   */
  async getLeaderboard(tournamentId: string, year: string, round?: number): Promise<NormalizedLeaderboard> {
    const cacheKey = `leaderboard_${tournamentId}_${year}_${round || 'current'}`;
    
    // Check cache first - but use a shorter TTL for leaderboards during tournament
    const cachedData = this.getFromCache<NormalizedLeaderboard>(cacheKey);
    if (cachedData) return cachedData;
    
    // Try each provider in order
    for (const provider of this.providers) {
      try {
        if (provider.isHealthy) {
          const data = await provider.getLeaderboard(tournamentId, year, round);
          this.saveToCache(cacheKey, data);
          return data;
        }
      } catch (error) {
        console.error(`Error getting leaderboard from ${provider.name}:`, error);
        provider.isHealthy = false;
      }
    }
    
    throw new Error('Augusta Engine: Unable to get leaderboard from any provider');
  }
  
  /**
   * Get from cache with TTL check
   */
  private getFromCache<T>(key: string): T | null {
    const cachedItem = this.cache.get(key);
    
    if (cachedItem && (Date.now() - cachedItem.timestamp) < this.cacheTTL) {
      return cachedItem.data as T;
    }
    
    return null;
  }
  
  /**
   * Save data to cache with timestamp
   */
  private saveToCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
} 