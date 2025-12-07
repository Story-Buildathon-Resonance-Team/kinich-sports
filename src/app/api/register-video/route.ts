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
    const text = await request.text();
    if (!text) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }
    const body = JSON.parse(text);

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

    const drill = getDrillById(drillTypeId);
    if (!drill || drill.asset_type !== "video") {
      return NextResponse.json(
        { error: "Invalid drill type ID or not a video drill" },
        { status: 400 }
      );
    }

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
        `${drill.name} - ${metadata?.cv_metrics?.rep_count || 0
        } reps completed with ${(
          (metadata?.verification?.human_confidence_score || 0) * 100
        ).toFixed(0)}% confidence`,
      cvVideoVerified: metadata?.verification?.is_verified || false,
      humanConfidenceScore: metadata?.verification?.human_confidence_score || 0,
      repCount: metadata?.cv_metrics?.rep_count || 0,
    });

    const nftMetadata = buildNFTMetadata({
      title: ipMetadata.title,
      description: ipMetadata.description || "Video drill performance",
      imageUrl: undefined,
      assetType: "video",
    });

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

    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("assets")
      .update({
        story_ip_id: result.ipId,
        story_tx_hash: result.txHash,
        ipfs_cid: result.ipfsCid,
        cv_verified: metadata?.verification?.is_verified || false,
        status: "active",
      })
      .eq("id", assetId);

    if (updateError) {
      console.error("[Register Video] Database update failed:", updateError);
    }

    const { data: asset } = await supabase
      .from("assets")
      .select("athlete_id")
      .eq("id", assetId)
      .single();

    if (asset) {
      const scoreResult = await recalculateAthleteScoreSafe(asset.athlete_id);
      if (scoreResult.success) {
        // Score updated silently
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
