"use client";

import { useState } from "react";
import React from "react";
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

function ProtocolCard({ drill, onAcceptChallenge, activeMode }: ProtocolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isVideo = drill.asset_type === "video";

  const duration = isVideo
    ? `${(drill as VideoDrill).duration_seconds}s`
    : `${(drill as AudioCapsule).duration_minutes} mins`;

  return (
    <div className='group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-300 cursor-pointer'>
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
      <div
        className='flex items-center justify-between p-6 cursor-pointer relative z-10'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center gap-6 flex-1'>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 flex-shrink-0",
              isVideo
                ? "bg-blue-500/20 text-blue-400"
                : "bg-purple-500/20 text-purple-400"
            )}
          >
            {isVideo ? (
              <Activity className='w-6 h-6' />
            ) : (
              <Mic className='w-6 h-6' />
            )}
          </div>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-3 mb-1'>
              <h3 className='text-lg font-bold text-white truncate'>{drill.name}</h3>
              <span className='px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-gray-400 border border-white/5 whitespace-nowrap'>
                {duration}
              </span>
            </div>
            <p className='text-gray-400 text-sm leading-relaxed truncate'>
              {drill.description}
            </p>
          </div>
        </div>

        <div className='flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white transition-colors ml-4'>
          <ChevronRight
            className={cn(
              "w-5 h-5 transition-transform duration-300",
              isExpanded && "rotate-90"
            )}
          />
        </div>
      </div>

      {isExpanded && (
        <div className='px-6 pb-6 pt-4 border-t border-[rgba(245,247,250,0.04)] relative z-10'>
          {isVideo && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
              <div className='space-y-6'>
                <div>
                  <div className='text-[10px] font-bold text-[rgba(245,247,250,0.4)] uppercase tracking-wider mb-2'>
                    Equipment Needed
                  </div>
                  <ul className='text-[13px] text-[rgba(245,247,250,0.7)] space-y-1'>
                    {(drill as VideoDrill).equipment_needed.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="opacity-50">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className='text-[10px] font-bold text-[rgba(245,247,250,0.4)] uppercase tracking-wider mb-2'>
                    Camera Setup
                  </div>
                  <div className='text-[13px] text-[rgba(245,247,250,0.7)] space-y-2'>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/5 rounded px-2 py-1.5">
                        <span className="block text-[10px] text-gray-500">Position</span>
                        <span>{(drill as VideoDrill).camera_setup.position}</span>
                      </div>
                      <div className="bg-white/5 rounded px-2 py-1.5">
                        <span className="block text-[10px] text-gray-500">Distance</span>
                        <span>{(drill as VideoDrill).camera_setup.distance}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 mb-1">Notes</span>
                      <ul className='space-y-1'>
                        {(drill as VideoDrill).camera_setup.notes.map((note, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="opacity-50">•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-6'>
                <div>
                  <div className='text-[10px] font-bold text-[rgba(245,247,250,0.4)] uppercase tracking-wider mb-2'>
                    Standards
                  </div>
                  <ul className='text-[13px] text-[rgba(245,247,250,0.7)] space-y-1'>
                    {(drill as VideoDrill).standards.map((standard, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="opacity-50 select-none">{i + 1}.</span>
                        <span>{standard}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className='text-[10px] font-bold text-[rgba(245,247,250,0.4)] uppercase tracking-wider mb-2'>
                    Execution
                  </div>
                  <ul className='text-[13px] text-[rgba(245,247,250,0.7)] space-y-1'>
                    {(drill as VideoDrill).execution_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="opacity-50 select-none">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!isVideo && (
            <div className="space-y-6">
              {(drill as AudioCapsule).verification_required && (
                <div className='px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg inline-flex items-center gap-2'>
                  <span className="text-sm">🔐</span>
                  <span className='text-xs text-purple-400 font-medium'>Verification Required</span>
                </div>
              )}

              <div>
                <div className='text-[10px] font-bold text-[rgba(245,247,250,0.4)] uppercase tracking-wider mb-2'>
                  Interview Questions
                </div>
                <ul className='text-[13px] text-[rgba(245,247,250,0.7)] space-y-2'>
                  {(drill as AudioCapsule).questions.map((question, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                      <span className="opacity-50 font-mono text-xs pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5">
            <ButtonCobalt
              onClick={() => onAcceptChallenge(drill.drill_type_id)}
              className='w-full'
            >
              Accept Challenge
            </ButtonCobalt>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ProtocolCard);
