# The AUGUSTA ENGINE: Golf API Integration

This module provides a unified interface for interacting with multiple golf data providers. The architecture uses an abstraction layer to ensure the application works consistently regardless of which API provider is used.

## Architecture

- **GolfAPIService**: Central service that manages multiple providers with fallback capabilities
- **GolfAPIProvider**: Interface that all providers must implement
- **Providers**: 
  - `SlashGolfProvider`: Implementation for SlashGolf API
  - `SportradarProvider`: Implementation for Sportradar Golf API
- **Data Normalization**: Each provider maps source-specific formats to our unified schema
- **Supabase Integration**: Normalized data is stored in Supabase for application use
- **Scheduled Updates**: Different data types are updated at different frequencies based on tournament status

## Features

- **Provider Fallback**: If one API fails, the system automatically tries the next provider
- **Caching**: API responses are cached to reduce redundant calls
- **Normalized Data**: All providers map their responses to a common data structure
- **Health Monitoring**: Providers track their health status
- **Error Handling**: Graceful handling of API failures with detailed logging
- **Update Frequency Management**: Different data types update at appropriate frequencies

## Project Structure

```
lib/
  augusta-engine/
    index.ts               # Main exports
    api-service.ts         # Main service with provider management and fallback
    types.ts               # Shared interfaces and normalized data structures
    slashgolf-provider.ts  # SlashGolf API implementation
    sportradar-provider.ts # Sportradar API implementation
    scheduled-updates.ts   # Update frequency management
    README.md              # Documentation

app/
  api/
    augusta/               # Augusta Engine API routes
      route.ts             # Status endpoint
      sync-golfers/        # Golfer data sync endpoint
      sync-tournaments/    # Tournament data sync endpoint
      sync-leaderboard/    # Leaderboard data sync endpoint
```

## Data Pipeline Flow

1. **External Golf APIs** (Sportradar, SlashGolf) provide raw data in provider-specific formats
2. **AUGUSTA ENGINE** normalizes and transforms this data into unified structures
3. **Sync Endpoints** (/api/augusta/sync-*) store this normalized data in Supabase
4. **Frontend Components** consume data from Supabase (not directly from APIs)

## Setup

1. Add your API keys to `.env.local`:
   ```
   SLASHGOLF_API_KEY=your_slashgolf_api_key_here
   SPORTRADAR_API_KEY=your_sportradar_api_key_here
   SYNC_API_KEY=your_custom_sync_protection_key
   ```

2. Import and use the service:
   ```typescript
   import { GolfAPIService } from '@/lib/augusta-engine';
   
   // Create the service
   const golfAPIService = new GolfAPIService();
   
   // Use the service
   const tournaments = await golfAPIService.getTournamentSchedule('2025');
   ```

## Testing

Run the test script to verify API connectivity:

```bash
bun run test:augusta-engine
```

This will test each provider individually and then test the combined service with fallback functionality.

## API Endpoints

The service provides the following methods:

- `getTournamentSchedule(year)`: Get tournament schedule for a specific year
- `getTournamentDetails(tournamentId, year)`: Get details for a specific tournament
- `getGolferList(tournamentId, year)`: Get list of golfers for a tournament
- `getGolferDetails(golferId)`: Get details for a specific golfer
- `getLeaderboard(tournamentId, year, round?)`: Get tournament leaderboard
- `checkHealth()`: Check if the providers are functioning correctly

## Normalized Data Types

The AUGUSTA ENGINE normalizes all provider-specific responses into these common structures:

- `NormalizedGolfer`: Player information (name, rank, country, etc.)
- `NormalizedLeaderboard`: Tournament standings with player scores
- `NormalizedLeaderboardEntry`: Individual player tournament performance
- `NormalizedTournament`: Tournament metadata
- `NormalizedSchedule`: Tournament schedule information

## Supabase Integration

The engine maps normalized data to Supabase tables:
- `golfers`: Player information
- `tournament_scores`: Round scores
- `tournaments`: Tournament details and status
- `leaderboards`: Tournament standings (planned)

## Data Sync Endpoints

Use these API routes to sync data from the APIs to Supabase:

```
GET /api/augusta/sync-golfers?tournamentId=<id>&year=<year>&apiKey=<key>
GET /api/augusta/sync-tournaments?year=<year>&apiKey=<key>
GET /api/augusta/sync-leaderboard?tournamentId=<id>&year=<year>&round=<round>&apiKey=<key>
```

Required environment variable:
- `SYNC_API_KEY`: Secret key for securing the sync endpoints

## Update Frequency Management

Different data types require different update frequencies:

1. **Frequent Updates (during tournaments)**:
   - Leaderboard data (every 5-10 minutes)
   - Scorecards (every 5-10 minutes)
   - Player statuses (active, cut, withdrawn)

2. **Semi-frequent Updates**:
   - Tournament details (daily during tournament)
   - Tee times (once set, rarely change)

3. **Infrequent Updates**:
   - Player profiles (weekly/monthly)
   - Tournament schedules (weekly)
   - Historical data (after tournament completion)

The `scheduled-updates.ts` module manages these different update frequencies automatically based on tournament status.

## Scheduled Updates

For production, we recommend setting up scheduled jobs using the provided utilities:

```typescript
import { updateTournamentData } from '@/lib/augusta-engine';
import { TournamentStatus } from '@/lib/augusta-engine';

// Update Masters tournament data
await updateTournamentData('masters-2025', '2025', TournamentStatus.IN_PROGRESS);
```

Recommended update frequencies:
- Golfer information: Before tournament begins
- Scores and leaderboards: Every 5-10 minutes during tournament play
- Final results: Once after tournament completion 