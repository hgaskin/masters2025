'use client';

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';
import { Database } from '../supabase/types';

/**
 * Hook for client components to get an authenticated Supabase client
 * Uses the official Supabase Third-Party Auth integration with Clerk
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      global: {},
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      accessToken: async () => {
        return await getToken();
      },
    }
  );
} 