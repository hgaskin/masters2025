/**
 * Test script for Golf API integration
 * 
 * This script tests both SportradarProvider and SlashGolfProvider
 * Usage: bun run scripts/test-golf-api.ts
 */

import * as dotenv from 'dotenv';
import { GolfAPIService } from '@/lib/golf-api/api-service';
import { SlashGolfProvider } from '@/lib/golf-api/slashgolf-provider';
import { SportradarProvider } from '@/lib/golf-api/sportradar-provider';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testGolfAPI() {
  console.log('🏌️‍♂️ Testing Golf API Integration');
  console.log('--------------------------------');
  
  // Test each provider individually
  await testProvider('SlashGolf', process.env.SLASHGOLF_API_KEY);
  await testProvider('Sportradar', process.env.SPORTRADAR_API_KEY);
  
  // Test combined service
  await testGolfAPIService();
}

async function testProvider(providerName: string, apiKey?: string) {
  if (!apiKey) {
    console.log(`⚠️ Skipping ${providerName} provider: No API key found`);
    return;
  }
  
  console.log(`\n🧪 Testing ${providerName} provider`);
  
  try {
    // Initialize provider
    const provider = providerName === 'SlashGolf'
      ? new SlashGolfProvider(apiKey)
      : new SportradarProvider(apiKey);
    
    // Check health
    console.log('  - Testing health check...');
    const health = await provider.checkHealth();
    console.log(`  ✅ Health check ${health ? 'passed' : 'failed'}`);
    
    if (!health) return;
    
    // Test tournament schedule
    const currentYear = new Date().getFullYear().toString();
    console.log(`  - Testing tournament schedule for ${currentYear}...`);
    const schedule = await provider.getTournamentSchedule(currentYear);
    console.log(`  ✅ Retrieved ${schedule.tournaments.length} tournaments`);
    
    // Get a sample tournament
    if (schedule.tournaments.length > 0) {
      const tournament = schedule.tournaments[0];
      console.log(`  - Testing tournament details for ${tournament.id}...`);
      
      // Test tournament details
      const details = await provider.getTournamentDetails(tournament.id, currentYear);
      console.log(`  ✅ Retrieved details for ${details.name}`);
      
      // Test golfers list
      console.log(`  - Testing golfer list for ${tournament.id}...`);
      const golfers = await provider.getGolferList(tournament.id, currentYear);
      console.log(`  ✅ Retrieved ${golfers.length} golfers`);
      
      // Test leaderboard
      console.log(`  - Testing leaderboard for ${tournament.id}...`);
      const leaderboard = await provider.getLeaderboard(tournament.id, currentYear);
      console.log(`  ✅ Retrieved leaderboard with ${leaderboard.players.length} players`);
      
      // Test golfer details if we have golfers
      if (golfers.length > 0) {
        console.log(`  - Testing golfer details for ${golfers[0].id}...`);
        const golfer = await provider.getGolferDetails(golfers[0].id);
        console.log(`  ✅ Retrieved details for ${golfer.name}`);
      }
    }
    
  } catch (error) {
    console.error(`  ❌ Error testing ${providerName} provider:`, error);
  }
}

async function testGolfAPIService() {
  console.log('\n🧪 Testing GolfAPIService with fallback');
  
  try {
    // Initialize service
    const golfAPIService = new GolfAPIService();
    
    // Check providers health
    console.log('  - Testing providers health...');
    const health = await golfAPIService.checkProvidersHealth();
    console.log('  ✅ Health check results:', health);
    
    // Test tournament schedule
    const currentYear = new Date().getFullYear().toString();
    console.log(`  - Testing tournament schedule for ${currentYear}...`);
    const schedule = await golfAPIService.getTournamentSchedule(currentYear);
    console.log(`  ✅ Retrieved ${schedule.tournaments.length} tournaments`);
    
    // Get a sample tournament
    if (schedule.tournaments.length > 0) {
      const tournament = schedule.tournaments[0];
      console.log(`  - Testing tournament details for ${tournament.id}...`);
      
      // Test tournament details
      const details = await golfAPIService.getTournamentDetails(tournament.id, currentYear);
      console.log(`  ✅ Retrieved details for ${details.name}`);
      
      // Test golfers list
      console.log(`  - Testing golfer list for ${tournament.id}...`);
      const golfers = await golfAPIService.getGolferList(tournament.id, currentYear);
      console.log(`  ✅ Retrieved ${golfers.length} golfers`);
      
      // Test leaderboard
      console.log(`  - Testing leaderboard for ${tournament.id}...`);
      const leaderboard = await golfAPIService.getLeaderboard(tournament.id, currentYear);
      console.log(`  ✅ Retrieved leaderboard with ${leaderboard.players.length} players`);
    }
    
  } catch (error) {
    console.error('  ❌ Error testing GolfAPIService:', error);
  }
}

// Run the tests
testGolfAPI().catch(console.error); 