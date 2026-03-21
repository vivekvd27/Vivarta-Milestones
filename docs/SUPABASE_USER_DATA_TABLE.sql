/**
 * SUPABASE USER DATA TABLE
 * 
 * Run this SQL in Supabase SQL Editor to create the user_data table
 * This stores the entire app state (JSON) for each user without authentication
 * 
 * Dashboard: https://app.supabase.com/project/_/sql
 */

-- ============================================
-- USER DATA TABLE (stores full app state)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL UNIQUE,
  state_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index for user_name lookups
CREATE INDEX idx_user_data_username ON public.user_data(user_name);

-- Enable RLS (optional - can disable for demo mode)
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view data (no auth required for demo)
-- To restrict by user_name, uncomment below:
/*
CREATE POLICY "users_can_view_own_data" ON public.user_data
  FOR SELECT USING (TRUE);  -- Allow all for now

CREATE POLICY "users_can_update_own_data" ON public.user_data
  FOR UPDATE USING (TRUE);  -- Allow all for now

CREATE POLICY "users_can_insert_data" ON public.user_data
  FOR INSERT WITH CHECK (TRUE);  -- Allow all for now
*/

-- Grant permissions (if using auth)
-- GRANT SELECT, UPDATE, INSERT ON public.user_data TO authenticated;
-- GRANT SELECT, UPDATE, INSERT ON public.user_data TO anon;
