/**
 * API Route for Syncing Tournament Schedule to Supabase
 * 
 * This endpoint fetches tournament data from golf APIs and synchronizes it with Supabase.
 * It's designed for infrequent updates (weekly/monthly or before tournaments)
 * and can be triggered manually or by a scheduled job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { GolfAPIService, TournamentStatus } from '@/lib/augusta-engine';
import { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Extract parameters
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const apiKey = searchParams.get('apiKey');
    
    // Validate API key if configured
    const requiredApiKey = process.env.SYNC_API_KEY;
    if (requiredApiKey && apiKey !== requiredApiKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }
    
    // Initialize API service with a longer cache TTL for tournament data
    // 24 hours is appropriate for tournament schedule data
    const golfAPIService = new GolfAPIService({ cacheTTL: 24 * 60 * 60 * 1000 });
    
    // Initialize Supabase client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Fetch tournament schedule from the API
    const schedule = await golfAPIService.getTournamentSchedule(year);
    
    // Track results
    const results = {
      total: schedule.tournaments.length,
      created: 0,
      updated: 0,
      errors: 0
    };
    
    // Process each tournament
    for (const tournament of schedule.tournaments) {
      try {
        // Check if tournament already exists
        const { data: existingTournaments } = await supabase
          .from('tournaments')
          .select('id')
          .eq('id', tournament.id);
        
        // Get extended tournament info that may not be in the type definition
        const extendedTournament = tournament as any;
        
        // Prepare tournament data for upsert
        const tournamentData = {
          name: tournament.name,
          start_date: tournament.startDate,
          end_date: tournament.endDate,
          course: tournament.course,
          location: tournament.location,
          status: tournament.status.toString(),
          current_round: tournament.currentRound || null,
          cut_line: null, // Add cut_line field with null value
          year: parseInt(year), // Convert year to number
          par: extendedTournament.par || 72, // Default to standard par
          purse: extendedTournament.purse || null,
          rounds: extendedTournament.rounds || 4, // Default to 4 rounds
          updated_at: new Date().toISOString()
        };
        
        // Update or insert
        if (existingTournaments && existingTournaments.length > 0) {
          // Update existing tournament
          const { error } = await supabase
            .from('tournaments')
            .update(tournamentData)
            .eq('id', tournament.id);
          
          if (error) throw error;
          results.updated++;
        } else {
          // Insert new tournament
          const { error } = await supabase
            .from('tournaments')
            .insert({
              id: tournament.id,
              ...tournamentData,
              created_at: new Date().toISOString()
            });
          
          if (error) throw error;
          results.created++;
        }
        
        // For the Masters specifically, get additional details
        if (tournament.name.toLowerCase().includes('masters')) {
          await syncTournamentDetails(supabase, golfAPIService, tournament.id, year);
        }
      } catch (error) {
        console.error(`Error syncing tournament ${tournament.name}:`, error);
        results.errors++;
      }
    }
    
    // Return results
    return NextResponse.json({
      success: true,
      message: `Synced ${results.total} tournaments: ${results.created} created, ${results.updated} updated, ${results.errors} errors`,
      results,
      year
    });
    
  } catch (error) {
    console.error('Error syncing tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to sync tournaments', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Helper function to sync additional tournament details
 */
async function syncTournamentDetails(supabase: any, golfAPIService: GolfAPIService, tournamentId: string, year: string) {
  try {
    // Get detailed tournament information
    const tournamentDetails = await golfAPIService.getTournamentDetails(tournamentId, year);
    
    // Cast to extended type to access additional properties
    const extendedDetails = tournamentDetails as any;
    
    // Update tournament with additional details if available
    const additionalDetails: any = {
      updated_at: new Date().toISOString()
    };
    
    // Add additional details if available
    if (extendedDetails.par) additionalDetails.par = extendedDetails.par;
    if (extendedDetails.purse) additionalDetails.purse = extendedDetails.purse;
    if (extendedDetails.rounds) additionalDetails.rounds = extendedDetails.rounds;
    
    // Update the tournament record
    await supabase
      .from('tournaments')
      .update(additionalDetails)
      .eq('id', tournamentId);
      
    return true;
  } catch (error) {
    console.error(`Error syncing tournament details for ${tournamentId}:`, error);
    return false;
  }
}

/**
 * This can also be triggered via POST with parameters in the body
 */
export async function POST(request: NextRequest) {
  try {
    // Extract parameters from request body
    const body = await request.json();
    const { year, apiKey } = body;
    
    // Build a new request with query parameters
    const url = new URL(request.url);
    if (year) url.searchParams.set('year', year);
    if (apiKey) url.searchParams.set('apiKey', apiKey);
    
    // Create a new request and call GET handler
    const newRequest = new NextRequest(url, {
      headers: request.headers
    });
    
    return GET(newRequest);
  } catch (error) {
    console.error('Error processing POST request:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: (error as Error).message },
      { status: 500 }
    );
  }
} 