"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonCobaltProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "default" | "large";
}

export function ButtonCobalt({
  children,
  size = "default",
  className = "",
  ...props
}: ButtonCobaltProps) {
  const sizeStyles = {
    default: "px-10 py-4 text-[16px]",
    large: "px-12 py-[18px] text-[16px]",
  };

  return (
    <button
      className={`
        relative overflow-hidden
        bg-linear-to-br from-cobalt/80 to-[#0056D6]/80
        border border-icy-cobalt/20
        text-ice font-medium
        rounded-xl
        shadow-[0_4px_20px_rgba(0,71,171,0.2)]
        transition-all duration-400
        hover:-translate-y-0.5
        hover:shadow-[0_8px_28px_rgba(0,71,171,0.3)]
        hover:border-kinetic-orange/30
        group
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {/* Orange sweep effect */}
      <span className='absolute inset-0 -left-full bg-linear-to-br from-transparent via-kinetic-orange/20 to-transparent transition-all duration-600 group-hover:left-full' />

      {/* Content */}
      <span className='relative z-10'>{children}</span>
    </button>
  );
}
