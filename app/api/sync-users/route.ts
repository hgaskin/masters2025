import { clerkClient } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';

// IMPORTANT: This is an admin-only endpoint
export async function GET(req: Request) {
  try {
    // Security check - only admin users should access this
    const { userId } = await auth();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Optional: Add an admin check here
    // const isAdmin = userId === 'your_admin_user_id';
    // if (!isAdmin) { return new Response(JSON.stringify({ error: 'Admin access required' }), ... }

    // Get all users from Clerk
    const users = await clerkClient.users.getUserList({
      limit: 100,
    });

    // Connect to Supabase
    const supabase = createServerClient();

    // Track results
    const results = {
      total: users.length,
      created: 0,
      skipped: 0,
      errors: 0,
      details: [] as Array<{ id: string; status: string; message?: string }>
    };

    // Process each user
    for (const user of users) {
      try {
        // Check if user already exists in Supabase
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, clerk_id')
          .eq('clerk_id', user.id)
          .maybeSingle();

        if (existingUser) {
          results.skipped++;
          results.details.push({
            id: user.id,
            status: 'skipped',
            message: 'User already exists'
          });
          continue;
        }

        // Get primary email
        const primaryEmailObj = user.emailAddresses.find(
          (email: any) => email.id === user.primaryEmailAddressId
        );
        
        // Insert user into Supabase
        const { error } = await supabase
          .from('users')
          .insert({
            clerk_id: user.id,
            email: primaryEmailObj?.emailAddress || null,
            first_name: user.firstName || null,
            last_name: user.lastName || null,
            username: user.username || null,
            avatar_url: user.imageUrl || null,
            created_at: new Date().toISOString()
          });

        if (error) {
          throw error;
        }

        results.created++;
        results.details.push({
          id: user.id,
          status: 'created'
        });
      } catch (err: any) {
        results.errors++;
        results.details.push({
          id: user.id,
          status: 'error',
          message: err.message
        });
      }
    }

    // Return results with a summary at the top
    return new Response(JSON.stringify({
      summary: {
        total: results.total,
        created: results.created,
        skipped: results.skipped,
        errors: results.errors
      },
      details: results.details
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('Error syncing users:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error syncing users'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 