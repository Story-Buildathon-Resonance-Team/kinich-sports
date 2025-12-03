"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/custom/card";
import HumanBadge from "@/components/custom/human-badge";
import { AudioCapsuleMetadata } from "@/lib/types/audio";
import { Clock, FileAudio, Calendar, FileType, Video } from "lucide-react";

interface AudioMetadataDisplayProps {
  metadata: AudioCapsuleMetadata;
  audioUrl?: string;
}

export function AudioMetadataDisplay({
  metadata,
  audioUrl,
}: AudioMetadataDisplayProps) {
  const [calculatedDuration, setCalculatedDuration] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (
      (!metadata.recording_duration_seconds ||
        metadata.recording_duration_seconds === 0) &&
      audioUrl
    ) {
      // Load audio file to get actual duration
      const audio = new Audio(audioUrl);
      audio.addEventListener("loadedmetadata", () => {
        setCalculatedDuration(audio.duration);
      });
      // Cleanup
      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [metadata.recording_duration_seconds, audioUrl]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Use metadata duration if available, otherwise use calculated duration
  const displayDuration =
    metadata.recording_duration_seconds || calculatedDuration || 0;

  return (
    <Card variant='default' hover={false} className='p-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h3 className='text-[18px] font-medium text-[#F5F7FA] mb-2'>
            Capsule Metadata
          </h3>
          <p className='text-[13px] text-[rgba(245,247,250,0.5)]'>
            Training context and verification
          </p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='bg-[rgba(0,71,171,0.08)] border border-[rgba(0,71,171,0.15)] rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <Clock className='w-4 h-4 text-blue-400' />
              <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)]'>
                Duration
              </p>
            </div>
            <p className='text-[24px] font-mono font-light text-[#F5F7FA]'>
              {formatDuration(displayDuration)}
            </p>
          </div>

          <div className='bg-[rgba(0,71,171,0.08)] border border-[rgba(0,71,171,0.15)] rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <FileAudio className='w-4 h-4 text-blue-400' />
              <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)]'>
                File Size
              </p>
            </div>
            <p className='text-[24px] font-mono font-light text-[#F5F7FA]'>
              {formatFileSize(metadata.file_size_bytes)}
            </p>
          </div>
        </div>

        {/* Questions */}
        <div>
          <h4 className='text-[14px] font-medium text-[rgba(245,247,250,0.9)] mb-3'>
            Questions Answered ({metadata.questions_answered})
          </h4>
          <div className='space-y-3'>
            {metadata.questions.map((question, index) => (
              <div
                key={index}
                className='flex gap-3 text-[13px] text-[rgba(245,247,250,0.7)] leading-relaxed'
              >
                <span className='font-mono text-[rgba(0,71,171,0.8)] font-medium'>
                  {index + 1}.
                </span>
                <span>{question}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Badges */}
        <div>
          <h4 className='text-[14px] font-medium text-[rgba(245,247,250,0.9)] mb-3'>
            Verification
          </h4>
          <div className='flex flex-col flex-wrap gap-2'>
            {metadata.verification.world_id_verified && (
              <HumanBadge variant='icon-label' size='small' />
            )}
            {metadata.verification.cv_video_verified && (
              <span className='bg-[rgba(0,71,171,0.15)] text-[rgba(184,212,240,0.9)] border border-[rgba(0,71,171,0.3)] rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide flex items-center gap-2'>
                <Video className='w-3 h-3' />
                Verified Human Through Video Drills
              </span>
            )}
          </div>
        </div>

        {/* Athlete Profile */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              Sport
            </p>
            <p className='text-[14px] text-[rgba(245,247,250,0.9)] font-medium'>
              {metadata.athlete_profile.discipline}
            </p>
          </div>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              Competitive Level
            </p>
            <p className='text-[14px] text-[rgba(245,247,250,0.9)] font-medium capitalize'>
              {metadata.athlete_profile.experience_level}
            </p>
          </div>
        </div>

        {/* Recording Details */}
        <div className='grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(245,247,250,0.06)]'>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              Duration
            </p>
            <p className='text-[13px] font-mono text-[rgba(245,247,250,0.7)]'>
              {formatDuration(displayDuration)}
            </p>
          </div>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              File Size
            </p>
            <p className='text-[13px] font-mono text-[rgba(245,247,250,0.7)]'>
              {formatFileSize(metadata.file_size_bytes)}
            </p>
          </div>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              Recorded
            </p>
            <p className='text-[13px] text-[rgba(245,247,250,0.7)]'>
              {formatDate(metadata.recorded_at)}
            </p>
          </div>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              Format
            </p>
            <p className='text-[13px] font-mono text-[rgba(245,247,250,0.7)]'>
              {metadata.mime_type.split("/")[1]}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
