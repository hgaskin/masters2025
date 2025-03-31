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

The engine maps normalized data to the following Supabase tables:

- `golfers`: Basic player information
- `tournament_golfers`: Tournament-specific golfer data including odds and status
- `tournament_scores`: Round-by-round scores for each golfer
- `tournaments`: Tournament details and status

## Implementation Status

The Augusta Engine is now fully implemented with the following components:

1. **Core API Service**
   - ✅ Complete provider interface implementation
   - ✅ SlashGolf API provider integration
   - ✅ Sportradar API provider integration
   - ✅ Fallback and caching mechanisms

2. **Sync Endpoints**
   - ✅ `/api/augusta/sync-golfers`: Functional
   - ✅ `/api/augusta/sync-tournaments`: Functional
   - ✅ `/api/augusta/sync-leaderboard`: Functional with schema integration

3. **Database Schema**
   - ✅ Enhanced schema for multi-tournament support
   - ✅ Proper indexes for performance optimization
   - ✅ Complete foreign key relationships
   - ✅ Constraints for data integrity

4. **Future Enhancements**
   - Query interface for natural language queries
   - Additional data providers
   - Advanced statistics and predictions

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

## Future Upgrades & Enhancements

The AUGUSTA ENGINE is designed for extensibility. Future planned enhancements include:

### Natural Language Query Interface

A major planned enhancement is transforming the AUGUSTA ENGINE into a queryable interface that can respond to natural language questions about golf data:

```typescript
// Example future usage
import { AugustaQueryEngine } from '@/lib/augusta-engine/query';

const queryEngine = new AugustaQueryEngine();
const result = await queryEngine.ask("What is Rory McIlroy's score today?");
// Returns: "Rory McIlroy is currently -4 through 12 holes in Round 2"
```

This would involve:
- Building natural language processing capabilities
- Creating specialized read operations for the Supabase database
- Implementing context-aware responses based on tournament status

### Advanced Data Analysis

Future versions will include:
- Statistical analysis tools for player performance trends
- Historical performance comparisons across tournaments
- Prediction models for tournament outcomes
- Enhanced visualization capabilities

### Additional Data Providers

The provider architecture allows for easy integration of additional data sources:
- Official PGA Tour API integration (if/when available)
- ESPN Golf API integration
- Golf Channel data integration
- Historical statistics databases

### External API Surface

Future plans include exposing the AUGUSTA ENGINE capabilities via API:
- RESTful endpoints for third-party consumption
- Webhook support for real-time data updates
- Export functionality for external analysis tools 