// TypeScript types for athlete data

export interface Athlete {
  id: string;
  dynamic_user_id: string;
  wallet_address: string;
  name: string | null;
  discipline: string | null;
  competitive_level: string | null;
  created_at: string;
  world_id_verified: boolean;
  world_id_nullifier_hash: string | null;
  world_id_verified_at: string | null;
}

export interface DynamicUserData {
  userId: string;
  firstName?: string;
  lastName?: string;
  verifiedCredentials: Array<{
    address: string;
    chain: string;
    id: string;
    walletName: string;
    walletProvider: string;
  }>;
  metadata?: {
    sport?: string;
    competitiveLevel?: string;
  };
}

// Type guard for Dynamic metadata
// Note: Dynamic returns metadata with capital letters and spaces
export interface DynamicMetadata {
  "Sport"?: string;
  "Competitive Level"?: string;
  [key: string]: unknown;
}

export interface SyncAthleteRequest {
  dynamicUserId: string;
  walletAddress: string;
  firstName?: string;
  lastName?: string;
  sport?: string;
  competitiveLevel?: string;
}

export interface SyncAthleteResponse {
  success: boolean;
  athlete?: Athlete;
  error?: string;
  isNewUser?: boolean;
}
