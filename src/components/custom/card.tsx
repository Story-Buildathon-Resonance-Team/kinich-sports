import { ReactNode } from "react";

type CardVariant = "default" | "elevated" | "featured" | "stat";

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({
  variant = "default",
  children,
  className = "",
  hover = true,
}: CardProps) {
  // Base styles applied to all cards
  const baseStyles = "rounded-xl border transition-all duration-300";

  // Variant-specific styles
  const variants = {
    default: `
      bg-graphite-dark/60 
      border-ice/[0.06]
      ${hover ? "hover:border-cobalt/20 hover:-translate-y-1" : ""}
    `,
    elevated: `
      bg-gradient-to-br from-cobalt/15 to-graphite-dark/60
      border-cobalt/20
      relative overflow-hidden
      ${hover ? "hover:border-cobalt/30 hover:-translate-y-1" : ""}
    `,
    featured: `
      bg-graphite-dark/40
      border-ice/[0.04]
      ${hover ? "hover:border-cobalt/15 hover:-translate-y-1" : ""}
    `,
    stat: `
      bg-graphite-dark/60
      border-ice/[0.06]
      relative overflow-hidden
      ${hover ? "hover:border-cobalt/20 hover:-translate-y-1" : ""}
    `,
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {/* Top accent line for elevated and stat cards on hover */}
      {(variant === "elevated" || variant === "stat") && hover && (
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cobalt/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400' />
      )}
      {children}
    </div>
  );
}
