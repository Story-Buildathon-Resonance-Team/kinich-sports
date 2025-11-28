"use client";

import { useRouter } from "next/navigation";
import { ProfileHeader } from "./profile-header";
import { VerificationCard } from "./verification-card";
import { StatsPanel } from "./stats-panel";
import { ButtonCobalt } from "../custom/button-cobalt";

interface ProfileSidebarProps {
  athlete: {
    id: string;
    initials: string;
    name: string;
    discipline: string;
    level: string;
    world_id_verified: boolean;
    world_id_verified_at?: string | null;
  };
  stats: {
    profileScore: number;
    totalRoyalties: number;
    totalAssets: number;
  };
  onVerificationSuccess?: () => void;
}

export function ProfileSidebar({
  athlete,
  stats,
  onVerificationSuccess,
}: ProfileSidebarProps) {
  const router = useRouter();

  const formattedStats = [
    {
      label: "Profile Score",
      value: stats.profileScore,
      unit: "/ 100",
      barPercentage: stats.profileScore,
    },
    {
      label: "Total Royalties",
      value: stats.totalRoyalties,
      unit: "$IP",
    },
    {
      label: "Assets",
      value: stats.totalAssets,
    },
  ];

  const handleAcceptChallenge = () => {
    router.push("/arena");
  };

  return (
    <aside className='lg:sticky lg:top-[140px] h-fit space-y-8 animate-fade-in-up'>
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
          {/* Decorative ambient light */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <ProfileHeader
            initials={athlete.initials}
            name={athlete.name}
            discipline={athlete.discipline}
            level={athlete.level}
            isWorldIdVerified={athlete.world_id_verified}
          />
          
          <div className="mt-8">
             <StatsPanel stats={formattedStats} />
          </div>
      </div>

      {!athlete.world_id_verified && (
        <div className="glass-panel rounded-2xl p-1 border-orange-500/20">
            <VerificationCard
              athleteId={athlete.id}
              isWorldIdVerified={athlete.world_id_verified}
              verifiedAt={athlete.world_id_verified_at || undefined}
              onVerificationSuccess={onVerificationSuccess}
            />
        </div>
      )}

      <ButtonCobalt className='w-full py-5 text-lg font-semibold tracking-wide' onClick={handleAcceptChallenge}>
        NEW ENTRY
      </ButtonCobalt>
    </aside>
  );
}
