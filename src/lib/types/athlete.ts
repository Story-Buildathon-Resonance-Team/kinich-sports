// TypeScript types for athlete data

// Available sports for athlete profiles
export const SPORTS = [
  'soccer',
  'basketball',
  'boxing',
  'mma',
  'swimming',
  'tennis',
  'crossfit',
  'surfing',
  'other',
] as const;

export type Sport = (typeof SPORTS)[number];

// Available competitive levels
export const COMPETITIVE_LEVELS = [
  'amateur',
  'competitive',
  'professional',
  'elite',
] as const;

export type CompetitiveLevel = (typeof COMPETITIVE_LEVELS)[number];

// Display labels for sports (capitalized for UI)
export const SPORT_LABELS: Record<Sport, string> = {
  soccer: 'Soccer',
  basketball: 'Basketball',
  boxing: 'Boxing',
  mma: 'MMA',
  swimming: 'Swimming',
  tennis: 'Tennis',
  crossfit: 'CrossFit',
  surfing: 'Surfing',
  other: 'Other',
};

// Display labels for competitive levels
export const COMPETITIVE_LEVEL_LABELS: Record<CompetitiveLevel, string> = {
  amateur: 'Amateur',
  competitive: 'Competitive',
  professional: 'Professional',
  elite: 'Elite',
};

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
