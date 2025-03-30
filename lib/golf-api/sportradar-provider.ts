/**
 * Sportradar Golf API Provider Implementation
 * 
 * This class implements the GolfAPIProvider interface for Sportradar Golf API
 * https://developer.sportradar.com/golf/reference/golf-overview
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
    this.baseUrl = 'https://api.sportradar.com/golf/v3';
  }
  
  /**
   * Make a request to the Sportradar API
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    // Build the URL with query parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    
    // Add API key to all requests
    url.searchParams.append('api_key', this.apiKey);
    
    try {
      // Make the API request
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
      // We'll use a simple check - attempt to get the current year's schedule
      const currentYear = new Date().getFullYear().toString();
      await this.makeRequest(`/en/tournaments/schedule/${currentYear}.json`);
      this.isHealthy = true;
      return true;
    } catch (error) {
      this.isHealthy = false;
      return false;
    }
  }
  
  /**
   * Map a Sportradar tournament to normalized format
   */
  private mapTournament(tournament: any, year: string): NormalizedTournament {
    // Convert dates to ISO format if needed
    const startDate = tournament.scheduled?.start_date || tournament.start_date || '';
    const endDate = tournament.scheduled?.end_date || tournament.end_date || '';
    
    // Map status
    let status = TournamentStatus.UPCOMING;
    
    if (tournament.status === 'closed') {
      status = TournamentStatus.COMPLETED;
    } else if (tournament.status === 'inprogress' || tournament.status === 'live') {
      status = TournamentStatus.IN_PROGRESS;
    } else if (tournament.status === 'cancelled') {
      status = TournamentStatus.CANCELED;
    }
    
    const course = tournament.venue?.name || tournament.course || '';
    const location = tournament.venue?.location || tournament.location || '';
    
    return {
      id: tournament.id,
      name: tournament.name,
      startDate,
      endDate,
      course,
      location,
      purse: tournament.purse?.amount ? `$${tournament.purse.amount}` : undefined,
      status,
      currentRound: tournament.current_round?.number,
      externalId: tournament.id,
      externalSystem: this.name
    };
  }
  
  /**
   * Map a Sportradar player to normalized golfer
   */
  private mapGolfer(player: any): NormalizedGolfer {
    // Map status
    let status = GolferStatus.ACTIVE;
    
    if (player.status === 'cut') {
      status = GolferStatus.CUT;
    } else if (player.status === 'withdrawn') {
      status = GolferStatus.WITHDRAWN;
    } else if (player.status === 'disqualified') {
      status = GolferStatus.DISQUALIFIED;
    }
    
    const name = player.name || `${player.first_name} ${player.last_name}`.trim();
    
    return {
      id: player.id,
      name,
      country: player.country,
      countryCode: player.country_code,
      rank: player.world_ranking,
      avatarUrl: player.image_url,
      status,
      externalId: player.id,
      externalSystem: this.name
    };
  }
  
  /**
   * Map a Sportradar leaderboard entry to normalized format
   */
  private mapLeaderboardEntry(entry: any): NormalizedLeaderboardEntry {
    // Map status
    let status = GolferStatus.ACTIVE;
    
    if (entry.status === 'cut') {
      status = GolferStatus.CUT;
    } else if (entry.status === 'withdrawn') {
      status = GolferStatus.WITHDRAWN;
    } else if (entry.status === 'disqualified') {
      status = GolferStatus.DISQUALIFIED;
    }
    
    return {
      golferId: entry.player?.id,
      position: entry.position || 0,
      score: entry.total_to_par || 0,
      round1: entry.rounds?.[0]?.score,
      round2: entry.rounds?.[1]?.score,
      round3: entry.rounds?.[2]?.score,
      round4: entry.rounds?.[3]?.score,
      thru: entry.thru,
      today: entry.today_to_par,
      status
    };
  }
} 