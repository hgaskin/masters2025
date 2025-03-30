# 🏌️ Golf Data Integration Strategy

## Overview

This document outlines our strategy for collecting, normalizing, and storing golf tournament data from multiple external API providers. The core principle is to create a robust abstraction layer between external data sources and our application, ensuring:

1. **Source Independence**: The ability to switch between data providers without affecting the application
2. **Data Consistency**: Uniform data structure regardless of the original source
3. **Fault Tolerance**: Continued operation even if a primary data source goes down
4. **Cost Management**: Flexibility to choose the most cost-effective provider at any time
5. **Data Ownership**: We maintain a complete copy of all required data in our own database

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
│               Data Ingestion & Normalization Layer              │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │                 │    │                 │    │              │ │
│  │ API Adaptors    │    │ Data Cleaners   │    │ Schedulers   │ │
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
│  │ golfers         │    │ tournament_     │    │ scores       │ │
│  │                 │    │ metadata        │    │              │ │
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

### 1. Scheduled Data Collection

We'll implement scheduled jobs that run at strategic intervals to collect and update:

- **Tournament Schedule**: Weekly updates
- **Golfer Information**: Daily updates during tournament weeks
- **Live Scoring**: Every 5-10 minutes during active tournament rounds
- **Results & Statistics**: After round completion

### 2. Data Normalization Process

For each data type, we'll create adaptors that transform provider-specific formats into our standardized schema:

```typescript
// Example adaptor interface
interface APIAdaptor {
  getTournamentSchedule(): Promise<NormalizedSchedule>;
  getGolferDetails(id: string): Promise<NormalizedGolfer>;
  getLeaderboard(tournamentId: string): Promise<NormalizedLeaderboard>;
  // ...etc
}

// Provider-specific implementations
class SportradarAdaptor implements APIAdaptor {
  // Implementation for Sportradar
}

class SlashGolfAdaptor implements APIAdaptor {
  // Implementation for SlashGolf
}
```

### 3. Fallback Mechanism

We'll implement a provider fallback chain that:

1. Attempts to fetch from primary provider
2. If unsuccessful, attempts secondary provider
3. If both fail, uses cached data with appropriate UI indication

### 4. Data Storage Design

Our Supabase schema will store normalized data independently of the source:

**golfers table**:
- `id` (UUID, primary key)
- `name` (TEXT)
- `external_id` (TEXT) - ID from external system
- `external_system` (TEXT) - Which API provided this data
- `rank` (INTEGER)
- `country` (TEXT)
- `countryCode` (TEXT)
- `avatar_url` (TEXT)
- `odds` (TEXT) - For Masters specific odds

**tournament_scores table**:
- `id` (UUID, primary key)
- `golfer_id` (UUID, foreign key to golfers.id)
- `round` (INTEGER)
- `score` (INTEGER)
- `status` (TEXT) - active, cut, WD, DQ
- `thru` (INTEGER) - Current hole (for live scoring)
- `last_updated` (TIMESTAMP)

## Implementation Plan

### Phase 1: Core Data Collection

1. Create API adaptor interfaces for both providers
2. Implement Sportradar adaptor with fallback to SlashGolf
3. Set up daily job to collect and normalize golfer information
4. Set up tournament schedule collection

### Phase 2: Live Scoring

1. Implement leaderboard data collection
2. Create scoring history storage
3. Develop status tracking (cut line, withdrawals, etc.)
4. Set up frequent polling during tournament hours

### Phase 3: Robustness Enhancements

1. Add health checks for API providers
2. Implement automatic fallback switching
3. Add error logging and notifications
4. Create admin dashboard for monitoring data collection

## Cost Management Strategy

To optimize costs while maintaining reliability:

1. Use SlashGolf's affordable plans for development and testing
2. Consider Sportradar for production/tournament weekends if budget allows
3. Implement caching to reduce API calls
4. Set up monitoring to track API usage and costs

## Conclusion

By implementing this data strategy, we'll create a robust foundation for the Masters Pool application that:

- Is resilient to external API failures
- Provides consistent data regardless of source
- Can adapt to changing cost considerations
- Maintains our own data ownership
- Supports the core scoring and leaderboard features reliably

This approach will significantly reduce risk and provide flexibility as the application grows. 