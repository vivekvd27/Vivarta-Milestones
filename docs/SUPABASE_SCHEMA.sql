/**
 * SUPABASE SCHEMA SETUP
 * 
 * Run this SQL in Supabase SQL Editor to create all tables
 * Dashboard: https://app.supabase.com/project/_/sql
 */

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users (id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: users can view only their own profile
CREATE POLICY "users_can_view_own_profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: users can update only their own profile
CREATE POLICY "users_can_update_own_profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- TIMELINE EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  type TEXT CHECK (type IN ('major', 'minor')) DEFAULT 'minor',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_timeline_user ON public.timeline_events(user_id);
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_timeline" ON public.timeline_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_timeline" ON public.timeline_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_timeline" ON public.timeline_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_timeline" ON public.timeline_events
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MEETINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  person TEXT,
  date TEXT NOT NULL,
  notes TEXT,
  status TEXT CHECK (status IN ('upcoming', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_meetings_user ON public.meetings(user_id);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_meetings" ON public.meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_meetings" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_meetings" ON public.meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_meetings" ON public.meetings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CONTACTS (NETWORKING) TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  notes TEXT,
  last_contact TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_contacts_user ON public.contacts(user_id);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_contacts" ON public.contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_contacts" ON public.contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_contacts" ON public.contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_contacts" ON public.contacts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUTURE EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.future_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  preparation_notes TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_future_events_user ON public.future_events(user_id);
ALTER TABLE public.future_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_future_events" ON public.future_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_future_events" ON public.future_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_future_events" ON public.future_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_future_events" ON public.future_events
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RULE OF 3 TASKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.rule_of_three_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  person TEXT NOT NULL DEFAULT 'General',
  task_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_rule_of_three_user ON public.rule_of_three_tasks(user_id);
ALTER TABLE public.rule_of_three_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_rule_of_three" ON public.rule_of_three_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_rule_of_three" ON public.rule_of_three_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_rule_of_three" ON public.rule_of_three_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_rule_of_three" ON public.rule_of_three_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- AFFIRMATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT CHECK (category IN ('Startup Guidelines', 'Mindset & Focus', 'Daily Execution')) DEFAULT 'Startup Guidelines',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_affirmations_user ON public.affirmations(user_id);
ALTER TABLE public.affirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_affirmations" ON public.affirmations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_affirmations" ON public.affirmations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_affirmations" ON public.affirmations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_affirmations" ON public.affirmations
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- GOALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('yearly', 'monthly', 'weekly')) DEFAULT 'yearly',
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  date TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_goals_user ON public.goals(user_id);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_announcements_user ON public.announcements(user_id);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_announcements" ON public.announcements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_announcements" ON public.announcements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_announcements" ON public.announcements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_announcements" ON public.announcements
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- MILESTONES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  due_date TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_milestones_user ON public.milestones(user_id);
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_milestones" ON public.milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_can_create_milestones" ON public.milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_can_update_milestones" ON public.milestones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_milestones" ON public.milestones
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ENABLE REALTIME (optional)
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.future_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rule_of_three_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.affirmations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestones;
