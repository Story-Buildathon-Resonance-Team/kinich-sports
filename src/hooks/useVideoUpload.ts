import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAnalysis } from "@/context/analysis-context";
import type { VideoDrillMetadata } from "@/lib/types/video";

interface UseVideoUploadParams {
  athleteId?: string | null;
  athleteProfile?: any | null;
  drillTypeId?: string;
}

interface UploadState {
  isUploading: boolean;
  error: string | null;
  progress:
  | "idle"
  | "uploading"
  | "creating-record"
  | "analyzing"
  | "updating-metadata"
  | "registering"
  | "complete";
}

export function useVideoUpload({
  athleteId,
  athleteProfile,
  drillTypeId = "EXPL_BURPEE_001", // Default to burpee drill
}: UseVideoUploadParams = {}) {
  const router = useRouter();
  const { startProcessing, setAssetId, setUploadedVideoUrl } = useAnalysis();
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    error: null,
    progress: "idle",
  });

  const isReady = Boolean(athleteId && athleteProfile);

  const uploadAndAnalyze = async (compressedFile: File): Promise<string> => {
    if (!isReady || !athleteId) {
      throw new Error(
        "Upload hook not ready - missing athleteId or athleteProfile"
      );
    }

    try {
      setState({
        isUploading: true,
        error: null,
        progress: "uploading",
      });

      const urlResponse = await fetch("/api/generate-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId,
          drillTypeId,
          fileName: compressedFile.name,
          mimeType: compressedFile.type,
        }),
      });

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json();
        throw new Error(
          `Failed to generate upload URL: ${errorData.error || "Unknown error"}`
        );
      }

      const { signedUrl, filePath } = await urlResponse.json();

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: compressedFile,
        headers: {
          "Content-Type": compressedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Direct upload failed: ${uploadResponse.statusText}`);
      }

      setState({
        isUploading: true,
        error: null,
        progress: "creating-record",
      });

      const recordResponse = await fetch("/api/create-asset-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteId,
          drillTypeId,
          filePath,
          fileSize: compressedFile.size,
          mimeType: compressedFile.type,
        }),
      });

      if (!recordResponse.ok) {
        const errorData = await recordResponse.json();
        throw new Error(
          `Asset record creation failed: ${errorData.error || "Unknown error"}`
        );
      }

      const { asset, publicUrl } = await recordResponse.json();

      setUploadedVideoUrl(publicUrl);
      setAssetId(asset.id);

      setState({
        isUploading: true,
        error: null,
        progress: "analyzing",
      });

      await startProcessing();

      setState({
        isUploading: false,
        error: null,
        progress: "idle",
      });

      return asset.id;
    } catch (err) {
      console.error("[useVideoUpload] Upload and analyze failed:", err);
      setState({
        isUploading: false,
        error: err instanceof Error ? err.message : "Upload failed",
        progress: "idle",
      });
      throw err;
    }
  };

  const submitToStory = async (
    assetId: string,
    metadata: VideoDrillMetadata
  ): Promise<void> => {
    if (!isReady || !athleteProfile) {
      throw new Error("Submit hook not ready - missing athleteProfile");
    }

    try {
      setState({
        isUploading: true,
        error: null,
        progress: "updating-metadata",
      });

      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("assets")
        .update({ metadata })
        .eq("id", assetId);

      if (updateError) {
        throw new Error(`Metadata update failed: ${updateError.message}`);
      }

      setState({
        isUploading: true,
        error: null,
        progress: "registering",
      });

      const { data: asset } = await supabase
        .from("assets")
        .select("asset_url")
        .eq("id", assetId)
        .single();

      const registerResponse = await fetch("/api/register-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          athleteWallet: athleteProfile.wallet_address,
          athleteName: athleteProfile.name || "Anonymous Athlete",
          drillTypeId,
          experienceLevel: athleteProfile.competitive_level || "competitive",
          mediaUrl: asset?.asset_url,
          mimeType: "video/mp4",
          licenseFee: 15.0,
          metadata,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(
          `Story registration failed: ${errorData.error || "Unknown error"}`
        );
      }

      const registerData = await registerResponse.json();

      setState({
        isUploading: false,
        error: null,
        progress: "complete",
      });

      router.push(`/dashboard/assets/${assetId}`);
    } catch (err) {
      console.error("[useVideoUpload] Submit to Story failed:", err);
      setState({
        isUploading: false,
        error: err instanceof Error ? err.message : "Submission failed",
        progress: "idle",
      });
      throw err;
    }
  };

  const resetError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    uploadAndAnalyze,
    submitToStory,
    isReady,
    isUploading: state.isUploading,
    error: state.error,
    progress: state.progress,
    resetError,
  };
}
