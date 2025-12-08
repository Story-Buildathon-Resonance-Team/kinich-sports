"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getVideoDrills, getAudioCapsules, getDrillById } from "@/lib/drills/constants";
import { Activity, Mic, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import ProtocolCard from "@/components/custom/protocol-card";

type ChallengeMode = "video" | "audio";

export default function ArenaPage() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<ChallengeMode>("video");

  const videoDrills = getVideoDrills();
  const audioCapsules = getAudioCapsules();
  const activeDrills = activeMode === "video" ? videoDrills : audioCapsules;

  const handleAcceptChallenge = (drillTypeId: string) => {
    const drill = getDrillById(drillTypeId);
    if (!drill) return;

    if (drill.asset_type === "video") {
      router.push("/dashboard/analyze");
    } else {
      router.push(`/dashboard/record-audio/${drillTypeId}`);
    }
  };

  return (
    <div className='p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-fade-in-up'>
      <div className='flex justify-end mb-6'>
        <div className='flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5'>
          <button
            onClick={() => setActiveMode("video")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              activeMode === "video"
                ? "bg-blue-500/10 text-blue-400 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Activity className='w-4 h-4' />
            Physical
          </button>

          <button
            onClick={() => setActiveMode("audio")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              activeMode === "audio"
                ? "bg-purple-500/10 text-purple-400 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Mic className='w-4 h-4' />
            Identity
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {activeDrills.map((drill) => (
          <ProtocolCard
            key={drill.drill_type_id}
            drill={drill}
            onAcceptChallenge={handleAcceptChallenge}
            activeMode={activeMode}
          />
        ))}

        <div className='rounded-2xl border border-white/5 bg-zinc-900/20 p-4 sm:p-8 flex items-start sm:items-center gap-4 sm:gap-8 opacity-50 cursor-not-allowed'>
          <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 flex-shrink-0'>
            <Lock className='w-5 h-5 sm:w-6 sm:h-6' />
          </div>
          <div>
            <h3 className='text-base sm:text-xl font-bold text-gray-500 mb-1'>
              Locked Protocols
            </h3>
            <p className='text-gray-600 text-xs sm:text-sm'>
              Advanced {activeMode === "video" ? "drills" : "capsules"}{" "}
              unlocking in Season 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
