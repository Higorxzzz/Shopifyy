-- Create invites table for managing subscription tokens
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  pushinpay_subscription_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Create policies for invites table
CREATE POLICY "Allow public to select valid unused invites" 
  ON public.invites FOR SELECT 
  USING (expires_at > NOW() AND used_at IS NULL);

CREATE POLICY "Allow service role to manage invites" 
  ON public.invites FOR ALL 
  USING (auth.role() = 'service_role');
