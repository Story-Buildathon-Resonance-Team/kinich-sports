"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssetAudioPlayer } from "@/components/asset-page/asset-audio-player";
import { AssetVideoPlayer } from "@/components/asset-page/asset-video-player";
import { AudioMetadataDisplay } from "@/components/asset-page/audio-metadata-display";
import { VideoMetadataDisplay } from "@/components/asset-page/video-metadata-display";
import { StoryRegistrationStatus } from "@/components/asset-page/story-registration-status";
import { LicenseDisplay } from "@/components/asset-page/license-terms-display";
import { Card } from "@/components/custom/card";
import { AudioCapsuleMetadata } from "@/lib/types/audio";
import { VideoDrillMetadata } from "@/lib/types/video";
import { createClient } from "@/utils/supabase/client";
import { Loader2, AlertCircle, ArrowLeft, Share2 } from "lucide-react";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from("assets")
          .select(
            `
            id,
            asset_type,
            asset_url,
            license_fee,
            status,
            story_ip_id,
            story_tx_hash,
            metadata,
            athlete_id,
            athletes:athlete_id (
              world_id_verified
            )
          `
          )
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

  if (loading) {
    return (
      <div className='p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8 animate-pulse'>
        {/* Header Skeleton */}
        <div className='flex items-center gap-4 mb-8'>
          <div className='w-10 h-10 rounded-full bg-white/5' />
          <div className='space-y-2'>
            <div className='h-8 w-64 rounded-lg bg-white/5' />
            <div className='h-4 w-32 rounded-lg bg-white/5' />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content Skeleton */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Player Skeleton */}
            <div className='aspect-video w-full rounded-2xl bg-white/5 border border-white/5' />
            
            {/* Metadata Skeleton */}
            <div className='grid grid-cols-3 gap-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='h-24 rounded-xl bg-white/5 border border-white/5' />
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className='space-y-6'>
            <div className='h-64 rounded-2xl bg-white/5 border border-white/5' />
            <div className='h-48 rounded-2xl bg-white/5 border border-white/5' />
          </div>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className='min-h-[calc(100vh-100px)] p-8'>
        <Card
          variant='default'
          className='p-8 text-center max-w-[600px] mx-auto mt-20'
        >
          <div className='flex justify-center mb-4'>
            <AlertCircle className='w-12 h-12 text-orange-400' />
          </div>
          <h2 className='text-[24px] font-medium text-[#F5F7FA] mb-3'>
            Asset Not Found
          </h2>
          <p className='text-[15px] text-[rgba(245,247,250,0.7)] mb-6'>
            {error || "The requested asset could not be found"}
          </p>
          <button
            onClick={() => router.push("/dashboard/assets")}
            className='bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl px-8 py-3 transition-all'
          >
            Back to Assets
          </button>
        </Card>
      </div>
    );
  }

  // Type cast based on asset_type
  const metadata =
    asset.asset_type === "audio"
      ? (asset.metadata as AudioCapsuleMetadata)
      : (asset.metadata as VideoDrillMetadata);

  const worldIdVerified = asset.athletes?.world_id_verified ?? false;
  const drillName =
    asset.asset_type === "audio"
      ? (metadata as AudioCapsuleMetadata).drill_type_id
      : (metadata as VideoDrillMetadata).drill_type_id;

  // Colors based on asset type
  const accentColor =
    asset.asset_type === "video"
      ? "border-blue-500/30"
      : "border-purple-500/30";
  const iconBg =
    asset.asset_type === "video" ? "bg-blue-500/10" : "bg-purple-500/10";
  const iconText =
    asset.asset_type === "video" ? "text-blue-400" : "text-purple-400";

  return (
    <div className='p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen animate-fade-in-up'>
      <div className='flex items-center justify-between mb-8'>
        <button
          onClick={() => router.push("/dashboard/assets")}
          className='flex items-center gap-2 text-gray-400 hover:text-white transition-colors group px-4 py-2 rounded-lg hover:bg-white/5'
        >
          <ArrowLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
          <span className='text-sm font-medium'>Back to Assets</span>
        </button>

        <div className='flex items-center gap-3'>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono border ${accentColor} ${iconBg} ${iconText}`}
          >
            {asset.asset_type.toUpperCase()}
          </span>
          <button className='p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors'>
            <Share2 className='w-4 h-4' />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-12 gap-8'>
        <div className='xl:col-span-8 space-y-6'>
          <div className='relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl'>
            {asset.asset_type === "audio" ? (
              <div className='p-8'>
                <AssetAudioPlayer
                  audioUrl={asset.asset_url}
                  challengeName={drillName}
                />
              </div>
            ) : (
              <AssetVideoPlayer
                videoUrl={asset.asset_url}
                drillName={drillName}
              />
            )}
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-[#0a0a0a] border border-white/5 rounded-xl p-4'>
              <p className='text-xs text-gray-500 uppercase tracking-wider mb-1'>
                Discipline
              </p>
              <p className='text-white font-medium'>
                {metadata.athlete_profile.discipline}
              </p>
            </div>
            <div className='bg-[#0a0a0a] border border-white/5 rounded-xl p-4'>
              <p className='text-xs text-gray-500 uppercase tracking-wider mb-1'>
                Level
              </p>
              <p className='text-white font-medium capitalize'>
                {metadata.athlete_profile.experience_level}
              </p>
            </div>
            <div className='bg-[#0a0a0a] border border-white/5 rounded-xl p-4'>
              <p className='text-xs text-gray-500 uppercase tracking-wider mb-1'>
                Processed
              </p>
              <p className='text-white font-medium'>
                {new Date(asset.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <div className='bg-[#0a0a0a] border border-white/5 rounded-xl p-4'>
              <p className='text-xs text-gray-500 uppercase tracking-wider mb-1'>
                Status
              </p>
              <p className='text-emerald-400 font-medium capitalize flex items-center gap-2'>
                <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'></span>
                {asset.status}
              </p>
            </div>
          </div>

          <div className='bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden'>
            <div className='px-6 py-4 border-b border-white/5 bg-white/[0.02]'>
              <h3 className='font-medium text-white'>Analysis Data</h3>
            </div>
            <div className='p-6'>
              {asset.asset_type === "audio" ? (
                <AudioMetadataDisplay
                  metadata={metadata as AudioCapsuleMetadata}
                  audioUrl={asset.asset_url}
                />
              ) : (
                <VideoMetadataDisplay
                  metadata={metadata as VideoDrillMetadata}
                  worldIdVerified={worldIdVerified}
                />
              )}
            </div>
          </div>
        </div>

        <div className='xl:col-span-4 space-y-6'>
          <StoryRegistrationStatus
            storyIpId={asset.story_ip_id}
            storyTxHash={asset.story_tx_hash}
            status={asset.status}
          />

          <LicenseDisplay
            licenseFee={Number(asset.license_fee)}
            storyIpId={asset.story_ip_id}
          />
        </div>
      </div>
    </div>
  );
}
