import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

const MAX_FILE_SIZE = 45 * 1024 * 1024; // 45MB (after compression)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { athleteId, drillTypeId, filePath, fileSize, mimeType } = body;

    // Validation
    if (!athleteId || !drillTypeId || !filePath || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields (athleteId, drillTypeId, filePath, fileSize, mimeType)" },
        { status: 400 }
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(fileSize / 1024 / 1024).toFixed(2)} MB. Maximum size: 45 MB` },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from("kinich-assets")
      .getPublicUrl(filePath);

    // Create the asset record in the database
    const { data: asset, error: insertError } = await supabase
      .from("assets")
      .insert({
        athlete_id: athleteId,
        asset_type: "video",
        drill_type_id: drillTypeId,
        asset_url: publicUrl,
        license_fee: 15.0, // Default fee
        metadata: {
          video_metadata: {
            file_size_bytes: fileSize,
            mime_type: mimeType,
          }
        },
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert failed:", insertError);
      return NextResponse.json(
        { error: `Database insert failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      asset,
      publicUrl,
    });
  } catch (error: unknown) {
    console.error("Create asset record API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
