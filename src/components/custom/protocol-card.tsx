"use client";

import { useState } from "react";
import { Activity, Mic, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonCobalt } from "./button-cobalt";
import { VideoDrill, AudioCapsule } from "@/lib/drills/constants";

type ChallengeMode = "video" | "audio";

interface ProtocolCardProps {
  drill: VideoDrill | AudioCapsule;
  onAcceptChallenge: (drillTypeId: string) => void;
  activeMode?: ChallengeMode;
}

export function ProtocolCard({ drill, onAcceptChallenge, activeMode }: ProtocolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isVideo = drill.asset_type === "video";

  const duration = isVideo
    ? `${(drill as VideoDrill).duration_seconds}s`
    : `${(drill as AudioCapsule).duration_minutes} mins`;

  return (
    <div className='group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-300 cursor-pointer'>
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
      <div
        className='flex items-center justify-between p-8 cursor-pointer relative z-10'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center gap-8 flex-1'>
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
              isVideo
                ? "bg-blue-500/20 text-blue-400"
                : "bg-purple-500/20 text-purple-400"
            )}
          >
            {isVideo ? (
              <Activity className='w-8 h-8' />
            ) : (
              <Mic className='w-8 h-8' />
            )}
          </div>

          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <h3 className='text-xl font-bold text-white'>{drill.name}</h3>
              <span className='px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono text-gray-400 border border-white/5'>
                {duration}
              </span>
            </div>
            <p className='text-gray-400 text-sm leading-relaxed max-w-2xl'>
              {drill.description}
            </p>
          </div>
        </div>

        <div className='flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors'>
          <ChevronRight
            className={cn(
              "w-6 h-6 transition-transform duration-300",
              isExpanded && "rotate-90"
            )}
          />
        </div>
      </div>

      {isExpanded && (
        <div className='px-8 pb-8 pt-6 border-t border-[rgba(245,247,250,0.04)] relative z-10'>
          {isVideo && (
            <>
              <div className='mb-6'>
                <div className='text-[12px] font-medium text-[rgba(245,247,250,0.5)] uppercase tracking-wider mb-3'>
                  Equipment Needed
                </div>
                <div className='text-[14px] text-[rgba(245,247,250,0.7)] font-light'>
                  <ul className='space-y-1'>
                    {(drill as VideoDrill).equipment_needed.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className='mb-6'>
                <div className='text-[12px] font-medium text-[rgba(245,247,250,0.5)] uppercase tracking-wider mb-3'>
                  Camera Setup
                </div>
                <div className='text-[14px] text-[rgba(245,247,250,0.7)] font-light space-y-1'>
                  <p>
                    <strong className='text-[rgba(245,247,250,0.9)]'>
                      Position:
                    </strong>{" "}
                    {(drill as VideoDrill).camera_setup.position}
                  </p>
                  <p>
                    <strong className='text-[rgba(245,247,250,0.9)]'>
                      Distance:
                    </strong>{" "}
                    {(drill as VideoDrill).camera_setup.distance}
                  </p>
                  <p>
                    <strong className='text-[rgba(245,247,250,0.9)]'>
                      Angle:
                    </strong>{" "}
                    {(drill as VideoDrill).camera_setup.angle}
                  </p>
                  <ul className='mt-2 space-y-1'>
                    {(drill as VideoDrill).camera_setup.notes.map((note, i) => (
                      <li key={i}>• {note}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className='mb-6'>
                <div className='text-[12px] font-medium text-[rgba(245,247,250,0.5)] uppercase tracking-wider mb-3'>
                  Standards (each rep must include)
                </div>
                <div className='text-[14px] text-[rgba(245,247,250,0.7)] font-light'>
                  <ol className='list-decimal list-inside space-y-1'>
                    {(drill as VideoDrill).standards.map((standard, i) => (
                      <li key={i}>{standard}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className='mb-6'>
                <div className='text-[12px] font-medium text-[rgba(245,247,250,0.5)] uppercase tracking-wider mb-3'>
                  Execute
                </div>
                <div className='text-[14px] text-[rgba(245,247,250,0.7)] font-light'>
                  <ol className='list-decimal list-inside space-y-1'>
                    {(drill as VideoDrill).execution_steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}

          {!isVideo && (
            <>
              {(drill as AudioCapsule).verification_required && (
                <div className='mb-4 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg'>
                  <p className='text-xs text-purple-400 font-medium flex items-center gap-2'>
                    <span>🔐</span> Verification Required
                  </p>
                </div>
              )}

              <div className='mb-6'>
                <div className='text-[12px] font-medium text-[rgba(245,247,250,0.5)] uppercase tracking-wider mb-3'>
                  Questions
                </div>
                <div className='text-[14px] text-[rgba(245,247,250,0.7)] font-light'>
                  <ol className='list-decimal list-inside space-y-2'>
                    {(drill as AudioCapsule).questions.map((question, i) => (
                      <li key={i}>{question}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}

          <ButtonCobalt
            onClick={() => onAcceptChallenge(drill.drill_type_id)}
            className='w-full'
          >
            Accept Challenge
          </ButtonCobalt>
        </div>
      )}
    </div>
  );
}
