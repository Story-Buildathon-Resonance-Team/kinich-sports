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

  const videoDrills = getVideoDrills();
  const audioCapsules = getAudioCapsules();
  const activeDrills = activeMode === "video" ? videoDrills : audioCapsules;

  const handleAcceptChallenge = (drillTypeId: string) => {
    router.push(`/submit/${activeMode}/${drillTypeId}`);
  };

  return (
    <div className='min-h-screen'>
      <Navigation
        variant='authenticated'
        userName='Athlete'
        walletAddress='0x742d...3a8f'
      />

      <div className='max-w-[1200px] mx-auto px-6 md:px-16 pt-[140px] pb-20'>
        <div className='text-center mb-16'>
          <h1 className='text-[48px] md:text-[56px] font-light tracking-tight mb-4'>
            Your Arena <span className='text-gradient-logo'>Awaits</span>
          </h1>
          <p className='text-[18px] font-light text-[rgba(245,247,250,0.7)] leading-relaxed'>
            Choose your challenge. Submit your performance. Build your legacy.
          </p>
        </div>

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
                  ? "bg-[rgba(0,71,171,0.15)] border-[rgba(0,71,171,0.3)] text-[#F5F7FA]"
                  : "bg-transparent border-[rgba(245,247,250,0.1)] text-[rgba(245,247,250,0.6)] hover:bg-[rgba(0,71,171,0.1)] hover:border-[rgba(0,71,171,0.3)] hover:text-[#F5F7FA]"
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
                  ? "bg-[rgba(0,71,171,0.15)] border-[rgba(0,71,171,0.3)] text-[#F5F7FA]"
                  : "bg-transparent border-[rgba(245,247,250,0.1)] text-[rgba(245,247,250,0.6)] hover:bg-[rgba(0,71,171,0.1)] hover:border-[rgba(0,71,171,0.3)] hover:text-[#F5F7FA]"
              }
            `}
          >
            <span className='text-[20px]'>🎙️</span>
            Audio Challenges
          </button>
        </div>

        <div className='bg-gradient-to-br from-[rgba(0,71,171,0.15)] to-[rgba(26,26,28,0.6)] border border-[rgba(0,71,171,0.2)] rounded-2xl p-8 mb-12 relative'>
          <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,71,171,0.3)] to-transparent' />

          <h2 className='text-[22px] font-medium text-[#F5F7FA] mb-3'>
            {activeMode === "video"
              ? "Physical Performance Protocols"
              : "Identity Capsules"}
          </h2>
          <p className='text-[15px] font-light text-[rgba(245,247,250,0.7)] leading-relaxed'>
            {activeMode === "video"
              ? "Record standardized training drills. Our computer vision extracts performance metrics, verifies execution quality, and registers your training as an IP asset on Story Protocol."
              : "Share your athletic journey through voice. Answer 3 questions in 3-4 minutes. Your story, strategy, and mindset become training data for AI models learning about human performance."}
          </p>
        </div>

        <div className='flex flex-col gap-4'>
          {activeDrills.map((drill) => (
            <ProtocolCard
              key={drill.drill_type_id}
              drill={drill}
              onAcceptChallenge={handleAcceptChallenge}
            />
          ))}

          <div className='bg-[rgba(26,26,28,0.4)] border border-[rgba(245,247,250,0.04)] rounded-xl p-6 opacity-60'>
            <div className='flex items-start gap-6'>
              <div className='text-[40px] leading-none'>⏳</div>
              <div>
                <div className='flex items-center gap-4 mb-2'>
                  <span className='text-[11px] font-mono font-medium text-[rgba(245,247,250,0.4)] uppercase tracking-wider'>
                    Coming Soon
                  </span>
                  <span className='text-[11px] font-mono font-medium text-[rgba(245,247,250,0.4)]'>
                    —
                  </span>
                </div>
                <h3 className='text-[20px] font-medium text-[#F5F7FA] mb-2'>
                  More {activeMode === "video" ? "Drills" : "Capsules"}
                </h3>
                <p className='text-[14px] text-[rgba(245,247,250,0.6)] font-light'>
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
