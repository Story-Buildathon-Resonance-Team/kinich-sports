"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardNavItems } from "@/config/navigation";

export function Navigation() {
  const { user } = useDynamicContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isAuthenticated = user !== null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (
    isAuthenticated &&
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/analyze") ||
      pathname.startsWith("/arena"))
  ) {
    return null;
  }

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-[100] transition-all duration-300 border-b border-transparent",
        scrolled
          ? "bg-[#050505]/80 backdrop-blur-xl border-white/5 py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className='max-w-[1600px] mx-auto px-6 lg:px-12 flex justify-between items-center'>
        <Link
          href='/'
          className='text-2xl font-bold tracking-tight text-white flex items-center gap-2 group'
        >
          <span className='text-gradient-logo'>KINICH</span>
          <div className='h-1.5 w-1.5 rounded-full bg-blue-600 group-hover:bg-orange-500 transition-colors duration-300' />
        </Link>

        <div className='hidden md:flex items-center gap-8'>
          <div className='flex items-center gap-1 bg-white/5 rounded-full px-1 py-1 border border-white/5 backdrop-blur-md'>
            {dashboardNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden",
                    isActive
                      ? "text-white bg-white/10 shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className='pl-4 border-l border-white/10'>
            <DynamicWidget
              variant='modal'
              innerButtonComponent={<span>Login</span>}
            />
          </div>
        </div>

        <div className='flex md:hidden items-center gap-4'>
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
      </div>

      <div
        className={cn(
          "fixed inset-0 bg-[#050505] z-[90] pt-24 px-6 transition-transform duration-300 md:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => {
          // Close if clicking the backdrop itself, not children
          if (e.target === e.currentTarget) {
            setMobileMenuOpen(false);
          }
        }}
      >
        {/* DynamicWidget at top of menu */}
        <div className='mb-6 pb-6 border-b border-white/10'>
          <DynamicWidget
            variant='modal'
            innerButtonComponent={<span>Login</span>}
          />
        </div>

        <div className='flex flex-col gap-2'>
          {dashboardNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center justify-between py-4 text-lg font-medium text-gray-300 border-b border-white/5 hover:text-white hover:pl-2 transition-all'
            >
              {item.name}
              <ChevronRight className='w-5 h-5 opacity-50' />
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
