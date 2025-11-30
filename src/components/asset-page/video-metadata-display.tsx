"use client";

import { Card } from "@/components/custom/card";
import { VideoDrillMetadata } from "@/lib/types/video";

interface VideoMetadataDisplayProps {
  metadata: VideoDrillMetadata;
}

export function VideoMetadataDisplay({ metadata }: VideoMetadataDisplayProps) {
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
            CV Analysis and Verification
          </p>
        </div>

        {/* CV Metrics */}
        <div>
          <h4 className='text-[14px] font-medium text-[rgba(245,247,250,0.9)] mb-3'>
            Performance Metrics
          </h4>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
                Reps Completed
              </p>
              <p className='text-[24px] font-bold text-[#00C2FF]'>
                {metadata.cv_metrics.rep_count}
              </p>
            </div>
            <div>
              <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-1'>
                Form Score
              </p>
              <p className='text-[24px] font-bold text-[#00C2FF]'>
                {(metadata.cv_metrics.form_score_avg * 10).toFixed(1)}/10
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
              {metadata.video_metadata.mime_type ? metadata.video_metadata.mime_type.split("/")[1] : "MP4"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

