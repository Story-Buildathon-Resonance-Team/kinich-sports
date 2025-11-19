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
    <nav className='fixed top-0 w-full z-[1000] px-6 md:px-16 py-5 bg-[rgba(26,26,28,0.92)] backdrop-blur-[20px] border-b border-[rgba(245,247,250,0.05)]'>
      <div className='flex justify-between items-center'>
        {/* Logo */}
        <Link
          href='/'
          className='text-[18px] md:text-[22px] font-light tracking-[4px] md:tracking-[6px] text-[#F5F7FA] opacity-95 hover:opacity-100 transition-opacity duration-200'
        >
          K I N I C H
        </Link>

        {/* Navigation Links */}
        <div className='flex items-center gap-6 md:gap-12'>
          {variant === "public" ? (
            <>
              <Link
                href='/feed'
                className='text-[14px] md:text-[15px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
              >
                Feed
              </Link>
              <button className='bg-[rgba(245,247,250,0.08)] border border-[rgba(245,247,250,0.2)] text-[#F5F7FA] px-6 md:px-8 py-2.5 md:py-3 rounded-lg text-[13px] md:text-[14px] font-medium hover:bg-[rgba(245,247,250,0.12)] hover:border-[rgba(0,71,171,0.4)] transition-all duration-300'>
                Login
              </button>
            </>
          ) : (
            <div className='flex items-center gap-6'>
              <div className='text-right'>
                <div className='text-[14px] md:text-[15px] font-medium text-[#F5F7FA]'>
                  {userName}
                </div>
                <div className='text-[11px] md:text-[12px] font-medium text-[rgba(245,247,250,0.5)] font-mono'>
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
