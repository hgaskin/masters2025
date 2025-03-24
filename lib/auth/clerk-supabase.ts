import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase/types';

/**
 * Creates a Supabase client authenticated with the Clerk user
 * Following the official Clerk-Supabase integration guide:
 * https://clerk.com/docs/integrations/databases/supabase
 */
export async function createClerkSupabaseClient() {
  const authData = await auth();
  
  if (!authData.userId) {
    throw new Error('User not authenticated');
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // Get the Supabase JWT from Clerk using the template
  const supabaseToken = await authData.getToken({ template: 'supabase' });
  
  if (!supabaseToken) {
    throw new Error('Unable to get Supabase token from Clerk');
  }
  
  // Create a Supabase client with the token
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
} 