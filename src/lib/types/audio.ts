import { AthleteProfile } from "./metadata";

export type VerificationMethod =
  | "world_id"
  | "cv_video"
  | "world_id_and_cv_video"
  | "none";

export interface AudioVerification {
  world_id_verified: boolean;
  cv_video_verified: boolean;
  verification_method: VerificationMethod;
}

export interface AudioCapsuleMetadata {
  schema_version: string;
  asset_type: string;
  drill_type_id: string;
  athlete_profile: AthleteProfile;
  verification: AudioVerification;
  challenge_name: string;
  questions_answered: number;
  questions: string[];
  recording_duration_seconds: number;
  recorded_at: string;
  file_size_bytes: number;
  mime_type: string;
}

export interface AudioAccessResponse {
  hasAccess: boolean;
  method: VerificationMethod | "none";
  worldIdVerified: boolean;
  cvVideoVerified: boolean;
}

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
    errors.push("Recording duration exceeds maximum allowed (5 minutes)");
  }

  if (metadata.file_size_bytes <= 0) {
    errors.push("File size must be greater than 0");
  }

  if (metadata.file_size_bytes > 10485760) {
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
