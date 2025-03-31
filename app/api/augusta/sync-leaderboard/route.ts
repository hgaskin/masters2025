/**
 * API Route for Syncing Tournament Leaderboard to Supabase
 * 
 * This endpoint fetches leaderboard data from golf APIs and synchronizes it with Supabase.
 * It's designed for frequent updates during tournaments (every 5-10 minutes)
 * and can be triggered manually or by a scheduled job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { GolfAPIService, GolferStatus } from '@/lib/augusta-engine';
import { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Extract parameters
    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournamentId');
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const round = searchParams.get('round') ? parseInt(searchParams.get('round')!, 10) : undefined;
    const apiKey = searchParams.get('apiKey');
    
    // Validate required parameters
    if (!tournamentId) {
      return NextResponse.json(
        { error: 'Missing required parameter: tournamentId' },
        { status: 400 }
      );
    }
    
    // Validate API key if configured
    const requiredApiKey = process.env.SYNC_API_KEY;
    if (requiredApiKey && apiKey !== requiredApiKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }
    
    // Initialize API service with a shorter cache TTL for leaderboard data
    // 2 minutes during tournament play is appropriate
    const golfAPIService = new GolfAPIService({ cacheTTL: 2 * 60 * 1000 });
    
    // Initialize Supabase client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Fetch leaderboard from the API
    const leaderboard = await golfAPIService.getLeaderboard(tournamentId, year, round);
    
    // First, check if tournament exists and update its status
    try {
      // Check if tournament exists first
      const { data: existingTournament } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();
      
      if (existingTournament) {
        // Just update the tournament status
        const { error: tournamentError } = await supabase
          .from('tournaments')
          .update({
            status: leaderboard.status.toString(),
            current_round: leaderboard.roundId || 1,
            cut_line: leaderboard.cutLine ? leaderboard.cutLine.toString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', tournamentId);
          
        if (tournamentError) {
          console.error('Error updating tournament status:', tournamentError);
        }
      } else {
        // If no tournament exists, we need to create at least a placeholder
        // (should be populated fully by the sync-tournaments endpoint)
        const { error: tournamentError } = await supabase
          .from('tournaments')
          .insert({
            id: tournamentId,
            name: `Tournament ${tournamentId}`,
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
            course: 'Unknown Course',
            location: 'Unknown Location',
            status: leaderboard.status.toString(),
            current_round: leaderboard.roundId || 1,
            cut_line: leaderboard.cutLine ? leaderboard.cutLine.toString() : null,
            year: parseInt(year),
            par: 72, // Default value
            rounds: 4, // Default value
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (tournamentError) {
          console.error('Error creating tournament placeholder:', tournamentError);
        }
      }
    } catch (error) {
      console.error('Error handling tournament:', error);
    }
    
    // Track results
    const results = {
      total: leaderboard.players.length,
      created: 0,
      updated: 0,
      errors: 0
    };
    
    // Process each player in the leaderboard
    for (const player of leaderboard.players) {
      try {
        // First ensure the golfer exists in the golfers table
        await ensureGolferExists(supabase, player.golferId);
        
        // Ensure the tournament-golfer relationship exists and update status
        await ensureTournamentGolferExists(supabase, tournamentId, player.golferId, player.status);
        
        // Check if score record already exists for this golfer and round
        const { data: existingScores } = await supabase
          .from('tournament_scores')
          .select('id')
          .eq('golfer_id', player.golferId)
          .eq('tournament_id', tournamentId)
          .eq('round', leaderboard.roundId || 1);
        
        // Calculate total score from all rounds
        const totalScore = calculateTotalScore(player);
        
        // Access extended properties that may not be in the type definition
        const extendedPlayer = player as any;
        
        // Prepare score data
        const scoreData = {
          golfer_id: player.golferId,
          tournament_id: tournamentId,
          round: leaderboard.roundId || 1,
          score: player.score,
          thru: player.thru || null,
          r1_score: player.round1 || null,
          r2_score: player.round2 || null,
          r3_score: player.round3 || null,
          r4_score: player.round4 || null,
          today_score: player.today || null,
          total_score: totalScore,
          position: player.position ? player.position.toString() : null,
          official_position: extendedPlayer.officialPosition ? extendedPlayer.officialPosition.toString() : player.position ? player.position.toString() : null,
          status: player.status.toString(),
          updated_at: new Date().toISOString()
        };
        
        // Update or insert
        if (existingScores && existingScores.length > 0) {
          // Update existing score
          const { error } = await supabase
            .from('tournament_scores')
            .update(scoreData)
            .eq('id', existingScores[0].id);
          
          if (error) throw error;
          results.updated++;
        } else {
          // Insert new score
          const { error } = await supabase
            .from('tournament_scores')
            .insert({
              ...scoreData,
              created_at: new Date().toISOString()
            });
          
          if (error) throw error;
          results.created++;
        }
      } catch (error) {
        console.error(`Error syncing score for golfer ${player.golferId}:`, error);
        results.errors++;
      }
    }
    
    // Return results
    return NextResponse.json({
      success: true,
      message: `Synced leaderboard with ${results.total} players: ${results.created} created, ${results.updated} updated, ${results.errors} errors`,
      results,
      timestamp: new Date().toISOString(),
      tournamentId,
      round: leaderboard.roundId
    });
    
  } catch (error) {
    console.error('Error syncing leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to sync leaderboard', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Helper function to calculate total score from all available rounds
 */
