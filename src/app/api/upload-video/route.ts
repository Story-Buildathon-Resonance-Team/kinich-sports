import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov files
];
const MAX_FILE_SIZE = 45 * 1024 * 1024; // 45MB (after compression)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const athleteId = formData.get("athleteId") as string;
    const drillTypeId = formData.get("drillTypeId") as string;

    // Validation
    if (!file || !athleteId || !drillTypeId) {
      return NextResponse.json(
        { error: "Missing required fields (file, athleteId, or drillTypeId)" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB. Maximum size: 45 MB` },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const supabase = createServiceClient();
    const timestamp = Date.now();
    const extension = file.type === "video/quicktime" ? "mov" : file.type.split("/")[1];
    const filePath = `video/${athleteId}/${timestamp}-${drillTypeId}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("kinich-assets")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("kinich-assets")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      publicUrl,
      filePath,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    console.error("Upload video API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
