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
  // Size configurations matching World ID guidelines
  const sizeConfig = {
    small: {
      container: "h-5 px-2 gap-1",
      icon: 12, // pixels
      text: "text-[10px]",
    },
    medium: {
      container: "h-6 px-2.5 gap-1.5",
      icon: 16, // pixels
      text: "text-[11px]",
    },
    large: {
      container: "h-8 px-3 gap-2",
      icon: 20, // pixels
      text: "text-[12px]",
    },
  };

  const config = sizeConfig[size];

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
        bg-[rgba(0,71,171,0.15)]
        border border-[rgba(0,71,171,0.3)]
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
