"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const { user } = useDynamicContext();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  return (
    <section className='relative min-h-[100svh] w-full flex flex-col justify-between px-6 md:px-16 py-6 md:py-8 overflow-hidden selection:bg-purple-500/30'>

      {/* Gradient Background - Mesh Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#080808]">
        {/* Top Left - Muted Orange/Brown */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] md:w-[50vw] h-[70vw] md:h-[50vw] rounded-full bg-[#8B5A2B] opacity-40 blur-[80px] md:blur-[120px]" />

        {/* Top Right - Blue/Purple */}
        <div className="absolute top-[-10%] right-[-20%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] rounded-full bg-[#2E3B8B] opacity-40 blur-[80px] md:blur-[120px]" />

        {/* Bottom Right - Pink/Purple */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] md:w-[50vw] h-[70vw] md:h-[50vw] rounded-full bg-[#5D3A6D] opacity-35 blur-[80px] md:blur-[100px]" />

        {/* Center Overlay to blend */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
      </div>

      {/* Brand - Top Left */}
      <div className="relative z-20 w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/5">
            <span className="font-bold text-white">K</span>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">KINICH</span>
        </div>
      </div>

      {/* Main Content */}
      <div className='relative z-10 flex-1 flex flex-col justify-center max-w-[1200px]'>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm w-fit mb-6 md:mb-8">
          <span className="text-[10px] md:text-xs font-medium text-white/60 uppercase tracking-wider">AI Powered Analysis</span>
        </div>

        <h1 className='font-primary text-5xl md:text-7xl lg:text-[7rem] font-normal leading-[1.0] md:leading-[0.95] tracking-tight text-white mb-6 md:mb-8' style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
          Athletic assets <br />
          in fluid motion
        </h1>

        <p className='font-primary text-base md:text-xl leading-relaxed text-white/60 font-light max-w-[90%] md:max-w-[500px] mb-10 md:mb-12'>
          Transforming physical effort into verified digital property with real-time computer vision and blockchain technology.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={handleGetStarted}
            className="group !px-8 !py-4 !bg-[#F5F5F5] !text-black !text-lg !font-medium !rounded-full hover:!bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {user ? "Open Dashboard" : "Get Started"}
            {user && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Footer / Scroll Indicator */}
      <div className="relative z-10 flex justify-center pb-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
          <span className="text-[10px] md:text-xs text-white/50 font-medium uppercase tracking-wider">Kinich Sports V1.0</span>
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>
    </section>
  );
}
