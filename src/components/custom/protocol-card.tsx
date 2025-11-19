// src/components/custom/protocol-card.tsx

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

  // Format duration
  const duration = isVideo
    ? `${(drill as VideoDrill).duration_seconds} seconds`
    : `${(drill as AudioCapsule).duration_minutes}-4 minutes`;

  // Get icon based on drill_type_id
  const getIcon = () => {
    if (drill.drill_type_id === "EXPL_BURPEE_001") return "🔥";
    if (drill.drill_type_id === "MENT_CAPSULE_001") return "🎯";
    if (drill.drill_type_id === "MENT_CAPSULE_002") return "👤";
    if (drill.drill_type_id === "MENT_CAPSULE_003") return "⚡";
    if (drill.drill_type_id === "MENT_CAPSULE_004") return "🔄";
    return "⏳";
  };

  // Get protocol ID display (simplified)
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
        bg-graphite-dark/40 
        border border-ice/[0.04] 
        rounded-xl 
        transition-all duration-300
        ${isExpanded ? "bg-graphite-dark/60" : ""}
      `}
    >
      {/* Protocol Header - Always Visible */}
      <div
        className='flex items-center justify-between p-6 cursor-pointer'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-start gap-6 flex-1'>
          {/* Icon */}
          <div className='text-[40px] leading-none shrink-0'>{getIcon()}</div>

          {/* Info */}
          <div className='flex-1'>
            {/* Meta: ID + Duration */}
            <div className='flex items-center gap-4 mb-2'>
              <span className='text-[11px] font-mono font-medium text-ice/40 uppercase tracking-wider'>
                {getProtocolId()}
              </span>
              <span className='text-[11px] font-mono font-medium text-ice/40'>
                {duration}
              </span>
            </div>

            {/* Title */}
            <h3 className='text-[20px] font-medium text-ice mb-2'>
              {drill.name}
            </h3>

            {/* Summary */}
            <p className='text-[14px] text-ice/60 font-light leading-relaxed'>
              {drill.description}
            </p>
          </div>
        </div>

        {/* Arrow indicator */}
        <div
          className={`
            text-[24px] text-ice/40 shrink-0 ml-4
            transition-transform duration-300
            ${isExpanded ? "rotate-90" : ""}
          `}
        >
          ›
        </div>
      </div>

      {/* Protocol Details - Expandable */}
      {isExpanded && (
        <div className='px-6 pb-6 pt-2 border-t border-ice/[0.04]'>
          {/* Video Drill Details */}
          {isVideo && (
            <>
              {/* Equipment */}
              <div className='mb-6'>
                <div className='text-[12px] font-medium text-ice/50 uppercase tracking-wider mb-3'>
                  Equipment Needed
                </div>
                <div className='text-[14px] text-ice/70 font-light'>
                  <ul className='space-y-1'>
                    {(drill as VideoDrill).equipment_needed.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Camera Setup */}
              <div className='mb-6'>
                <div className='text-[12px] font-medium text-ice/50 uppercase tracking-wider mb-3'>
                  Camera Setup
                </div>
                <div className='text-[14px] text-ice/70 font-light space-y-1'>
                  <p>
                    <strong className='text-ice/90'>Position:</strong>{" "}
                    {(drill as VideoDrill).camera_setup.position}
                  </p>
                  <p>
                    <strong className='text-ice/90'>Distance:</strong>{" "}
                    {(drill as VideoDrill).camera_setup.distance}
                  </p>
                  <p>
                    <strong className='text-ice/90'>Angle:</strong>{" "}
                    {(drill as VideoDrill).camera_setup.angle}
                  </p>
                  <ul className='mt-2 space-y-1'>
                    {(drill as VideoDrill).camera_setup.notes.map((note, i) => (
                      <li key={i}>• {note}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Standards */}
              <div className='mb-6'>
                <div className='text-[12px] font-medium text-ice/50 uppercase tracking-wider mb-3'>
                  Standards (each rep must include)
                </div>
                <div className='text-[14px] text-ice/70 font-light'>
                  <ol className='list-decimal list-inside space-y-1'>
                    {(drill as VideoDrill).standards.map((standard, i) => (
                      <li key={i}>{standard}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Execute */}
              <div className='mb-6'>
                <div className='text-[12px] font-medium text-ice/50 uppercase tracking-wider mb-3'>
                  Execute
                </div>
                <div className='text-[14px] text-ice/70 font-light'>
                  <ol className='list-decimal list-inside space-y-1'>
                    {(drill as VideoDrill).execution_steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}

          {/* Audio Capsule Details */}
          {!isVideo && (
            <div className='mb-6'>
              <div className='text-[12px] font-medium text-ice/50 uppercase tracking-wider mb-3'>
                Questions
              </div>
              <div className='text-[14px] text-ice/70 font-light'>
                <ol className='list-decimal list-inside space-y-2'>
                  {(drill as AudioCapsule).questions.map((question, i) => (
                    <li key={i}>{question}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Accept Challenge Button */}
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
