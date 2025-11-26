"use client";

import { Card } from "../custom/card";
import WorldIdVerify from "../custom/world-id-verify";

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

      <div className='space-y-4'>
        <div className='flex-col justify-center gap-5'>
          <p className='text-[13px] text-[rgba(245,247,250,0.6)] leading-relaxed'>
            Connect your World ID to add a "human" badge to your profile and
            assets.
          </p>
          <WorldIdVerify
            athleteId={athleteId}
            onVerificationSuccess={onVerificationSuccess}
          />
        </div>
      </div>
    </Card>
  );
}
