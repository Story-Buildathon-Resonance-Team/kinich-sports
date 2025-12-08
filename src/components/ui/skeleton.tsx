import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[#121212] bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}
