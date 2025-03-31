/**
 * Sportradar API Provider Implementation
 * 
 * This class implements the GolfAPIProvider interface for Sportradar Golf API
 * https://developer.sportradar.com/docs/read/golf/Golf_v3
 * 
 * TODO (Augusta Engine Improvements):
 * - Fix 404 errors encountered with several endpoints during testing
 * - Verify all endpoint mappings are correct for Sportradar API structure
 * - Confirm tournament ID format/lookup for Masters and other tournaments
 * - Ensure robust fallbacks for all required normalized fields
 * - Verify response mapping handles all edge cases properly
 * - Add comprehensive test coverage for all endpoints
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

export class SportradarProvider implements GolfAPIProvider {
  private apiKey: string;
  private baseUrl: string;
  public name: string = 'Sportradar';
  public isHealthy: boolean = true;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Try using the .com domain from the documentation
    this.baseUrl = 'https://api.sportradar.com/golf/trial/v3';
  }
  
  /**
   * Make a request to the Sportradar API
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    // Build the URL with query parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add API key as a query parameter - this is the required approach for Sportradar
    url.searchParams.append('api_key', this.apiKey);
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    
    try {
      // Make the API request with minimal headers
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        this.isHealthy = false;
        throw new Error(`Sportradar API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      this.isHealthy = false;
      console.error('Sportradar API request failed:', error);
      throw error;
    }
  }
  
  /**
   * Get tournament schedule for a year
   */
  async getTournamentSchedule(year: string): Promise<NormalizedSchedule> {
    // Call Sportradar schedules endpoint
    const response = await this.makeRequest<any>(`/en/tournaments/schedule/${year}.json`);
    
    // Map to normalized format
    return {
      season: year,
      tournaments: response.tournaments.map((tournament: any) => this.mapTournament(tournament, year))
    };
  }
  
  /**
   * Get tournament details
   */
  async getTournamentDetails(tournamentId: string, year: string): Promise<NormalizedTournament> {
    // Call Sportradar tournament summary endpoint
    const response = await this.makeRequest<any>(`/en/tournaments/${tournamentId}/summary.json`);
    
    return this.mapTournament(response.tournament, year);
  }
  
  /**
   * Get list of golfers for a tournament
   */
  async getGolferList(tournamentId: string, year: string): Promise<NormalizedGolfer[]> {
    // Call Sportradar tournament summary endpoint to get player list
    const response = await this.makeRequest<any>(`/en/tournaments/${tournamentId}/summary.json`);
    
    // Map players to normalized format
    return response.tournament?.players?.map((player: any) => this.mapGolfer(player)) || [];
  }
  
  /**
   * Get details for a specific golfer
   */
  async getGolferDetails(golferId: string): Promise<NormalizedGolfer> {
    // Call Sportradar player profile endpoint
    const response = await this.makeRequest<any>(`/en/players/${golferId}/profile.json`);
    
    return this.mapGolfer(response.player);
  }
  
  /**
   * Get tournament leaderboard
   */
  async getLeaderboard(tournamentId: string, year: string, round?: number): Promise<NormalizedLeaderboard> {
    // Call Sportradar leaderboard endpoint
    const response = await this.makeRequest<any>(`/en/tournaments/${tournamentId}/leaderboard.json`);
    
    // Extract players and map to normalized entries
    const players = response.leaderboard?.players?.map((entry: any) => 
      this.mapLeaderboardEntry(entry)
    ) || [];
    
    // Determine tournament status
    let status = TournamentStatus.UPCOMING;
    
    if (response.tournament?.status === 'closed') {
      status = TournamentStatus.COMPLETED;
    } else if (response.tournament?.status === 'inprogress' || response.tournament?.status === 'live') {
      status = TournamentStatus.IN_PROGRESS;
    } else if (response.tournament?.status === 'cancelled') {
      status = TournamentStatus.CANCELED;
    }
    
    return {
      tournamentId,
      roundId: round || response.round?.number,
      lastUpdated: response.generated_at || new Date().toISOString(),
      cutLine: response.cut_line?.value,
      status,
      players
    };
  }
  
  /**
   * Check if the API is responding correctly
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Use the simplest possible endpoint for health check
      const response = await this.makeRequest(`/en/seasons.json`);
      
      // If we got a response, the API is healthy
      this.isHealthy = true;
      return true;
    } catch (error) {
      console.error('Sportradar health check failed:', error);
      this.isHealthy = false;
      return false;
    }
  }
  
  /**
   * Map a Sportradar tournament to normalized format
   */
  private mapTournament(tournament: any, year: string): NormalizedTournament {
    if (!tournament) {
      throw new Error('Cannot map undefined tournament');
    }
    
    // Convert dates to ISO format if needed
    let startDate = tournament.scheduled?.start_date || tournament.start_date || '';
    let endDate = tournament.scheduled?.end_date || tournament.end_date || '';
    
    // Ensure consistent date format (YYYY-MM-DD)
    if (startDate && !startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      try {
        startDate = new Date(startDate).toISOString().split('T')[0];
      } catch (e) {
        console.warn(`Failed to parse start date: ${startDate}`);
        startDate = '';
      }
    }
    
    if (endDate && !endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      try {
        endDate = new Date(endDate).toISOString().split('T')[0];
      } catch (e) {
        console.warn(`Failed to parse end date: ${endDate}`);
        endDate = '';
      }
    }
    
    // Map status
    let status = TournamentStatus.UPCOMING;
    
    if (tournament.status === 'closed') {
      status = TournamentStatus.COMPLETED;
    } else if (tournament.status === 'inprogress' || tournament.status === 'live') {
      status = TournamentStatus.IN_PROGRESS;
    } else if (tournament.status === 'cancelled') {
      status = TournamentStatus.CANCELED;
    } else {
      // If status is missing, try to infer from dates
      const now = new Date();
      const tournamentStart = startDate ? new Date(startDate) : null;
      const tournamentEnd = endDate ? new Date(endDate) : null;
      
      if (tournamentEnd && now > tournamentEnd) {
        status = TournamentStatus.COMPLETED;
      } else if (tournamentStart && now >= tournamentStart) {
        status = TournamentStatus.IN_PROGRESS;
      }
    }
    
    const course = tournament.venue?.name || tournament.course || '';
    const location = tournament.venue?.location || tournament.location || '';
    
    // Format purse consistently as string with currency symbol
    let purse = undefined;
    if (tournament.purse?.amount) {
      const amount = tournament.purse.amount;
      purse = typeof amount === 'number' 
        ? `$${amount.toLocaleString()}`
        : `$${amount}`;
    }
    
    return {
      id: tournament.id || '',
      name: tournament.name || 'Unknown Tournament',
      startDate,
      endDate,
      course,
      location,
      purse,
      status,
      currentRound: tournament.current_round?.number || 0,
      externalId: tournament.id || '',
      externalSystem: this.name
    };
  }
  
  /**
   * Map a Sportradar player to normalized golfer
   */
  private mapGolfer(player: any): NormalizedGolfer {
    if (!player) {
      throw new Error('Cannot map undefined player');
    }
    
    // Map status
    let status = GolferStatus.ACTIVE;
    
    if (player.status === 'cut') {
      status = GolferStatus.CUT;
    } else if (player.status === 'withdrawn' || player.status === 'wd') {
      status = GolferStatus.WITHDRAWN;
    } else if (player.status === 'disqualified' || player.status === 'dq') {
      status = GolferStatus.DISQUALIFIED;
    }
    
    // Ensure we have a name by combining first/last if needed
    let name = player.name;
    if (!name && (player.first_name || player.last_name)) {
      name = `${player.first_name || ''} ${player.last_name || ''}`.trim();
    }
    
    // If no name is available, use id with a prefix
    if (!name) {
      name = `Player ${player.id || 'Unknown'}`;
    }
    
    // Parse rank as number if it exists
    let rank = undefined;
    if (player.world_ranking !== undefined) {
      rank = typeof player.world_ranking === 'string' 
        ? parseInt(player.world_ranking, 10) 
        : player.world_ranking;
      
      // Only use valid numbers
      if (isNaN(rank)) {
        rank = undefined;
      }
    }
    
    return {
      id: player.id || '',
      name,
      country: player.country || '',
      countryCode: player.country_code || '',
      rank,
      avatarUrl: player.image_url || null,
      status,
      externalId: player.id || '',
      externalSystem: this.name
    };
  }
  
  /**
   * Map a Sportradar leaderboard entry to normalized format
   */
  private mapLeaderboardEntry(entry: any): NormalizedLeaderboardEntry {
    if (!entry) {
      throw new Error('Cannot map undefined leaderboard entry');
    }
    
    // Map status
    let status = GolferStatus.ACTIVE;
    
    if (entry.status === 'cut') {
      status = GolferStatus.CUT;
    } else if (entry.status === 'withdrawn' || entry.status === 'wd') {
      status = GolferStatus.WITHDRAWN;
    } else if (entry.status === 'disqualified' || entry.status === 'dq') {
      status = GolferStatus.DISQUALIFIED;
    }
    
    // Ensure position is a number
    let position = 0;
    if (entry.position !== undefined) {
      position = typeof entry.position === 'string'
        ? parseInt(entry.position.replace(/T$/, ''), 10) // Handle tied positions like "10T"
        : entry.position;
      
      if (isNaN(position)) {
        position = 0;
      }
    }
    
    // Normalize score to a number
    let score = 0;
    if (entry.total_to_par !== undefined) {
      score = typeof entry.total_to_par === 'string'
        ? parseInt(entry.total_to_par, 10)
        : entry.total_to_par;
      
      if (isNaN(score)) {
        score = 0;
      }
    }
    
    // Helper to normalize round scores
    const normalizeRoundScore = (roundScore: any): number | undefined => {
      if (roundScore === undefined || roundScore === null) return undefined;
      
      const score = typeof roundScore === 'string'
        ? parseInt(roundScore, 10)
        : roundScore;
        
      return isNaN(score) ? undefined : score;
    };
    
    return {
      golferId: entry.player?.id || '',
      position,
      score,
      round1: normalizeRoundScore(entry.rounds?.[0]?.score),
      round2: normalizeRoundScore(entry.rounds?.[1]?.score),
      round3: normalizeRoundScore(entry.rounds?.[2]?.score),
      round4: normalizeRoundScore(entry.rounds?.[3]?.score),
      thru: entry.thru || 0,
      today: normalizeRoundScore(entry.today_to_par),
      status
    };
  }
} 