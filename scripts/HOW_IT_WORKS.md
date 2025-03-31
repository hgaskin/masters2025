# AUGUSTA ENGINE CLI Tool

This CLI tool helps manage and test the AUGUSTA ENGINE, providing interactive commands for data fetching, validation, and database operations.

## Overview

The tool provides several commands for managing golf tournament data:

```bash
# Fetch and process 2024 Masters Tournament data
bun run scripts/test-augusta-engine.ts fetch-masters-2024

# Create a test pool with sample data
bun run scripts/test-augusta-engine.ts create-test-pool

# Validate data integrity
bun run scripts/test-augusta-engine.ts validate

# Check sync status
bun run scripts/test-augusta-engine.ts status
```

## Data Flow

1. **API Data Fetching**
   - The tool fetches data from multiple golf data providers (Sportradar, SlashGolf)
   - Uses provider fallback if one API is unavailable
   - Stores raw API responses in `scripts/results/masters-2024/`

2. **Interactive Workflow**
   For each data type (tournament details, golfer list, scores, leaderboard), you can:
   - Save raw API response to file
   - Normalize the data for database insertion
   - Preview the normalized data
   - Insert the data into Supabase
   - Skip to the next step
   - Exit the process

3. **File Structure**
   ```
   scripts/
   ├── results/
   │   └── masters-2024/
   │       ├── tournament_details_raw.json
   │       ├── golfer_list_raw.json
   │       ├── round_scores_raw.json
   │       └── leaderboard_raw.json
   └── test-augusta-engine.ts
   ```

## Commands in Detail

### `fetch-masters-2024`
Fetches and processes data for the 2024 Masters Tournament:
- Tournament details (name, dates, course)
- Golfer list (participants, rankings)
- Round scores (when available)
- Leaderboard data

Options:
- `-f, --force`: Force refresh even if data exists

### `create-test-pool`
Creates a test pool with sample data:
- Generates standard pool rules
- Creates golfer groups
- Adds sample entries and picks

Options:
- `-n, --name`: Specify pool name (default: "Test Pool 2024")

### `validate`
Validates data integrity:
- Checks tournament data
- Verifies golfer records
- Validates scores
- Checks relationships

### `status`
Shows sync status and statistics:
- Last sync time
- Data counts
- API health
- Error logs

## Error Handling

- The tool provides clear error messages with chalk-colored output
- Allows continuing to next step if one step fails
- Saves error logs for debugging

## Best Practices

1. **Before Running**
   - Ensure all API keys are set in `.env`
   - Check database connection
   - Review previous sync logs

2. **During Operation**
   - Review data at each step before proceeding
   - Save raw responses for debugging
   - Validate data before insertion

3. **After Running**
   - Check the results directory for saved files
   - Verify database entries
   - Review any error logs

## Environment Setup

Required environment variables:
```bash
# Golf Data APIs
SLASHGOLF_API_KEY=your-slashgolf-api-key
SPORTRADAR_API_KEY=your-sportradar-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
``` 