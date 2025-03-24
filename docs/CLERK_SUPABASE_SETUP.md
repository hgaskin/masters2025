# Setting up Clerk with Supabase

This guide explains how to set up Clerk with Supabase for the Masters25 project.

## 1. Create a Supabase JWT Template in Clerk

1. Go to the [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Navigate to your application
3. Go to **JWT Templates** in the sidebar
4. Click **New Template**
5. Name it `supabase`
6. Add the following claims:

```json
{
  "sub": "{{user.id}}",
  "aud": "authenticated",
  "role": "authenticated",
  "user_id": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "app_metadata": {
    "user_id": "{{user.id}}"
  }
}
```

7. Set the signing algorithm to `HS256`
8. For the signing key, you'll need to get your Supabase JWT Secret:
   - Go to your Supabase project
   - Go to **Settings** > **API**
   - Find the **JWT Settings** section
   - Copy the **JWT Secret**
9. Paste this value into the Clerk JWT template's signing key field
10. Save the template
11. Copy the same JWT Secret value to your `.env.local` file as `CLERK_JWT_SUPABASE_KEY`

## 2. Set Up the Supabase Function to Check Clerk JWT

The following SQL function has been created in Supabase to check the JWT from Clerk:

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

This function extracts the Clerk user ID from the `sub` claim in the JWT token.

## 3. Set Up Row Level Security (RLS) Policies

RLS policies have been created for all tables to restrict access based on the Clerk user ID. For example:

```sql
CREATE POLICY "Users can read their own user data" 
  ON public.users 
  FOR SELECT 
  USING (clerk_id = requesting_user_id());
```

This policy ensures that users can only read their own user data.

## 4. Using the Clerk-Supabase Integration in Your Code

To use the integration in your code, use the `createClerkSupabaseClient` function:

```typescript
import { createClerkSupabaseClient } from '@/lib/auth/clerk-supabase';

// In a server component or API route
const supabase = await createClerkSupabaseClient();

// Now use the Supabase client as usual
const { data, error } = await supabase.from('some_table').select();
```

The client automatically passes the Clerk JWT with the appropriate claims to Supabase, which then validates and uses it for Row Level Security. 