"use client";

import { useEffect, useRef } from "react";
import BurpeeAnalyzer from "@/components/drills/burpee-analyzer";
import Lenis from "lenis";
import gsap from "gsap";

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
