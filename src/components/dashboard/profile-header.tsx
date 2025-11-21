interface ProfileHeaderProps {
  initials: string;
  name: string;
  discipline: string;
  level: string;
}

export function ProfileHeader({
  initials,
  name,
  discipline,
  level,
}: ProfileHeaderProps) {
  return (
    <div className='bg-[rgba(26,26,28,0.6)] border border-[rgba(245,247,250,0.06)] rounded-xl p-8 text-center'>
      <div className='w-20 h-20 bg-gradient-to-br from-[rgba(0,71,171,0.2)] to-[rgba(184,212,240,0.1)] border-2 border-[rgba(184,212,240,0.2)] rounded-full flex items-center justify-center text-[32px] font-light text-[#B8D4F0] mx-auto mb-4'>
        {initials}
      </div>

      <div className='text-[20px] font-medium text-[#F5F7FA] mb-2'>{name}</div>

      <div className='text-[14px] text-[rgba(245,247,250,0.6)] mb-1'>
        {discipline}
      </div>

      <span className='badge-verified inline-block'>{level}</span>
    </div>
  );
}
