/**
 * Profile Score Constants
 *
 * Total possible score: 100 points
 */

// Foundation Score (20 points total)
export const WORLD_ID_POINTS = 15;
export const ACCOUNT_AGE_POINTS = 5;
export const ACCOUNT_AGE_DAYS_REQUIRED = 30;

// Video Excellence Score (60 points total)
export const VIDEO_MAX_POINTS = 60;
export const TOP_VIDEOS_COUNT = 5;

// Video Quality Weights (must sum to 1.0)
export const VIDEO_WEIGHTS = {
  ROM_SCORE: 0.35,           // 35% - Range of Motion (form quality)
  CONSISTENCY_SCORE: 0.30,   // 30% - Tempo maintenance
  CADENCE_SCORE: 0.25,       // 25% - Intensity/effort
  HUMAN_CONFIDENCE: 0.10,    // 10% - CV reliability check
} as const;

// Cadence Scoring
export const ELITE_CADENCE_RPM = 25; // 25 rpm = 1.0 score (elite sustained effort)

// Audio Contribution Score (12 points total)
export const AUDIO_POINTS_EACH = 4;
export const AUDIO_MAX_COUNT = 3;
export const AUDIO_MAX_POINTS = AUDIO_POINTS_EACH * AUDIO_MAX_COUNT; // 12

// Consistency Bonus (8 points total)
export const CONSISTENCY_MAX_POINTS = 8;
export const CONSISTENCY_ACTIVITY_BUFFER_DAYS = 45; // Grace period to maintain streak

// Consistency Streak Points
export const STREAK_POINTS = {
  2: 2,
  3: 4,
  4: 6,
  5: 8,
} as const;

// Score Ranges for Badges
export const SCORE_BADGES = {
  ELITE: 80,
  ADVANCED: 60,
  INTERMEDIATE: 40,
  DEVELOPING: 0,
} as const;

/**
 * Cadence Benchmarks for Reference
 *
 * - 10 rpm: 0.40 (moderate effort)
 * - 16.8 rpm: 0.67 (good effort)
 * - 20 rpm: 0.80 (strong effort)
 * - 25 rpm: 1.00 (elite sustained effort)
 * - 30+ rpm: 1.00 (capped)
 */
