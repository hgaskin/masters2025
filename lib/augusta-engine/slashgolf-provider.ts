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
    
    // Add required orgId parameter if not provided
    if (!params.orgId && !url.searchParams.has('orgId')) {
      url.searchParams.append('orgId', '1'); // Default to PGA Tour
    }
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    
    try {
      // Make the API request with proper RapidAPI headers (using hyphen format)
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          // RapidAPI requires these specific headers with exact format
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
      throw error;
    }
  }
  
  /**
   * Check connection health by making a simple schedule API call
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Make a basic request to check connectivity - use schedule with minimal data
      await this.makeRequest<any>('/schedule', { year: '2024' });
      this.isHealthy = true;
      return true;
    } catch (error) {
      this.isHealthy = false;
      return false;
    }
  }
  
  /**
   * Get tournament schedule for a specific year
   */
  async getTournamentSchedule(year: string): Promise<NormalizedSchedule> {
    // Call SlashGolf schedule endpoint
    const response = await this.makeRequest<any>('/schedule', { year });
    
    // Map tournaments from response to normalized format
    const tournaments = response.schedule.map((tournament: any) => {
      // Parse start/end dates
      const startDate = new Date(parseInt(tournament.date.start.$date.$numberLong));
      const endDate = new Date(parseInt(tournament.date.end.$date.$numberLong));
      
      // Determine tournament status
      let status = TournamentStatus.UPCOMING;
      if (new Date() > endDate) {
        status = TournamentStatus.COMPLETED;
      } else if (new Date() >= startDate && new Date() <= endDate) {
        status = TournamentStatus.IN_PROGRESS;
      }
      
      return {
        id: tournament.tournId,
        name: tournament.name,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        course: '',  // SlashGolf doesn't provide course in the schedule
        location: '', // SlashGolf doesn't provide location in the schedule
        purse: tournament.purse ? `$${parseInt(tournament.purse.$numberInt).toLocaleString()}` : undefined,
        status,
        externalId: tournament.tournId,
        externalSystem: this.name
      };
    });
    
    return {
      season: year,
      tournaments
    };
  }
  
  /**
   * Get tournament details
   */
  async getTournamentDetails(tournamentId: string, year: string): Promise<NormalizedTournament> {
    // Call SlashGolf tournament endpoint (previously incorrectly using /tournaments)
    const response = await this.makeRequest<any>('/tournament', { 
      tournId: tournamentId,
      year
    });
    
    return this.mapTournament(response, year);
  }
  
  /**
   * Helper to map a tournament from SlashGolf to normalized format
   */
  private mapTournament(tournament: any, year: string): NormalizedTournament {
    // Parse start/end dates
    const startDate = new Date(parseInt(tournament.date.start.$date.$numberLong));
    const endDate = new Date(parseInt(tournament.date.end.$date.$numberLong));
    
    // Determine status from tournament.status or based on dates
    let status = TournamentStatus.UPCOMING;
    if (tournament.status === 'Official') {
      status = TournamentStatus.COMPLETED;
    } else if (new Date() >= startDate && new Date() <= endDate) {
      status = TournamentStatus.IN_PROGRESS;
    }
    
    // Construct venue information if available
    const course = tournament.course?.name || '';
    
    return {
      id: tournament.tournId,
      name: tournament.name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      course,
      location: '',  // SlashGolf doesn't provide detailed location
      purse: tournament.purse ? `$${parseInt(tournament.purse.$numberInt).toLocaleString()}` : undefined,
      status,
      currentRound: tournament.currentRound ? parseInt(tournament.currentRound) : undefined,
      externalId: tournament.tournId,
      externalSystem: this.name
    };
  }
  
  /**
   * Get list of golfers for a tournament
   */
  async getGolferList(tournamentId: string, year: string): Promise<NormalizedGolfer[]> {
    // Call SlashGolf tournament endpoint to get player list
    const response = await this.makeRequest<any>('/tournament', { 
      tournId: tournamentId,
      year
    });
    
    // Check if players array exists in the response
    if (!response.players || !Array.isArray(response.players)) {
      return [];
    }
    
    // Map players to normalized format
    return response.players.map((player: any) => this.mapGolfer(player));
  }
  
  /**
   * Helper to map a golfer from SlashGolf to normalized format
   */
  private mapGolfer(golfer: any): NormalizedGolfer {
    return {
      id: golfer.playerId,
      name: `${golfer.firstName} ${golfer.lastName}`,
      country: golfer.country || undefined,
      status: this.mapGolferStatus(golfer.status),
      externalId: golfer.playerId,
      externalSystem: this.name
    };
  }
  
  /**
   * Helper to map player status from SlashGolf to our normalized format
   */
  private mapGolferStatus(status?: string): GolferStatus {
    if (!status) return GolferStatus.ACTIVE;
    
    switch (status.toLowerCase()) {
      case 'active':
      case 'complete':
        return GolferStatus.ACTIVE;
      case 'withdrawn':
      case 'wd':
        return GolferStatus.WITHDRAWN;
      case 'cut':
        return GolferStatus.CUT;
      case 'disqualified':
      case 'dq':
        return GolferStatus.DISQUALIFIED;
      default:
        return GolferStatus.ACTIVE;
    }
  }
  
  /**
   * Get details for a specific golfer
   */
  async getGolferDetails(golferId: string): Promise<NormalizedGolfer> {
    // Call SlashGolf players endpoint
    try {
      const response = await this.makeRequest<any>('/players', { 
        playerId: golferId
      });
      
      // If we got player data, map it
      if (response && response.players && response.players.length > 0) {
        return this.mapGolfer(response.players[0]);
      }
      
      // Fallback minimal implementation
      throw new Error('Player not found');
    } catch (error) {
      // Return minimal implementation if the API doesn't have this player
      return {
        id: golferId,
        name: 'Unknown Player',
        externalId: golferId,
        externalSystem: this.name
      };
    }
  }
  
  /**
   * Get tournament leaderboard
   */
  async getLeaderboard(tournamentId: string, year: string, round?: number): Promise<NormalizedLeaderboard> {
    // Call SlashGolf leaderboard endpoint
    const params: Record<string, string> = { 
      tournId: tournamentId,
      year
    };
    
    // Add round parameter if specified
    if (round !== undefined) {
      params.roundId = round.toString();
    }
    
    const response = await this.makeRequest<any>('/leaderboard', params);
    
    // Extract players and map to normalized entries
    const players = response.leaderboardRows.map((entry: any) => this.mapLeaderboardEntry(entry));
    
    // Determine tournament status
    let status = TournamentStatus.UPCOMING;
    if (response.status === 'Official') {
      status = TournamentStatus.COMPLETED;
    } else if (response.roundId && parseInt(response.roundId.$numberInt) > 0) {
      status = TournamentStatus.IN_PROGRESS;
    }
    
    // Extract cut line if available
    const cutLine = response.cutLines?.length ? response.cutLines[0].cutScore : undefined;
    
    // Format round number
    const roundNumber = response.roundId ? parseInt(response.roundId.$numberInt) : undefined;
    
    // Parse last updated timestamp
    const lastUpdated = response.lastUpdated?.$date?.$numberLong
      ? new Date(parseInt(response.lastUpdated.$date.$numberLong)).toISOString()
      : new Date().toISOString();
    
    return {
      tournamentId,
      roundId: roundNumber,
      lastUpdated,
      cutLine,
      status,
      players
    };
  }
  
  /**
   * Helper to map a leaderboard entry from SlashGolf to normalized format
   */
  private mapLeaderboardEntry(entry: any): NormalizedLeaderboardEntry {
    // Parse position - remove T prefix if tied
    let position = 0;
    if (entry.position) {
      const positionStr = entry.position.replace('T', '');
      position = parseInt(positionStr, 10);
      if (isNaN(position)) position = 0;
    }
    
    // Convert score to number
    let score = 0;
    if (entry.total) {
      if (entry.total === 'E') {
        score = 0;
      } else {
        const parsed = parseInt(entry.total, 10);
        if (!isNaN(parsed)) score = parsed;
      }
    }
    
    // Map round scores to match interface
    let round1, round2, round3, round4;
    if (entry.rounds && Array.isArray(entry.rounds)) {
      entry.rounds.forEach((round: any) => {
        const roundId = round.roundId?.$numberInt ? parseInt(round.roundId.$numberInt) : 0;
        const roundScore = round.scoreToPar ? 
          (round.scoreToPar === 'E' ? 0 : parseInt(round.scoreToPar, 10)) : 
          undefined;
        
        if (roundId === 1) round1 = roundScore;
        if (roundId === 2) round2 = roundScore;
        if (roundId === 3) round3 = roundScore;
        if (roundId === 4) round4 = roundScore;
      });
    }
    
    // Parse today's score
    let today;
    if (entry.currentRoundScore) {
      today = entry.currentRoundScore === 'E' ? 
        0 : 
        parseInt(entry.currentRoundScore, 10);
      
      if (isNaN(today)) today = undefined;
    }
    
    return {
      golferId: entry.playerId,
      position,
      score,
      round1,
      round2,
      round3,
      round4,
      thru: entry.currentHole?.$numberInt ? parseInt(entry.currentHole.$numberInt) : undefined,
      today,
      status: this.mapGolferStatus(entry.status)
    };
  }
  
  /**
   * Get scorecard for a specific player in a tournament
   */
  async getScorecard(tournamentId: string, playerId: string, year: string, round?: number): Promise<any> {
    // Build params for the API call
    const params: Record<string, string> = {
      tournId: tournamentId,
      playerId,
      year
    };
    
    // Add round parameter if specified
    if (round !== undefined) {
      params.roundId = round.toString(); 
    }
    
    // Call SlashGolf scorecard endpoint
    return await this.makeRequest<any>('/scorecard', params);
  }
} 