import { createClient } from "@/utils/supabase/server";
import {
  WORLD_ID_POINTS,
  ACCOUNT_AGE_POINTS,
  ACCOUNT_AGE_DAYS_REQUIRED,
  VIDEO_MAX_POINTS,
  TOP_VIDEOS_COUNT,
  VIDEO_WEIGHTS,
  ELITE_CADENCE_RPM,
  AUDIO_POINTS_EACH,
  AUDIO_MAX_POINTS,
  CONSISTENCY_ACTIVITY_BUFFER_DAYS,
  STREAK_POINTS,
} from "./constants";
import { hasValidCVMetrics, hasValidVerification } from "./types";

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
    console.error(
      "[Profile Score] Calculation failed for athlete:",
      athleteId,
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function recalculateAthleteScore(
  athleteId: string
): Promise<number> {
  const supabase = await createClient();

  const [athleteResult, videosResult, audiosResult, allAssetsResult] =
    await Promise.all([
      supabase
        .from("athletes")
        .select("world_id_verified, created_at")
        .eq("id", athleteId)
        .single(),

      supabase
        .from("assets")
        .select("metadata")
        .eq("athlete_id", athleteId)
        .eq("asset_type", "video")
        .eq("cv_verified", true)
        .eq("status", "active"),

      supabase
        .from("assets")
        .select("id")
        .eq("athlete_id", athleteId)
        .eq("asset_type", "audio")
        .eq("status", "active")
        .limit(3),

      supabase
        .from("assets")
        .select("created_at")
        .eq("athlete_id", athleteId)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

  if (athleteResult.error) throw athleteResult.error;
  if (videosResult.error) throw videosResult.error;
  if (audiosResult.error) throw audiosResult.error;
  if (allAssetsResult.error) throw allAssetsResult.error;

  const athlete = athleteResult.data;
  const videos = videosResult.data;
  const audios = audiosResult.data;
  const allAssets = allAssetsResult.data;

  const worldIdScore = athlete.world_id_verified ? WORLD_ID_POINTS : 0;

  let ageBonus = 0;
  if (allAssets && allAssets.length > 0) {
    const firstAssetDate = new Date(allAssets[allAssets.length - 1].created_at);
    const daysSinceFirst = Math.floor(
      (Date.now() - firstAssetDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    ageBonus =
      daysSinceFirst >= ACCOUNT_AGE_DAYS_REQUIRED ? ACCOUNT_AGE_POINTS : 0;
  }

  const foundationScore = worldIdScore + ageBonus;

  let videoScore = 0;
  if (videos && videos.length > 0) {
    const videoQualities = videos
      .map((v) => calculateVideoQualityScore(v))
      .sort((a, b) => b - a);

    const topVideos = videoQualities.slice(0, TOP_VIDEOS_COUNT);
    const avgQuality =
      topVideos.reduce((sum, q) => sum + q, 0) / topVideos.length;
    videoScore = avgQuality * VIDEO_MAX_POINTS;
  }

  const audioCount = audios?.length ?? 0;
  const audioScore = Math.min(audioCount * AUDIO_POINTS_EACH, AUDIO_MAX_POINTS);

  const consistencyScore = calculateConsistencyBonus(allAssets);

  const totalScore =
    foundationScore + videoScore + audioScore + consistencyScore;
  const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  await supabase
    .from("athletes")
    .update({ profile_score: finalScore })
    .eq("id", athleteId);

  console.log(`Profile score updated for athlete ${athleteId}: ${finalScore}`);
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
  if (
    !hasValidCVMetrics(video.metadata) ||
    !hasValidVerification(video.metadata)
  ) {
    return 0;
  }

  const cv = video.metadata.cv_metrics;
  const verification = video.metadata.verification;

  const romScore = cv.rom_score ?? 0;
  const consistencyScore = cv.consistency_score ?? 0;
  const cadenceAvg = cv.cadence_avg ?? 0;
  const humanConfidence = verification.human_confidence_score ?? 0;

  const cadenceScore = Math.min(cadenceAvg / ELITE_CADENCE_RPM, 1.0);

  const weighted =
    romScore * VIDEO_WEIGHTS.ROM_SCORE +
    consistencyScore * VIDEO_WEIGHTS.CONSISTENCY_SCORE +
    cadenceScore * VIDEO_WEIGHTS.CADENCE_SCORE +
    humanConfidence * VIDEO_WEIGHTS.HUMAN_CONFIDENCE;

  return weighted; // Returns 0.0 - 1.0
}

function calculateConsistencyBonus(assets: any[]): number {
  if (!assets || assets.length === 0) return 0;

  const mostRecentDate = new Date(assets[0].created_at);
  const daysSinceLastAsset = Math.floor(
    (Date.now() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastAsset > CONSISTENCY_ACTIVITY_BUFFER_DAYS) {
    return 0; // Streak broken
  }

  const monthsSet = new Set(assets.map((a) => a.created_at.substring(0, 7)));
  const sortedMonths = Array.from(monthsSet).sort().reverse();

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

  if (streak >= 5) return STREAK_POINTS[5];
  if (streak === 4) return STREAK_POINTS[4];
  if (streak === 3) return STREAK_POINTS[3];
  if (streak === 2) return STREAK_POINTS[2];
  return 0;
}
