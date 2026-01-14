-- DEFICIT Waitlist Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  referral_source TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for public signups)
CREATE POLICY "Allow public inserts" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only service role can select/update/delete (for admin)
-- The service role key bypasses RLS, so admin routes work automatically
