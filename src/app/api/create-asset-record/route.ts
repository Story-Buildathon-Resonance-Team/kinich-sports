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

    // Get public URL for the uploaded file
    const supabase = createServiceClient();
    const { data: { publicUrl } } = supabase.storage
      .from("kinich-assets")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      publicUrl,
      filePath,
      fileSize,
      mimeType,
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
