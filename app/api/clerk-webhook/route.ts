import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(req: Request) {
  console.log('Webhook received');
  
  // Get the headers - headers() must be awaited
  const headersList = await headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  // If there are no headers, return error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers');
    return new Response('Error: Missing svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  console.log('Webhook payload type:', payload.type);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Invalid webhook signature', {
      status: 400
    });
  }

  // Get the event type
  const eventType = evt.type;
  console.log('Processing webhook event:', eventType);
  
  // Handle session events separately
  if (eventType === 'session.created') {
    console.log('Session created event received - no action needed');
    return new Response('Session event acknowledged', { status: 200 });
  }
  
  const supabase = createServerClient();

  // Handle each event type
  try {
    switch (eventType) {
      case 'user.created': {
        console.log('Creating new user in Supabase');
        // Create a new user in your database
        const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
        
        if (!id) {
          throw new Error('Missing user ID in webhook data');
        }
        
        const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id)?.email_address;
        
        console.log('User data:', { 
          clerk_id: id, 
          email: primaryEmail,
          first_name,
          last_name
        });
        
        const { data, error } = await supabase
          .from('users')
          .insert({
            clerk_id: id,
            email: primaryEmail || null,
            first_name: first_name || null,
            last_name: last_name || null,
            username: username || null,
            avatar_url: image_url || null,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (error) {
          console.error('Error inserting user:', error);
          throw error;
        }
        
        console.log('User created successfully:', data);
        break;
      }
      
      case 'user.updated': {
        console.log('Updating user in Supabase');
        // Update user in your database
        const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
        
        if (!id) {
          throw new Error('Missing user ID in webhook data');
        }
        
        const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id)?.email_address;
        
        const { error } = await supabase
          .from('users')
          .update({
            email: primaryEmail || null,
            first_name: first_name || null,
            last_name: last_name || null,
            username: username || null,
            avatar_url: image_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('clerk_id', id);
          
        if (error) {
          console.error('Error updating user:', error);
          throw error;
        }
        
        console.log('User updated successfully');
        break;
      }
      
      case 'user.deleted': {
        console.log('Deleting user from Supabase');
        // Delete user from your database
        const { id } = evt.data;
        
        if (!id) {
          throw new Error('Missing user ID in webhook data');
        }
        
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('clerk_id', id);
          
        if (error) {
          console.error('Error deleting user:', error);
          throw error;
        }
        
        console.log('User deleted successfully');
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    
    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
} 