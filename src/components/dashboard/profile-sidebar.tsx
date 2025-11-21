import { useRouter } from "next/router";
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
    <aside className='lg:sticky lg:top-[100px] h-fit space-y-6'>
      <ProfileHeader
        initials={athlete.initials}
        name={athlete.name}
        discipline={athlete.discipline}
        level={athlete.level}
      />

      <VerificationCard
        athleteId={athlete.id}
        isWorldIdVerified={athlete.world_id_verified}
        verifiedAt={athlete.world_id_verified_at || undefined}
        onVerificationSuccess={onVerificationSuccess}
      />

      <StatsPanel stats={formattedStats} />

      <ButtonCobalt className='w-full' onClick={handleAcceptChallenge}>
        Accept New Challenge
      </ButtonCobalt>
    </aside>
  );
}
