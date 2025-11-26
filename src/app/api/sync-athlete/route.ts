import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type {
  SyncAthleteRequest,
  SyncAthleteResponse,
} from "@/lib/types/athlete";

export async function POST(request: NextRequest) {
  try {
    const body: SyncAthleteRequest = await request.json();
    const {
      dynamicUserId,
      walletAddress,
      firstName,
      lastName,
      sport,
      competitiveLevel,
    } = body;

    // Log incoming request for debugging
    console.log("[sync-athlete] Request:", {
      dynamicUserId,
      walletAddress: walletAddress?.slice(0, 10) + "...",
      firstName,
      lastName,
      sport,
      competitiveLevel,
    });

    // Validate required fields
    if (!dynamicUserId || !walletAddress) {
      console.error("[sync-athlete] Missing required fields");
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: dynamicUserId and walletAddress",
        } as SyncAthleteResponse,
        { status: 400 }
      );
    }

    // Create Supabase server client
    const supabase = await createClient();

    // Check if athlete already exists by dynamic_user_id
    const { data: existingAthlete, error: selectError } = await supabase
      .from("athletes")
      .select("*")
      .eq("dynamic_user_id", dynamicUserId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 = no rows returned (expected for new users)
      console.error("[sync-athlete] Error checking existing athlete:", {
        code: selectError.code,
        message: selectError.message,
        details: selectError.details,
        hint: selectError.hint,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Database error while checking athlete",
        } as SyncAthleteResponse,
        { status: 500 }
      );
    }

    // Construct full name from firstName and lastName
    const fullName =
      firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || lastName || null;

    // Normalize sport and competitiveLevel to lowercase for database constraints
    const normalizedSport = sport ? sport.toLowerCase() : null;
    const normalizedCompetitiveLevel = competitiveLevel
      ? competitiveLevel.toLowerCase()
      : null;

    if (existingAthlete) {
      // User exists - update ONLY the fields that are provided
      console.log("[sync-athlete] Existing athlete found, updating...");

      // Build update object dynamically to avoid setting undefined values
      const updateData: any = {
        wallet_address: walletAddress,
      };

      // Only include fields that are actually provided
      if (fullName !== null) {
        updateData.name = fullName;
      }

      // Only update discipline if sport is actually provided, and use lowercase
      if (normalizedSport !== null) {
        updateData.discipline = normalizedSport;
      }

      // Only update competitive_level if provided, and use lowercase
      if (normalizedCompetitiveLevel !== null) {
        updateData.competitive_level = normalizedCompetitiveLevel;
      }

      console.log("[sync-athlete] Update data (normalized):", updateData);

      // Perform update
      const { data: updatedAthletes, error: updateError } = await supabase
        .from("athletes")
        .update(updateData)
        .eq("dynamic_user_id", dynamicUserId)
        .select();

      if (updateError) {
        console.error("[sync-athlete] Error updating athlete:", {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update athlete data",
          } as SyncAthleteResponse,
          { status: 500 }
        );
      }

      // Check if we got data back
      if (!updatedAthletes || updatedAthletes.length === 0) {
        console.error("[sync-athlete] Update returned no rows");
        return NextResponse.json(
          {
            success: false,
            error: "Update succeeded but returned no data",
          } as SyncAthleteResponse,
          { status: 500 }
        );
      }

      console.log("[sync-athlete] Athlete updated successfully");
      return NextResponse.json({
        success: true,
        athlete: updatedAthletes[0],
        isNewUser: false,
      } as SyncAthleteResponse);
    } else {
      // New user - insert athlete record
      console.log("[sync-athlete] New athlete, inserting...");

      const insertData = {
        dynamic_user_id: dynamicUserId,
        wallet_address: walletAddress,
        name: fullName,
        discipline: normalizedSport,
        competitive_level: normalizedCompetitiveLevel,
      };

      console.log("[sync-athlete] Insert data (normalized):", insertData);

      const { data: newAthletes, error: insertError } = await supabase
        .from("athletes")
        .insert(insertData)
        .select();

      if (insertError) {
        console.error("[sync-athlete] Error inserting athlete:", {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create athlete record",
          } as SyncAthleteResponse,
          { status: 500 }
        );
      }

      if (!newAthletes || newAthletes.length === 0) {
        console.error("[sync-athlete] Insert returned no rows");
        return NextResponse.json(
          {
            success: false,
            error: "Insert succeeded but returned no data",
          } as SyncAthleteResponse,
          { status: 500 }
        );
      }

      console.log("[sync-athlete] Athlete created successfully");
      return NextResponse.json({
        success: true,
        athlete: newAthletes[0],
        isNewUser: true,
      } as SyncAthleteResponse);
    }
  } catch (error) {
    console.error("[sync-athlete] Unexpected error:", error);
    console.error(
      "[sync-athlete] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as SyncAthleteResponse,
      { status: 500 }
    );
  }
}
