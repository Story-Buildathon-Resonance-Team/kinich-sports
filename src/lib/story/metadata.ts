/**
 * IP Metadata Builders for Kinich
 * Creates metadata objects for Story Protocol IP registration
 */

import { IpMetadata } from "@story-protocol/core-sdk";
import { Address } from "viem";

/**
 * Creator information for IP metadata
 */
export interface Creator {
  name: string; // Athlete's display name
  address: Address; // Athlete's wallet address
  contributionPercent: number; // Always 100 for solo athletes
}

/**
 * Kinich-specific drill information (minimal on-chain data)
 */
export interface DrillInfo {
  drill_type_id: string; // e.g., "EXPL_BURPEE_001"
  drill_name: string; // e.g., "Burpee Max Effort" - from constants
  experience_level: string; // e.g., "elite"
}

/**
 * Media information for the asset
 */
export interface MediaInfo {
  url: string; // Supabase public URL
  type: "video" | "audio"; // Asset type
  mimeType: string; // e.g., "video/mp4", "audio/webm"
  hash?: string; // Optional: file hash for integrity
}

/**
 * Build IP metadata for video drill submission
 */
export function buildDrillIPMetadata(params: {
  athleteName: string; // Athlete's display name
  athleteAddress: Address; // Wallet address
  drillInfo: DrillInfo;
  media: MediaInfo;
  description?: string;
}): IpMetadata {
  const { athleteName, athleteAddress, drillInfo, media, description } = params;

  // Use drill name from constants as title
  const title = `${drillInfo.drill_name} - ${drillInfo.experience_level} Athlete`;

  return {
    title,
    description: description || `Training drill with verified performance data`,
    createdAt: Date.now().toString(),
    creators: [
      {
        name: athleteName,
        address: athleteAddress,
        contributionPercent: 100,
      },
    ],
    mediaUrl: media.url,
    mediaType: media.mimeType,
    ipType: "performance-data", // Custom type for Kinich

    // Additional searchable/filterable properties
    additionalProperties: {
      drill_type_id: drillInfo.drill_type_id,
      drill_name: drillInfo.drill_name,
      experience_level: drillInfo.experience_level,
    },
  };
}

/**
 * Build IP metadata for audio mental patterns submission
 */
export function buildAudioIPMetadata(params: {
  athleteName: string;
  athleteAddress: Address;
  drillTypeId: string; // e.g., "MENT_CAPSULE_001"
  drillName: string; // e.g., "Identity Capsule 1: The Origin Story" - from constants
  experienceLevel: string;
  media: MediaInfo;
  verificationMethod: "world_id" | "cv_video" | "world_id_and_cv_video";
  worldIdVerified: boolean;
  cvVideoVerified: boolean;
  questionsCount?: number;
}): IpMetadata {
  const {
    athleteName,
    athleteAddress,
    drillTypeId,
    drillName,
    experienceLevel,
    media,
    verificationMethod,
    worldIdVerified,
    cvVideoVerified,
    questionsCount,
  } = params;

  // Use drill name from constants as title
  const title = `${drillName} - ${experienceLevel} Athlete`;

  return {
    title,
    description: "Audio mental patterns and training reflections",
    createdAt: Date.now().toString(),
    creators: [
      {
        name: athleteName,
        address: athleteAddress,
        contributionPercent: 100,
      },
    ],
    mediaUrl: media.url,
    mediaType: media.mimeType,
    ipType: "training-data",

    additionalProperties: {
      drill_type_id: drillTypeId,
      drill_name: drillName,
      experience_level: experienceLevel,
      asset_type: "audio",
      verification_method: verificationMethod,
      world_id_verified: worldIdVerified,
      cv_video_verified: cvVideoVerified,
      questions_count: questionsCount || 0,
    },
  };
}

/**
 * Build NFT metadata (simpler, for the ownership token)
 */
export function buildNFTMetadata(params: {
  title: string | undefined;
  description: string;
  imageUrl?: string;
}): {
  name: string | undefined;
  description: string;
  image: string;
} {
  return {
    name: params.title,
    description: params.description,
    image: params.imageUrl || "", // Fallback image
  };
}

/**
 * Validate IP metadata before upload
 */
export function validateIPMetadata(metadata: IpMetadata): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!metadata.title || metadata.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (!metadata.creators || metadata.creators.length === 0) {
    errors.push("At least one creator is required");
  }

  if (metadata.creators) {
    const totalContribution = metadata.creators.reduce(
      (sum, creator) => sum + creator.contributionPercent,
      0
    );
    if (totalContribution !== 100) {
      errors.push(
        `Creator contribution must equal 100% (currently ${totalContribution}%)`
      );
    }
  }

  if (!metadata.mediaUrl) {
    errors.push("Media URL is required");
  }

  if (!metadata.ipType) {
    errors.push("IP type is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
