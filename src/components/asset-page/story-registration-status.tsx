"use client";

import { Card } from "@/components/custom/card";

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
          <div className='w-10 h-10 border-4 border-[rgba(0,71,171,0.3)] border-t-[rgba(0,71,171,0.8)] rounded-full animate-spin' />
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
      <Card variant='default' hover={false} className='p-6'>
        <div className='flex items-start gap-4'>
          <div className='text-[32px]'>⚠️</div>
          <div>
            <h4 className='text-[16px] font-medium text-[rgba(255,107,53,0.9)] mb-1'>
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
    <Card variant='elevated' hover={false} className='p-6'>
      <div className='space-y-4'>
        {/* Success Header */}
        <div className='flex items-start gap-3'>
          <div className='text-[28px]'>✓</div>
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

        {/* Explorer Link */}
        {explorerUrl && (
          <a
            href={explorerUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='
              block w-full
              bg-transparent
              border border-[rgba(245,247,250,0.1)]
              text-[rgba(245,247,250,0.7)]
              px-4 py-2.5 rounded-lg
              text-[14px] font-medium text-center
              transition-all duration-300
              hover:bg-[rgba(0,71,171,0.1)]
              hover:border-[rgba(0,71,171,0.3)]
              hover:text-[#F5F7FA]
            '
          >
            View on Story Explorer →
          </a>
        )}

        {/* Transaction Hash */}
        {storyTxHash && (
          <div className='pt-3 border-t border-[rgba(245,247,250,0.06)]'>
            <p className='text-[11px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] mb-2'>
              Transaction Hash
            </p>
            <p className='text-[11px] font-mono text-[rgba(245,247,250,0.6)] break-all'>
              {storyTxHash}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
