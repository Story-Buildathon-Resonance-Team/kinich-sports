"use client";

import { useState } from "react";
import { Card } from "@/components/custom/card";
import { VideoDrillMetadata } from "@/lib/types/video";
import HumanBadge from "@/components/custom/human-badge";
import { Video, FileJson, X, AlertTriangle } from "lucide-react";

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

        {/* Verification Warning - Low Confidence or Zero Reps */}
        {(metadata.verification.human_confidence_score < 0.75 || metadata.cv_metrics.rep_count === 0) && (
          <div className='bg-orange-500/10 border border-orange-500/30 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5' />
              <div className='space-y-1'>
                <p className='text-[13px] font-medium text-orange-300'>
                  {metadata.cv_metrics.rep_count === 0 && metadata.verification.human_confidence_score >= 0.75
                    ? "No Reps Detected"
                    : metadata.verification.human_confidence_score < 0.75 && metadata.cv_metrics.rep_count > 0
                    ? "Low Human Confidence Detected"
                    : "Verification Issues Detected"}
                </p>
                <p className='text-[12px] text-orange-200/70 leading-relaxed'>
                  {metadata.cv_metrics.rep_count === 0 && metadata.verification.human_confidence_score >= 0.75 ? (
                    <>
                      A human was detected in this video (confidence: {(metadata.verification.human_confidence_score * 100).toFixed(0)}%),
                      but no valid drill repetitions were recorded. Ensure proper drill form and movement are visible in the video.
                    </>
                  ) : metadata.verification.human_confidence_score < 0.75 && metadata.cv_metrics.rep_count > 0 ? (
                    <>
                      This video has a human confidence score of {(metadata.verification.human_confidence_score * 100).toFixed(0)}%,
                      below the 75% threshold. The video may not contain valid human movement.
                    </>
                  ) : (
                    <>
                      This video has a human confidence score of {(metadata.verification.human_confidence_score * 100).toFixed(0)}%
                      and no valid reps detected. The video does not meet verification requirements.
                    </>
                  )}
                  {!metadata.verification.is_verified && " This asset is not CV-verified."}
                </p>
              </div>
            </div>
          </div>
        )}

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
            {metadata.verification.is_verified ? (
              <span className='bg-[rgba(0,71,171,0.15)] text-[rgba(184,212,240,0.9)] border border-[rgba(0,71,171,0.3)] rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide flex items-center gap-2'>
                <Video className='w-3 h-3' />
                Human Confidence Score:{" "}
                {(metadata.verification.human_confidence_score * 100).toFixed(
                  0
                )}
                %
              </span>
            ) : (
              <span className='bg-orange-500/10 text-orange-300 border border-orange-500/30 rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide flex items-center gap-2'>
                <AlertTriangle className='w-3 h-3' />
                Not CV-Verified - {(metadata.verification.human_confidence_score * 100).toFixed(0)}% Confidence
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
          className='fixed inset-0 overflow-y-auto bg-black/80 backdrop-blur-sm p-6'
          onClick={() => setShowMetadataModal(false)}
        >
          <div
            className='bg-[#050505] border border-[rgba(184,212,240,0.2)] rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col mx-auto'
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
              <pre className='text-xs md:text-sm font-mono text-gray-300 bg-[#111] p-4 rounded-xl border border-white/5 overflow-x-auto'>
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
