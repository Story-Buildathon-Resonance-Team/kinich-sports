import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dynamicUserId = searchParams.get("dynamic_user_id");

    if (!dynamicUserId) {
      return NextResponse.json(
        { error: "Missing dynamic_user_id parameter" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Optimized query: join assets to get counts in one go if possible
    // or keep as is if already optimized by supabase
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("id, dynamic_user_id, name, discipline, competitive_level, profile_score, world_id_verified, world_id_verified_at")
      .eq("dynamic_user_id", dynamicUserId)
      .single();

    if (athleteError || !athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // Parallelize count queries
    const [assetCountResult, verifiedVideoCountResult] = await Promise.all([
      supabase
        .from("assets")
        .select("id", { count: "exact", head: true })
        .eq("athlete_id", athlete.id)
        .eq("status", "active"),
      supabase
        .from("assets")
        .select("id", { count: "exact", head: true })
        .eq("athlete_id", athlete.id)
        .eq("asset_type", "video")
        .eq("cv_verified", true)
    ]);

    const stats = {
      profileScore: athlete.profile_score || 0,
      totalRoyalties: 0,
      totalAssets: assetCountResult.count || 0,
    };

    return NextResponse.json({
      athlete: {
        ...athlete,
        has_verified_video: (verifiedVideoCountResult.count || 0) > 0,
      },
      stats,
    });
  } catch (error) {
    console.error("Error in /api/athletes/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
