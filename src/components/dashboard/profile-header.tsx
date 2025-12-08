import HumanBadge from "../custom/human-badge";
import React from "react";

interface ProfileHeaderProps {
  initials: string;
  name: string;
  discipline: string;
  level: string;
  isWorldIdVerified?: boolean;
}

function ProfileHeader({
  initials,
  name,
  discipline,
  level,
  isWorldIdVerified = false,
}: ProfileHeaderProps) {
  return (
    <div className='text-center'>
      <div className='relative mx-auto mb-5 w-fit'>
        <div className='w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-400/20 rounded-full flex items-center justify-center text-2xl font-medium text-blue-200 shadow-inner'>
          {initials}
        </div>
        {isWorldIdVerified && (
          <div className="absolute -bottom-1 -right-1 bg-[#050505] rounded-full p-1">
            <HumanBadge variant='icon-only' size='small' />
          </div>
        )}
      </div>

      <h2 className='text-2xl font-semibold text-white mb-1'>{name}</h2>

      <p className='text-sm text-gray-400 mb-4 font-medium tracking-wide uppercase'>
        {discipline}
      </p>

      <div className='inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full'>
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className='text-xs font-medium text-gray-300 tracking-wide uppercase'>{level}</span>
      </div>
    </div>
  );
}

export default React.memo(ProfileHeader, (prev, next) => {
  return prev.name === next.name && prev.isWorldIdVerified === next.isWorldIdVerified;
});
