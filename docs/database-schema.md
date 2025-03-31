# Masters 2025 Database Schema

This document outlines the complete database schema for the Masters 2025 application, with a focus on scalability and flexibility for multiple tournaments and user-created pools.

> **Update (April 2025)**: All tables and relationships described in this document have been successfully implemented in Supabase with proper constraints and indexes.

## Core Tables

### `users`
Stores user information synced from Clerk.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| clerk_id | text | External ID from Clerk |
| email | text | User email |
| first_name | text | User first name |
| last_name | text | User last name |
| username | text | Username |
| avatar_url | text | URL to user avatar |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

### `golfers`
Contains basic information about golfers that is consistent across all tournaments.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Golfer name |
| avatar_url | text | URL to golfer photo |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |
| external_id | text | ID from external system |
| external_system | text | Name of external system |

### `tournaments`
Stores information about golf tournaments.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Tournament name |
| start_date | date | Tournament start date |
| end_date | date | Tournament end date |
| course | text | Course name |
| location | text | Tournament location |
| status | text | Status (upcoming, active, completed) |
| current_round | integer | Current round number |
| cut_line | text | Cut line for the tournament |
| year | integer | Tournament year |
| purse | numeric | Tournament prize money |
| par | integer | Par for the course |
| rounds | integer | Number of rounds (usually 4) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

## Tournament-Specific Tables

### `tournament_golfers`
Links golfers to specific tournaments with tournament-specific data.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tournament_id | uuid | Foreign key to tournaments |
| golfer_id | uuid | Foreign key to golfers |
| odds | numeric | Golfer odds for this tournament |
| tournament_rank | integer | Golfer rank for this tournament |
| status | text | Status (active, cut, withdrawn, disqualified, injured) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

### `tournament_scores`
Stores individual round scores for each golfer in a tournament.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| golfer_id | uuid | Foreign key to golfers |
| tournament_id | uuid | Foreign key to tournaments |
| round | integer | Round number |
| score | integer | Score for the round |
| thru | integer | Holes completed |
| r1_score | integer | Round 1 score |
| r2_score | integer | Round 2 score |
| r3_score | integer | Round 3 score |
| r4_score | integer | Round 4 score |
| today_score | integer | Today's score |
| total_score | integer | Total score across all rounds |
| position | text | Current position (e.g., "T1", "3") |
| official_position | text | Official position for handling ties |
| status | text | Status (active, cut, withdrawn) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

## Pool Management Tables

### `pools`
Information about contest pools.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Pool name |
| description | text | Pool description |
| entry_fee | numeric | Entry fee amount |
| tournament_id | uuid | Foreign key to tournaments |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |
| admin_id | uuid | Foreign key to admin user |
| is_active | boolean | Whether pool is active |
| count_top_n_scores | integer | How many top scores count (default 6) |
| entry_deadline | timestamp | When entries lock |
| prize_distribution | jsonb | Flexible prize structure |
| scoring_rules | jsonb | Allows different scoring systems |
| format | text | Pool format (standard, skins, etc.) |

### `pool_rules`
Defines rules for each pool.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| pool_id | uuid | Foreign key to pools |
| golfers_required | integer | Total number of golfers per entry |
| max_picks_per_group | integer | Max picks from a single group |
| groups_required | integer | Number of groups that must be used |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

### `golfer_groups`
Groups golfers into tiers/groups for selection rules.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tournament_id | uuid | Foreign key to tournaments |
| name | text | Group name (e.g., "A", "B", "C") |
| description | text | Group description |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

### `golfer_group_assignments`
Assigns golfers to groups for a specific tournament.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| group_id | uuid | Foreign key to golfer_groups |
| golfer_id | uuid | Foreign key to golfers |
| created_at | timestamp | Creation timestamp |

## User Entries Tables

### `entries`
User entries into specific pools.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| pool_id | uuid | Foreign key to pools |
| user_id | uuid | Foreign key to users |
| has_paid | boolean | Payment status |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

### `picks`
Links entries to selected golfers.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| entry_id | uuid | Foreign key to entries |
| golfer_id | uuid | Foreign key to golfers |
| selection_order | integer | Order of selection |
| group_id | uuid | Foreign key to golfer_groups |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

## Key Relationships

1. **Tournaments & Golfers**: Many-to-many through `tournament_golfers`
   - Each golfer can participate in multiple tournaments
   - Each tournament has multiple golfers

2. **Tournaments & Pools**: One-to-many
   - Each tournament can have multiple pools
   - Each pool belongs to one tournament

3. **Pools & Entries**: One-to-many
   - Each pool can have multiple entries
   - Each entry belongs to one pool

4. **Entries & Golfers**: Many-to-many through `picks`
   - Each entry selects multiple golfers
   - Each golfer can be selected by multiple entries

5. **Tournaments & Groups**: One-to-many
   - Each tournament can have multiple golfer groups
   - Each group belongs to one tournament

## Usage Patterns

### Creating a New Tournament
1. Insert record into `tournaments`
2. Fetch golfers from API and insert/update in `golfers`
3. Create relationships in `tournament_golfers` with odds and rankings
4. Define groups in `golfer_groups` and assign golfers with `golfer_group_assignments`

### Creating a Pool
1. Insert record into `pools` linked to a specific tournament
2. Define rules in `pool_rules` for how many golfers can be selected from each group

### User Creating an Entry
1. Insert record into `entries` for a specific pool and user
2. Add golfer selections to `picks` adhering to pool rules
3. Update payment status in `entries` when confirmed

### Syncing Tournament Scores
1. Fetch scores from Augusta Engine
2. Upsert into `tournament_scores` for each golfer and round
3. Update golfer status in `tournament_golfers` if changed

### Calculating Leaderboard
1. Query `picks` to find all selected golfers for each entry
2. Join with `tournament_scores` to get their current scores
3. Apply scoring rules (e.g., top 6 scores count, +8 for missed cuts)
4. Sort entries by total score to generate leaderboard

## Indexing Strategy

For optimal query performance, the following indexes have been created:

1. `tournament_golfers(tournament_id, golfer_id)`
2. `tournament_scores(tournament_id, golfer_id, round)`
3. `tournament_scores(golfer_id)`
4. `tournament_scores(tournament_id)`
5. `picks(entry_id, golfer_id)`
6. `entries(pool_id, user_id)`
7. `golfer_group_assignments(group_id, golfer_id)`
8. `pools(tournament_id)`
9. `picks(golfer_id)`
10. `golfer_groups(tournament_id)`
11. `golfer_group_assignments(golfer_id)`

## Implementation Status

✅ All tables created with proper columns and data types  
✅ All relationships established with foreign keys  
✅ Unique constraints in place (unique golfer per tournament, unique picks per entry)  
✅ Check constraints implemented (status constraint on tournament_golfers)  
✅ All performance indexes created  
✅ Data synchronization endpoints updated to work with this schema

## Future Considerations

This schema is designed with flexibility in mind, allowing for:

1. **Multiple Tournaments**: All tournament-specific data is properly separated
2. **User-Created Pools**: The structure supports different rule sets for different pools
3. **Historical Data**: Tournament data can be preserved year over year
4. **Advanced Analytics**: The schema supports complex queries for statistics and insights
5. **Different Scoring Systems**: The flexible scoring_rules field allows for various formats
6. **Complex Prize Structures**: The prize_distribution field can handle any payout structure

The design balances normalization for data integrity with the practical needs of the application for efficient querying and updates. 