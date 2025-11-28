/**
 * POST /api/register-audio
 *
 * Registers an audio asset as an IP on Story Protocol
 * Called by frontend immediately after audio upload to DB
 *
 * Flow:
 * 1. Validate request data
 * 2. Call registerIPAsset() (platform pays gas)
 * 3. Update asset in database with Story Protocol data
 * 4. Return success with IP ID
 */

import { NextRequest, NextResponse } from "next/server";
import { registerIPAsset } from "@/lib/story/actions";
import { buildAudioIPMetadata, buildNFTMetadata } from "@/lib/story/metadata";
import { createClient } from "@/utils/supabase/server";
import { getDrillById } from "@/lib/drills/constants";
import { Address } from "viem";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      assetId, // UUID from database
      athleteWallet,
      athleteName,
      drillTypeId,
      experienceLevel,
      mediaUrl,
      mimeType,
      licenseFee,
      questionsCount,
      verificationMethod,
      worldIdVerified,
      cvVideoVerified,
    } = body;

    if (
      !assetId ||
      !athleteWallet ||
      !athleteName ||
      !drillTypeId ||
      !mediaUrl ||
      !licenseFee ||
      !verificationMethod
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate verification method
    if (
      verificationMethod !== "world_id" &&
      verificationMethod !== "cv_video" &&
      verificationMethod !== "world_id_and_cv_video"
    ) {
      return NextResponse.json(
        { error: "Invalid verification method" },
        { status: 400 }
      );
    }

    // Ensure at least one verification is true
    if (!worldIdVerified && !cvVideoVerified) {
      return NextResponse.json(
        { error: "At least one verification method must be active" },
        { status: 400 }
      );
    }

    console.log("[Register Audio] Starting registration");
    console.log("[Register Audio] Asset ID:", assetId);
    console.log("[Register Audio] Athlete:", athleteWallet);
    console.log("[Register Audio] Verification:", verificationMethod);

    // Get drill definition from constants
    const drill = getDrillById(drillTypeId);
    if (!drill || drill.asset_type !== "audio") {
      return NextResponse.json(
        { error: "Invalid drill type ID or not an audio drill" },
        { status: 400 }
      );
    }

    // Build IP metadata using metadata builder
    const ipMetadata = buildAudioIPMetadata({
      athleteName,
      athleteAddress: athleteWallet as Address,
      drillTypeId,
      drillName: drill.name, // From constants
      experienceLevel,
      media: {
        url: mediaUrl,
        type: "audio",
        mimeType,
      },
      verificationMethod,
      worldIdVerified,
      cvVideoVerified,
      questionsCount,
    });

    // Build NFT metadata
    const nftMetadata = buildNFTMetadata({
      title: ipMetadata.title,
      description: ipMetadata.description || "Audio mental training",
      imageUrl: undefined, // TODO: Get default image, fix path
    });

    // Register IP Asset on Story Protocol
    const result = await registerIPAsset({
      athleteWallet: athleteWallet as Address,
      athleteName,
      ipMetadata,
      nftMetadata,
      licenseFee: Number(licenseFee),
    });

    if (!result.success) {
      console.error("[Register Audio] Registration failed:", result.error);
      return NextResponse.json(
        { error: result.error || "IP registration failed" },
        { status: 500 }
      );
    }

    console.log("[Register Audio] IP registered:", result.ipId);

    // Update asset in database with Story Protocol data
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("assets")
      .update({
        story_ip_id: result.ipId,
        story_tx_hash: result.txHash,
        ipfs_cid: result.ipfsCid,
        status: "active", // Mark as active immediately
      })
      .eq("id", assetId);

    if (updateError) {
      console.error("[Register Audio] Database update failed:", updateError);
      // Don't fail the request - registration succeeded
      // Log error for manual review
    }

    return NextResponse.json({
      success: true,
      ipId: result.ipId,
      txHash: result.txHash,
      tokenId: result.tokenId?.toString(),
      licenseTermsId: result.licenseTermsIds?.toLocaleString(),
    });
  } catch (error) {
    console.error("[Register Audio] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
