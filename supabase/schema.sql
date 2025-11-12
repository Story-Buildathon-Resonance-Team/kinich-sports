-- Run this in Supabase SQL Editor to set up the database

-- Athletes table
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  name TEXT,
  discipline TEXT,
  sub_discipline TEXT,
  competitive_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('video', 'audio')),
  drill_id TEXT NOT NULL,
  story_ip_id TEXT,
  ipfs_cid TEXT,
  asset_url TEXT NOT NULL,
  license_fee BIGINT NOT NULL DEFAULT 10000000000000000000,
  metadata JSONB NOT NULL,
  cv_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_athletes_wallet ON athletes(wallet_address);
CREATE INDEX idx_assets_athlete ON assets(athlete_id);
CREATE INDEX idx_assets_metadata ON assets USING GIN (metadata);