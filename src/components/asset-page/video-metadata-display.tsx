"use client";

import { useState } from "react";
import { Card } from "@/components/custom/card";
import { VideoDrillMetadata } from "@/lib/types/video";
import HumanBadge from "@/components/custom/human-badge";
import { Video, FileJson, X } from "lucide-react";

interface VideoMetadataDisplayProps {
  metadata: VideoDrillMetadata;
  worldIdVerified: boolean;
}

export function VideoMetadataDisplay({
  metadata,
  worldIdVerified,
}: VideoMetadataDisplayProps) {
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "N/A";
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

  return (
    <Card variant='default' hover={false} className='p-6'>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h3 className='text-[18px] font-medium text-[#F5F7FA] mb-2'>
            Drill Metadata
          </h3>
          <p className='text-[13px] text-[rgba(245,247,250,0.5)]'>
            MediaPipe Analysis and Verification
          </p>
        </div>

        {/* CV Metrics */}
        <div>
          <h4 className='text-[14px] font-medium text-[rgba(245,247,250,0.9)] mb-3'>
            Performance Metrics
          </h4>
          <div className='grid grid-cols-3 gap-4'>
            <div>
              <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
                Reps
              </p>
              <p className='text-[24px] font-bold text-[#00C2FF]'>
                {metadata.cv_metrics.rep_count}
              </p>
            </div>
            <div>
              <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
                Consistency
              </p>
              <p className='text-[24px] font-bold text-[#00C2FF]'>
                {(metadata.cv_metrics.consistency_score * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
                Cadence
              </p>
              <p className='text-[24px] font-bold text-[#00C2FF]'>
                {metadata.cv_metrics.cadence_avg.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className='grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(245,247,250,0.06)]'>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              Duration
            </p>
            <p className='text-[13px] font-mono text-[rgba(245,247,250,0.7)]'>
              {formatDuration(metadata.video_metadata.duration_seconds)}
            </p>
          </div>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              Compressed Size
            </p>
            <p className='text-[13px] font-mono text-[rgba(245,247,250,0.7)]'>
              {formatFileSize(metadata.video_metadata.file_size_bytes)}
            </p>
          </div>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              Processed
            </p>
            <p className='text-[13px] text-[rgba(245,247,250,0.7)]'>
              {formatDate(metadata.verification.processed_at)}
            </p>
          </div>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
              Format
            </p>
            <p className='text-[13px] font-mono text-[rgba(245,247,250,0.7)]'>
              {metadata.video_metadata.mime_type
                ? metadata.video_metadata.mime_type.split("/")[1]
                : "MP4"}
            </p>
          </div>
        </div>

        {/* Verification Badges */}
        <div>
          <h4 className='text-[14px] font-medium text-[rgba(245,247,250,0.9)] mb-3'>
            Verification
          </h4>
          <div className='flex flex-col gap-4'>
            {worldIdVerified && (
              <HumanBadge variant='icon-label' size='small' />
            )}
            {metadata.verification.is_verified && (
              <span className='bg-[rgba(0,71,171,0.15)] text-[rgba(184,212,240,0.9)] border border-[rgba(0,71,171,0.3)] rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide flex items-center gap-2'>
                <Video className='w-3 h-3' />
                Human Confidence Score:{" "}
                {(metadata.verification.human_confidence_score * 100).toFixed(
                  0
                )}
                %
              </span>
            )}
          </div>
        </div>

        {/* View Full Metadata Button */}
        <div className='pt-4 border-t border-[rgba(245,247,250,0.06)]'>
          <button
            onClick={() => setShowMetadataModal(true)}
            className='
              flex items-center gap-2
              text-[13px] text-[rgba(0,71,171,0.9)] hover:text-[rgba(0,71,171,1)]
              font-medium
              transition-colors
              cursor-pointer
            '
          >
            <FileJson className='w-4 h-4' />
            View Full Metadata
          </button>
        </div>
      </div>

      {/* Metadata Modal */}
      {showMetadataModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'
          onClick={() => setShowMetadataModal(false)}
        >
          <div
            className='bg-[#050505] border border-[rgba(184,212,240,0.2)] rounded-xl max-w-3xl w-full max-h-[85vh] my-auto flex flex-col'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50'>
              <h3 className='text-[18px] font-medium text-[#F5F7FA]'>
                Full Metadata
              </h3>
              <button
                onClick={() => setShowMetadataModal(false)}
                className='text-[rgba(245,247,250,0.6)] hover:text-[#F5F7FA] transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Modal Content */}
            <div className='flex-1 overflow-y-auto p-6'>
              <div className='relative'>
                <pre className='text-xs md:text-sm font-mono text-gray-300 bg-[#111] p-4 rounded-xl border border-white/5 overflow-x-auto'>
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
