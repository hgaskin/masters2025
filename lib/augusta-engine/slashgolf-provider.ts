/**
 * SlashGolf API Provider Implementation
 * 
 * This class implements the GolfAPIProvider interface for SlashGolf API
 * https://slashgolf.dev/
 */

import {
  GolfAPIProvider,
  GolferStatus,
  NormalizedGolfer,
  NormalizedLeaderboard,
  NormalizedLeaderboardEntry,
  NormalizedSchedule,
  NormalizedTournament,
  TournamentStatus
} from './types';

export class SlashGolfProvider implements GolfAPIProvider {
  private apiKey: string;
  private baseUrl: string;
  public name: string = 'SlashGolf';
  public isHealthy: boolean = true;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://live-golf-data.p.rapidapi.com';
  }
  
  /**
   * Make a request to the SlashGolf API
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    // Build the URL with query parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    
    try {
      // Make the API request
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'live-golf-data.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        this.isHealthy = false;
        throw new Error(`SlashGolf API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      this.isHealthy = false;
      console.error('SlashGolf API request failed:', error);
      throw error;
    }
  }
  
  /**
   * Get tournament schedule for a year
   */
  async getTournamentSchedule(year: string): Promise<NormalizedSchedule> {
    // Call SlashGolf schedules endpoint
    const response = await this.makeRequest<any>('/schedules', { year });
    
    // Map to normalized format
    return {
      season: year,
      tournaments: response.schedule.map((item: any) => this.mapTournament(item, year))
    };
  }
  
  /**
   * Get tournament details
   */
  async getTournamentDetails(tournamentId: string, year: string): Promise<NormalizedTournament> {
    // Call SlashGolf tournaments endpoint
    const response = await this.makeRequest<any>('/tournaments', { 
      tournId: tournamentId,
      year
    });
    
    return this.mapTournament(response, year);
  }
  
  /**
   * Get list of golfers for a tournament
   */
  async getGolferList(tournamentId: string, year: string): Promise<NormalizedGolfer[]> {
    // Call SlashGolf tournaments endpoint to get entry list
    const response = await this.makeRequest<any>('/tournaments', { 
      tournId: tournamentId,
      year
    });
    
    // Map players to normalized format
    return response.players.map((player: any) => this.mapGolfer(player));
  }
  
  /**
   * Get details for a specific golfer
   */
  async getGolferDetails(golferId: string): Promise<NormalizedGolfer> {
    // Note: SlashGolf may not have a specific golfer details endpoint
    // This would need to be enhanced based on the actual API capabilities
    // For now, returning a minimal implementation
    return {
      id: golferId,
      name: 'Unknown', // Without a proper API endpoint, we can't get the name
      externalId: golferId,
      externalSystem: this.name
    };
  }
  
  /**
   * Get tournament leaderboard
   */
  async getLeaderboard(tournamentId: string, year: string, round?: number): Promise<NormalizedLeaderboard> {
    // Call SlashGolf leaderboards endpoint
    const response = await this.makeRequest<any>('/leaderboards', { 
      tournId: tournamentId,
      year,
      ...(round ? { roundId: round.toString() } : {})
    });
    
    // Extract players and map to normalized entries
    const players = response.leaderboard.map((entry: any) => this.mapLeaderboardEntry(entry));
    
    // Determine tournament status
    let status = TournamentStatus.UPCOMING;
    if (response.complete) {
      status = TournamentStatus.COMPLETED;
    } else if (response.round > 0) {
      status = TournamentStatus.IN_PROGRESS;
    }
    
    return {
      tournamentId,
      roundId: response.round,
      lastUpdated: new Date().toISOString(), // API might not provide this
      cutLine: response.cutLine,
      status,
      players
    };
  }
  
  /**
   * Check if the API is responding correctly
   */
  async checkHealth(): Promise<boolean> {
    try {
      // We'll use a simple check - attempt to get the current year's schedule
      const currentYear = new Date().getFullYear().toString();
      await this.makeRequest('/schedules', { year: currentYear });
      this.isHealthy = true;
      return true;
    } catch (error) {
      this.isHealthy = false;
      return false;
    }
  }
  
  /**
   * Map a SlashGolf tournament to normalized format
   */
  private mapTournament(tournament: any, year: string): NormalizedTournament {
    // Convert dates from timestamps if needed
    const startDate = tournament.date?.start 
      ? new Date(tournament.date.start * 1000).toISOString().split('T')[0]
      : '';
      
    const endDate = tournament.date?.end
      ? new Date(tournament.date.end * 1000).toISOString().split('T')[0]
      : '';
    
    // Map status
    let status = TournamentStatus.UPCOMING;
    const now = Date.now();
    
    if (tournament.date?.end && tournament.date.end * 1000 < now) {
      status = TournamentStatus.COMPLETED;
    } else if (tournament.date?.start && tournament.date.start * 1000 < now) {
      status = TournamentStatus.IN_PROGRESS;
    }
    
    return {
      id: tournament.tournId,
      name: tournament.name,
      startDate,
      endDate,
      course: tournament.courseName || '',
      location: this.formatLocation(tournament.location),
      purse: tournament.purse,
      status,
      currentRound: tournament.round,
      externalId: tournament.tournId,
      externalSystem: this.name
    };
  }
  
  /**
   * Map a SlashGolf player to normalized golfer
   */
  private mapGolfer(player: any): NormalizedGolfer {
    // Map status
    let status = GolferStatus.ACTIVE;
    if (player.status === 'cut') {
      status = GolferStatus.CUT;
    } else if (player.status === 'wd') {
      status = GolferStatus.WITHDRAWN;
    } else if (player.status === 'dq') {
      status = GolferStatus.DISQUALIFIED;
    }
    
    return {
      id: player.playerId,
      name: player.name || `${player.firstName} ${player.lastName}`.trim(),
      country: player.country,
      countryCode: player.countryCode,
      status,
      externalId: player.playerId,
      externalSystem: this.name
    };
  }
  
  /**
   * Map a SlashGolf leaderboard entry to normalized format
   */
  private mapLeaderboardEntry(entry: any): NormalizedLeaderboardEntry {
    // Map status
    let status = GolferStatus.ACTIVE;
    if (entry.status === 'cut') {
      status = GolferStatus.CUT;
    } else if (entry.status === 'wd') {
      status = GolferStatus.WITHDRAWN;
    } else if (entry.status === 'dq') {
      status = GolferStatus.DISQUALIFIED;
    }
    
    return {
      golferId: entry.playerId,
      position: parseInt(entry.position, 10) || 0,
      score: entry.score || 0,
      round1: entry.r1 || 0,
      round2: entry.r2 || 0,
      round3: entry.r3 || 0,
      round4: entry.r4 || 0,
      thru: entry.thru,
      today: entry.today,
      status
    };
  }
  
  /**
   * Format location from SlashGolf data
   */
  private formatLocation(location: any): string {
    if (!location) return '';
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country && location.country !== 'USA') parts.push(location.country);
    
    return parts.join(', ');
  }
} 