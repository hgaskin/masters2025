# Migrating from Clerk JWT Templates to Supabase Third-Party Auth

This document explains the migration from the deprecated Clerk JWT Template integration to the new official Supabase Third-Party Auth with Clerk.

## Background

As of April 1st, 2025, Supabase has officially deprecated the previous Clerk integration that used JWT templates. The new official integration offers:

- Better security (no need to share JWT secrets)
- Simpler setup (fewer environment variables required)
- Improved performance (no extra JWT generation step)
- Official support from both Supabase and Clerk

## Migration Steps

### 1. Configure Clerk

1. Go to the [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application instance
3. Navigate to "Integrations" → "Supabase"
4. Enable the Supabase integration (this adds the required role claim to your tokens)
5. Copy your Clerk domain (e.g., `your-app.clerk.accounts.dev`)

### 2. Configure Supabase

1. In the Supabase Dashboard, go to Authentication → Third-party Auth
2. Add a new provider and select "Clerk"
3. Paste your Clerk domain from the previous step
4. Save the configuration

### 3. Update Local Development Environment

Add this to your `supabase/config.toml` file:

```toml
[auth.third_party.clerk]
enabled = true
domain = "${CLERK_DOMAIN}"
```

Add your Clerk domain to your environment variables:

```
# Add to .env.local
CLERK_DOMAIN=your-clerk-domain.clerk.accounts.dev
```

### 4. Update Client Code

Replace the old client creation code:

```typescript
// Old approach using JWT template
const supabaseToken = await authData.getToken({ template: 'supabase' });
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      Authorization: `Bearer ${supabaseToken}`
    }
  },
  // ...
});
```

With the new approach:

```typescript
// For server components (in lib/auth/clerk-supabase.ts)
const token = await authData.getToken();
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      Authorization: `Bearer ${token}`
    }
  },
  // ...
});

// For client components (in lib/auth/clerk-supabase-client.ts)
// Note the 'use client' directive at the top of the file
const supabase = createClient(supabaseUrl, supabaseKey, {
  accessToken: async () => {
    return await getToken();
  },
  // ...
});
```

## Updated Implementation

Our codebase has been updated with two main files:

1. `lib/auth/clerk-supabase.ts` - Contains `createClerkSupabaseClient()` for server components and API routes
2. `lib/auth/clerk-supabase-client.ts` - Contains `useSupabaseClient()` hook for client components

### Important: Server/Client Separation

To avoid errors with server-only code in client components, we've split the functionality into separate files:

- Server-side authentication is imported from `@clerk/nextjs/server`
- Client-side authentication is imported from `@clerk/nextjs` with a `'use client'` directive

This prevents the "Invalid import 'server-only' cannot be imported from a Client Component module" error.

## Testing the Integration

You can test the integration by visiting `/auth-test` in your browser. This page will:

1. Display your authenticated user information
2. Let you test querying authenticated data from Supabase
3. Show the results of the test

## Cleanup

After confirming everything works, you can:

1. Remove any JWT template from your Clerk dashboard
2. Remove the `CLERK_JWT_SUPABASE_KEY` environment variable
3. Update any documentation that references the old integration

## Row Level Security (RLS) Policies

Your existing RLS policies should continue to work, as long as they use the standard JWT claim format with `auth.jwt()->>'sub'` to identify users.

## Troubleshooting

### "Invalid import 'server-only'" Error

If you see this error:
```
Error: Invalid import 'server-only' cannot be imported from a Client Component module
```

Make sure you're using:
- `lib/auth/clerk-supabase-client.ts` in client components (with 'use client' directive)
- `lib/auth/clerk-supabase.ts` in server components

This error occurs when server-only code from Clerk is inadvertently included in client components.

## Resources

- [Supabase Docs: Clerk Integration](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase Blog: Clerk Third-Party Auth Pricing](https://supabase.com/blog/clerk-tpa-pricing)
- [Clerk Docs: Connect with Supabase](https://clerk.com/docs/integrations/supabase) 