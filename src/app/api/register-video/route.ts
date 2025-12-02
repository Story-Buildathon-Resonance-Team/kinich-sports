import { NextRequest, NextResponse } from "next/server";
import { registerIPAsset } from "@/lib/story/actions";
import { buildDrillIPMetadata, buildNFTMetadata } from "@/lib/story/metadata";
import { createClient } from "@/utils/supabase/server";
import { getDrillById } from "@/lib/drills/constants";
import { Address } from "viem";
import { recalculateAthleteScoreSafe } from "@/lib/scoring/calculateProfileScore";
import type { VideoDrillMetadata } from "@/lib/types/video";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      assetId,
      athleteWallet,
      athleteName,
      drillTypeId,
      experienceLevel,
      mediaUrl,
      mimeType,
      licenseFee,
      metadata,
    } = body;

    // Validation
    if (
      !assetId ||
      !athleteWallet ||
      !athleteName ||
      !drillTypeId ||
      !mediaUrl ||
      !licenseFee
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("[Register Video] Starting registration for asset:", assetId);

    // Validate drill type
    const drill = getDrillById(drillTypeId);
    if (!drill || drill.asset_type !== "video") {
      return NextResponse.json(
        { error: "Invalid drill type ID or not a video drill" },
        { status: 400 }
      );
    }

    // Build Story Protocol IP metadata (minimal metadata for blockchain)
    const ipMetadata = buildDrillIPMetadata({
      athleteName,
      athleteAddress: athleteWallet as Address,
      drillInfo: {
        drill_type_id: drillTypeId,
        drill_name: drill.name,
        experience_level: experienceLevel || "competitive",
      },
      media: {
        url: mediaUrl,
        type: "video",
        mimeType: mimeType || "video/mp4",
      },
      description:
        metadata?.description ||
        `${drill.name} - ${
          metadata?.cv_metrics?.rep_count || 0
        } reps completed with ${(
          (metadata?.verification?.human_confidence_score || 0) * 100
        ).toFixed(0)}% confidence`,
    });

    // Build NFT metadata
    const nftMetadata = buildNFTMetadata({
      title: ipMetadata.title,
      description: ipMetadata.description || "Video drill performance",
      imageUrl: undefined,
      assetType: "video",
    });

    // Register on Story Protocol
    console.log("[Register Video] Calling registerIPAsset");
    const result = await registerIPAsset({
      athleteWallet: athleteWallet as Address,
      athleteName,
      ipMetadata,
      nftMetadata,
      licenseFee: Number(licenseFee),
    });

    if (!result.success) {
      console.error("[Register Video] Registration failed:", result.error);
      return NextResponse.json(
        { error: result.error || "IP registration failed" },
        { status: 500 }
      );
    }

    console.log("[Register Video] IP registered:", result.ipId);

    // Update asset in database with Story Protocol data
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("assets")
      .update({
        story_ip_id: result.ipId,
        story_tx_hash: result.txHash,
        ipfs_cid: result.ipfsCid,
        cv_verified: metadata?.verification?.is_verified || false, // MediaPipe verified
        status: "active",
      })
      .eq("id", assetId);

    if (updateError) {
      console.error("[Register Video] Database update failed:", updateError);
      // Don't fail the request - Story registration succeeded
    }

    // Recalculate athlete profile score
    const { data: asset } = await supabase
      .from("assets")
      .select("athlete_id")
      .eq("id", assetId)
      .single();

    if (asset) {
      const scoreResult = await recalculateAthleteScoreSafe(asset.athlete_id);
      if (scoreResult.success) {
        console.log(
          `[Register Video] Profile score updated: ${scoreResult.score}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      ipId: result.ipId,
      txHash: result.txHash,
      tokenId: result.tokenId?.toString(),
      licenseTermsId: result.licenseTermsIds?.toLocaleString(),
      explorerUrl: `https://aeneid.explorer.story.foundation/ipa/${result.ipId}`,
    });
  } catch (error) {
    console.error("[Register Video] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
