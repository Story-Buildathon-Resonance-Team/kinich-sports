"use client";

import Link from "next/link";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Athlete, DynamicMetadata } from "@/lib/types/athlete";
import { Menu, X } from "lucide-react";

type SyncStatus = "idle" | "syncing" | "synced" | "error";

export function Navigation() {
  const { user, primaryWallet } = useDynamicContext();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [showRetry, setShowRetry] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = user !== null;

  // When user authenticates, verify sync status with database
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      verifySyncStatus();
    } else {
      // Reset state when user logs out
      setSyncStatus("idle");
      setAthlete(null);
      setShowRetry(false);
    }
  }, [isAuthenticated, user?.userId]);

  const verifySyncStatus = async () => {
    if (!user?.userId) return;

    setSyncStatus("syncing");

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .eq("dynamic_user_id", user.userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found - sync hasn't happened yet, wait a bit
          await new Promise((resolve) => setTimeout(resolve, 2000));
          // Try one more time
          const { data: retryData, error: retryError } = await supabase
            .from("athletes")
            .select("*")
            .eq("dynamic_user_id", user.userId)
            .single();

          if (retryError) {
            console.error("Sync verification failed after retry:", retryError);
            setSyncStatus("error");
            setShowRetry(true);
          } else {
            setAthlete(retryData);
            setSyncStatus("synced");
          }
        } else {
          console.error("Error verifying sync status:", error);
          setSyncStatus("error");
          setShowRetry(true);
        }
      } else {
        setAthlete(data);
        setSyncStatus("synced");
      }
    } catch (error) {
      console.error("Error in verifySyncStatus:", error);
      setSyncStatus("error");
      setShowRetry(true);
    }
  };

  const handleRetrySync = async () => {
    if (!user?.userId || !primaryWallet?.address) return;

    setShowRetry(false);
    setSyncStatus("syncing");

    try {
      const metadata = user.metadata as DynamicMetadata | undefined;

      const response = await fetch("/api/sync-athlete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dynamicUserId: user.userId,
          walletAddress: primaryWallet.address,
          firstName: user.firstName,
          lastName: user.lastName,
          sport: metadata?.sport,
          competitiveLevel: metadata?.competitiveLevel,
        }),
      });

      const result = await response.json();

      if (result.success && result.athlete) {
        setAthlete(result.athlete);
        setSyncStatus("synced");
      } else {
        setSyncStatus("error");
        setShowRetry(true);
      }
    } catch (error) {
      console.error("Retry sync failed:", error);
      setSyncStatus("error");
      setShowRetry(true);
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
                <Link
                  href='/feed'
                  className='text-[15px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                >
                  Feed
                </Link>
                <DynamicWidget
                  variant='modal'
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
                  href='/feed'
                  className='text-[15px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                >
                  Feed
                </Link>

                {syncStatus === "synced" ? (
                  <Link
                    href='/dashboard'
                    className='text-[15px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                  >
                    Dashboard
                  </Link>
                ) : (
                  <span className='text-[15px] font-normal text-[rgba(245,247,250,0.3)] cursor-not-allowed'>
                    Dashboard
                  </span>
                )}

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
                    variant='modal'
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
              variant='modal'
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
                  <Link
                    href='/feed'
                    onClick={() => setMobileMenuOpen(false)}
                    className='text-[16px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                  >
                    Feed
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
                    href='/feed'
                    onClick={() => setMobileMenuOpen(false)}
                    className='text-[16px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                  >
                    Feed
                  </Link>

                  {syncStatus === "synced" ? (
                    <Link
                      href='/dashboard'
                      onClick={() => setMobileMenuOpen(false)}
                      className='text-[16px] font-normal text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] transition-colors duration-200'
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <span className='text-[16px] font-normal text-[rgba(245,247,250,0.3)] cursor-not-allowed'>
                      Dashboard (syncing...)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Loading Overlay - Shows during sync */}
      {syncStatus === "syncing" && (
        <div className='fixed inset-0 z-[1001] flex items-center justify-center bg-[rgba(26,26,28,0.95)] backdrop-blur-[20px]'>
          <div className='flex flex-col items-center gap-6'>
            {/* Spinner */}
            <div className='w-16 h-16 border-4 border-[rgba(245,247,250,0.1)] border-t-[#FF6B35] rounded-full animate-spin'></div>

            {/* Loading Text */}
            <div className='text-center'>
              <div className='text-[20px] md:text-[24px] font-light text-[#F5F7FA] mb-2'>
                Syncing your profile...
              </div>
              <div className='text-[14px] md:text-[15px] text-[rgba(245,247,250,0.6)]'>
                Setting up your arena
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State with Retry */}
      {syncStatus === "error" && showRetry && (
        <div className='fixed top-24 right-6 z-[1001] bg-[rgba(26,26,28,0.95)] border border-[rgba(255,107,53,0.3)] rounded-xl p-6 max-w-sm backdrop-blur-[20px]'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-start gap-3'>
              <div className='flex-shrink-0 w-5 h-5 rounded-full bg-[rgba(255,107,53,0.15)] flex items-center justify-center'>
                <span className='text-[#FF6B35] text-xs font-bold'>!</span>
              </div>
              <div className='flex-1'>
                <div className='text-[15px] font-medium text-[#F5F7FA] mb-1'>
                  Sync Failed
                </div>
                <div className='text-[13px] text-[rgba(245,247,250,0.6)]'>
                  We couldn't sync your profile. Please try again.
                </div>
              </div>
              <button
                onClick={() => setShowRetry(false)}
                className='flex-shrink-0 text-[rgba(245,247,250,0.5)] hover:text-[#F5F7FA] transition-colors duration-200'
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M12 4L4 12M4 4L12 12'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={handleRetrySync}
              className='w-full bg-[rgba(255,107,53,0.15)] border border-[rgba(255,107,53,0.3)] text-[#FF6B35] px-4 py-2.5 rounded-lg text-[14px] font-medium hover:bg-[rgba(255,107,53,0.2)] transition-all duration-300'
            >
              Retry Sync
            </button>
          </div>
        </div>
      )}
    </>
  );
}
