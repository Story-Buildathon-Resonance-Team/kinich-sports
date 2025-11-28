"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { AudioPreviewPlayer } from "@/components/audio/audio-preview-player";
import { AudioAccessGate } from "@/components/audio/audio-access-gate";
import { Card } from "@/components/custom/card";
import { getDrillById, AudioCapsule } from "@/lib/drills/constants";
import { useAudioUpload } from "@/hooks/useAudioUpload";
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
  const [athleteId, setAthleteId] = useState<string | null>(null);
  const [athleteProfile, setAthleteProfile] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Initialize upload hook
  const uploadHook =
    challenge && athleteProfile && athleteId
      ? useAudioUpload({ challenge, athleteId, athleteProfile })
      : null;

  // Fetch challenge and athlete profile
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get challenge
        const drill = getDrillById(drillTypeId);
        if (!drill || drill.asset_type !== "audio") {
          setLoadingError("Invalid challenge ID");
          return;
        }
        setChallenge(drill as AudioCapsule);

        // Get athlete profile
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/");
          return;
        }

        const response = await fetch(
          `/api/athletes/me?dynamic_user_id=${user.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch athlete profile");
        }

        const data = await response.json();

        if (!data.athlete) {
          setLoadingError("Athlete profile not found");
          return;
        }

        setAthleteId(data.athlete.id);
        setAthleteProfile(data.athlete);
      } catch (err) {
        console.error("[Audio Submission] Initialization error:", err);
        setLoadingError("Failed to load challenge");
      }
    };

    initialize();
  }, [drillTypeId, router]);

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordedBlob(blob);
    setRecordingDuration(duration);
    setCurrentStep("preview");
  };

  const handleReRecord = () => {
    setRecordedBlob(null);
    setRecordingDuration(0);
    setCurrentStep("recording");
    uploadHook?.resetError();
  };

  const handleSubmit = async () => {
    if (!recordedBlob || !uploadHook) return;

    try {
      setCurrentStep("uploading");
      await uploadHook.uploadAudio(recordedBlob, recordingDuration);
    } catch (err) {
      setCurrentStep("preview");
    }
  };

  // Loading state
  if (!challenge || !athleteId || !athleteProfile) {
    if (loadingError) {
      return (
        <div className='min-h-screen bg-[#2C2C2E]'>
          <div className='max-w-[600px] mx-auto px-6 pt-[140px]'>
            <Card variant='default' className='p-8 text-center'>
              <div className='text-[48px] mb-4'>⚠️</div>
              <h2 className='text-[24px] font-medium text-[#F5F7FA] mb-3'>
                Error
              </h2>
              <p className='text-[15px] text-[rgba(245,247,250,0.7)] mb-6'>
                {loadingError}
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
            </Card>
          </div>
        </div>
      );
    }

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
              <Card variant='default' hover={false} className='p-6'>
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
              </Card>

              <Card variant='elevated' hover={false} className='p-8'>
                <h2 className='text-[22px] font-medium text-[#F5F7FA] mb-6'>
                  Answer These Questions
                </h2>

                <div className='space-y-6'>
                  {challenge.questions.map((question, index) => (
                    <Card
                      key={index}
                      variant='default'
                      hover={false}
                      className='p-5'
                    >
                      <div className='flex gap-4'>
                        <div className='flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)] rounded-full flex items-center justify-center text-[14px] font-medium text-[#F5F7FA]'>
                          {index + 1}
                        </div>
                        <p className='text-[16px] text-[rgba(245,247,250,0.9)] leading-relaxed pt-1'>
                          {question}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className='mt-8 flex items-center gap-3 text-[14px] text-[rgba(245,247,250,0.6)]'>
                  <span className='text-[20px]'>⏱️</span>
                  <span>
                    Suggested duration: {challenge.duration_minutes} minutes
                  </span>
                </div>
              </Card>

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
              <Card variant='default' hover={false} className='p-6'>
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
              </Card>

              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDurationSeconds={challenge.duration_minutes * 60}
                onError={setLoadingError}
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
          {currentStep === "uploading" && uploadHook && (
            <div className='flex flex-col items-center justify-center py-20'>
              <div className='inline-block w-16 h-16 border-4 border-[rgba(0,71,171,0.3)] border-t-[rgba(0,71,171,0.8)] rounded-full animate-spin mb-6' />
              <h3 className='text-[24px] font-medium text-[#F5F7FA] mb-2'>
                {uploadHook.progress === "uploading" &&
                  "Uploading Your Recording"}
                {uploadHook.progress === "creating-record" &&
                  "Creating Asset Record"}
                {uploadHook.progress === "registering" &&
                  "Registering on Story Protocol"}
                {uploadHook.progress === "complete" && "Complete!"}
              </h3>
              <p className='text-[16px] text-[rgba(245,247,250,0.6)] mb-8'>
                Please wait...
              </p>
              {uploadHook.error && (
                <Card variant='default' className='p-4 max-w-[500px]'>
                  <p className='text-[14px] text-[rgba(255,107,53,0.9)]'>
                    {uploadHook.error}
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </AudioAccessGate>
  );
}
