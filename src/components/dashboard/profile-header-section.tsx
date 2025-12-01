"use client";

import { ProfileHeader } from "./profile-header";
import { VerificationCard } from "./verification-card";

interface ProfileHeaderSectionProps {
  athlete: {
    id: string;
    initials: string;
    name: string;
    discipline: string;
    level: string;
    world_id_verified: boolean;
    world_id_verified_at?: string | null;
  };
  onVerificationSuccess?: () => void;
}

export function ProfileHeaderSection({
  athlete,
  onVerificationSuccess,
}: ProfileHeaderSectionProps) {
  return (
    <div className='bg-[#0a0a0a] rounded-2xl border border-white/10 p-6 mb-8 hover:border-white/20 transition-colors'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>
        {/* Profile Header - Left Side */}
        <div className='flex-shrink-0'>
          <ProfileHeader
            initials={athlete.initials}
            name={athlete.name}
            discipline={athlete.discipline}
            level={athlete.level}
            isWorldIdVerified={athlete.world_id_verified}
          />
        </div>

        {/* Verification Card - Right Side (only show if not verified) */}
        {!athlete.world_id_verified && (
          <div className='flex-1 lg:max-w-md'>
            <VerificationCard
              athleteId={athlete.id}
              isWorldIdVerified={athlete.world_id_verified}
              verifiedAt={athlete.world_id_verified_at ?? undefined}
              onVerificationSuccess={onVerificationSuccess}
            />
          </div>
        )}
      </div>
    </div>
  );
}
