"use client";

import Image from "next/image";

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
  // Size configurations matching World ID guidelines (32-48px recommended)
  const sizeConfig = {
    small: {
      container: "h-7 px-2.5 gap-1.5",
      icon: 32, // pixels
      text: "text-[12px]",
    },
    medium: {
      container: "h-8 px-3 gap-2",
      icon: 36, // pixels
      text: "text-[13px]",
    },
    large: {
      container: "h-9 px-3.5 gap-2",
      icon: 40, // pixels
      text: "text-[14px]",
    },
  };

  const config = sizeConfig[size];

  if (variant === "icon-only") {
    return (
      <div
        className={`
          inline-flex items-center justify-center
          bg-[rgba(245,247,250,0.12)]
          border border-[rgba(245,247,250,0.2)]
          rounded-md
          ${config.container}
          ${className}
        `}
        title='human'
        aria-label='Verified Human'
      >
        <Image
          src='/World-Logomark-Black-RGB.svg'
          alt='World ID'
          width={config.icon}
          height={config.icon}
          className=''
        />
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center
        bg-[rgba(245,247,250,0.12)]
        border border-[rgba(245,247,250,0.2)]
        rounded-md
        ${config.container}
        ${className}
      `}
      aria-label='Verified Human'
    >
      <Image
        src='/World-Logomark-Black-RGB.svg'
        alt='World ID'
        width={config.icon}
        height={config.icon}
        className='opacity-90'
      />
      <span
        className={`
          text-[#2C2C2E]
          font-medium
          tracking-wide
          ${config.text}
        `}
      >
        human
      </span>
    </div>
  );
}