function calculateTotalScore(player: any): number | null {
  // If player has a total score property, use that
  if (player.totalScore !== undefined) {
    return player.totalScore;
  }
  
  // Otherwise calculate from individual rounds
  let rounds = [player.round1, player.round2, player.round3, player.round4];
  let validRounds = rounds.filter(r => r !== undefined && r !== null);
  
  if (validRounds.length === 0) {
    return player.score; // Use current round score if no round scores available
  }
  
  return validRounds.reduce((sum, score) => sum + score, 0);
}

/**
 * Helper function to ensure a golfer exists in the database
 */
async function ensureGolferExists(supabase: any, golferId: string) {
  // Check if golfer exists
  const { data: existingGolfer } = await supabase
    .from('golfers')
    .select('id')
    .eq('id', golferId)
    .single();
  
  // If golfer doesn't exist, create a placeholder record
  // This will be updated later by the sync-golfers endpoint
  if (!existingGolfer) {
    await supabase
      .from('golfers')
      .insert({
        id: golferId,
        name: `Golfer ${golferId}`, // Placeholder name
        created_at: new Date().toISOString()
      });
  }
}

/**
 * Helper function to ensure the tournament-golfer relationship exists
 * and update the golfer's status for this tournament
 */
async function ensureTournamentGolferExists(supabase: any, tournamentId: string, golferId: string, status: GolferStatus) {
  // Check if the tournament-golfer relationship exists
  const { data: existingRelationship } = await supabase
    .from('tournament_golfers')
    .select('id')
    .eq('tournament_id', tournamentId)
    .eq('golfer_id', golferId)
    .single();
  
  const timestamp = new Date().toISOString();
  
  if (existingRelationship) {
    // Update existing relationship with new status
    await supabase
      .from('tournament_golfers')
      .update({ 
        status: status.toString(),
        updated_at: timestamp
      })
      .eq('id', existingRelationship.id);
  } else {
    // Create new tournament-golfer relationship
    await supabase
      .from('tournament_golfers')
      .insert({
        tournament_id: tournamentId,
        golfer_id: golferId,
        status: status.toString(),
        created_at: timestamp,
        updated_at: timestamp
      });
  }
}

/**
 * This can also be triggered via POST with parameters in the body
 */
export async function POST(request: NextRequest) {
  try {
    // Extract parameters from request body
    const body = await request.json();
    const { tournamentId, year, round, apiKey } = body;
    
    // Build a new request with query parameters
    const url = new URL(request.url);
    if (tournamentId) url.searchParams.set('tournamentId', tournamentId);
    if (year) url.searchParams.set('year', year);
    if (round) url.searchParams.set('round', round.toString());
    if (apiKey) url.searchParams.set('apiKey', apiKey);
    
    // Delegate to GET handler
    const newRequest = new NextRequest(url, {
      headers: request.headers
    });
    
    return GET(newRequest);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
} 