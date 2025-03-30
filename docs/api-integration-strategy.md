# 🏌️ The AUGUSTA ENGINE: Golf Data Integration Strategy

## Overview

This document outlines our strategy for collecting, normalizing, and storing golf tournament data from multiple external API providers. The AUGUSTA ENGINE is our unified data processing system that ensures:

1. **Source Independence**: The ability to switch between data providers without affecting the application
2. **Data Consistency**: Uniform data structure regardless of the original source
3. **Fault Tolerance**: Continued operation even if a primary data source goes down
4. **Cost Management**: Flexibility to choose the most cost-effective provider at any time
5. **Data Ownership**: We maintain a complete copy of all required data in our own database
6. **Update Frequency Management**: Different data types are updated at appropriate intervals

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  Sportradar     │    │  SlashGolf      │    │  Other Future   │
│  Golf API       │    │  API            │    │  Provider APIs  │
│                 │    │                 │    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        THE AUGUSTA ENGINE                       │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │                 │    │                 │    │              │ │
│  │ API Adaptors    │    │ Data Normalizer │    │ Schedulers   │ │
│  │                 │    │                 │    │              │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                                                 │
└───────────────────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       Supabase Database                         │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │                 │    │                 │    │              │ │
│  │ golfers         │    │ tournaments     │    │ scores       │ │
│  │                 │    │                 │    │              │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                                                 │
└───────────────────────────────────┬─────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                       Next.js Application                       │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │                 │    │                 │    │              │ │
│  │ Team Selection  │    │ Leaderboard     │    │ Scoring      │ │
│  │                 │    │                 │    │ Engine       │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## API Providers Analysis

### Sportradar Golf API

**Strengths:**
- Comprehensive coverage (PGA, DP World Tour, LIV Tour, LPGA, etc.)
- Detailed hole-by-hole scoring
- Rich player profiles and statistics
- Push feed capabilities for real-time updates

**Considerations:**
- Potentially high cost after trial period
- More complex integration due to extensive feature set

### SlashGolf API

**Strengths:**
- Affordable pricing tiers (including free tier for development)
- Simpler API structure
- Reliable for core tournament data
- Previously used in our system

**Considerations:**
- Potentially more limited data scope
- May have higher rate limits on lower-priced tiers

## Data Synchronization Strategy

### 1. Update Frequency Management

The AUGUSTA ENGINE manages different update frequencies based on data type and tournament status:

#### Frequent Updates (during tournaments)
- **Leaderboard data**: Every 5 minutes during tournament play
- **Scorecards**: Every 5 minutes during tournament play
- **Player statuses**: Updated with leaderboard (cut, withdrawn, etc.)

#### Semi-frequent Updates
- **Tournament details**: Daily during tournament
- **Tee times**: Once set, rarely change

#### Infrequent Updates
- **Player profiles**: Weekly or before tournament
- **Tournament schedules**: Weekly
- **Historical data**: After tournament completion

### 2. Data Normalization Process

For each data type, the AUGUSTA ENGINE includes adaptors that transform provider-specific formats into our standardized schema:

```typescript
// Provider interface
export interface GolfAPIProvider {
  name: string;
  isHealthy: boolean;
  
  // Tournament Methods
  getTournamentSchedule(year: string): Promise<NormalizedSchedule>;
  getTournamentDetails(tournamentId: string, year: string): Promise<NormalizedTournament>;
  
  // Golfer Methods
  getGolferList(tournamentId: string, year: string): Promise<NormalizedGolfer[]>;
  getGolferDetails(golferId: string): Promise<NormalizedGolfer>;
  
  // Leaderboard Methods  
  getLeaderboard(tournamentId: string, year: string, round?: number): Promise<NormalizedLeaderboard>;
  
  // Health Check
  checkHealth(): Promise<boolean>;
}
```

### 3. Fallback Mechanism

The AUGUSTA ENGINE implements fallback logic to ensure continuous data availability:

1. Attempts to fetch from primary provider
2. If unsuccessful, automatically tries secondary provider
3. Maintains a cache to reduce API calls and provide data when APIs are unavailable
4. Tracks provider health status for intelligent routing

### 4. Data Storage Design

Our Supabase schema stores normalized data independently of the source:

**golfers table**:
- `id` (UUID, primary key)
- `name` (TEXT)
- `external_id` (TEXT) - ID from external system
- `external_system` (TEXT) - Which API provided this data
- `rank` (INTEGER)
- `avatar_url` (TEXT)
- `odds` (NUMERIC)
- `status` (TEXT) - active, cut, WD, DQ
- `updated_at` (TIMESTAMP)

**tournament_scores table**:
- `id` (UUID, primary key)
- `golfer_id` (UUID, foreign key to golfers.id)
- `tournament_id` (UUID, foreign key to tournaments.id)
- `round` (INTEGER)
- `score` (INTEGER)
- `r1_score`, `r2_score`, `r3_score`, `r4_score` (INTEGER)
- `thru` (INTEGER) - Current hole (for live scoring)
- `position` (INTEGER) - Current position on leaderboard
- `status` (TEXT) - active, cut, WD, DQ
- `updated_at` (TIMESTAMP)

**tournaments table**:
- `id` (UUID, primary key)
- `name` (TEXT)
- `start_date`, `end_date` (TIMESTAMP)
- `course` (TEXT)
- `location` (TEXT)
- `purse` (TEXT)
- `status` (TEXT) - upcoming, in_progress, completed, canceled
- `current_round` (INTEGER)
- `cut_line` (INTEGER)
- `year` (TEXT)

## Implementation Status

### Completed
- Core provider interfaces
- Sportradar and SlashGolf adaptors
- Normalization utilities
- Data caching layer
- Sync endpoints for golfers and tournament data
- Scheduled update configuration

### In Progress
- Leaderboard sync improvements
- Admin tools for monitoring API health
- Scorecards implementation

### Planned
- Push notification system for real-time updates
- Advanced statistics extraction
- Expanded course information

## Data Sync Endpoints

The system includes API routes for synchronizing data:

```
GET /api/sync-golfers?tournamentId=<id>&year=<year>&apiKey=<key>
GET /api/sync-tournaments?year=<year>&apiKey=<key>
GET /api/sync-leaderboard?tournamentId=<id>&year=<year>&round=<round>&apiKey=<key>
```

## Scheduled Updates

For production, we use the scheduling utilities provided by the AUGUSTA ENGINE:

```typescript
import { updateTournamentData } from '@/lib/augusta-engine/scheduled-updates';
import { TournamentStatus } from '@/lib/augusta-engine/types';

// Update Masters tournament data
await updateTournamentData('masters-2025', '2025', TournamentStatus.IN_PROGRESS);
```

## Conclusion

The AUGUSTA ENGINE provides a robust and flexible foundation for golf data integration, ensuring reliable data availability regardless of external API changes or outages. By normalizing data and implementing intelligent update frequencies, we maximize reliability while minimizing API usage costs. 