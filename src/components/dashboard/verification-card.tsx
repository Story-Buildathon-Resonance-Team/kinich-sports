"use client";

import { Card } from "../custom/card";
import WorldIdVerify from "../custom/world-id-verify";
import HumanBadge from "../custom/human-badge";

interface VerificationCardProps {
  athleteId: string;
  isWorldIdVerified: boolean;
  verifiedAt?: string;
  onVerificationSuccess?: () => void;
}

export function VerificationCard({
  athleteId,
  isWorldIdVerified,
  verifiedAt,
  onVerificationSuccess,
}: VerificationCardProps) {
  return (
    <Card variant='default' hover={false} className='p-6'>
      <h3 className='text-[12px] font-medium uppercase tracking-[1.5px] text-[rgba(245,247,250,0.5)] mb-5'>
        Verification
      </h3>

      {isWorldIdVerified ? (
        <div className='space-y-3'>
          <div className='flex items-center justify-center py-2'>
            <HumanBadge variant='icon-label' size='large' />
          </div>
          {verifiedAt && (
            <p className='text-[11px] text-[rgba(245,247,250,0.4)] text-center font-mono'>
              {new Date(verifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ) : (
        <div className='space-y-4'>
          <p className='text-[13px] text-[rgba(245,247,250,0.6)] leading-relaxed'>
            Connect your World ID to add a "human" badge to your profile and
            assets.
          </p>
          <div className='flex justify-center'>
            <WorldIdVerify
              athleteId={athleteId}
              onVerificationSuccess={onVerificationSuccess}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
