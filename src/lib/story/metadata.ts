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
  drill_id: string; // e.g., "EXPL_BURPEE_001"
  discipline: string; // e.g., "soccer"
  skill_category: string; // e.g., "explosive_power"
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
  athleteName: string; //  Athlete's display name
  athleteAddress: Address; // Wallet address
  drillInfo: DrillInfo;
  media: MediaInfo;
  description?: string;
}): IpMetadata {
  const { athleteName, athleteAddress, drillInfo, media, description } = params;

  // Generate descriptive title
  const title = `${drillInfo.skill_category.replace("_", " ")} Drill - ${
    drillInfo.experience_level
  } Athlete`;

  return {
    title,
    description:
      description ||
      `${drillInfo.discipline} training drill with performance data`,
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
      drill_id: drillInfo.drill_id,
      discipline: drillInfo.discipline,
      skill_category: drillInfo.skill_category,
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
  drillId: string; // e.g., "MENT_PATTERN_001"
  discipline: string;
  experienceLevel: string;
  media: MediaInfo;
  verificationPhrase?: string;
  questions?: string[];
}): IpMetadata {
  const {
    athleteName,
    athleteAddress,
    drillId,
    discipline,
    experienceLevel,
    media,
    verificationPhrase,
    questions,
  } = params;

  const title = `Mental Patterns - ${experienceLevel} ${discipline} Athlete`;

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
      drill_id: drillId,
      discipline,
      experience_level: experienceLevel,
      asset_type: "audio",
      verification_phrase: verificationPhrase,
      questions_count: questions?.length || 0,
    },
  };
}

/**
 * Build NFT metadata (simpler, for the ownership token)
 */
export function buildNFTMetadata(params: {
  title: string;
  description: string;
  imageUrl?: string;
}): {
  name: string;
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
