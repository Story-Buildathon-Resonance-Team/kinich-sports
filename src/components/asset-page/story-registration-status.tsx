"use client";

import { Card } from "@/components/custom/card";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface StoryRegistrationStatusProps {
  storyIpId: string | null;
  storyTxHash: string | null;
  status: "pending" | "active" | "failed";
}

export function StoryRegistrationStatus({
  storyIpId,
  storyTxHash,
  status,
}: StoryRegistrationStatusProps) {
  const explorerUrl = storyIpId
    ? `https://aeneid.explorer.story.foundation/ipa/${storyIpId}`
    : null;

  if (status === "pending" || !storyIpId) {
    return (
      <Card variant='default' hover={false} className='p-6'>
        <div className='flex items-center gap-4'>
          <Loader2 className='w-10 h-10 text-blue-400 animate-spin' />
          <div>
            <h4 className='text-[16px] font-medium text-[#F5F7FA] mb-1'>
              Registering on Story Protocol
            </h4>
            <p className='text-[13px] text-[rgba(245,247,250,0.6)]'>
              This may take a few moments...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === "failed") {
    return (
      <Card
        variant='default'
        hover={false}
        className='p-6 border-orange-500/20'
      >
        <div className='flex items-start gap-4'>
          <div className='w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0'>
            <AlertTriangle className='w-6 h-6 text-orange-400' />
          </div>
          <div>
            <h4 className='text-[16px] font-medium text-orange-400 mb-1'>
              Registration Failed
            </h4>
            <p className='text-[13px] text-[rgba(245,247,250,0.6)]'>
              Please try again or contact support
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant='default'
      hover={false}
      className='p-6 border-green-500/20 relative'
    >
      {/* Explorer Badge - Top Right */}
      {explorerUrl && (
        <a
          href={explorerUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors'
        >
          Explorer →
        </a>
      )}

      <div className='space-y-4'>
        {/* Success Header */}
        <div className='flex items-start gap-3'>
          <div className='w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0'>
            <CheckCircle2 className='w-6 h-6 text-green-400' />
          </div>
          <div className='flex-1'>
            <h4 className='text-[16px] font-medium text-[#F5F7FA] mb-1'>
              Registered on Story Protocol
            </h4>
            <p className='text-[13px] text-[rgba(245,247,250,0.6)]'>
              Your audio capsule is now an IP asset
            </p>
          </div>
        </div>

        {/* IP ID */}
        <div className='pt-3 border-t border-[rgba(245,247,250,0.06)]'>
          <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-2'>
            IP Asset ID
          </p>
          <p className='text-[13px] font-mono text-[rgba(245,247,250,0.8)] break-all'>
            {storyIpId}
          </p>
        </div>
      </div>
    </Card>
  );
}
