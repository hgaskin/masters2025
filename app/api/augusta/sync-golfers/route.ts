/**
 * API Route for Syncing Golfers to Supabase
 * 
 * This endpoint fetches golfer data from golf APIs and synchronizes it with Supabase.
 * It can be triggered manually or by a scheduled job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { GolfAPIService } from '@/lib/augusta-engine';
import { Database } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Extract parameters
    const searchParams = request.nextUrl.searchParams;
    const tournamentId = searchParams.get('tournamentId');
    const year = searchParams.get('year') || new Date().getFullYear().toString();
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
    
    // Initialize API service
    const golfAPIService = new GolfAPIService();
    
    // Initialize Supabase client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Fetch golfers from the API
    const golfers = await golfAPIService.getGolferList(tournamentId, year);
    
    // Track results
    const results = {
      total: golfers.length,
      created: 0,
      updated: 0,
      tournament_relations_created: 0,
      tournament_relations_updated: 0,
      errors: 0
    };
    
    // Process each golfer
    for (const golfer of golfers) {
      try {
        // Check if golfer already exists by external ID and system if provided
        let existingGolfer = null;
        let golferId = null;
        
        if (golfer.externalId && golfer.externalSystem) {
          const { data } = await supabase
            .from('golfers')
            .select('id, external_id')
            .eq('external_id', golfer.externalId)
            .eq('external_system', golfer.externalSystem);
          
          existingGolfer = data && data.length > 0 ? data[0] : null;
        } else {
          // Try to find by name if no external ID
          const { data } = await supabase
            .from('golfers')
            .select('id')
            .eq('name', golfer.name);
            
          existingGolfer = data && data.length > 0 ? data[0] : null;
        }
        
        // Prepare golfer data for upsert - only store persistent golfer data
        const golferData = {
          name: golfer.name,
          avatar_url: golfer.avatarUrl || null,
          external_id: golfer.externalId || null,
          external_system: golfer.externalSystem || null,
          updated_at: new Date().toISOString()
        };
        
        // Update or insert golfer
        if (existingGolfer) {
          // Update existing golfer
          const { error } = await supabase
            .from('golfers')
            .update(golferData)
            .eq('id', existingGolfer.id);
          
          if (error) throw error;
          results.updated++;
          golferId = existingGolfer.id;
        } else {
          // Insert new golfer
          const { data, error } = await supabase
            .from('golfers')
            .insert({
              ...golferData,
              created_at: new Date().toISOString()
            })
            .select('id');
          
          if (error) throw error;
          results.created++;
          golferId = data && data.length > 0 ? data[0].id : null;
        }
        
        // Now handle tournament-specific data in tournament_golfers table
        if (golferId) {
          // Check if tournament-golfer relationship exists
          const { data: existingRelation } = await supabase
            .from('tournament_golfers')
            .select('id')
            .eq('tournament_id', tournamentId)
            .eq('golfer_id', golferId);
          
          const tournamentGolferData = {
            tournament_id: tournamentId,
            golfer_id: golferId,
            tournament_rank: golfer.rank || null,
            odds: golfer.odds ? parseFloat(golfer.odds) : null,
            status: 'active', // Default to active for new golfers
            updated_at: new Date().toISOString()
          };
          
          if (existingRelation && existingRelation.length > 0) {
            // Update existing relationship
            const { error } = await supabase
              .from('tournament_golfers')
              .update(tournamentGolferData)
              .eq('id', existingRelation[0].id);
            
            if (error) throw error;
            results.tournament_relations_updated++;
          } else {
            // Create new relationship
            const { error } = await supabase
              .from('tournament_golfers')
              .insert({
                ...tournamentGolferData,
                created_at: new Date().toISOString()
              });
            
            if (error) throw error;
            results.tournament_relations_created++;
          }
        }
      } catch (error) {
        console.error(`Error syncing golfer ${golfer.name}:`, error);
        results.errors++;
      }
    }
    
    // Return results
    return NextResponse.json({
      success: true,
      message: `Synced ${results.total} golfers: ${results.created} created, ${results.updated} updated, ${results.tournament_relations_created} tournament relationships created, ${results.tournament_relations_updated} tournament relationships updated, ${results.errors} errors`,
      results
    });
    
  } catch (error) {
    console.error('Error syncing golfers:', error);
    return NextResponse.json(
      { error: 'Failed to sync golfers', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * This can also be triggered via POST with parameters in the body
 */
export async function POST(request: NextRequest) {
  try {
    // Extract parameters from request body
    const body = await request.json();
    const { tournamentId, year, apiKey } = body;
    
    // Build a new request with query parameters
    const url = new URL(request.url);
    if (tournamentId) url.searchParams.set('tournamentId', tournamentId);
    if (year) url.searchParams.set('year', year);
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