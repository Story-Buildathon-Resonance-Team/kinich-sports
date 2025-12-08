import { createClient } from "@/utils/supabase/server";

export async function getAthleteByDynamicId(dynamicUserId: string) {
  const supabase = await createClient();
  
  const { data: athlete, error } = await supabase
    .from("athletes")
    .select("id, dynamic_user_id, name, discipline, competitive_level, profile_score, world_id_verified, world_id_verified_at")
    .eq("dynamic_user_id", dynamicUserId)
    .single();

  if (error) {
    return null;
  }

  return athlete;
}

export async function getAthleteStats(athleteId: string) {
  const supabase = await createClient();

  // Run counts in parallel
  const [assetCountResult, verifiedVideoCountResult] = await Promise.all([
    supabase
      .from("assets")
      .select("id", { count: "exact", head: true })
      .eq("athlete_id", athleteId)
      .eq("status", "active"),
    supabase
      .from("assets")
      .select("id", { count: "exact", head: true })
      .eq("athlete_id", athleteId)
      .eq("asset_type", "video")
      .eq("cv_verified", true)
  ]);

  return {
    totalAssets: assetCountResult.count || 0,
    verifiedVideoCount: verifiedVideoCountResult.count || 0,
    totalRoyalties: 0, // Placeholder
  };
}

export async function getAthleteAssets(athleteId: string) {
  const supabase = await createClient();
  
  const { data: assets, error } = await supabase
    .from("assets")
    .select("id, asset_type, drill_type_id, asset_url, license_fee, metadata, status, created_at")
    .eq("athlete_id", athleteId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assets:", error);
    return [];
  }

  return assets || [];
}
