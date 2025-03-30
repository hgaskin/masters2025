/**
 * Golf API Service
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
   * Initialize the Golf API Service with available providers
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
      console.warn('GolfAPIService: No providers configured. Check environment variables.');
    }
  }
  
  /**
   * Get data using the first available provider with fallback
   */
  private async getWithFallback<T>(
    cacheKey: string,
    operation: (provider: GolfAPIProvider) => Promise<T>
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    
    // Try each provider in sequence
    let lastError: Error | null = null;
    
    for (const provider of this.providers) {
      try {
        // Skip providers that are known to be unhealthy
        if (!provider.isHealthy) continue;
        
        // Attempt to get data from this provider
        const result = await operation(provider);
        
        // Cache the successful result
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        return result;
      } catch (error) {
        console.error(`Error with provider ${provider.name}:`, error);
        lastError = error as Error;
        // Continue to next provider
      }
    }
    
    // If we reach here, all providers failed
    throw new Error(
      `All golf data providers failed. Last error: ${lastError?.message}`
    );
  }
  
  /**
   * Clear specific or all cached data
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
  
  /**
   * Get tournament schedule for a year
   */
  async getTournamentSchedule(year: string): Promise<NormalizedSchedule> {
    return this.getWithFallback(
      `schedule:${year}`,
      (provider) => provider.getTournamentSchedule(year)
    );
  }
  
  /**
   * Get tournament details
   */
  async getTournamentDetails(tournamentId: string, year: string): Promise<NormalizedTournament> {
    return this.getWithFallback(
      `tournament:${tournamentId}:${year}`,
      (provider) => provider.getTournamentDetails(tournamentId, year)
    );
  }
  
  /**
   * Get list of golfers for a tournament
   */
  async getGolferList(tournamentId: string, year: string): Promise<NormalizedGolfer[]> {
    return this.getWithFallback(
      `golfers:${tournamentId}:${year}`,
      (provider) => provider.getGolferList(tournamentId, year)
    );
  }
  
  /**
   * Get details for a specific golfer
   */
  async getGolferDetails(golferId: string): Promise<NormalizedGolfer> {
    return this.getWithFallback(
      `golfer:${golferId}`,
      (provider) => provider.getGolferDetails(golferId)
    );
  }
  
  /**
   * Get tournament leaderboard
   */
  async getLeaderboard(
    tournamentId: string, 
    year: string, 
    round?: number
  ): Promise<NormalizedLeaderboard> {
    // For leaderboards, use a shorter cache time during active tournaments
    const cacheKey = `leaderboard:${tournamentId}:${year}:${round || 'current'}`;
    
    // Clear existing cache for this leaderboard to ensure fresh data
    this.cache.delete(cacheKey);
    
    return this.getWithFallback(
      cacheKey,
      (provider) => provider.getLeaderboard(tournamentId, year, round)
    );
  }
  
  /**
   * Check health of all providers
   */
  async checkProvidersHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const provider of this.providers) {
      try {
        health[provider.name] = await provider.checkHealth();
      } catch (error) {
        health[provider.name] = false;
      }
    }
    
    return health;
  }
} 