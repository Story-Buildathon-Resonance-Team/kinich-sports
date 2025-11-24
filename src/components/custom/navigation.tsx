"use client";

import Link from "next/link";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Athlete } from "@/lib/types/athlete";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const { user, primaryWallet } = useDynamicContext();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = user !== null;

  // When user authenticates, fetch athlete data
  useEffect(() => {
    if (isAuthenticated && user?.userId && !athlete) {
      fetchAthleteData();
    } else if (!isAuthenticated) {
      // Reset state when user logs out
      setAthlete(null);
      setLoading(false);
    }
  }, [isAuthenticated, user?.userId]);

  const fetchAthleteData = async () => {
    if (!user?.userId || loading) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("dynamic_user_id", user.userId)
        .single();

      if (error) {
        console.error("Error fetching athlete data:", error);
      } else {
        setAthlete(data);
      }
    } catch (error) {
      console.error("Error in fetchAthleteData:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <nav className='fixed top-0 w-full z-[1000] px-6 md:px-16 py-5 bg-[rgba(26,26,28,0.92)] backdrop-blur-[20px] border-b border-[rgba(245,247,250,0.05)]'>
        <div className='flex justify-between items-center'>
          {/* Logo */}
          <Link
            href='/'
            className='text-[18px] md:text-[22px] font-light tracking-[4px] md:tracking-[6px] text-[#F5F7FA] opacity-95 hover:opacity-100 transition-opacity duration-200'
          >
            K I N I C H
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-12'>
            {!isAuthenticated ? (
              /* PUBLIC NAVIGATION - DESKTOP */
              <>
                <Link
                  href='/arena'
                  className='text-[15px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                >
                  Arena
                </Link>
                <DynamicWidget
                  variant='dropdown'
                  innerButtonComponent={<span>Log In</span>}
                />
              </>
            ) : (
              /* AUTHENTICATED NAVIGATION - DESKTOP */
              <>
                <Link
                  href='/arena'
                  className='text-[15px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                >
                  Arena
                </Link>

                <Link
                  href='/dashboard'
                  className='text-[15px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                >
                  Dashboard
                </Link>

                <div className='flex items-center gap-4'>
                  {athlete && (
                    <div className='text-right'>
                      <div className='text-[15px] font-medium text-[#F5F7FA]'>
                        {athlete.name || "Athlete"}
                      </div>
                      {primaryWallet?.address && (
                        <div className='text-[12px] font-medium text-[rgba(245,247,250,0.5)] font-mono'>
                          {formatWalletAddress(primaryWallet.address)}
                        </div>
                      )}
                    </div>
                  )}
                  <DynamicWidget
                    variant='dropdown'
                    innerButtonComponent={<span>Log In</span>}
                  />
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Widget */}
          <div className='flex md:hidden items-center gap-4'>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className='text-[#F5F7FA] hover:text-[rgba(245,247,250,0.7)] transition-colors duration-200'
              aria-label='Toggle menu'
            >
              {mobileMenuOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
            <DynamicWidget
              variant='dropdown'
              innerButtonComponent={<span>Log In</span>}
            />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className='md:hidden mt-6 pb-4 border-t border-[rgba(245,247,250,0.05)] pt-6'>
            <div className='flex flex-col gap-6'>
              {!isAuthenticated ? (
                /* PUBLIC NAVIGATION - MOBILE */
                <>
                  <Link
                    href='/arena'
                    onClick={() => setMobileMenuOpen(false)}
                    className='text-[16px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                  >
                    Arena
                  </Link>
                </>
              ) : (
                /* AUTHENTICATED NAVIGATION - MOBILE */
                <>
                  {athlete && (
                    <div className='pb-4 border-b border-[rgba(245,247,250,0.05)]'>
                      <div className='text-[16px] font-medium text-[#F5F7FA] mb-1'>
                        {athlete.name || "Athlete"}
                      </div>
                      {primaryWallet?.address && (
                        <div className='text-[13px] font-medium text-[rgba(245,247,250,0.5)] font-mono'>
                          {formatWalletAddress(primaryWallet.address)}
                        </div>
                      )}
                    </div>
                  )}
                  <Link
                    href='/arena'
                    onClick={() => setMobileMenuOpen(false)}
                    className='text-[16px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                  >
                    Arena
                  </Link>

                  <Link
                    href='/dashboard'
                    onClick={() => setMobileMenuOpen(false)}
                    className='text-[16px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                  >
                    Dashboard
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
