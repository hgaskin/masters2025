/**
 * Augusta Engine API Status Endpoint
 * 
 * This endpoint provides status information about the Augusta Engine
 * and its connected data providers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GolfAPIService } from '@/lib/augusta-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check API key if configured
  const searchParams = request.nextUrl.searchParams;
  const apiKey = searchParams.get('apiKey');
  
  const requiredApiKey = process.env.SYNC_API_KEY;
  if (requiredApiKey && apiKey !== requiredApiKey) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    );
  }
  
  try {
    // Initialize API service
    const golfAPIService = new GolfAPIService();
    
    // Get API providers
    const providers = Object.keys(process.env)
      .filter(key => key.includes('_API_KEY'))
      .map(key => key.replace('_API_KEY', '').toLowerCase());
    
    // Return Augusta Engine status
    return NextResponse.json({
      name: 'THE AUGUSTA ENGINE',
      status: 'operational',
      providers,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: [
        { path: '/api/augusta/sync-golfers', method: 'GET', description: 'Sync golfer data' },
        { path: '/api/augusta/sync-tournaments', method: 'GET', description: 'Sync tournament data' },
        { path: '/api/augusta/sync-leaderboard', method: 'GET', description: 'Sync leaderboard data' }
      ]
    });
  } catch (error) {
    console.error('Error getting Augusta Engine status:', error);
    return NextResponse.json(
      { error: 'Failed to get Augusta Engine status' },
      { status: 500 }
    );
  }
} 