import { VideoDrillMetadata } from '@/lib/types/video';

/**
 * Type guard to check if metadata is a valid VideoDrillMetadata
 */
export function isVideoDrillMetadata(metadata: any): metadata is VideoDrillMetadata {
  return (
    metadata &&
    metadata.cv_metrics &&
    metadata.verification &&
    typeof metadata.cv_metrics.rom_score === 'number'
  );
}

/**
 * Type guard to check if video has valid CV metrics for scoring
 */
export function hasValidCVMetrics(metadata: any): boolean {
  const cv = metadata?.cv_metrics;
  return (
    cv &&
    typeof cv.rom_score === 'number' &&
    typeof cv.consistency_score === 'number' &&
    typeof cv.cadence_avg === 'number'
  );
}

/**
 * Type guard to check if video has valid verification data
 */
export function hasValidVerification(metadata: any): boolean {
  const verification = metadata?.verification;
  return (
    verification &&
    typeof verification.human_confidence_score === 'number'
  );
}
