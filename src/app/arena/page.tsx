"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/custom/navigation";
import { ProtocolCard } from "@/components/custom/protocol-card";
import { getVideoDrills, getAudioCapsules } from "@/lib/drills/constants";

type ChallengeMode = "video" | "audio";

export default function ArenaPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<ChallengeMode>("video");

  // Get drills based on active mode
  const videoDrills = getVideoDrills();
  const audioCapsules = getAudioCapsules();

  const activeDrills = activeMode === "video" ? videoDrills : audioCapsules;

  // Handle challenge acceptance
  const handleAcceptChallenge = (drillTypeId: string) => {
    // Placeholder route - update with actual route pattern
    router.push(`/submit/${activeMode}/${drillTypeId}`);
  };

  return (
    <div className='min-h-screen'>
      {/* Navigation */}
      <Navigation
        variant='authenticated'
        userName='Athlete'
        walletAddress='0x742d...3a8f'
      />

      {/* Main Content */}
      <div className='max-w-[1200px] mx-auto px-16 pt-[140px] pb-20'>
        {/* Hero Section */}
        <div className='text-center mb-16'>
          <h1 className='text-[56px] font-light tracking-tight mb-4'>
            Your Arena <span className='text-gradient-logo'>Awaits</span>
          </h1>
          <p className='text-[18px] font-light text-ice/70 leading-relaxed'>
            Choose your challenge. Submit your performance. Build your legacy.
          </p>
        </div>

        {/* Challenge Mode Tabs */}
        <div className='flex gap-4 justify-center mb-12'>
          <button
            onClick={() => setActiveMode("video")}
            className={`
              flex items-center gap-3
              px-8 py-3 rounded-lg
              text-[15px] font-medium
              border transition-all duration-300
              ${
                activeMode === "video"
                  ? "bg-cobalt/15 border-cobalt/30 text-ice"
                  : "bg-transparent border-ice/10 text-ice/60 hover:bg-cobalt/10 hover:border-cobalt/30 hover:text-ice"
              }
            `}
          >
            <span className='text-[20px]'>🎥</span>
            Video Challenges
          </button>

          <button
            onClick={() => setActiveMode("audio")}
            className={`
              flex items-center gap-3
              px-8 py-3 rounded-lg
              text-[15px] font-medium
              border transition-all duration-300
              ${
                activeMode === "audio"
                  ? "bg-cobalt/15 border-cobalt/30 text-ice"
                  : "bg-transparent border-ice/10 text-ice/60 hover:bg-cobalt/10 hover:border-cobalt/30 hover:text-ice"
              }
            `}
          >
            <span className='text-[20px]'>🎙️</span>
            Audio Challenges
          </button>
        </div>

        {/* Intro Card */}
        <div className='bg-linear-to-br from-cobalt/15 to-graphite-dark/60 border border-cobalt/20 rounded-2xl p-8 mb-12 relative'>
          {/* Top accent line */}
          <div className='absolute top-0 left-0 right-0 h-px bg-linear-to-br from-transparent via-cobalt/30 to-transparent' />

          <h2 className='text-[22px] font-medium text-ice mb-3'>
            {activeMode === "video"
              ? "Physical Performance Protocols"
              : "Identity Capsules"}
          </h2>
          <p className='text-[15px] font-light text-ice/70 leading-relaxed'>
            {activeMode === "video"
              ? "Record standardized training drills. Our computer vision extracts performance metrics, verifies execution quality, and registers your training as an IP asset on Story Protocol."
              : "Share your athletic journey through voice. Answer 3 questions in 3-4 minutes. Your story, strategy, and mindset become training data for AI models learning about human performance."}
          </p>
        </div>

        {/* Protocols List */}
        <div className='flex flex-col gap-4'>
          {activeDrills.map((drill) => (
            <ProtocolCard
              key={drill.drill_type_id}
              drill={drill}
              onAcceptChallenge={handleAcceptChallenge}
            />
          ))}

          {/* Coming Soon Card */}
          <div className='bg-graphite-dark/40 border border-ice/[0.04] rounded-xl p-6 opacity-60'>
            <div className='flex items-start gap-6'>
              <div className='text-[40px] leading-none'>⏳</div>
              <div>
                <div className='flex items-center gap-4 mb-2'>
                  <span className='text-[11px] font-mono font-medium text-ice/40 uppercase tracking-wider'>
                    Coming Soon
                  </span>
                  <span className='text-[11px] font-mono font-medium text-ice/40'>
                    —
                  </span>
                </div>
                <h3 className='text-[20px] font-medium text-ice mb-2'>
                  More {activeMode === "video" ? "Drills" : "Capsules"}
                </h3>
                <p className='text-[14px] text-ice/60 font-light'>
                  Additional training protocols launching soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
