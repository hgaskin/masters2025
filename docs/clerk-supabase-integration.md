# Clerk-Supabase Integration

This project uses [Clerk](https://clerk.com/) for authentication and [Supabase](https://supabase.com/) as the database. Here's how they work together.

## Official Documentation

This implementation follows the official integration guides:
- [Clerk Docs: Integrate Supabase with Clerk](https://clerk.com/docs/integrations/databases/supabase)
- [Supabase Docs: Clerk Integration](https://supabase.com/partners/integrations/clerk)
- [Example Repo: clerk-supabase-nextjs](https://github.com/clerk/clerk-supabase-nextjs)

## Environment Setup

Ensure these environment variables are set in `.env.local`:

```
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
CLERK_JWT_SUPABASE_KEY=your_supabase_jwt_secret_for_clerk

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## How It Works

1. **JWT Integration**:
   - A JWT template is created in the Clerk dashboard using the Supabase JWT secret
   - This JWT is used to authenticate requests to Supabase

2. **Authentication Flow**:
   - Users sign in with Clerk
   - Clerk handles the auth flow, session management, and user data
   - The Clerk middleware protects routes based on the config in `middleware.ts`

3. **Database Integration**:
   - We use `createServerClient()` for server-side database operations
   - We use `createBrowserClient()` for client-side database operations
   - When user authentication is needed, we use `createClerkSupabaseClient()` which attaches the user's JWT

4. **Webhook Integration**:
   - The webhook at `/api/clerk-webhook/route.ts` listens for Clerk events
   - When a user is created, updated, or deleted in Clerk, the webhook updates the Supabase database

## Database Schema

Our database migration files are organized in the Supabase migrations folder:

```
supabase/
  ├── migrations/
  │   └── 20240623000000_add_clerk_auth.sql  # Initial schema with RLS policies
  └── config.toml
```

## Requesting User ID Function

We use a PostgreSQL function to extract the Clerk user ID from the JWT:

```sql
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
DECLARE
  user_id TEXT;
BEGIN
  -- Extract the 'sub' claim from the JWT token
  user_id := nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## How to Use

### Server Component

```tsx
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/client";

export default async function MyServerComponent() {
  const { userId } = await auth();
  
  // Use Supabase with service role (admin access)
  const supabase = createServerClient();
  const { data } = await supabase.from('my_table').select();
  
  return <div>Data: {JSON.stringify(data)}</div>;
}
```

### Client Component with Authentication

```tsx
"use client";
import { useUser } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/auth/clerk-supabase";
import { useState, useEffect } from "react";

export default function MyClientComponent() {
  const { user } = useUser();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      if (user) {
        const supabase = await createClerkSupabaseClient();
        const { data } = await supabase.from('my_table').select();
        setData(data);
      }
    }
    
    fetchData();
  }, [user]);
  
  return <div>Data: {JSON.stringify(data)}</div>;
}
```

## Troubleshooting

1. **Authentication Issues**:
   - Check that Clerk environment variables are set correctly
   - Ensure the middleware is configured properly in `middleware.ts`
   - Verify the JWT template is set up in the Clerk dashboard for Supabase

2. **Database Connection Issues**:
   - Check Supabase environment variables
   - Ensure the database schema matches the types defined in `lib/supabase/types.ts`
   - Verify Row Level Security (RLS) policies in Supabase

## Setup Steps

1. Get your Supabase JWT Secret from the Supabase dashboard
2. Create a JWT Template in Clerk dashboard with the name `supabase`
3. Set the JWT Template to use the Supabase JWT Secret
4. Add claims to the JWT Template for the user ID
5. Set up your environment variables
6. Apply the database migrations
7. Test the integration 