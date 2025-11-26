-- Run this in Supabase SQL Editor to set up the database

-- Athletes table
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dynamic_user_id TEXT UNIQUE NOT NULL,
  wallet_address TEXT NOT NULL,
  name TEXT,
  discipline TEXT CHECK (discipline IN ('soccer', 'basketball', 'boxing', 'mma', 'swimming', 'tennis', 'crossfit', 'surfing', 'other')),
  competitive_level TEXT CHECK (competitive_level IN ('amateur', 'competitive', 'professional', 'elite')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  world_id_verified BOOLEAN DEFAULT FALSE,
  world_id_nullifier_hash TEXT UNIQUE,
  world_id_verified_at TIMESTAMP WITH TIME ZONE
);

-- Assets table
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('video', 'audio')),
  drill_type_id TEXT NOT NULL,
  story_ip_id TEXT UNIQUE,
  story_tx_hash TEXT, -- Transaction hash from IP registration
  ipfs_cid TEXT, -- IPFS hash of metadata
  asset_url TEXT NOT NULL, -- LivePeer URL for video file. Supabase public URL for audio file
  license_fee DECIMAL(10, 2) NOT NULL DEFAULT 15.00, -- Fee in $IP (e.g., 15.00 $IP)
  metadata JSONB NOT NULL, -- Full drill metadata from submission protocol
  cv_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_athletes_dynamic_user ON athletes(dynamic_user_id);
CREATE INDEX idx_athletes_wallet ON athletes(wallet_address);
CREATE INDEX idx_assets_athlete ON assets(athlete_id);
CREATE INDEX idx_assets_story_ip ON assets(story_ip_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_metadata ON assets USING GIN (metadata);
CREATE INDEX idx_assets_athlete_drill ON assets(athlete_id, drill_type_id); -- For querying all attempts of same drill by athlete
CREATE INDEX idx_assets_drill_type ON assets(drill_type_id); -- For filtering by drill type