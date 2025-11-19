"use client";

import Link from "next/link";

interface NavigationProps {
  variant?: "public" | "authenticated";
  userName?: string;
  walletAddress?: string;
}

export function Navigation({
  variant = "public",
  userName,
  walletAddress,
}: NavigationProps) {
  return (
    <nav className='fixed top-0 w-full z-1000 px-16 py-5 bg-graphite-dark/92 backdrop-blur-[20px] border-b border-ice/5'>
      <div className='flex justify-between items-center'>
        {/* Logo */}
        <Link
          href='/'
          className='text-[22px] font-light tracking-[6px] text-ice opacity-95 hover:opacity-100 transition-opacity'
        >
          K I N I C H
        </Link>

        {/* Navigation Links */}
        <div className='flex items-center gap-12'>
          {variant === "public" ? (
            <>
              <Link
                href='/feed'
                className='text-[15px] font-normal text-ice/70 hover:text-ice transition-colors'
              >
                Feed
              </Link>
              <button className='bg-ice/8 border border-ice/20 text-ice px-8 py-3 rounded-lg text-[14px] font-medium hover:bg-ice/12 hover:border-cobalt/40 transition-all'>
                Login
              </button>
            </>
          ) : (
            <div className='flex items-center gap-6'>
              <div className='text-right'>
                <div className='text-[15px] font-medium text-ice'>
                  {userName}
                </div>
                <div className='text-[12px] font-medium text-ice/50 font-mono'>
                  {walletAddress}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
