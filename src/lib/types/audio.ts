// Metadata structure, types, and helpers for Audio Capsules

import { AthleteProfile } from "./metadata";

export type VerificationMethod =
  | "world_id"
  | "cv_video"
  | "world_id_and_cv_video"
  | "none";

/**
 * Verification information for audio capsule
 */
export interface AudioVerification {
  world_id_verified: boolean;
  cv_video_verified: boolean;
  verification_method: VerificationMethod;
}

/**
 * Audio Capsule Metadata
 *
 * Stored in assets.metadata JSONB column and registered on Story Protocol
 */
export interface AudioCapsuleMetadata {
  schema_version: string;
  asset_type: string;
  drill_type_id: string; // "MENT_CAPSULE_001"

  athlete_profile: AthleteProfile;

  // Layered verification
  verification: AudioVerification;

  // Challenge details
  challenge_name: string;
  questions_answered: number;
  questions: string[];

  // Recording metadata
  recording_duration_seconds: number;
  recorded_at: string; // ISO timestamp
  file_size_bytes: number;
  mime_type: string; // "audio/webm" or "audio/ogg"
}

/**
 * Audio Access Check Response
 */
export interface AudioAccessResponse {
  hasAccess: boolean;
  method: VerificationMethod | "none";
  worldIdVerified: boolean;
  cvVideoVerified: boolean;
}

/**
 * Helper to determine verification method
 */
export function getVerificationMethod(
  worldIdVerified: boolean,
  cvVideoVerified: boolean
): VerificationMethod | "none" {
  if (worldIdVerified && cvVideoVerified) {
    return "world_id_and_cv_video";
  }
  if (worldIdVerified) {
    return "world_id";
  }
  if (cvVideoVerified) {
    return "cv_video";
  }
  return "none";
}

/**
 * Build audio capsule metadata object
 */
export function buildAudioCapsuleMetadata(params: {
  drillTypeId: string;
  challengeName: string;
  questions: string[];
  athleteDiscipline: string;
  athleteExperienceLevel: string;
  worldIdVerified: boolean;
  cvVideoVerified: boolean;
  recordingDurationSeconds: number;
  fileSizeBytes: number;
  mimeType: string;
}): AudioCapsuleMetadata {
  const {
    drillTypeId,
    challengeName,
    questions,
    athleteDiscipline,
    athleteExperienceLevel,
    worldIdVerified,
    cvVideoVerified,
    recordingDurationSeconds,
    fileSizeBytes,
    mimeType,
  } = params;

  return {
    schema_version: "1.0",
    asset_type: "audio_capsule",
    drill_type_id: drillTypeId,
    athlete_profile: {
      discipline: athleteDiscipline,
      experience_level: athleteExperienceLevel,
    },
    verification: {
      world_id_verified: worldIdVerified,
      cv_video_verified: cvVideoVerified,
      verification_method: getVerificationMethod(
        worldIdVerified,
        cvVideoVerified
      ),
    },
    challenge_name: challengeName,
    questions_answered: questions.length,
    questions: questions,
    recording_duration_seconds: recordingDurationSeconds,
    recorded_at: new Date().toISOString(),
    file_size_bytes: fileSizeBytes,
    mime_type: mimeType,
  };
}

/**
 * Validate audio capsule metadata
 */
export function validateAudioMetadata(metadata: AudioCapsuleMetadata): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!metadata.schema_version || metadata.schema_version !== "1.0") {
    errors.push("Invalid or missing schema version");
  }

  if (metadata.asset_type !== "audio_capsule") {
    errors.push("Asset type must be 'audio_capsule'");
  }

  if (!metadata.drill_type_id || !metadata.drill_type_id.startsWith("MENT_")) {
    errors.push("Invalid drill type ID");
  }

  if (!metadata.challenge_name || metadata.challenge_name.trim().length === 0) {
    errors.push("Challenge name is required");
  }

  if (!metadata.questions || metadata.questions.length === 0) {
    errors.push("At least one question is required");
  }

  if (metadata.questions_answered !== metadata.questions.length) {
    errors.push("Questions answered count must match questions array length");
  }

  if (
    !metadata.verification.world_id_verified &&
    !metadata.verification.cv_video_verified
  ) {
    errors.push("At least one verification method is required");
  }

  if (metadata.recording_duration_seconds <= 0) {
    errors.push("Recording duration must be greater than 0");
  }

  if (metadata.recording_duration_seconds > 300) {
    // 5 minutes max (buffer beyond 4 min limit)
    errors.push("Recording duration exceeds maximum allowed (5 minutes)");
  }

  if (metadata.file_size_bytes <= 0) {
    errors.push("File size must be greater than 0");
  }

  if (metadata.file_size_bytes > 10485760) {
    // 10MB limit
    errors.push("File size exceeds maximum allowed (10MB)");
  }

  if (!metadata.mime_type || !metadata.mime_type.startsWith("audio/")) {
    errors.push("Invalid MIME type");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
