import { NextRequest, NextResponse } from "next/server";
import { registerIPAsset } from "@/lib/story/actions";
import { buildAudioIPMetadata, buildNFTMetadata } from "@/lib/story/metadata";
import { createClient } from "@/utils/supabase/server";
import { getDrillById } from "@/lib/drills/constants";
import { Address } from "viem";
import { recalculateAthleteScoreSafe } from "@/lib/scoring/calculateProfileScore";

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

    if (!worldIdVerified && !cvVideoVerified) {
      return NextResponse.json(
        { error: "At least one verification method must be active" },
        { status: 400 }
      );
    }

    console.log("[Register Audio] Starting registration");

    const drill = getDrillById(drillTypeId);
    if (!drill || drill.asset_type !== "audio") {
      return NextResponse.json(
        { error: "Invalid drill type ID or not an audio drill" },
        { status: 400 }
      );
    }

    const ipMetadata = buildAudioIPMetadata({
      athleteName,
      athleteAddress: athleteWallet as Address,
      drillTypeId,
      drillName: drill.name,
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

    const nftMetadata = buildNFTMetadata({
      title: ipMetadata.title,
      description: ipMetadata.description || "Audio mental training",
      imageUrl: undefined,
    });

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

    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("assets")
      .update({
        story_ip_id: result.ipId,
        story_tx_hash: result.txHash,
        ipfs_cid: result.ipfsCid,
        status: "active",
      })
      .eq("id", assetId);

    if (updateError) {
      console.error("[Register Audio] Database update failed:", updateError);
    }

    // Update profile score after audio registration
    const { data: asset } = await supabase
      .from("assets")
      .select("athlete_id")
      .eq("id", assetId)
      .single();

    if (asset) {
      const scoreResult = await recalculateAthleteScoreSafe(asset.athlete_id);
      if (scoreResult.success) {
        console.log(
          `Profile score updated after audio registration: ${scoreResult.score}`
        );
      }
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
