import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { buildAudioCapsuleMetadata } from "@/lib/types/audio";
import { AudioCapsule } from "@/lib/drills/constants";

interface UseAudioUploadParams {
  challenge?: AudioCapsule | null;
  athleteId?: string | null;
  athleteProfile?: any | null;
}

interface UploadState {
  isUploading: boolean;
  error: string | null;
  progress:
    | "idle"
    | "uploading"
    | "creating-record"
    | "registering"
    | "complete";
}

export function useAudioUpload({
  challenge,
  athleteId,
  athleteProfile,
}: UseAudioUploadParams = {}) {
  const router = useRouter();
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    error: null,
    progress: "idle",
  });

  const isReady = Boolean(challenge && athleteId && athleteProfile);

  const uploadAudio = async (
    audioBlob: Blob,
    recordingDuration: number
  ): Promise<void> => {
    if (!isReady || !challenge || !athleteId || !athleteProfile) {
      throw new Error("Upload hook not ready - missing required data");
    }

    try {
      setState({
        isUploading: true,
        error: null,
        progress: "uploading",
      });

      const supabase = createClient();

      const timestamp = Date.now();
      const filePath = `audio/${athleteId}/${timestamp}-${challenge.drill_type_id}.webm`;

      console.log("[useAudioUpload] Uploading to:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("kinich-assets")
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("[useAudioUpload] Upload successful:", uploadData);

      const {
        data: { publicUrl },
      } = supabase.storage.from("kinich-assets").getPublicUrl(filePath);

      console.log("[useAudioUpload] Public URL:", publicUrl);

      const metadata = buildAudioCapsuleMetadata({
        drillTypeId: challenge.drill_type_id,
        challengeName: challenge.name,
        questions: challenge.questions,
        athleteDiscipline: athleteProfile.discipline || "other",
        athleteExperienceLevel: athleteProfile.competitive_level || "amateur",
        worldIdVerified: athleteProfile.world_id_verified || false,
        cvVideoVerified: false, // Will be determined by API
        recordingDurationSeconds: Math.floor(recordingDuration),
        fileSizeBytes: audioBlob.size,
        mimeType: audioBlob.type,
      });

      console.log("[useAudioUpload] Metadata:", metadata);

      setState({
        isUploading: true,
        error: null,
        progress: "creating-record",
      });

      const { data: asset, error: assetError } = await supabase
        .from("assets")
        .insert({
          athlete_id: athleteId,
          asset_type: "audio",
          drill_type_id: challenge.drill_type_id,
          asset_url: publicUrl,
          license_fee: 15.0, // Default fee
          metadata: metadata,
          status: "pending",
        })
        .select()
        .single();

      if (assetError || !asset) {
        throw new Error(`Database insert failed: ${assetError?.message}`);
      }

      console.log("[useAudioUpload] Asset created:", asset.id);

      setState({
        isUploading: true,
        error: null,
        progress: "registering",
      });

      console.log("[useAudioUpload] Registering on Story Protocol...");

      const registerResponse = await fetch("/api/register-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          athleteWallet: athleteProfile.wallet_address,
          athleteName: athleteProfile.name || "Anonymous Athlete",
          drillTypeId: challenge.drill_type_id,
          experienceLevel: athleteProfile.competitive_level || "amateur",
          mediaUrl: publicUrl,
          mimeType: audioBlob.type,
          licenseFee: 15.0,
          questionsCount: challenge.questions.length,
          verificationMethod: metadata.verification.verification_method,
          worldIdVerified: metadata.verification.world_id_verified,
          cvVideoVerified: metadata.verification.cv_video_verified,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(
          `Story registration failed: ${errorData.error || "Unknown error"}`
        );
      }

      const registerData = await registerResponse.json();
      console.log(
        "[useAudioUpload] Story registration complete:",
        registerData
      );

      setState({
        isUploading: false,
        error: null,
        progress: "complete",
      });

      router.push(`/asset/${asset.id}`);
    } catch (err) {
      console.error("[useAudioUpload] Upload failed:", err);
      setState({
        isUploading: false,
        error: err instanceof Error ? err.message : "Upload failed",
        progress: "idle",
      });
      throw err;
    }
  };

  const resetError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    uploadAudio,
    isReady,
    isUploading: state.isUploading,
    error: state.error,
    progress: state.progress,
    resetError,
  };
}
