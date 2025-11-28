import { NextRequest, NextResponse } from "next/server";
import { registerIPAsset } from "@/lib/story/actions";
import { buildDrillIPMetadata, buildNFTMetadata } from "@/lib/story/metadata";
import { createClient } from "@/utils/supabase/server";
import { getDrillById } from "@/lib/drills/constants";
import { Address } from "viem";

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
      metadata, // The full VideoDrillMetadata object
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

    console.log("[Register Video] Starting registration");

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
        experience_level: experienceLevel,
      },
      media: {
        url: mediaUrl,
        type: "video",
        mimeType: mimeType || "video/webm",
      },
      description: `Verified performance data for ${drill.name}. Form Score: ${metadata?.cv_metrics?.form_score_avg?.toFixed(2) || "N/A"}`,
    });

    const nftMetadata = buildNFTMetadata({
      title: ipMetadata.title,
      description: ipMetadata.description || "Video drill performance",
      imageUrl: undefined,
    });

    const result = await registerIPAsset({
      athleteWallet: athleteWallet as Address,
      athleteName,
      athleteId: metadata?.athlete_profile?.athlete_id,
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
      console.error("[Register Video] Database update failed:", updateError);
    }

    return NextResponse.json({
      success: true,
      ipId: result.ipId,
      txHash: result.txHash,
      tokenId: result.tokenId?.toString(),
      licenseTermsId: result.licenseTermsIds?.toLocaleString(),
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

