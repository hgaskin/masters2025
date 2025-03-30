# 🏆 The Gaskin Masters Pool - Project Analysis

## Executive Summary

The Gaskin Masters Pool is a fantasy golf platform designed specifically for the Masters Tournament. It allows users to create teams of 8 golfers, with the best 6 scores counting toward their total. The platform features real-time scoring, leaderboards, and payment tracking to create an engaging competition for golf enthusiasts.

This document outlines the project's scope, goals, technical considerations, and implementation strategy.

## Core Business Requirements

### Primary Goals

1. **Accessible Fantasy Experience**: Create an intuitive platform where users of all technical abilities can easily participate in the Masters Tournament fantasy pool.

2. **Real-Time Competition**: Deliver live updates from the tournament, reflecting real-world events in the fantasy standings.

3. **Transparent Rules Enforcement**: Implement clear scoring rules with automated penalty application for missed cuts.

4. **Community Engagement**: Build features that foster community engagement and friendly competition.

5. **Historical Context**: Provide context about past tournaments and winners to enhance the experience.

### Key User Journeys

1. **First-time User**:
   - Signs up via Clerk authentication
   - Learns about the pool rules
   - Creates a team before the tournament deadline
   - Makes payment
   - Tracks performance throughout the tournament

2. **Returning Participant**:
   - Logs in with existing credentials
   - Creates new entry (or multiple entries)
   - References past performance
   - Tracks current tournament standing

3. **Tournament Weekend Experience**:
   - Checks leaderboard frequently from mobile devices
   - Sees detailed breakdown of team performance
   - Views tiebreaker scenarios if applicable
   - Engages with other participants

## Technical Architecture

### System Design Overview

The application follows a modern web architecture pattern with Next.js App Router as the foundation:

1. **Frontend Layer**:
   - Next.js 15.2.3 with App Router for server and client components
   - Tailwind CSS v4 for styling with responsive design 
   - React for component architecture (v19)
   - Heavy use of React Server Components where possible
   - Focused client components only where interactivity is needed

2. **Authentication Layer**:
   - Clerk for user authentication and management
   - WebHooks to sync user data to Supabase

3. **Data Layer**:
   - Supabase PostgreSQL database for structured data
   - Row-level security policies for data protection
   - External API integration for real-time tournament data
   - Abstraction layer for multiple golf data providers

4. **Deployment Layer**:
   - Vercel for hosting and CI/CD
   - Environment variables for configuration

### Database Schema Design

The database is structured around these key entities:

1. **Users**: Synchronized from Clerk with profile information
2. **Pools**: Information about tournament pools (primarily the Masters)
3. **Golfers**: Participant data for the tournament 
4. **Entries**: User entries in the pool with payment status
5. **Picks**: Individual golfer selections (8 per entry)
6. **Tournament Scores**: Round-by-round scores for all golfers

### API Integration

The application will integrate with multiple golf data providers to ensure reliability:

1. **Primary Providers**:
   - **Sportradar Golf API**: Comprehensive data including detailed statistics
   - **SlashGolf API**: Reliable core tournament data with competitive pricing

2. **Abstraction Layer**:
   - Provider-agnostic interfaces for all golf data
   - Automatic fallback between providers for redundancy
   - Data normalization to ensure consistent format

3. **Data Collection Strategy**:
   - Scheduled jobs to fetch and update tournament data
   - Frequent polling during active tournament rounds
   - Caching to reduce API calls and costs

For more details, see the [API Integration Strategy](./api-integration-strategy.md) document.

## Technical Challenges and Solutions

### Challenge: Data Provider Reliability and Costs

**Solution**:
- Create an abstraction layer between external APIs and our application
- Implement provider-agnostic interfaces with adaptor pattern
- Support automatic fallback between providers if one fails
- Cache frequently accessed data to reduce API calls
- Store normalized data in Supabase to reduce dependency on external APIs
- Monitor provider health and implement automatic switching

### Challenge: Real-time Scoring Updates

**Solution**: Implement a hybrid approach:
- Server-side polling of golf APIs on a scheduled interval
- Write updates to Supabase
- Use client-side polling for active users to ensure fresh data
- Potentially use websockets for real-time updates

### Challenge: Handling Cut Players and Penalties

**Solution**: 
- Create a scoring engine that calculates penalties based on tournament progression
- Track player status (active, cut, WD, DQ) in the database
- Apply the +8 stroke penalty per missed round automatically
- Recalculate team scores when player statuses change

### Challenge: Tiebreaker Logic

**Solution**:
- Implement the tiebreaker algorithm in a server function
- Store calculated tiebreaker data in a denormalized format for performance
- Create clear UI to show tiebreaker scenarios

### Challenge: Mobile Experience Priority

**Solution**:
- Mobile-first design approach with Tailwind
- Optimize for quick loading on mobile networks
- Ensure real-time updates work efficiently on mobile devices
- Create compact views for tournament weekend

## Implementation Strategy

### Phase 1: Core Infrastructure (Current)

- ✅ Project setup with Next.js 15 and Tailwind v4
- ✅ Authentication with Clerk
- ✅ Supabase database schema
- ✅ User synchronization
- ✅ Basic UI framework

### Phase 2: MVP Features

- Team creation and management
- API integration with golf data providers
- Data normalization and caching layer
- Golfer selection interface
- Basic leaderboard structure
- Payment tracking for admins
- Tournament countdown and status

### Phase 3: Tournament Experience

- Live scoring integration
- Advanced leaderboard with filtering
- Team performance visualization
- Tiebreaker logic and display
- Mobile optimization

### Phase 4: Enhanced Features

- Chat/comments system
- Past winners archive
- Team sharing functionality
- Performance optimization
- Enhanced admin tools

## Measuring Success

The project will be considered successful if:

1. Users can easily create teams before the tournament
2. The platform accurately reflects tournament scores and standings
3. Users can easily track their performance during the tournament
4. Admin can manage entries and payments efficiently
5. The system handles the tournament weekend traffic without issues
6. The application maintains reliability despite external API fluctuations

## Technical Debt Considerations

Areas to monitor for potential technical debt:

1. **API Integration Reliability**: Ensure error handling for API outages
2. **Database Scaling**: Monitor query performance as user base grows
3. **Frontend Performance**: Watch for client-side performance issues
4. **Authentication Flow**: Keep Clerk integration updated and secure
5. **API Provider Management**: Regularly assess reliability and cost of providers

## Next Steps

1. Implement the data provider abstraction layer
2. Complete the team creation interface with real data integration
3. Implement saving team selections to the database
4. Build the leaderboard interface with mock data
5. Create the scoring engine logic
6. Develop admin tools for tournament management

Refer to the [TODO.md](../TODO.md) file for the detailed task breakdown and priorities.

---

*This document will be updated as the project progresses and requirements evolve.* 