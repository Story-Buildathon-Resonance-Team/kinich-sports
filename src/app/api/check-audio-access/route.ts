/**
 * GET /api/check-audio-access?athleteId=xxx
 *
 * Checks if athlete has unlocked audio challenges via:
 * - World ID verification, OR
 * - At least one CV-verified video asset
 *
 * Returns verification status and method used.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AudioAccessResponse, getVerificationMethod } from "@/lib/types/audio";

export async function GET(request: NextRequest) {
  try {
    const athleteId = request.nextUrl.searchParams.get("athleteId");

    if (!athleteId) {
      return NextResponse.json(
        { error: "athleteId parameter is required" },
        { status: 400 }
      );
    }

    console.log("[Audio Access] Checking access for athlete:", athleteId);

    const supabase = await createClient();

    // Check World ID verification
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("world_id_verified")
      .eq("id", athleteId)
      .single();

    if (athleteError || !athlete) {
      console.error("[Audio Access] Athlete not found:", athleteError);
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    const worldIdVerified = athlete.world_id_verified || false;

    // Check if athlete has at least one CV-verified video
    const { data: cvVideos, error: cvError } = await supabase
      .from("assets")
      .select("id")
      .eq("athlete_id", athleteId)
      .eq("asset_type", "video")
      .eq("cv_verified", true)
      .eq("status", "active")
      .limit(1);

    if (cvError) {
      console.error("[Audio Access] Error checking CV videos:", cvError);
      return NextResponse.json(
        { error: "Error checking verification status" },
        { status: 500 }
      );
    }

    const cvVideoVerified = cvVideos && cvVideos.length > 0;

    // Determine access
    const hasAccess = worldIdVerified || cvVideoVerified;
    const method = getVerificationMethod(worldIdVerified, cvVideoVerified);

    console.log("[Audio Access] World ID:", worldIdVerified);
    console.log("[Audio Access] CV Video:", cvVideoVerified);
    console.log("[Audio Access] Has Access:", hasAccess);
    console.log("[Audio Access] Method:", method);

    const response: AudioAccessResponse = {
      hasAccess,
      method,
      worldIdVerified,
      cvVideoVerified,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Audio Access] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
