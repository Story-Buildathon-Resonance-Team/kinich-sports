"use client";

import dynamic from "next/dynamic";
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
  return (
    <div className="flex-1 p-6 lg:p-8 h-full animate-fade-in-up">
      <BurpeeAnalyzer />
    </div>
  );
}
