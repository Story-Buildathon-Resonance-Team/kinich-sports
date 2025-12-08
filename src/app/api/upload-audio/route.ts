import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

const ALLOWED_MIME_TYPES = ["audio/webm", "audio/wav", "audio/ogg"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const athleteId = formData.get("athleteId") as string | null;
    const drillTypeId = formData.get("drillTypeId") as string | null;

    if (!file || !athleteId || !drillTypeId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${file.size} bytes` },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const timestamp = Date.now();
    const filePath = `audio/${athleteId}/${timestamp}-${drillTypeId}.webm`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("kinich-assets")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Upload Audio] Storage upload failed:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("kinich-assets").getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      publicUrl,
      filePath,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("[Upload Audio] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
