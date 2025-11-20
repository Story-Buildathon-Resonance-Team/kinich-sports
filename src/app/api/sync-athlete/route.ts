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

    // Validate required fields
    if (!dynamicUserId || !walletAddress) {
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
      // PGRST116 = no rows returned
      console.error("Error checking existing athlete:", selectError);
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

    if (existingAthlete) {
      // User exists - update wallet_address (in case they switched wallets)
      // Also update name/discipline/competitive_level in case they changed in Dynamic
      const { data: updatedAthlete, error: updateError } = await supabase
        .from("athletes")
        .update({
          wallet_address: walletAddress,
          name: fullName,
          discipline: sport || existingAthlete.discipline,
          competitive_level:
            competitiveLevel || existingAthlete.competitive_level,
        })
        .eq("dynamic_user_id", dynamicUserId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating athlete:", updateError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update athlete data",
          } as SyncAthleteResponse,
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        athlete: updatedAthlete,
        isNewUser: false,
      } as SyncAthleteResponse);
    } else {
      // New user - insert athlete record
      const { data: newAthlete, error: insertError } = await supabase
        .from("athletes")
        .insert({
          dynamic_user_id: dynamicUserId,
          wallet_address: walletAddress,
          name: fullName,
          discipline: sport,
          competitive_level: competitiveLevel,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting athlete:", insertError);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create athlete record",
          } as SyncAthleteResponse,
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        athlete: newAthlete,
        isNewUser: true,
      } as SyncAthleteResponse);
    }
  } catch (error) {
    console.error("Unexpected error in sync-athlete:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as SyncAthleteResponse,
      { status: 500 }
    );
  }
}
