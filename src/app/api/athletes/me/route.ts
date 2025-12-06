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

    // Fetch athlete data first
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select("id, dynamic_user_id, name, discipline, competitive_level, profile_score, world_id_verified, world_id_verified_at")
      .eq("dynamic_user_id", dynamicUserId)
      .single();

    if (athleteError || !athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // Fetch asset count
    const { count: assetCount, error: countError } = await supabase
      .from("assets")
      .select("id", { count: "exact", head: true }) // Fetch only ID for count
      .eq("athlete_id", athlete.id)
      .eq("status", "active");

    if (countError) {
      console.error("Error fetching asset count:", countError);
    }

    // Calculate stats
    const stats = {
      profileScore: athlete.profile_score || 0, // Real score from database
      totalRoyalties: 0, // Mock for now
      totalAssets: assetCount || 0,
    };

    return NextResponse.json({
      athlete,
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
