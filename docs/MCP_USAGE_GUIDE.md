# Using MCP with Masters25

This guide explains how to use the Model Context Protocol (MCP) to interact with your Supabase database for the Masters25 project.

## What is MCP?

Model Context Protocol (MCP) is a standard that allows AI tools like Cursor, Claude, and others to interact with external services, including databases. In the Masters25 project, MCP is configured to connect to your Supabase PostgreSQL database.

## What Can You Do with MCP?

With MCP set up for your Supabase database, you can:

1. **Query your database using natural language**
   - "Show me all tables in the database"
   - "What columns are in the users table?"
   - "Find all pools created by a specific user"

2. **Generate SQL for complex operations**
   - "Write a query to find the top-performing golfers across all tournaments"
   - "Create SQL to calculate the standings for a specific pool"
   - "Show me how to join entries with their picks and golfer information"

3. **Get schema information and relationships**
   - "What foreign key relationships exist in the database?"
   - "Show me the complete schema for the entries table"
   - "How are users and pools related?"

4. **Database debugging and exploration**
   - "Check if a specific user exists in the database"
   - "Find entries that don't have any picks"
   - "Show me the structure of all tables related to tournament scoring"

## How to Use MCP in Cursor

1. **Direct Questions**: Simply ask questions about your database in the Cursor chat.
   
   Example: "What tables exist in my Supabase database?"

2. **SQL Generation**: Ask the AI to generate SQL queries for you.
   
   Example: "Write a SQL query to find all pools that a specific user has entered"

3. **Schema Exploration**: Ask about your database structure.
   
   Example: "Show me the schema for the tournament_scores table"

4. **Data Analysis**: Ask for insights or specific data.
   
   Example: "Find the top 5 most selected golfers across all entries"

## Testing MCP Connection

To verify your MCP connection is working properly, try these simple test queries:

1. "List all tables in the Supabase database"
2. "Show me the schema of the users table"
3. "Count the number of records in each table"

## Troubleshooting MCP

If your MCP connection isn't working:

1. Ensure your `.cursor/mcp.json` file has the correct connection string
2. Check if the Supabase session pooler connection string is correctly formatted
3. Verify that you can connect to your database using standard tools
4. Restart Cursor after making changes to your MCP configuration
5. Check the Cursor logs for any connection errors

## Security Considerations

- The connection string in `.cursor/mcp.json` contains your database credentials
- Only use MCP on trusted devices
- Keep the `.cursor/mcp.json` file in your `.gitignore` to avoid committing credentials
- Consider using a read-only database user for MCP if you're only doing queries

## Example Queries for Masters25

Here are some useful queries specific to the Masters25 project:

### Users and Authentication

- "Show me all users who have signed up"
- "Find users who haven't created any entries yet"

### Pools Management

- "List all active pools ordered by entry fee"
- "Find pools with the most entries"

### Golfer Selection

- "Show the most frequently picked golfers"
- "Find golfers who haven't been picked by anyone"

### Tournament Scoring

- "Calculate the current score for each entry in a specific pool"
- "Show the best-performing golfer picks in the tournament" 