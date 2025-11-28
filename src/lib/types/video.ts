// Metadata structure and types for Video Drills

import { AthleteProfile } from "./metadata";

export interface VideoDrillMetadata {
  schema_version: string;
  asset_type: string;
  drill_type_id: string;
  athlete_profile: AthleteProfile;
  context: {
    session_intensity: string;
    filming_moment: string;
  };
  video_metadata: {
    resolution: string;
    framerate: number;
    duration_seconds: number;
  };
  cv_metrics: {
    cadence_avg: number;
    rep_count: number;
    rom_score: number;
    consistency_score: number;
    technique_breakdown_frame: number;
  };
  verification: {
    human_presence: boolean;
    mediapipe_confidence: number;
  };
}
