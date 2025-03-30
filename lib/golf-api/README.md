# Golf API Integration

This module provides a unified interface for interacting with multiple golf data providers. The architecture uses an abstraction layer to ensure the application works consistently regardless of which API provider is used.

## Architecture

- **GolfAPIService**: Central service that manages multiple providers with fallback capabilities
- **GolfAPIProvider**: Interface that all providers must implement
- **Providers**: 
  - `SlashGolfProvider`: Implementation for SlashGolf API
  - `SportradarProvider`: Implementation for Sportradar Golf API

## Features

- **Provider Fallback**: If one API fails, the system automatically tries the next provider
- **Caching**: API responses are cached to reduce redundant calls
- **Normalized Data**: All providers map their responses to a common data structure
- **Health Monitoring**: Providers track their health status

## Setup

1. Add your API keys to `.env.local`:
   ```
   SLASHGOLF_API_KEY=your_slashgolf_api_key_here
   SPORTRADAR_API_KEY=your_sportradar_api_key_here
   ```

2. Import and use the service:
   ```typescript
   import { GolfAPIService } from '@/lib/golf-api/api-service';
   
   // Create the service
   const golfAPIService = new GolfAPIService();
   
   // Use the service
   const tournaments = await golfAPIService.getTournamentSchedule('2025');
   ```

## Testing

Run the test script to verify API connectivity:

```bash
bun run test:golf-api
```

## API Endpoints

The service provides the following methods:

- `getTournamentSchedule(year)`: Get tournament schedule for a specific year
- `getTournamentDetails(tournamentId, year)`: Get details for a specific tournament
- `getGolferList(tournamentId, year)`: Get list of golfers for a tournament
- `getGolferDetails(golferId)`: Get details for a specific golfer
- `getLeaderboard(tournamentId, year, round?)`: Get tournament leaderboard

## Syncing to Database

Use the `/api/sync-golfers` API route to sync golfer data from the APIs to Supabase:

```
GET /api/sync-golfers?tournamentId=<id>&year=<year>&apiKey=<key>
```

Required environment variable:
- `SYNC_API_KEY`: Secret key for securing the sync endpoint 