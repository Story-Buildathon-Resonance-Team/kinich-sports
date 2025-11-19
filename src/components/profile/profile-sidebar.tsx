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
    profileScore: number; // 0-100
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
  // Format stats for StatsPanel
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
    <aside className='sticky top-[100px] h-fit space-y-6'>
      {/* Profile Header */}
      <ProfileHeader
        initials={athlete.initials}
        name={athlete.name}
        discipline={athlete.discipline}
        level={athlete.level}
      />

      {/* Stats Panel */}
      <StatsPanel stats={formattedStats} />

      {/* Upload CTA */}
      <ButtonCobalt className='w-full' onClick={onUploadClick}>
        + Upload New Asset
      </ButtonCobalt>
    </aside>
  );
}
