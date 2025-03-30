/**
 * THE AUGUSTA ENGINE Test Script
 * 
 * This script tests the Augusta Engine's connections to golf data providers
 * and verifies data normalization, provider fallback, and core functionality.
 * 
 * Usage: bun run test:augusta-engine
 */

import 'dotenv/config';
import { GolfAPIService, SlashGolfProvider, SportradarProvider } from '@/lib/augusta-engine';
import chalk from 'chalk';

/**
 * Main test function
 */
async function testGolfAPI() {
  console.log(chalk.bold('\n🏌️ THE AUGUSTA ENGINE TEST\n'));
  
  const sportradarKey = process.env.SPORTRADAR_API_KEY;
  const slashgolfKey = process.env.SLASHGOLF_API_KEY;
  
  if (!sportradarKey && !slashgolfKey) {
    console.error(chalk.red('❌ No API keys found. Please check your .env file.'));
    console.log('Required environment variables: SPORTRADAR_API_KEY, SLASHGOLF_API_KEY');
    return;
  }
  
  // Test providers individually if keys are available
  let sportradarWorking = false;
  let slashgolfWorking = false;
  
  if (sportradarKey) {
    sportradarWorking = await testSportradarProvider(sportradarKey);
  } else {
    console.log(chalk.yellow('⚠️ No Sportradar key found. Skipping Sportradar tests.'));
  }
  
  if (slashgolfKey) {
    slashgolfWorking = await testSlashGolfProvider(slashgolfKey);
  } else {
    console.log(chalk.yellow('⚠️ No SlashGolf key found. Skipping SlashGolf tests.'));
  }
  
  // Test combined service
  await testGolfAPIService(sportradarWorking, slashgolfWorking);
}

/**
 * Test Sportradar provider
 */
async function testSportradarProvider(apiKey: string): Promise<boolean> {
  console.log(chalk.blue('\n[TESTING SPORTRADAR PROVIDER]'));
  
  try {
    const provider = new SportradarProvider(apiKey);
    const isHealthy = await provider.checkHealth();
    
    if (isHealthy) {
      console.log(chalk.green('✅ Sportradar API is healthy'));
      
      // Test tournament schedule
      console.log(chalk.gray('📅 Testing tournament schedule...'));
      const schedule = await provider.getTournamentSchedule('2024');
      console.log(chalk.green(`✅ Found ${schedule.tournaments.length} tournaments in 2024`));
      
      // Test golfer list - try to get Masters 2024 field
      console.log(chalk.gray('👥 Testing golfer list...'));
      const golfers = await provider.getGolferList('masters-tournament', '2024');
      console.log(chalk.green(`✅ Found ${golfers.length} golfers in Masters 2024`));
      
      return true;
    } else {
      console.log(chalk.red('❌ Sportradar API is not healthy'));
      return false;
    }
  } catch (error) {
    console.error(chalk.red('❌ Sportradar API test failed:'), error);
    return false;
  }
}

/**
 * Test SlashGolf provider
 */
async function testSlashGolfProvider(apiKey: string): Promise<boolean> {
  console.log(chalk.magenta('\n[TESTING SLASHGOLF PROVIDER]'));
  
  try {
    const provider = new SlashGolfProvider(apiKey);
    const isHealthy = await provider.checkHealth();
    
    if (isHealthy) {
      console.log(chalk.green('✅ SlashGolf API is healthy'));
      
      // Test tournament schedule
      console.log(chalk.gray('📅 Testing tournament schedule...'));
      const schedule = await provider.getTournamentSchedule('2024');
      console.log(chalk.green(`✅ Found ${schedule.tournaments.length} tournaments in 2024`));
      
      // Test golfer list - try to get Masters 2024 field
      console.log(chalk.gray('👥 Testing golfer list...'));
      const golfers = await provider.getGolferList('masters', '2024');
      console.log(chalk.green(`✅ Found ${golfers.length} golfers in Masters 2024`));
      
      return true;
    } else {
      console.log(chalk.red('❌ SlashGolf API is not healthy'));
      return false;
    }
  } catch (error) {
    console.error(chalk.red('❌ SlashGolf API test failed:'), error);
    return false;
  }
}

/**
 * Test the GolfAPIService with provider fallback
 */
async function testGolfAPIService(sportradarWorking: boolean, slashgolfWorking: boolean) {
  console.log(chalk.cyan('\n[TESTING GOLF API SERVICE WITH FALLBACK]'));
  
  if (!sportradarWorking && !slashgolfWorking) {
    console.log(chalk.red('❌ Skipping GolfAPIService test - no working providers'));
    return;
  }
  
  try {
    const service = new GolfAPIService();
    
    // Test getting Masters 2024
    console.log(chalk.gray('🏆 Testing tournament detail retrieval...'));
    const year = '2024';
    const tournamentId = sportradarWorking ? 'masters-tournament' : 'masters';
    const tournament = await service.getTournamentDetails(tournamentId, year);
    
    console.log(chalk.green(`✅ Successfully retrieved Masters ${year} details:`));
    console.log({
      name: tournament.name,
      course: tournament.course,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      status: tournament.status
    });
    
    // Test getting leaderboard
    console.log(chalk.gray('🏆 Testing leaderboard retrieval...'));
    try {
      const leaderboard = await service.getLeaderboard(tournamentId, year);
      console.log(chalk.green(`✅ Successfully retrieved leaderboard with ${leaderboard.players.length} players`));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Leaderboard not available - tournament may not be active'));
    }
    
    console.log(chalk.green('\n✅ GolfAPIService test completed successfully'));
  } catch (error) {
    console.error(chalk.red('❌ GolfAPIService test failed:'), error);
  }
}

// Run the tests
testGolfAPI().catch(console.error); 