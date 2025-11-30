"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import gsap from "gsap";
import { Skeleton } from "@/components/ui/skeleton";

const BurpeeAnalyzer = dynamic(() => import("@/components/drills/burpee-analyzer"), {
  loading: () => (
    <div className="w-full h-[calc(100vh-100px)] flex gap-6">
      <Skeleton className="flex-1 h-full bg-white/5 rounded-xl" />
      <div className="w-[280px] flex flex-col gap-4 h-full">
        <Skeleton className="h-40 w-full bg-white/5 rounded-xl" />
        <Skeleton className="flex-1 w-full bg-white/5 rounded-xl" />
      </div>
    </div>
  ),
  ssr: false
});

export default function AnalyzePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Content Animation
    if (containerRef.current) {
        gsap.fromTo(containerRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.1 }
        );
    }

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
      <div ref={containerRef} className="flex-1 p-6 lg:p-8 h-full">
        <BurpeeAnalyzer />
      </div>
  );
}
