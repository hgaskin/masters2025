-- Create users table with Clerk ID
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can read their own user data" 
  ON public.users 
  FOR SELECT 
  USING (clerk_id = requesting_user_id());

-- Allow inserting for the webhook
CREATE POLICY "Service role can insert users" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Allow updating for the webhook
CREATE POLICY "Service role can update users" 
  ON public.users 
  FOR UPDATE 
  USING (true);

-- Allow deleting for the webhook
CREATE POLICY "Service role can delete users" 
  ON public.users 
  FOR DELETE 
  USING (true);