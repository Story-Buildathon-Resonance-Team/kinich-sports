"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getVideoDrills, getAudioCapsules } from "@/lib/drills/constants";
import { Activity, Mic, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type ChallengeMode = "video" | "audio";

export default function ArenaPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<ChallengeMode>("video");

  const videoDrills = getVideoDrills();
  const audioCapsules = getAudioCapsules();
  const activeDrills = activeMode === "video" ? videoDrills : audioCapsules;

  const handleAcceptChallenge = () => {
    if (activeMode === "video") {
      router.push("/dashboard/analyze");
    } else {
      router.push("/dashboard/record-audio");
    }
  };

  return (
    <div className='p-8 pt-12 max-w-[1200px] mx-auto animate-fade-in-up'>
      <div className='mb-12'>
        <h1 className='text-4xl font-bold tracking-tight text-white mb-3'>
          Training Arena
        </h1>
        <p className='text-lg text-gray-400 max-w-2xl'>
          Select a protocol to begin. Your performance will be verified,
          analyzed, and minted as an IP asset.
        </p>
      </div>

      <div className='flex gap-4 mb-10'>
        <button
          onClick={() => setActiveMode("video")}
          className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 border",
            activeMode === "video"
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
              : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          <Activity className='w-4 h-4' />
          Physical Protocols
        </button>

        <button
          onClick={() => setActiveMode("audio")}
          className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 border",
            activeMode === "audio"
              ? "bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
              : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          )}
        >
          <Mic className='w-4 h-4' />
          Identity Capsules
        </button>
      </div>

      <div className='grid grid-cols-1 gap-6'>
        {activeDrills.map((drill) => (
          <div
            key={drill.drill_type_id}
            onClick={() => handleAcceptChallenge()}
            className='group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-300 cursor-pointer'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

            <div className='p-8 flex items-center gap-8 relative z-10'>
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
                  activeMode === "video"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-purple-500/20 text-purple-400"
                )}
              >
                {activeMode === "video" ? (
                  <Activity className='w-8 h-8' />
                ) : (
                  <Mic className='w-8 h-8' />
                )}
              </div>

              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <h3 className='text-xl font-bold text-white'>{drill.name}</h3>
                  <span className='px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono text-gray-400 border border-white/5'>
                    {activeMode === "video" ? "60s" : "3 mins"}
                  </span>
                </div>
                <p className='text-gray-400 text-sm leading-relaxed max-w-2xl'>
                  {drill.description}
                </p>
              </div>

              <div className='flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors'>
                <ChevronRight className='w-6 h-6' />
              </div>
            </div>
          </div>
        ))}

        <div className='rounded-2xl border border-white/5 bg-zinc-900/20 p-8 flex items-center gap-8 opacity-50 cursor-not-allowed'>
          <div className='w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600'>
            <Lock className='w-6 h-6' />
          </div>
          <div>
            <h3 className='text-xl font-bold text-gray-500 mb-1'>
              Locked Protocols
            </h3>
            <p className='text-gray-600 text-sm'>
              Advanced {activeMode === "video" ? "drills" : "capsules"}{" "}
              unlocking in Season 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
