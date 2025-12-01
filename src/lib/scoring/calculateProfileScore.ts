import { createClient } from '@/utils/supabase/server';

/**
 * Safe wrapper for profile score calculation with silent error handling
 */
export async function recalculateAthleteScoreSafe(
  athleteId: string
): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    const score = await recalculateAthleteScore(athleteId);
    return { success: true, score };
  } catch (error) {
    console.error('[Profile Score] Calculation failed for athlete:', athleteId, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Recalculates and updates an athlete's profile score (0-100)
 *
 * Scoring breakdown:
 * - Foundation: 20pts (World ID 15pts + Account Age 5pts)
 * - Video Excellence: 60pts (top 5 video average)
 * - Audio Contribution: 12pts (4pts each, max 3)
 * - Consistency Bonus: 8pts (monthly streak)
 */
export async function recalculateAthleteScore(athleteId: string): Promise<number> {
  const supabase = await createClient();

  // Fetch all data in parallel with Promise.all
  const [athleteResult, videosResult, audiosResult, allAssetsResult] = await Promise.all([
    supabase
      .from('athletes')
      .select('world_id_verified, created_at')
      .eq('id', athleteId)
      .single(),

    supabase
      .from('assets')
      .select('metadata')
      .eq('athlete_id', athleteId)
      .eq('asset_type', 'video')
      .eq('cv_verified', true)
      .eq('status', 'active'),

    supabase
      .from('assets')
      .select('id')
      .eq('athlete_id', athleteId)
      .eq('asset_type', 'audio')
      .eq('status', 'active')
      .limit(3),

    supabase
      .from('assets')
      .select('created_at')
      .eq('athlete_id', athleteId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
  ]);

  // Error handling
  if (athleteResult.error) throw athleteResult.error;
  if (videosResult.error) throw videosResult.error;
  if (audiosResult.error) throw audiosResult.error;
  if (allAssetsResult.error) throw allAssetsResult.error;

  const athlete = athleteResult.data;
  const videos = videosResult.data;
  const audios = audiosResult.data;
  const allAssets = allAssetsResult.data;

  // A. Foundation Score (20pts)
  const worldIdScore = athlete.world_id_verified ? 15 : 0;

  let ageBonus = 0;
  if (allAssets && allAssets.length > 0) {
    const firstAssetDate = new Date(allAssets[allAssets.length - 1].created_at);
    const daysSinceFirst = Math.floor((Date.now() - firstAssetDate.getTime()) / (1000 * 60 * 60 * 24));
    ageBonus = daysSinceFirst >= 30 ? 5 : 0;
  }

  const foundationScore = worldIdScore + ageBonus;

  // B. Video Excellence Score (60pts)
  let videoScore = 0;
  if (videos && videos.length > 0) {
    const videoQualities = videos
      .map(v => calculateVideoQualityScore(v))
      .sort((a, b) => b - a);

    const top5 = videoQualities.slice(0, 5);
    const avgQuality = top5.reduce((sum, q) => sum + q, 0) / top5.length;
    videoScore = avgQuality * 60;
  }

  // C. Audio Contribution Score (12pts)
  const audioCount = audios?.length ?? 0;
  const audioScore = Math.min(audioCount * 4, 12);

  // D. Consistency Bonus (8pts) - WITH 45-DAY BUFFER
  const consistencyScore = calculateConsistencyBonus(allAssets);

  // E. Final Score
  const totalScore = foundationScore + videoScore + audioScore + consistencyScore;
  const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  // Update database
  await supabase.from('athletes').update({ profile_score: finalScore }).eq('id', athleteId);

  console.log(`✓ Profile score updated for athlete ${athleteId}: ${finalScore}`);
  return finalScore;
}

/**
 * Calculates video quality score (0.0 - 1.0) based on CV metrics
 *
 * Weighted breakdown:
 * - ROM Score: 35%
 * - Consistency Score: 30%
 * - Cadence Score: 25% (normalized: 25 rpm = 1.0)
 * - Human Confidence: 10%
 */
function calculateVideoQualityScore(video: any): number {
  const cv = video.metadata?.cv_metrics;
  const verification = video.metadata?.verification;

  if (!cv || !verification) return 0;

  const romScore = cv.rom_score ?? 0;
  const consistencyScore = cv.consistency_score ?? 0;
  const cadenceAvg = cv.cadence_avg ?? 0;
  const humanConfidence = verification.human_confidence_score ?? 0;

  // Normalize cadence (25 rpm = 1.0, elite sustained effort)
  const cadenceScore = Math.min(cadenceAvg / 25, 1.0);

  // Weighted scoring (percentages sum to 100%)
  const weighted =
    (romScore * 0.35) +           // 35% - Range of Motion (form quality)
    (consistencyScore * 0.30) +   // 30% - Tempo maintenance
    (cadenceScore * 0.25) +       // 25% - Intensity/effort
    (humanConfidence * 0.10);     // 10% - CV reliability check

  return weighted; // Returns 0.0 - 1.0
}

/**
 * Calculates consistency bonus (0-8pts) based on monthly submission streak
 *
 * Scoring:
 * - 2 months: 2pts
 * - 3 months: 4pts
 * - 4 months: 6pts
 * - 5+ months: 8pts
 *
 * Uses 45-day buffer to prevent streak loss at month boundaries
 */
function calculateConsistencyBonus(assets: any[]): number {
  if (!assets || assets.length === 0) return 0;

  // 45-DAY BUFFER CHECK
  const mostRecentDate = new Date(assets[0].created_at);
  const daysSinceLastAsset = Math.floor((Date.now() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastAsset > 45) {
    return 0; // Streak broken
  }

  // Extract unique months in YYYY-MM format
  const monthsSet = new Set(assets.map(a => a.created_at.substring(0, 7)));
  const sortedMonths = Array.from(monthsSet).sort().reverse();

  // Count consecutive months
  let streak = 1;
  for (let i = 0; i < sortedMonths.length - 1; i++) {
    const current = new Date(sortedMonths[i] + "-01");
    const next = new Date(sortedMonths[i + 1] + "-01");
    const monthDiff =
      (current.getFullYear() - next.getFullYear()) * 12 +
      (current.getMonth() - next.getMonth());

    if (monthDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  // Map streak to points
  if (streak >= 5) return 8;
  if (streak === 4) return 6;
  if (streak === 3) return 4;
  if (streak === 2) return 2;
  return 0;
}
