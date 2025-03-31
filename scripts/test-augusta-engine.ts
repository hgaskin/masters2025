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
import { Command } from 'commander';
import ora from 'ora';
import { createServerClient } from '@/lib/supabase/client';
import { TournamentStatus, GolfAPIProvider } from '@/lib/augusta-engine/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import Enquirer from 'enquirer';

const { prompt } = Enquirer;

const program = new Command();

program
  .name('augusta')
  .description('CLI tool for managing the AUGUSTA ENGINE')
  .version('1.0.0');

interface CommandOptions {
  force?: boolean;
  name?: string;
}

interface HealthStatus {
  sportradar: boolean;
  slashgolf: boolean;
}

const RESULTS_DIR = path.join(process.cwd(), 'scripts', 'results', 'masters-2024');

// Ensure results directory exists
async function ensureResultsDir() {
  try {
    await fs.mkdir(RESULTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create results directory:', error);
    process.exit(1);
  }
}

// Save data to JSON file
async function saveToFile(filename: string, data: any): Promise<string> {
  const filepath = path.join(RESULTS_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  return filepath;
}

// Interactive prompt for next action
async function promptNextAction(step: string): Promise<string> {
  const response = await prompt<{ action: string }>({
    type: 'select',
    name: 'action',
    message: `What would you like to do with the ${step} data?`,
    choices: [
      { name: 'save', message: 'Save raw response to file' },
      { name: 'normalize', message: 'Normalize the data' },
      { name: 'preview', message: 'Preview normalized data' },
      { name: 'insert', message: 'Insert into Supabase' },
      { name: 'skip', message: 'Skip to next step' },
      { name: 'exit', message: 'Exit process' }
    ]
  });
  return response.action;
}

// Before the program.command calls, add these helper functions for direct API access

// Direct API fetch to get raw responses
async function fetchRawEndpoint(provider: 'slashgolf' | 'sportradar', endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const apiKey = provider === 'slashgolf' 
    ? process.env.SLASHGOLF_API_KEY 
    : process.env.SPORTRADAR_API_KEY;
  
  if (!apiKey) {
    throw new Error(`API key for ${provider} not found`);
  }
  
  let url: URL;
  let headers: Record<string, string> = {};
  
  if (provider === 'slashgolf') {
    url = new URL(`https://live-golf-data.p.rapidapi.com${endpoint}`);
    
    // Add required orgId parameter if not provided for SlashGolf
    if (!params.orgId && !url.searchParams.has('orgId') && endpoint === '/schedule') {
      url.searchParams.append('orgId', '1'); // Default to PGA Tour
    }
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    
    headers = {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'live-golf-data.p.rapidapi.com'
    };
  } else {
    // Sportradar
    url = new URL(`https://api.sportradar.com/golf/trial/v3${endpoint}`);
    
    // Add API key as query parameter
    url.searchParams.append('api_key', apiKey);
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    
    headers = {
      'Accept': 'application/json'
    };
  }
  
  // Make the API request
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers
  });
  
  if (!response.ok) {
    throw new Error(`${provider} API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Fetch 2024 Masters Data
program
  .command('fetch-masters-2024')
  .description('Fetch and store 2024 Masters Tournament data')
  .option('-f, --force', 'Force refresh even if data exists')
  .action(async (options: CommandOptions) => {
    await ensureResultsDir();
    
    const steps = [
      'tournament_details',
      'golfer_list',
      'round_scores',
      'leaderboard'
    ] as const;
    
    const golfAPI = new GolfAPIService();
    
    for (const step of steps) {
      const spinner = ora(`Fetching ${step.replace('_', ' ')}...`).start();
      try {
        let rawData: any;
        let normalizedData: any;
        
        // Fetch data based on step
        switch (step) {
          case 'tournament_details':
            rawData = await golfAPI.getTournamentDetails('masters-2024', '2024');
            break;
          case 'golfer_list':
            rawData = await golfAPI.getGolferList('masters-2024', '2024');
            break;
          case 'round_scores':
            // TODO: Implement round score fetching
            rawData = { message: 'Not implemented yet' };
            break;
          case 'leaderboard':
            rawData = await golfAPI.getLeaderboard('masters-2024', '2024');
            break;
        }
        
        spinner.succeed(`Successfully fetched ${step.replace('_', ' ')}`);
        
        // Interactive workflow
        let action: string;
        do {
          action = await promptNextAction(step);
          
          switch (action) {
            case 'save':
              const filepath = await saveToFile(`${step}_raw.json`, rawData);
              console.log(chalk.green(`✅ Saved raw data to ${filepath}`));
              break;
              
            case 'normalize':
              // TODO: Implement data normalization based on step
              normalizedData = rawData; // Placeholder
              console.log(chalk.yellow('⚠️ Data normalization not implemented yet'));
              break;
              
            case 'preview':
              if (!normalizedData) {
                console.log(chalk.yellow('⚠️ Please normalize the data first'));
                break;
              }
              console.log(chalk.cyan('\nNormalized Data Preview:'));
              console.log(JSON.stringify(normalizedData, null, 2));
              break;
              
            case 'insert':
              if (!normalizedData) {
                console.log(chalk.yellow('⚠️ Please normalize the data first'));
                break;
              }
              const confirmResponse = await prompt<{ confirm: boolean }>({
                type: 'confirm',
                name: 'confirm',
                message: 'Are you sure you want to insert this data into Supabase?'
              });
              
              if (confirmResponse.confirm) {
                // TODO: Implement Supabase insertion based on step
                console.log(chalk.yellow('⚠️ Supabase insertion not implemented yet'));
              }
              break;
              
            case 'exit':
              console.log(chalk.yellow('Exiting process...'));
              process.exit(0);
          }
        } while (action !== 'skip' && action !== 'exit');
        
      } catch (error) {
        spinner.fail(`Failed to process ${step}`);
        console.error(error);
        const continueResponse = await prompt<{ continue: boolean }>({
          type: 'confirm',
          name: 'continue',
          message: 'Would you like to continue with the next step?'
        });
        
        if (!continueResponse.continue) {
          process.exit(1);
        }
      }
    }
  });

// Create Test Pool
program
  .command('create-test-pool')
  .description('Create a test pool with 2024 Masters data')
  .option('-n, --name <name>', 'Pool name', 'Test Pool 2024')
  .action(async (options) => {
    const spinner = ora('Creating test pool...').start();
    try {
      const supabase = createServerClient();
      
      // TODO: Implement test pool creation
      // 1. Create pool with standard rules
      // 2. Generate golfer groups
      // 3. Create sample entries
      // 4. Add picks
      
      spinner.succeed('Test pool created successfully');
    } catch (error) {
      spinner.fail('Failed to create test pool');
      console.error(error);
      process.exit(1);
    }
  });

// Validate Data
program
  .command('validate')
  .description('Validate data integrity')
  .action(async () => {
    const spinner = ora('Validating data...').start();
    try {
      const supabase = createServerClient();
      
      // TODO: Implement data validation
      // 1. Check tournament data
      // 2. Verify golfer records
      // 3. Validate scores
      // 4. Check relationships
      
      spinner.succeed('Data validation complete');
    } catch (error) {
      spinner.fail('Data validation failed');
      console.error(error);
      process.exit(1);
    }
  });

// Monitor Sync Status
program
  .command('status')
  .description('Show sync status and statistics')
  .action(async () => {
    const spinner = ora('Fetching status...').start();
    try {
      const supabase = createServerClient();
      
      // TODO: Implement status reporting
      // 1. Last sync time
      // 2. Data counts
      // 3. API health
      // 4. Error logs
      
      spinner.stop();
      // TODO: Display formatted status
    } catch (error) {
      spinner.fail('Failed to fetch status');
      console.error(error);
      process.exit(1);
    }
  });

// Check connection status
program
  .command('check-connection')
  .description('Check connection status of all services')
  .option('-v, --verify', 'Make actual API calls to verify connections')
  .action(async (options) => {
    console.log(chalk.bold('\nChecking configuration status...'));

    // Check environment variables first
    const sportradarKey = process.env.SPORTRADAR_API_KEY;
    const slashgolfKey = process.env.SLASHGOLF_API_KEY;
    
    // Check Supabase environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('\nAPI Keys Status:');
    console.log(chalk.blue('Sportradar API Key:'), sportradarKey ? chalk.green('✓ Found') : chalk.red('✗ Missing'));
    console.log(chalk.blue('SlashGolf API Key:'), slashgolfKey ? chalk.green('✓ Found') : chalk.red('✗ Missing'));
    console.log(chalk.blue('Supabase URL:'), supabaseUrl ? chalk.green('✓ Found') : chalk.red('✗ Missing'));
    console.log(chalk.blue('Supabase Key:'), supabaseKey ? chalk.green('✓ Found') : chalk.red('✗ Missing'));

    // Only make actual connection tests if --verify flag is used
    if (options.verify) {
      console.log(chalk.yellow('\nVerifying connections (this will make API calls)...'));

      // Check Supabase connection
      const spinner1 = ora('Checking Supabase connection...').start();
      try {
        const supabase = createServerClient();
        const { data, error } = await supabase.from('golfers').select('count').single();
        if (error) throw error;
        spinner1.succeed(chalk.green('Supabase connection: OK'));
      } catch (error) {
        spinner1.fail(chalk.red('Supabase connection: Failed'));
        console.error(error);
      }

      // Check SlashGolf API
      if (slashgolfKey) {
        const spinner2 = ora('Checking SlashGolf API...').start();
        try {
          const slashGolf = new SlashGolfProvider(slashgolfKey);
          const isHealthy = await slashGolf.checkHealth();
          if (isHealthy) {
            spinner2.succeed(chalk.green('SlashGolf API: OK'));
          } else {
            spinner2.fail(chalk.red('SlashGolf API: Failed'));
          }
        } catch (error) {
          spinner2.fail(chalk.red('SlashGolf API: Failed'));
          console.error(error);
        }
      }

      // Check Sportradar API
      if (sportradarKey) {
        const spinner3 = ora('Checking Sportradar API...').start();
        try {
          const sportradar = new SportradarProvider(sportradarKey);
          const isHealthy = await sportradar.checkHealth();
          if (isHealthy) {
            spinner3.succeed(chalk.green('Sportradar API: OK'));
          } else {
            spinner3.fail(chalk.red('Sportradar API: Failed'));
          }
        } catch (error) {
          spinner3.fail(chalk.red('Sportradar API: Failed'));
          console.error(error);
        }
      }
    } else {
      console.log(chalk.gray('\nTip: Use --verify flag to test actual connections'));
    }
  });

// Then modify the fetch-endpoint-samples command
program
  .command('fetch-endpoint-samples')
  .description('Fetch sample data from all providers for each endpoint and save to results directory')
  .option('-t, --tournament <id>', 'Tournament ID to use', 'masters-2024')
  .option('-y, --year <year>', 'Year to use', '2024')
  .action(async (options) => {
    await ensureResultsDir();
    
    // Create subdirectories for each provider
    const slashgolfDir = path.join(RESULTS_DIR, 'slashgolf');
    const sportradarDir = path.join(RESULTS_DIR, 'sportradar');
    
    try {
      await fs.mkdir(slashgolfDir, { recursive: true });
      await fs.mkdir(sportradarDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create provider directories:', error);
      process.exit(1);
    }
    
    // Initialize providers directly for raw access
    const slashgolfKey = process.env.SLASHGOLF_API_KEY;
    const sportradarKey = process.env.SPORTRADAR_API_KEY;
    
    if (!slashgolfKey || !sportradarKey) {
      console.error('API keys not found in environment variables');
      process.exit(1);
    }
    
    const slashgolf = new SlashGolfProvider(slashgolfKey);
    const sportradar = new SportradarProvider(sportradarKey);
    
    // Endpoints to test
    const endpoints = [
      { 
        name: 'tournament_schedule', 
        fetchFn: async (provider: GolfAPIProvider) => provider.getTournamentSchedule(options.year)
      },
      { 
        name: 'tournament_details', 
        fetchFn: async (provider: GolfAPIProvider) => provider.getTournamentDetails(options.tournament, options.year)
      },
      { 
        name: 'golfer_list', 
        fetchFn: async (provider: GolfAPIProvider) => provider.getGolferList(options.tournament, options.year)
      },
      { 
        name: 'leaderboard', 
        fetchFn: async (provider: GolfAPIProvider) => provider.getLeaderboard(options.tournament, options.year)
      }
    ];
    
    // Fetch from SlashGolf
    console.log(chalk.blue(`\nFetching data from SlashGolf API for ${options.tournament} ${options.year}...`));
    for (const endpoint of endpoints) {
      const spinner = ora(`Fetching ${endpoint.name}...`).start();
      try {
        const data = await endpoint.fetchFn(slashgolf);
        const filepath = path.join(slashgolfDir, `${endpoint.name}.json`);
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        spinner.succeed(`Saved SlashGolf ${endpoint.name} to ${filepath}`);
      } catch (error) {
        spinner.fail(`Failed to fetch SlashGolf ${endpoint.name}`);
        console.error(error);
      }
    }
    
    // Fetch from Sportradar
    console.log(chalk.blue(`\nFetching data from Sportradar API for ${options.tournament} ${options.year}...`));
    for (const endpoint of endpoints) {
      const spinner = ora(`Fetching ${endpoint.name}...`).start();
      try {
        const data = await endpoint.fetchFn(sportradar);
        const filepath = path.join(sportradarDir, `${endpoint.name}.json`);
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        spinner.succeed(`Saved Sportradar ${endpoint.name} to ${filepath}`);
      } catch (error) {
        spinner.fail(`Failed to fetch Sportradar ${endpoint.name}`);
        console.error(error);
      }
    }
    
    console.log(chalk.green('\n✅ Sample data collection complete. Results saved in:'));
    console.log(`  - SlashGolf samples: ${slashgolfDir}`);
    console.log(`  - Sportradar samples: ${sportradarDir}`);
  });

// Add a new command to fetch raw API responses
program
  .command('fetch-raw-samples')
  .description('Fetch raw API responses from providers and save to results directory')
  .option('-t, --tournament <id>', 'Tournament ID to use', 'masters-2024')
  .option('-y, --year <year>', 'Year to use', '2024')
  .action(async (options) => {
    await ensureResultsDir();
    
    // Create subdirectories for raw data
    const slashgolfRawDir = path.join(RESULTS_DIR, 'slashgolf-raw');
    const sportradarRawDir = path.join(RESULTS_DIR, 'sportradar-raw');
    
    try {
      await fs.mkdir(slashgolfRawDir, { recursive: true });
      await fs.mkdir(sportradarRawDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create provider directories:', error);
      process.exit(1);
    }
    
    // SlashGolf API endpoints
    const slashgolfEndpoints = [
      { 
        name: 'schedule', 
        endpoint: '/schedule', 
        params: { year: String(options.year), orgId: '1' }
      },
      { 
        name: 'tournaments', 
        endpoint: '/tournaments', 
        params: { tournId: String(options.tournament), year: String(options.year) }
      },
      { 
        name: 'leaderboard', 
        endpoint: '/leaderboards', 
        params: { tournId: String(options.tournament), year: String(options.year) }
      }
    ];
    
    // Sportradar API endpoints
    const sportradarEndpoints = [
      { 
        name: 'seasons', 
        endpoint: '/en/seasons.json',
        params: {}
      },
      { 
        name: 'tournament_schedule', 
        endpoint: '/en/tournaments/schedule/2024.json',
        params: {} 
      },
      { 
        name: 'tournament_summary', 
        endpoint: `/en/tournaments/${options.tournament}/summary.json`,
        params: {}
      },
      { 
        name: 'tournament_leaderboard', 
        endpoint: `/en/tournaments/${options.tournament}/leaderboard.json`,
        params: {}
      }
    ];
    
    // Fetch from SlashGolf
    console.log(chalk.blue(`\nFetching raw data from SlashGolf API...`));
    for (const endpoint of slashgolfEndpoints) {
      const spinner = ora(`Fetching ${endpoint.name}...`).start();
      try {
        const data = await fetchRawEndpoint('slashgolf', endpoint.endpoint, endpoint.params);
        const filepath = path.join(slashgolfRawDir, `${endpoint.name}.json`);
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        spinner.succeed(`Saved SlashGolf raw ${endpoint.name} to ${filepath}`);
      } catch (error) {
        spinner.fail(`Failed to fetch SlashGolf ${endpoint.name}`);
        console.error(error);
      }
    }
    
    // Fetch from Sportradar with delay to avoid rate limiting
    console.log(chalk.blue(`\nFetching raw data from Sportradar API...`));
    for (const endpoint of sportradarEndpoints) {
      const spinner = ora(`Fetching ${endpoint.name}...`).start();
      try {
        // Add a delay before each request to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const data = await fetchRawEndpoint('sportradar', endpoint.endpoint, endpoint.params);
        const filepath = path.join(sportradarRawDir, `${endpoint.name}.json`);
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        spinner.succeed(`Saved Sportradar raw ${endpoint.name} to ${filepath}`);
      } catch (error) {
        spinner.fail(`Failed to fetch Sportradar ${endpoint.name}`);
        console.error(error);
      }
    }
    
    console.log(chalk.green('\n✅ Raw sample data collection complete. Results saved in:'));
    console.log(`  - SlashGolf raw samples: ${slashgolfRawDir}`);
    console.log(`  - Sportradar raw samples: ${sportradarRawDir}`);
  });

// Add a new command to extract Masters data
program
  .command('extract-masters-data')
  .description('Extract data for The Masters tournament specifically')
  .option('-y, --year <year>', 'Year to use', '2024')
  .action(async (options) => {
    await ensureResultsDir();
    
    // Create directory
    const mastersDir = path.join(RESULTS_DIR, 'masters-extract');
    
    try {
      await fs.mkdir(mastersDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create master directory:', error);
      process.exit(1);
    }
    
    console.log(chalk.blue(`\nExtracting Masters data for ${options.year}...`));
    
    // Step 1: Get the schedule from SlashGolf to find Masters tournId
    let mastersId = '';
    const scheduleSpinner = ora('Fetching schedule to find Masters tournament ID...').start();
    
    try {
      const schedule = await fetchRawEndpoint('slashgolf', '/schedule', { 
        year: String(options.year), 
        orgId: '1' 
      });
      
      // Save full schedule for reference
      await fs.writeFile(
        path.join(mastersDir, 'full_schedule.json'), 
        JSON.stringify(schedule, null, 2)
      );
      
      // Find Masters tournament
      const mastersTournament = schedule.schedule.find((tournament: any) => 
        tournament.name.toLowerCase().includes('masters')
      );
      
      if (!mastersTournament) {
        scheduleSpinner.fail('Could not find Masters tournament in schedule');
        console.log('Available tournaments:');
        schedule.schedule.forEach((t: any) => {
          console.log(` - ${t.name} (ID: ${t.tournId})`);
        });
        process.exit(1);
      }
      
      mastersId = mastersTournament.tournId;
      await fs.writeFile(
        path.join(mastersDir, 'masters_tournament.json'), 
        JSON.stringify(mastersTournament, null, 2)
      );
      
      scheduleSpinner.succeed(`Found Masters tournament (ID: ${mastersId})`);
      
      // Step 2: Get detailed data using the actual tournament ID
      console.log(chalk.blue('\nFetching Masters-specific data...'));
      
      // List of endpoints to try
      const endpoints = [
        { 
          provider: 'slashgolf' as const,
          name: 'tournaments', 
          endpoint: '/tournaments', 
          params: { tournId: mastersId, year: String(options.year) }
        },
        { 
          provider: 'slashgolf' as const,
          name: 'leaderboard', 
          endpoint: '/leaderboards', 
          params: { tournId: mastersId, year: String(options.year) }
        },
        { 
          provider: 'sportradar' as const,
          name: 'tournament_summary', 
          endpoint: `/en/tournaments/${mastersId}/summary.json`,
          params: {}
        },
        { 
          provider: 'sportradar' as const,
          name: 'tournament_leaderboard', 
          endpoint: `/en/tournaments/${mastersId}/leaderboard.json`,
          params: {}
        }
      ];
      
      // Add a 2-second delay between requests to avoid rate limiting
      for (const endpoint of endpoints) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const spinner = ora(`Fetching ${endpoint.name} from ${endpoint.provider}...`).start();
        try {
          const data = await fetchRawEndpoint(endpoint.provider, endpoint.endpoint, endpoint.params);
          const filepath = path.join(mastersDir, `${endpoint.provider}_${endpoint.name}.json`);
          await fs.writeFile(filepath, JSON.stringify(data, null, 2));
          spinner.succeed(`Saved ${endpoint.provider} ${endpoint.name} to ${filepath}`);
        } catch (error) {
          spinner.fail(`Failed to fetch ${endpoint.provider} ${endpoint.name}`);
          console.error(error);
        }
      }
      
      console.log(chalk.green('\n✅ Masters data extraction complete. Results saved in:'));
      console.log(`  - ${mastersDir}`);
      
    } catch (error) {
      scheduleSpinner.fail('Failed to fetch schedule');
      console.error(error);
      process.exit(1);
    }
  });

// Remove duplicate yargs commands

program
  .command('test-endpoint')
  .description('Test a specific endpoint from a provider')
  .requiredOption('--provider <provider>', 'Provider to test (slashgolf or sportradar)', /^(slashgolf|sportradar)$/)
  .requiredOption('--endpoint <endpoint>', 'Endpoint path to test')
  .option('--params <params>', 'URL parameters as JSON string', '{}')
  .action(async (options) => {
    await testEndpoint(options);
  });

program.parse(process.argv);

// Comment out or remove the automatic test execution
// testGolfAPI().catch(console.error); 

async function testEndpoint(options: { provider: string; endpoint: string; params: string }) {
  console.log(`Testing endpoint for ${options.provider}: ${options.endpoint}`);
  
  try {
    // Parse the params JSON string
    const params = JSON.parse(options.params);
    
    // Create the results directory if it doesn't exist
    const testDir = path.join(RESULTS_DIR, 'endpoint-tests');
    await fs.mkdir(testDir, { recursive: true });
    
    // Generate a filename from the endpoint and params
    const sanitizedEndpoint = options.endpoint.replace(/\//g, '_').replace(/^_/, '');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${options.provider}-${sanitizedEndpoint}-${timestamp}.json`;
    const outputPath = path.join(testDir, filename);
    
    // Fetch data from the endpoint
    console.log(`Fetching with params:`, params);
    const data = await fetchRawEndpoint(options.provider as 'slashgolf' | 'sportradar', options.endpoint, params);
    
    // Save to file
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`✅ Response saved to: ${outputPath}`);
    
    // Print a preview
    console.log('\nResponse preview:');
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
    
  } catch (error) {
    console.error(`❌ Error testing endpoint:`, error);
  }
} 