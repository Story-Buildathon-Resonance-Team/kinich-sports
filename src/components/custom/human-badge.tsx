"use client";

interface HumanBadgeProps {
  variant?: "icon-only" | "icon-label";
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function HumanBadge({
  variant = "icon-label",
  size = "medium",
  className = "",
}: HumanBadgeProps) {
  // Size configurations matching World ID guidelines
  const sizeConfig = {
    small: {
      container: "h-5 px-2 gap-1",
      icon: "w-3 h-3",
      text: "text-[10px]",
    },
    medium: {
      container: "h-6 px-2.5 gap-1.5",
      icon: "w-4 h-4",
      text: "text-[11px]",
    },
    large: {
      container: "h-8 px-3 gap-2",
      icon: "w-5 h-5",
      text: "text-[12px]",
    },
  };

  const config = sizeConfig[size];

  // World ID logo (simplified geometric version)
  const WorldIdIcon = () => (
    <svg
      className={config.icon}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='1.5'
        fill='none'
      />
      <circle cx='12' cy='12' r='6' fill='currentColor' />
    </svg>
  );

  if (variant === "icon-only") {
    return (
      <div
        className={`
          inline-flex items-center justify-center
          bg-[rgba(0,71,171,0.15)]
          border border-[rgba(0,71,171,0.3)]
          rounded-md
          ${config.container}
          ${className}
        `}
        title='Verified Human'
        aria-label='Verified Human'
      >
        <div className='text-[rgba(184,212,240,0.9)]'>
          <WorldIdIcon />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center
        bg-[rgba(0,71,171,0.15)]
        border border-[rgba(0,71,171,0.3)]
        rounded-md
        ${config.container}
        ${className}
      `}
      aria-label='Verified Human'
    >
      <div className='text-[rgba(184,212,240,0.9)]'>
        <WorldIdIcon />
      </div>
      <span
        className={`
          text-[rgba(184,212,240,0.9)]
          font-medium
          uppercase
          tracking-wide
          ${config.text}
        `}
      >
        human
      </span>
    </div>
  );
}

// Alternative badge variants for specific use cases
export function HumanBadgeCompact({ className = "" }: { className?: string }) {
  return <HumanBadge variant='icon-label' size='small' className={className} />;
}

export function HumanBadgeIcon({ className = "" }: { className?: string }) {
  return <HumanBadge variant='icon-only' size='medium' className={className} />;
}
