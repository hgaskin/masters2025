import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';

/**
 * Creates a Supabase client authenticated with the Clerk user
 * Using the official Supabase Third-Party Auth integration:
 * https://supabase.com/blog/clerk-tpa-pricing
 * 
 * Following the latest pattern from Clerk:
 * https://clerk.com/changelog/2025-03-31-supabase-integration
 */
export async function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Create a Supabase client with the accessToken callback pattern
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      // Using the accessToken callback pattern is now recommended
      // for both server and client components
      async accessToken() {
        const authData = await auth();
        if (!authData.userId) {
          throw new Error('User not authenticated');
        }
        return authData.getToken();
      },
    }
  );
} 