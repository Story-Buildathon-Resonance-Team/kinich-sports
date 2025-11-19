interface ProfileHeaderProps {
  initials: string;
  name: string;
  discipline: string;
  level: "Competitive" | "Professional" | "Amateur" | "Elite";
}

export function ProfileHeader({
  initials,
  name,
  discipline,
  level,
}: ProfileHeaderProps) {
  return (
    <div className='bg-graphite-dark/60 border border-ice/[0.06] rounded-xl p-8 text-center'>
      {/* Avatar */}
      <div
        className='
        w-20 h-20
        bg-gradient-to-br from-cobalt/20 to-icy-cobalt/10
        border-2 border-icy-cobalt/20
        rounded-full
        flex items-center justify-center
        text-[32px] font-light text-icy-cobalt
        mx-auto mb-4
      '
      >
        {initials}
      </div>

      {/* Name */}
      <div className='text-[20px] font-medium text-ice mb-2'>{name}</div>

      {/* Discipline */}
      <div className='text-[14px] text-ice/60 mb-1'>{discipline}</div>

      {/* Level Badge */}
      <span className='badge-verified inline-block'>{level}</span>
    </div>
  );
}
