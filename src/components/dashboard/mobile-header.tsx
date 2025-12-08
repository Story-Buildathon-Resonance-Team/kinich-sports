"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardNavItems } from "@/config/navigation";

export function DashboardMobileHeader() {
  const { handleLogOut } = useDynamicContext();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onLogout = async () => {
    try {
      await handleLogOut();
      router.replace("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 transition-all duration-300 border-b border-transparent lg:hidden",
          scrolled || mobileMenuOpen
            ? "bg-[#050505]/80 backdrop-blur-xl border-white/5"
            : "bg-[#050505]/80 backdrop-blur-xl border-white/5"
        )}
      >
        <Link
          href='/'
          className='text-xl font-bold tracking-tight text-white flex items-center gap-2 group'
        >
          <span className='text-white'>KINICH</span>
          <div className='h-1.5 w-1.5 rounded-full bg-blue-600 group-hover:bg-orange-500 transition-colors duration-300' />
        </Link>

        <div className='flex items-center gap-3'>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='text-white p-2 hover:bg-white/10 rounded-lg transition-colors'
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <X className='w-6 h-6' />
            ) : (
              <Menu className='w-6 h-6' />
            )}
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 bg-[#050505] z-[90] pt-24 px-6 transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => {
          // Close if clicking the backdrop itself, not children
          if (e.target === e.currentTarget) {
            setMobileMenuOpen(false);
          }
        }}
      >
        {/* Logout button */}
        <div className='mb-6 pb-6 border-b border-white/10'>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full py-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>

        <div className='flex flex-col gap-2'>
          {dashboardNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between py-4 text-lg font-medium border-b border-white/5 hover:pl-2 transition-all",
                  isActive ? "text-white" : "text-gray-400 hover:text-white"
                )}
              >
                <div className='flex items-center gap-4'>
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-white" : "text-gray-500"
                    )}
                  />
                  {item.name}
                </div>
                <ChevronRight className='w-5 h-5 opacity-50' />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
