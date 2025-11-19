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
    default: "px-10 py-4 text-base",
    large: "px-12 py-[18px] text-base",
  };

  return (
    <button
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-[rgba(0,71,171,0.8)] to-[rgba(0,86,214,0.8)]
        border border-[rgba(184,212,240,0.2)]
        text-[#F5F7FA] font-medium
        rounded-xl
        shadow-[0_4px_20px_rgba(0,71,171,0.2)]
        transition-all duration-[400ms] ease-out
        hover:-translate-y-0.5
        hover:shadow-[0_8px_28px_rgba(0,71,171,0.3)]
        hover:border-[rgba(255,107,53,0.3)]
        focus-visible:outline-none
        focus-visible:shadow-[0_0_0_4px_rgba(255,107,53,0.15)]
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:translate-y-0
        group
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {/* Orange sweep effect on hover */}
      <span
        className='
          absolute inset-0 -left-full
          bg-gradient-to-r from-transparent via-[rgba(255,107,53,0.2)] to-transparent
          transition-all duration-[600ms] ease-out
          group-hover:left-full
          pointer-events-none
        '
      />

      {/* Content */}
      <span className='relative z-10'>{children}</span>
    </button>
  );
}
