"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { AudioPreviewPlayer } from "@/components/audio/audio-preview-player";
import { AudioAccessGate } from "@/components/audio/audio-access-gate";
import { getDrillById, AudioCapsule } from "@/lib/drills/constants";
import { buildAudioCapsuleMetadata } from "@/lib/types/audio";
import { createClient } from "@/utils/supabase/client";

type SubmissionStep = "instructions" | "recording" | "preview" | "uploading";

export default function AudioSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const drillTypeId = params.drillTypeId as string;

  const [challenge, setChallenge] = useState<AudioCapsule | null>(null);
  const [currentStep, setCurrentStep] =
    useState<SubmissionStep>("instructions");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [athleteId, setAthleteId] = useState<string | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<any>(null);

  // Fetch challenge details
  useEffect(() => {
    const drill = getDrillById(drillTypeId);
    if (!drill || drill.asset_type !== "audio") {
      setError("Invalid challenge ID");
      return;
    }
    setChallenge(drill as AudioCapsule);
  }, [drillTypeId]);

  // Fetch athlete profile
  useEffect(() => {
    const fetchAthleteProfile = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("athletes")
          .select("*")
          .eq("dynamic_user_id", user.id)
          .single();

        if (profileError || !profile) {
          console.error("[Audio Submission] Profile not found:", profileError);
          setError("Athlete profile not found");
          return;
        }

        setAthleteId(profile.id);
        setAthleteProfile(profile);
      } catch (err) {
        console.error("[Audio Submission] Error fetching profile:", err);
        setError("Failed to load athlete profile");
      }
    };

    fetchAthleteProfile();
  }, [router]);

  // Handle recording complete
  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordedBlob(blob);
    setRecordingDuration(duration);
    setCurrentStep("preview");
    console.log("[Audio Submission] Recording complete:", {
      size: blob.size,
      duration,
    });
  };

  // Handle re-record
  const handleReRecord = () => {
    setRecordedBlob(null);
    setRecordingDuration(0);
    setCurrentStep("recording");
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!recordedBlob || !challenge || !athleteProfile || !athleteId) {
      setError("Missing required data");
      return;
    }

    try {
      setCurrentStep("uploading");
      setError(null);

      const supabase = createClient();

      // Upload audio to Supabase Storage
      const timestamp = Date.now();
      const filePath = `audio/${athleteId}/${timestamp}-${drillTypeId}.webm`;

      console.log("[Audio Submission] Uploading to:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("kinich-assets")
        .upload(filePath, recordedBlob, {
          contentType: recordedBlob.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log("[Audio Submission] Upload successful:", uploadData);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("kinich-assets").getPublicUrl(filePath);

      console.log("[Audio Submission] Public URL:", publicUrl);

      // Build metadata
      const metadata = buildAudioCapsuleMetadata({
        drillTypeId: challenge.drill_type_id,
        challengeName: challenge.name,
        questions: challenge.questions,
        athleteDiscipline: athleteProfile.discipline || "other",
        athleteExperienceLevel: athleteProfile.competitive_level || "amateur",
        worldIdVerified: athleteProfile.world_id_verified || false,
        cvVideoVerified: false, // Will be determined by API
        recordingDurationSeconds: Math.floor(recordingDuration),
        fileSizeBytes: recordedBlob.size,
        mimeType: recordedBlob.type,
      });

      console.log("[Audio Submission] Metadata:", metadata);

      // Create asset record in database
      const { data: asset, error: assetError } = await supabase
        .from("assets")
        .insert({
          athlete_id: athleteId,
          asset_type: "audio",
          drill_type_id: drillTypeId,
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

      console.log("[Audio Submission] Asset created:", asset.id);

      // Register on Story Protocol
      console.log("[Audio Submission] Registering on Story Protocol...");

      const registerResponse = await fetch("/api/register-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          athleteWallet: athleteProfile.wallet_address,
          athleteName: athleteProfile.name || "Anonymous Athlete",
          drillTypeId: drillTypeId,
          experienceLevel: athleteProfile.competitive_level || "amateur",
          mediaUrl: publicUrl,
          mimeType: recordedBlob.type,
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
        "[Audio Submission] Story registration complete:",
        registerData
      );

      // Redirect to asset page
      router.push(`/asset/${asset.id}`);
    } catch (err) {
      console.error("[Audio Submission] Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setCurrentStep("preview"); // Go back to preview on error
    }
  };

  // Loading state
  if (!challenge || !athleteId) {
    return (
      <div className='min-h-screen bg-[#2C2C2E] flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block w-12 h-12 border-4 border-[rgba(0,71,171,0.3)] border-t-[rgba(0,71,171,0.8)] rounded-full animate-spin mb-4' />
          <p className='text-[16px] text-[rgba(245,247,250,0.7)]'>
            Loading challenge...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && currentStep !== "uploading") {
    return (
      <div className='min-h-screen bg-[#2C2C2E]'>
        <div className='max-w-[600px] mx-auto px-6 pt-[140px]'>
          <div className='bg-[rgba(26,26,28,0.6)] border border-[rgba(255,107,53,0.2)] rounded-xl p-8 text-center'>
            <div className='text-[48px] mb-4'>⚠️</div>
            <h2 className='text-[24px] font-medium text-[#F5F7FA] mb-3'>
              Error
            </h2>
            <p className='text-[15px] text-[rgba(245,247,250,0.7)] mb-6'>
              {error}
            </p>
            <button
              onClick={() => router.push("/arena")}
              className='
                bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
                border border-[rgba(184,212,240,0.2)]
                text-[#F5F7FA] font-medium
                rounded-xl px-8 py-3
                transition-all duration-300
                hover:-translate-y-0.5
              '
            >
              Back to Arena
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wrap in AudioAccessGate
  return (
    <AudioAccessGate athleteId={athleteId}>
      <div className='min-h-screen bg-[#2C2C2E]'>
        <div className='max-w-[800px] mx-auto px-6 md:px-16 pt-[140px] pb-20'>
          {/* Header */}
          <div className='text-center mb-12'>
            <h1 className='text-[40px] md:text-[48px] font-light tracking-tight mb-3'>
              {challenge.name}
            </h1>
            <p className='text-[16px] font-light text-[rgba(245,247,250,0.7)] leading-relaxed'>
              {challenge.description}
            </p>
          </div>

          {/* Instructions Step */}
          {currentStep === "instructions" && (
            <div className='space-y-6'>
              {/* Privacy Reminder */}
              <div className='bg-[rgba(255,107,53,0.1)] border border-[rgba(255,107,53,0.2)] rounded-xl p-6'>
                <div className='flex items-start gap-4'>
                  <div className='text-[24px]'>🔒</div>
                  <div>
                    <h3 className='text-[16px] font-medium text-[#F5F7FA] mb-2'>
                      Privacy Reminder
                    </h3>
                    <p className='text-[14px] text-[rgba(245,247,250,0.7)] leading-relaxed'>
                      {challenge.privacy_reminder}
                    </p>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className='bg-gradient-to-br from-[rgba(0,71,171,0.15)] to-[rgba(26,26,28,0.6)] border border-[rgba(0,71,171,0.2)] rounded-2xl p-8 relative'>
                <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,71,171,0.3)] to-transparent' />

                <h2 className='text-[22px] font-medium text-[#F5F7FA] mb-6'>
                  Answer These Questions
                </h2>

                <div className='space-y-6'>
                  {challenge.questions.map((question, index) => (
                    <div
                      key={index}
                      className='bg-[rgba(26,26,28,0.4)] border border-[rgba(245,247,250,0.06)] rounded-xl p-5'
                    >
                      <div className='flex gap-4'>
                        <div className='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)] rounded-full flex items-center justify-center text-[14px] font-medium text-[#F5F7FA]'>
                          {index + 1}
                        </div>
                        <p className='text-[16px] text-[rgba(245,247,250,0.9)] leading-relaxed pt-1'>
                          {question}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='mt-8 flex items-center gap-3 text-[14px] text-[rgba(245,247,250,0.6)]'>
                  <span className='text-[20px]'>⏱️</span>
                  <span>
                    Suggested duration: {challenge.duration_minutes} minutes
                  </span>
                </div>
              </div>

              {/* Start Button */}
              <div className='flex justify-center pt-4'>
                <button
                  onClick={() => setCurrentStep("recording")}
                  className='
                    relative overflow-hidden
                    bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
                    border border-[rgba(184,212,240,0.2)]
                    text-[#F5F7FA] font-medium
                    rounded-xl px-12 py-4
                    text-[16px]
                    shadow-[0_4px_20px_rgba(0,71,171,0.2)]
                    transition-all duration-[400ms]
                    hover:-translate-y-0.5
                    hover:shadow-[0_8px_28px_rgba(0,71,171,0.3)]
                    group
                  '
                >
                  <span className='absolute inset-0 -left-full bg-gradient-to-r from-transparent via-[rgba(255,107,53,0.2)] to-transparent transition-all duration-[600ms] group-hover:left-full pointer-events-none' />
                  <span className='relative z-10 flex items-center gap-3'>
                    <span className='text-[24px]'>🎙️</span>
                    Begin Recording
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Recording Step */}
          {currentStep === "recording" && (
            <div className='space-y-8'>
              {/* Questions Reference (Compact) */}
              <div className='bg-[rgba(26,26,28,0.4)] border border-[rgba(245,247,250,0.06)] rounded-xl p-6'>
                <h3 className='text-[16px] font-medium text-[rgba(245,247,250,0.9)] mb-4'>
                  Questions to Answer:
                </h3>
                <ol className='space-y-2 text-[14px] text-[rgba(245,247,250,0.7)]'>
                  {challenge.questions.map((question, index) => (
                    <li key={index} className='flex gap-2'>
                      <span className='font-medium'>{index + 1}.</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Recorder */}
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDurationSeconds={challenge.duration_minutes * 60}
                onError={setError}
              />
            </div>
          )}

          {/* Preview Step */}
          {currentStep === "preview" && recordedBlob && (
            <AudioPreviewPlayer
              audioBlob={recordedBlob}
              onReRecord={handleReRecord}
              onConfirm={handleSubmit}
              isUploading={false}
            />
          )}

          {/* Uploading Step */}
          {currentStep === "uploading" && (
            <div className='flex flex-col items-center justify-center py-20'>
              <div className='inline-block w-16 h-16 border-4 border-[rgba(0,71,171,0.3)] border-t-[rgba(0,71,171,0.8)] rounded-full animate-spin mb-6' />
              <h3 className='text-[24px] font-medium text-[#F5F7FA] mb-2'>
                Uploading Your Recording
              </h3>
              <p className='text-[16px] text-[rgba(245,247,250,0.6)] mb-8'>
                Registering on Story Protocol...
              </p>
              {error && (
                <div className='bg-[rgba(255,107,53,0.1)] border border-[rgba(255,107,53,0.2)] rounded-xl p-4 max-w-[500px]'>
                  <p className='text-[14px] text-[rgba(255,107,53,0.9)]'>
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AudioAccessGate>
  );
}
