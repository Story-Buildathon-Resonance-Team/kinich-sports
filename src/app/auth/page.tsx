"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { user, setShowAuthFlow } = useDynamicContext();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleConnect = () => {
    if (user) {
      router.push("/dashboard");
      return;
    }

    setIsConnecting(true);
    setShowAuthFlow(true);
  };

  return (
    <div className='min-h-screen w-full bg-[#000000] flex items-center justify-center relative'>
      {/* Brand at the Top Left */}
      <div className='absolute top-8 left-8 z-20'>
        <div className='flex items-center gap-2'>
          <div className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/5'>
            <span className='font-bold text-xl text-white'>K</span>
          </div>
          <span className='text-xl font-bold text-white tracking-tight'>
            KINICH
          </span>
        </div>
      </div>

      {/* Centered Connect Button - Only visible when not connecting */}
      <div
        className={`relative z-10 flex flex-col items-center gap-4 transition-opacity duration-300 ${
          isConnecting ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <button
          onClick={handleConnect}
          className='group px-8 py-4 bg-white text-black text-lg font-medium rounded-full hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 cursor-pointer'
        >
          Log In
        </button>
      </div>
    </div>
  );
}
