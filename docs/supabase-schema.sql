-- Supabase schema for Fishing Tournament Manager (Phase 4)
-- Run this in the Supabase SQL editor once before using cloud sync.
--
-- After running this:
--   1. Enable Realtime for 'weigh_ins' and 'teams' tables in the Supabase dashboard
--   2. Copy Project URL + anon key from Project Settings → API
--   3. Create .env.local at project root:
--      VITE_SUPABASE_URL=https://your-project.supabase.co
--      VITE_SUPABASE_ANON_KEY=your-anon-key-here

CREATE TABLE tournaments (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  rules JSONB,
  public_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  tournament_id TEXT REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  team_number INTEGER NOT NULL,
  members JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE weigh_ins (
  id TEXT PRIMARY KEY,
  tournament_id TEXT REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  team_number INTEGER,
  day INTEGER,
  fish_count INTEGER,
  raw_weight DECIMAL(10,2),
  fish_released INTEGER,
  big_fish_weight DECIMAL(10,2),
  received_by TEXT,
  issued_by TEXT,
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE weigh_ins ENABLE ROW LEVEL SECURITY;

-- Public read (spectator mode — no auth required)
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read weigh_ins" ON weigh_ins FOR SELECT USING (true);

-- Authenticated owner writes
CREATE POLICY "Owners write tournaments" ON tournaments
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners write teams" ON teams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.owner_id = auth.uid())
  );

CREATE POLICY "Owners write weigh_ins" ON weigh_ins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.owner_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Phase 5: Subscription table
-- Edge Functions write via service_role key (bypasses RLS)
-- ---------------------------------------------------------------------------

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'org')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Phase 6a: Device tokens for push notifications
-- ---------------------------------------------------------------------------

CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tokens" ON device_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Phase 6b: Tournament members for role-based access (Org tier)
-- ---------------------------------------------------------------------------

CREATE TABLE tournament_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id TEXT REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'operator', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(tournament_id, user_id)
);
ALTER TABLE tournament_members ENABLE ROW LEVEL SECURITY;
-- Owners and members can see the member list
CREATE POLICY "Members read tournament_members" ON tournament_members
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM tournaments t WHERE t.id = tournament_id AND t.owner_id = auth.uid())
  );
-- Operator write policies for weigh_ins and teams
CREATE POLICY "Operators write weigh_ins" ON weigh_ins
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tournament_members m
      WHERE m.tournament_id = weigh_ins.tournament_id
        AND m.user_id = auth.uid() AND m.role IN ('owner','operator'))
  );
CREATE POLICY "Operators write teams" ON teams
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tournament_members m
      WHERE m.tournament_id = teams.tournament_id
        AND m.user_id = auth.uid() AND m.role IN ('owner','operator'))
  );
