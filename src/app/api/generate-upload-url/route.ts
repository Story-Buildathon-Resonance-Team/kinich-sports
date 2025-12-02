import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov files
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { athleteId, drillTypeId, fileName, mimeType } = body;

    // Validation
    if (!athleteId || !drillTypeId || !fileName || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields (athleteId, drillTypeId, fileName, mimeType)" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: `Invalid file type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate file path
    const supabase = createServiceClient();
    const timestamp = Date.now();
    const extension = mimeType === "video/quicktime" ? "mov" : mimeType.split("/")[1];
    const filePath = `video/${athleteId}/${timestamp}-${drillTypeId}.${extension}`;

    // Create signed upload URL (expires in 10 minutes)
    const { data, error } = await supabase.storage
      .from("kinich-assets")
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      console.error("Failed to create signed upload URL:", error);
      return NextResponse.json(
        { error: `Failed to generate upload URL: ${error?.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
      filePath: filePath,
      token: data.token,
    });
  } catch (error: unknown) {
    console.error("Generate upload URL API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
