// Metadata types for submission protocol schemas

export interface VideoDrillMetadata {
  schema_version: string;
  asset_type: string;
  drill_type_id: string;
  athlete_profile: {
    discipline: string;
    experience_level: string;
  };
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

export interface AudioCapsuleMetadata {
  schema_version: string;
  asset_type: string;
  drill_type_id: string;
  athlete_profile: {
    discipline: string;
    experience_level: string;
  };
  verification_phrase: string;
  questions_answered: number;
  recording_duration_seconds: number;
  recorded_at: string;
}
