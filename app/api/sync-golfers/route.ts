/**
 * API Route for Syncing Golfers to Supabase
 * 
 * This endpoint fetches golfer data from golf APIs and synchronizes it with Supabase.
 * It can be triggered manually or by a scheduled job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr/server';
import { cookies } from 'next/headers';
import { GolfAPIService } from '@/lib/golf-api/api-service';
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
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Fetch golfers from the API
    const golfers = await golfAPIService.getGolferList(tournamentId, year);
    
    // Track results
    const results = {
      total: golfers.length,
      created: 0,
      updated: 0,
      errors: 0
    };
    
    // Process each golfer
    for (const golfer of golfers) {
      try {
        // Check if golfer already exists by external ID
        const { data: existingGolfers } = await supabase
          .from('golfers')
          .select('id, external_id')
          .eq('external_id', golfer.externalId)
          .eq('external_system', golfer.externalSystem);
        
        // Prepare golfer data for upsert
        const golferData = {
          name: golfer.name,
          rank: golfer.rank || null,
          odds: golfer.odds ? parseFloat(golfer.odds) : null,
          avatar_url: golfer.avatarUrl || null,
          external_id: golfer.externalId,
          external_system: golfer.externalSystem,
          updated_at: new Date().toISOString()
        };
        
        // Update or insert
        if (existingGolfers && existingGolfers.length > 0) {
          // Update existing golfer
          const { error } = await supabase
            .from('golfers')
            .update(golferData)
            .eq('id', existingGolfers[0].id);
          
          if (error) throw error;
          results.updated++;
        } else {
          // Insert new golfer
          const { error } = await supabase
            .from('golfers')
            .insert({
              ...golferData,
              created_at: new Date().toISOString()
            });
          
          if (error) throw error;
          results.created++;
        }
      } catch (error) {
        console.error(`Error syncing golfer ${golfer.name}:`, error);
        results.errors++;
      }
    }
    
    // Return results
    return NextResponse.json({
      success: true,
      message: `Synced ${results.total} golfers: ${results.created} created, ${results.updated} updated, ${results.errors} errors`,
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