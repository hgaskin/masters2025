import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(req: Request) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get current user details from Clerk
    const user = await currentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Connect to Supabase
    const supabase = createServerClient();
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, clerk_id, updated_at')
      .eq('clerk_id', userId)
      .maybeSingle();
      
    if (checkError) {
      throw checkError;
    }
    
    const primaryEmail = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress;
      
    let result;
    
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          email: primaryEmail || null,
          first_name: user.firstName || null,
          last_name: user.lastName || null,
          username: user.username || null,
          avatar_url: user.imageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', userId)
        .select()
        .single();
        
      if (error) throw error;
      result = { action: 'updated', user: data };
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          email: primaryEmail || null,
          first_name: user.firstName || null,
          last_name: user.lastName || null,
          username: user.username || null,
          avatar_url: user.imageUrl || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      result = { action: 'created', user: data };
    }

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error syncing current user:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to sync user'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 