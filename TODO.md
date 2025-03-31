# 🏆 The Gaskin Masters Pool - Development TODO

for local dev im using cloudflare tunnel: cloudflared tunnel --url http://localhost:3000

## 🔴 High Priority Tasks

### Authentication & User Management
- [x] Set up Clerk authentication
- [x] Create webhook handlers for user sync with Supabase
- [ ] Enhance user profile page with avatar upload
- [ ] Add account settings page

### Core Database Implementation
- [x] Set up Supabase tables structure
- [x] Implement improved database schema for tournament flexibility
- [ ] Create API endpoints for all core operations
- [x] Implement database access patterns for golfers sync
- [ ] Add robust error handling for database operations

### Golf Data Integration
- [x] Create adaptor interfaces for Sportradar and SlashGolf APIs
- [x] Implement Sportradar API client
- [x] Implement SlashGolf API client as fallback
- [x] Create unified GolfAPIService with provider fallback
- [x] Build `/api/sync-golfers` endpoint for syncing to database
- [x] Create data normalization utilities through providers
- [x] Build `/api/sync-tournaments` endpoint for syncing tournament data
- [x] Build `/api/sync-leaderboard` endpoint for syncing leaderboard data
- [x] Update sync endpoints to use improved schema
- [ ] Set up scheduled jobs for data collection
- [~] Build admin tools for monitoring API health (Testing script created, needs dashboard)
- [x] Implement caching layer to reduce API calls
- [ ] Create CLI tool for manual data sync operations
- [ ] Build admin UI for on-demand data synchronization
- [ ] Implement tournament-specific sync controls (Masters leaderboard, etc.)
- [ ] Add detailed logging for all sync operations
- [ ] Integrate earnings and FedExCup points data from SlashGolf API
- [ ] Add OWGR (Official World Golf Ranking) integration from SlashGolf API

### Team Draft Experience
- [ ] Implement golfer grouping system for tiered selection
- [ ] Create pool rules configuration for draft constraints
- [ ] Complete golfer selection interface with real data
- [ ] Implement saving team selections to database
- [ ] Add validation rules for team creation
- [ ] Create edit team functionality for pre-tournament changes

### Leaderboard & Scoring
- [~] Create PGA Tour API integration for real-time scores (APIs implemented, need UI integration)
- [ ] Build scoring engine with the +8 penalty rule for missed cuts
- [ ] Implement team score calculation logic (top 6 scores)
- [ ] Develop tiebreaker display and calculation
- [ ] Build real-time leaderboard UI

### Payment Tracking
- [ ] Design and implement payment tracking interface
- [ ] Add manual payment confirmation for admin
- [ ] Show payment status on entries

## 🟠 Medium Priority Tasks

### User Dashboard
- [ ] Design user dashboard with entry overview
- [ ] Add team performance visualizations
- [ ] Implement tournament progress indicators

### Admin Experience
- [~] Create admin console for managing the tournament (API endpoints ready, UI needed)
- [ ] Add ability to manually adjust scores if needed
- [ ] Implement system for marking entries as paid
- [~] Build tools for monitoring data sync status (Script created, needs UI)
- [x] Create administrative override for data sources (API key system)
- [ ] Develop dashboard for manual API sync operations
- [ ] Create audit logs for all administrative actions
- [ ] Add system status monitoring with notifications

### Tournament Status
- [x] Add countdown timer to tournament
- [ ] Implement automatic locking of entries at deadline
- [ ] Show tournament status (upcoming, in progress, completed)

### Mobile Optimization
- [ ] Optimize all pages for mobile viewing
- [ ] Ensure smooth performance on all devices
- [ ] Implement responsive designs for all components

## 🟢 Lower Priority Tasks

### Enhanced Features
- [ ] Implement chat/commenting system
- [ ] Create past winners hall of fame
- [ ] Add share functionality for teams
- [ ] Develop golfer statistics display

### Infrastructure
- [x] Update Supabase auth from auth-helpers to SSR package (careful here - because im also using Clerk for auth, right? so need to make sure this doesnt collide)
- [x] Fix type organization in the codebase
- [x] Create comprehensive database schema documentation
- [ ] Set up comprehensive error logging
- [ ] Implement performance monitoring
- [x] Create test utilities for API integrations
- [ ] Add CI/CD pipeline
- [ ] Set up monitoring for API usage and costs

### Documentation
- [x] Write Golf API integration documentation
- [ ] Create user guide
- [x] Document code and architecture for Golf API
- [x] Document data synchronization strategy

## 🔮 AUGUSTA ENGINE Future Enhancements

### Query Interface
- [ ] Build natural language query interface for golf data
- [ ] Implement read methods to extract specific player/tournament information
- [ ] Create utility functions for common questions (e.g., "What is Player X's score today?")
- [ ] Add context-aware responses based on tournament status

### Data Analysis
- [ ] Implement statistical analysis tools for performance trends
- [ ] Add historical comparisons for player performance
- [ ] Develop prediction models for tournament outcomes
- [ ] Create visualizations for player performance

### External Integrations
- [ ] Add integration with additional data providers
- [ ] Implement webhook support for real-time data updates
- [ ] Create API endpoints for third-party consumption
- [ ] Build export functionality for data analysis

## 🔄 Ongoing Tasks

- [ ] Regular security audits
- [ ] Performance optimization
- [ ] User feedback collection and implementation
- [ ] Content updates (tournament information, rules clarification)
- [ ] Monitor API provider reliability and costs

## 📝 Notes

- The core MVP focuses on the team selection, scoring, and leaderboard functionality
- Payment tracking will be manual in the first version
- Mobile experience is crucial - majority of users will check scores on phones during the tournament
- We'll implement a hybrid API approach using both Sportradar and SlashGolf with fallback logic 

## 🔄 Recently Completed Tasks (FYI we are in the year 2025)
- [x] (2025-04-01) Designed improved database schema for multi-tournament support
- [x] (2025-04-01) Created database schema documentation
- [x] (2025-04-01) Updated sync endpoints for the new schema
- [x] (2025-03-30) Implemented SlashGolf API Provider
- [x] (2025-03-30) Implemented Sportradar API Provider  
- [x] (2025-03-30) Created GolfAPIService with provider fallback
- [x] (2025-03-30) Built golfer sync endpoint with Supabase integration
- [x] (2025-03-30) Created test script for API health monitoring
- [x] (2025-03-30) Updated Supabase auth to use new SSR package
- [x] (2025-03-30) Fixed type organization by consolidating in lib/supabase 