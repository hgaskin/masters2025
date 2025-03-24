# Setting up MCP with Supabase

This guide explains how to configure Model Context Protocol (MCP) with Supabase for the Masters25 project, allowing AI tools to interact with your database.

## Prerequisites

- A Supabase project set up
- The Supabase service role key (for admin access)
- AI tools that support MCP, such as:
  - Cursor
  - Windsurf (Codium)
  - Cline (VS Code extension)
  - Claude desktop

## Setup Instructions

### 1. Find your database connection details

Your connection details are in your `.env.local` file:
- `NEXT_PUBLIC_SUPABASE_URL` - The URL of your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key for admin access

### 2. Configure MCP for your AI tool

#### For Cursor

The project already has a `.cursor/mcp.json` file configured. It uses environment variables to construct the connection string.

```json
{
  "mcpServers": {
    "masters2025-supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "<connection-string>"]
    }
  }
}
```

When you open the project in Cursor, it will automatically connect to your Supabase database.

#### For other AI tools (Windsurf, Cline, Claude desktop)

Use a similar configuration but adjust it for the specific tool's format. The connection string should be constructed as:

```
postgresql://postgres:<SUPABASE_SERVICE_ROLE_KEY>@<SUPABASE_HOST>:5432/postgres
```

Where:
- `<SUPABASE_SERVICE_ROLE_KEY>` is your service role key
- `<SUPABASE_HOST>` is the host part of your Supabase URL (e.g., `db.abcdefghijkl.supabase.co`)

### 3. Using MCP to query your database

Once connected, you can ask your AI tool questions about your database or request it to generate SQL queries. For example:

- "What tables are in the database?"
- "Show me the schema for the users table"
- "Create a query to find all pools managed by a specific user"
- "Generate SQL to get all picks for a specific entry"

The AI tool will use MCP to connect to your database, explore the schema, and generate appropriate SQL queries.

## Security Considerations

- The MCP connection uses your service role key, which has admin access to your database
- Only use this configuration on trusted devices and with trusted AI tools
- Consider setting up a read-only user for MCP if you only need query capabilities
- Do not commit the `.cursor/mcp.json` file to public repositories (it's already in `.gitignore`) 