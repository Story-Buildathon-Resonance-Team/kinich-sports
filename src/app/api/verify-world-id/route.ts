import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface VerifyWorldIdRequest {
  proof: {
    nullifier_hash: string;
    merkle_root: string;
    proof: string;
    verification_level: "device" | "orb";
  };
  athlete_id: string;
}

interface WorldIdVerifyResponse {
  success: boolean;
  action?: string;
  nullifier_hash?: string;
  created_at?: string;
  code?: string; // Error code from World ID
  detail?: string; // Error details
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: VerifyWorldIdRequest = await request.json();
    const { proof, athlete_id } = body;

    // Validate request
    if (!proof || !athlete_id) {
      return NextResponse.json(
        { error: "Missing proof or athlete_id" },
        { status: 400 }
      );
    }

    // Check if athlete exists and is not already verified
    const supabase = await createClient();
    const { data: athlete, error: fetchError } = await supabase
      .from("athletes")
      .select("id, world_id_verified, world_id_nullifier_hash")
      .eq("id", athlete_id)
      .single();

    if (fetchError || !athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // Check if athlete is already verified
    if (athlete.world_id_verified) {
      return NextResponse.json(
        { error: "Athlete is already verified with World ID" },
        { status: 400 }
      );
    }

    // Check if this nullifier_hash is already used by another athlete
    // (This catches if someone tries to verify multiple profiles with same World ID)
    const { data: existingVerification } = await supabase
      .from("athletes")
      .select("id")
      .eq("world_id_nullifier_hash", proof.nullifier_hash)
      .single();

    if (existingVerification && existingVerification.id !== athlete_id) {
      return NextResponse.json(
        {
          error:
            "This World ID has already been used to verify another athlete profile",
        },
        { status: 400 }
      );
    }

    // Verify the proof with World ID Developer Portal API
    const verifyResponse = await fetch(
      `https://developer.worldcoin.org/api/v2/verify/${process.env.WORLD_ID_APP_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nullifier_hash: proof.nullifier_hash,
          merkle_root: proof.merkle_root,
          proof: proof.proof,
          verification_level: proof.verification_level,
          action: process.env.WORLD_ID_ACTION,
        }),
      }
    );

    const verifyData: WorldIdVerifyResponse = await verifyResponse.json();

    // Handle World ID verification failure
    if (!verifyResponse.ok || !verifyData.success) {
      console.error("World ID verification failed:", verifyData);

      // Provide user-friendly error messages based on World ID error codes
      let errorMessage = "World ID verification failed";

      if (verifyData.code === "already_verified") {
        errorMessage = "This World ID has already been used for this action";
      } else if (verifyData.code === "invalid_proof") {
        errorMessage = "Invalid verification proof. Please try again";
      } else if (verifyData.code === "max_verifications_reached") {
        errorMessage = "Maximum verifications reached for this World ID";
      }

      return NextResponse.json(
        { error: errorMessage, details: verifyData },
        { status: 400 }
      );
    }

    // World ID verification succeeded - now update the database
    const { error: updateError } = await supabase
      .from("athletes")
      .update({
        world_id_verified: true,
        world_id_nullifier_hash: proof.nullifier_hash,
        world_id_verified_at: new Date().toISOString(),
      })
      .eq("id", athlete_id);

    if (updateError) {
      console.error("Database update failed:", updateError);

      // CRITICAL: Verification succeeded with World ID, but DB update failed
      // This requires manual intervention
      return NextResponse.json(
        {
          error:
            "Verification succeeded but failed to save to database. Please contact support with your athlete ID.",
          athlete_id: athlete_id,
          nullifier_hash: proof.nullifier_hash,
        },
        { status: 500 }
      );
    }

    // Success! Return verification details
    return NextResponse.json({
      success: true,
      message: "Athlete profile verified successfully",
      nullifier_hash: proof.nullifier_hash,
      verified_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
