"use client";

import { useState } from "react";
import { ButtonCobalt } from "./button-cobalt";
import { VideoDrill, AudioCapsule } from "@/lib/drills/constants";

interface ProtocolCardProps {
  drill: VideoDrill | AudioCapsule;
  onAcceptChallenge: (drillTypeId: string) => void;
}

export function ProtocolCard({ drill, onAcceptChallenge }: ProtocolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isVideo = drill.asset_type === "video";

  const duration = isVideo
    ? `${(drill as VideoDrill).duration_seconds} seconds`
    : `${(drill as AudioCapsule).duration_minutes}-4 minutes`;

  const getIcon = () => {
    if (drill.drill_type_id === "EXPL_BURPEE_001") return "🔥";
    if (drill.drill_type_id === "MENT_CAPSULE_001") return "🎯";
    if (drill.drill_type_id === "MENT_CAPSULE_002") return "👤";
    if (drill.drill_type_id === "MENT_CAPSULE_003") return "⚡";
    if (drill.drill_type_id === "MENT_CAPSULE_004") return "🔄";
    return "⏳";
  };

  const getProtocolId = () => {
    if (drill.drill_type_id === "EXPL_BURPEE_001") return "Explosive_01";
    if (drill.drill_type_id === "MENT_CAPSULE_001") return "Identity_01";
    if (drill.drill_type_id === "MENT_CAPSULE_002") return "Identity_02";
    if (drill.drill_type_id === "MENT_CAPSULE_003") return "Identity_03";
    if (drill.drill_type_id === "MENT_CAPSULE_004") return "Identity_04";
    return drill.drill_type_id;
  };

  return (
    <div
      className={`
        bg-[rgba(26,26,28,0.4)] 
        border border-[rgba(245,247,250,0.04)] 
        rounded-xl 
        transition-all duration-300
        ${isExpanded ? "bg-[rgba(26,26,28,0.6)]" : ""}
      `}
    >
      <div
        className='flex items-center justify-between p-6 cursor-pointer'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-start gap-6 flex-1'>
          <div className='text-[40px] leading-none shrink-0'>{getIcon()}</div>

          <div className='flex-1'>
            <div className='flex items-center gap-4 mb-2'>
              <span className='text-[11px] font-mono font-medium text-[rgba(245,247,250,0.4)] uppercase tracking-wider'>
                {getProtocolId()}
              </span>
              <span className='text-[11px] font-mono font-medium text-[rgba(245,247,250,0.4)]'>
                {duration}
              </span>
            </div>

            <h3 className='text-[20px] font-medium text-[#F5F7FA] mb-2'>
              {drill.name}
            </h3>

            <p className='text-[14px] text-[rgba(245,247,250,0.6)] font-light leading-relaxed'>
              {drill.description}
            </p>
          </div>
        </div>

        <div
          className={`
            text-[24px] text-[rgba(245,247,250,0.4)] shrink-0 ml-4
            transition-transform duration-300
            ${isExpanded ? "rotate-90" : ""}
          `}
        >
          ›
        </div>
      </div>

      {isExpanded && (
        <div className='px-6 pb-6 pt-2 border-t border-[rgba(245,247,250,0.04)]'>
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
