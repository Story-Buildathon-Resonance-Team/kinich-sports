import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const athleteId = searchParams.get("athlete_id");
    const assetType = searchParams.get("asset_type"); // 'video' | 'audio' | null
    const status = searchParams.get("status") || "active";

    if (!athleteId) {
      return NextResponse.json(
        { error: "Missing athlete_id parameter" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from("assets")
      .select("*")
      .eq("athlete_id", athleteId)
      .eq("status", status)
      .order("created_at", { ascending: false });

    // Apply asset_type filter if provided
    if (assetType && (assetType === "video" || assetType === "audio")) {
      query = query.eq("asset_type", assetType);
    }

    const { data: assets, error } = await query;

    if (error) {
      console.error("Error fetching assets:", error);
      return NextResponse.json(
        { error: "Failed to fetch assets" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      assets: assets || [],
      count: assets?.length || 0,
    });
  } catch (error) {
    console.error("Error in /api/assets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
