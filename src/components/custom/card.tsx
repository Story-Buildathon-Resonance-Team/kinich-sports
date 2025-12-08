import { ReactNode, HTMLAttributes } from "react";

type CardVariant = "default" | "elevated" | "featured" | "stat";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
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
  ...props
}: CardProps) {
  const baseStyles = "rounded-xl border transition-all duration-300";

  const variants = {
    default: `
      bg-[rgba(26,26,28,0.6)] 
      border-[rgba(245,247,250,0.06)]
      ${hover ? "hover:border-[rgba(0,71,171,0.2)] hover:-translate-y-1" : ""}
    `,
    elevated: `
      bg-gradient-to-br from-[rgba(0,71,171,0.15)] to-[rgba(26,26,28,0.6)]
      border-[rgba(0,71,171,0.2)]
      relative overflow-hidden
      ${hover ? "hover:border-[rgba(0,71,171,0.3)] hover:-translate-y-1" : ""}
    `,
    featured: `
      bg-[rgba(26,26,28,0.4)]
      border-[rgba(245,247,250,0.04)]
      ${hover ? "hover:border-[rgba(0,71,171,0.15)] hover:-translate-y-1" : ""}
    `,
    stat: `
      bg-[rgba(26,26,28,0.6)]
      border-[rgba(245,247,250,0.06)]
      relative overflow-hidden
      ${hover ? "hover:border-[rgba(0,71,171,0.2)] hover:-translate-y-1" : ""}
    `,
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className} group`} {...props}>
      {(variant === "elevated" || variant === "stat") && hover && (
        <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,71,171,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]' />
      )}
      {children}
    </div>
  );
}
