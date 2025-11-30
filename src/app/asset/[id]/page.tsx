"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssetAudioPlayer } from "@/components/asset-page/asset-audio-player";
import { AudioMetadataDisplay } from "@/components/asset-page/audio-metadata-display";
import { StoryRegistrationStatus } from "@/components/asset-page/story-registration-status";
import { LicenseDisplay } from "@/components/asset-page/license-terms-display";
import { Card } from "@/components/custom/card";
import { AudioCapsuleMetadata } from "@/lib/types/audio";
import { createClient } from "@/utils/supabase/client";

// Demo asset mock data
const DEMO_ASSET_DATA: Record<string, any> = {
  "demo-1": {
    id: "demo-1",
    asset_type: "video",
    asset_url: "",
    license_fee: 15,
    status: "registered",
    story_ip_id: null,
    story_tx_hash: null,
    metadata: {
      drill_name: "Burpee Max Effort",
      video_metadata: { duration_seconds: 60 }
    }
  },
  "demo-2": {
    id: "demo-2",
    asset_type: "audio",
    asset_url: "",
    license_fee: 12,
    status: "registered",
    story_ip_id: null,
    story_tx_hash: null,
    metadata: {
      schema_version: "1.0",
      asset_type: "audio_capsule",
      drill_type_id: "identity-capsule-origin",
      challenge_name: "Identity Capsule - Origin Story",
      recording_duration_seconds: 225,
      questions_answered: 5,
      questions: [
        "Tell us about how you first got into your sport",
        "What drives you to compete?",
        "Describe your training routine",
        "What's your biggest achievement?",
        "Where do you see yourself in 5 years?"
      ],
      recorded_at: new Date().toISOString(),
      file_size_bytes: 1800000,
      mime_type: "audio/webm",
      athlete_profile: {
        discipline: "Crossfit",
        experience_level: "competitive"
      },
      verification: {
        world_id_verified: false,
        cv_video_verified: false
      }
    }
  }
};

export default function AssetPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      // Check if this is a demo asset
      if (assetId.startsWith("demo-") && DEMO_ASSET_DATA[assetId]) {
        setAsset(DEMO_ASSET_DATA[assetId]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from("assets")
          .select("*")
          .eq("id", assetId)
          .single();

        if (fetchError || !data) {
          setError("Asset not found");
          return;
        }

        setAsset(data);
      } catch (err) {
        console.error("[Asset Page] Error fetching asset:", err);
        setError("Failed to load asset");
      } finally {
        setLoading(false);
      }
    };

    if (assetId) {
      fetchAsset();
    }
  }, [assetId]);

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-[#2C2C2E] flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block w-12 h-12 border-4 border-[rgba(0,71,171,0.3)] border-t-[rgba(0,71,171,0.8)] rounded-full animate-spin mb-4' />
          <p className='text-[16px] text-[rgba(245,247,250,0.7)]'>
            Loading asset...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !asset) {
    return (
      <div className='min-h-screen bg-[#2C2C2E]'>
        <div className='max-w-[600px] mx-auto px-6 pt-[140px]'>
          <Card variant='default' className='p-8 text-center'>
            <div className='text-[48px] mb-4'>⚠️</div>
            <h2 className='text-[24px] font-medium text-[#F5F7FA] mb-3'>
              Asset Not Found
            </h2>
            <p className='text-[15px] text-[rgba(245,247,250,0.7)] mb-6'>
              {error || "The requested asset could not be found"}
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

  const metadata = asset.metadata as AudioCapsuleMetadata;

  // Only show audio layout if asset is audio type
  if (asset.asset_type !== "audio") {
    return (
      <div className='min-h-screen bg-[#2C2C2E]'>
        <div className='max-w-[600px] mx-auto px-6 pt-[140px]'>
          <Card variant='default' className='p-8 text-center'>
            <div className='text-[48px] mb-4'>🎥</div>
            <h2 className='text-[24px] font-medium text-[#F5F7FA] mb-3'>
              Video Asset
            </h2>
            <p className='text-[15px] text-[rgba(245,247,250,0.7)] mb-6'>
              This is a video asset. Video asset display is coming soon.
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
    <div className='min-h-screen bg-[#2C2C2E]'>
      <div className='max-w-[1400px] mx-auto px-6 md:px-16 pt-[140px] pb-20'>
        {/* Header */}
        <div className='mb-12'>
          <h1 className='text-[40px] md:text-[48px] font-light tracking-tight mb-3'>
            {metadata.challenge_name}
          </h1>
          <p className='text-[16px] text-[rgba(245,247,250,0.7)]'>
            Audio Capsule • {metadata.athlete_profile.discipline} •{" "}
            <span className='capitalize'>
              {metadata.athlete_profile.experience_level}
            </span>
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Left Column */}
          <div className='space-y-6'>
            {/* Audio Player */}
            <AssetAudioPlayer
              audioUrl={asset.asset_url}
              challengeName={metadata.challenge_name}
            />

            {/* Story Registration Status */}
            <StoryRegistrationStatus
              storyIpId={asset.story_ip_id}
              storyTxHash={asset.story_tx_hash}
              status={asset.status}
            />
          </div>

          {/* Right Column */}
          <div className='space-y-6'>
            {/* Metadata */}
            <AudioMetadataDisplay metadata={metadata} />

            {/* License - Pass storyIpId prop */}
            <LicenseDisplay
              licenseFee={Number(asset.license_fee)}
              storyIpId={asset.story_ip_id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
