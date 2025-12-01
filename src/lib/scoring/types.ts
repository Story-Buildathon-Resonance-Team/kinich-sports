import { VideoDrillMetadata } from "@/lib/types/video";

export function isVideoDrillMetadata(
  metadata: any
): metadata is VideoDrillMetadata {
  return (
    metadata &&
    metadata.cv_metrics &&
    metadata.verification &&
    typeof metadata.cv_metrics.rom_score === "number"
  );
}

export function hasValidCVMetrics(metadata: any): boolean {
  const cv = metadata?.cv_metrics;
  return (
    cv &&
    typeof cv.rom_score === "number" &&
    typeof cv.consistency_score === "number" &&
    typeof cv.cadence_avg === "number"
  );
}

export function hasValidVerification(metadata: any): boolean {
  const verification = metadata?.verification;
  return (
    verification && typeof verification.human_confidence_score === "number"
  );
}
