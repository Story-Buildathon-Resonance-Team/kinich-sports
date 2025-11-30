// Metadata structure and types for Video Drills

import { AthleteProfile } from "./metadata";

export interface VideoDrillMetadata {
  // Standard IPFS/NFT Fields
  name?: string;
  description?: string;
  image?: string;
  properties?: Record<string, unknown>;

  schema_version: string; // "1.1"
  asset_type: string; // "video_drill"
  drill_type_id: string;
  athlete_profile: AthleteProfile;

  // Context about the session
  context: {
    session_intensity: string;
    filming_moment: string;
    device_type?: string; // mobile, webcam, etc.
  };

  // Technical video details
  video_metadata: {
    resolution: string;
    framerate: number;
    duration_seconds: number;
    file_size_bytes?: number;
    mime_type?: string;
  };

  // Computer Vision Analysis Metrics
  cv_metrics: {
    rep_count: number;
    rep_timestamps: number[]; // [2.5, 5.1, 8.3]
    avg_rep_duration: number;

    // Quality Metrics
    form_score_avg: number; // 0.0 - 1.0 based on vertical ratio adherence
    rom_score: number; // Range of Motion consistency
    consistency_score: number; // Temporal consistency (variance in rep speed)

    // Technical Analysis
    cadence_avg: number; // Reps per minute
    technique_breakdown_frame?: number; // Frame where form potentially failed
  };

  // Verification Proofs
  verification: {
    is_verified: boolean;
    verification_method: "cv_automated" | "manual_review";
    human_confidence_score: number; // Avg MediaPipe pose presence confidence
    liveness_check?: boolean; // Future: blink detection or prompt response
    processed_at: string;
  };
}
