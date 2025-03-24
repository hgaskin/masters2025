#!/bin/bash

# This script applies Supabase migrations using the Supabase CLI or REST API
# Based on official Clerk-Supabase integration documentation

# Get environment variables from .env.local
if [ -f "../.env.local" ]; then
  source <(grep -v '^#' ../.env.local | sed -E 's/(.+)=(.+)/export \1="\2"/')
  echo "Loaded environment variables from .env.local"
else
  echo "Error: .env.local file not found"
  exit 1
fi

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
  echo "Using Supabase CLI to apply migrations"
  
  # Apply migrations using Supabase CLI
  supabase db push
else
  echo "Supabase CLI not found, using REST API instead"
  
  # Check required environment variables
  if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "Error: Missing required environment variables"
    echo "Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
    exit 1
  fi
  
  # For each migration file in the migrations directory
  for migration_file in migrations/*.sql; do
    echo "Applying migration: $migration_file"
    
    # Read the SQL file
    SQL=$(cat "$migration_file")
    
    # Execute the SQL using the Supabase REST API
    response=$(curl -s -X POST "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec" \
      -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
      -H "Content-Type: application/json" \
      -d "{\"query\": \"${SQL}\"}")
    
    # Check the response
    if [[ "$response" == *"error"* ]]; then
      echo "Error executing migration: $response"
      exit 1
    fi
  done
fi

echo "Migrations applied successfully!" 