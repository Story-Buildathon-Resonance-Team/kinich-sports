-- Run this in Supabase SQL Editor to set up the database

-- Athletes table
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  name TEXT,
  discipline TEXT,
  competitive_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('video', 'audio')),
  drill_id UUID REFERENCES drills(id) ON DELETE SET NULL,
  story_ip_id TEXT UNIQUE,
  story_tx_hash TEXT, -- Transaction hash from IP registration
  ipfs_cid TEXT, -- IPFS hash of metadata
  asset_url TEXT NOT NULL, -- LivePeer URL for video file. Supabase public URL for audio file
  license_fee DECIMAL(10, 2) NOT NULL DEFAULT 15.00, -- Fee in $IP (e.g., 15.00 $IP)
  metadata JSONB NOT NULL, -- Full drill metadata from submission
  cv_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drill table
CREATE TABLE drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  drill_type TEXT NOT NULL CHECK (drill_type IN ('skill', 'mental capsule'))
)

-- Indexes
CREATE INDEX idx_athletes_wallet ON athletes(wallet_address);
CREATE INDEX idx_assets_athlete ON assets(athlete_id);
CREATE INDEX idx_assets_story_ip ON assets(story_ip_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_metadata ON assets USING GIN (metadata);
CREATE INDEX idx_drills_name ON drills(name);
