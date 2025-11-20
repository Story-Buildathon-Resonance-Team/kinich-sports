import { ProfileHeader } from "./profile-header";
import { StatsPanel } from "./stats-panel";
import { ButtonCobalt } from "../custom/button-cobalt";

interface ProfileSidebarProps {
  athlete: {
    initials: string;
    name: string;
    discipline: string;
    level: "Competitive" | "Professional" | "Amateur" | "Elite";
  };
  stats: {
    profileScore: number;
    totalRoyalties: number;
    totalAssets: number;
  };
  onUploadClick?: () => void;
}

export function ProfileSidebar({
  athlete,
  stats,
  onUploadClick,
}: ProfileSidebarProps) {
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

  return (
    <aside className='lg:sticky lg:top-[100px] h-fit space-y-6'>
      <ProfileHeader
        initials={athlete.initials}
        name={athlete.name}
        discipline={athlete.discipline}
        level={athlete.level}
      />

      <StatsPanel stats={formattedStats} />

      <ButtonCobalt className='w-full' onClick={onUploadClick}>
        + Upload New Asset
      </ButtonCobalt>
    </aside>
  );
}
