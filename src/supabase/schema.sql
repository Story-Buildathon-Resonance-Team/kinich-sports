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
  story_ip_id TEXT UNIQUE, -- Each Story IP ID maps to exactly one asset
  story_tx_hash TEXT, -- Transaction hash from IP registration
  ipfs_cid TEXT, -- IPFS hash of metadata
  asset_url TEXT NOT NULL, -- Supabase public URL
  license_fee DECIMAL(10, 2) NOT NULL DEFAULT 15.00, -- Fee in $IP (e.g., 15.00 $IP)
  metadata JSONB NOT NULL, -- Full drill metadata from submission
  cv_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- License purchases table
-- Tracks which wallets purchased licenses for which assets
CREATE TABLE license_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_wallet TEXT NOT NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  story_license_token_id TEXT NOT NULL, -- License NFT token ID from Story
  purchase_tx_hash TEXT NOT NULL, -- Transaction hash from license mint
  amount_paid DECIMAL(10, 2) NOT NULL, -- Amount in $IP (e.g., 15.00 $IP)  
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_athletes_wallet ON athletes(wallet_address);
CREATE INDEX idx_assets_athlete ON assets(athlete_id);
CREATE INDEX idx_assets_story_ip ON assets(story_ip_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_metadata ON assets USING GIN (metadata);
CREATE INDEX idx_license_purchases_buyer ON license_purchases(buyer_wallet);
CREATE INDEX idx_license_purchases_asset ON license_purchases(asset_id);
CREATE INDEX idx_license_purchases_buyer_asset ON license_purchases(buyer_wallet, asset_id); -- Fast lookup for access checks