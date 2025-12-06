"use client";

import Link from "next/link";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardNavItems } from "@/config/navigation";
import React from "react";

// Sidebar Navigation Component
function DashboardSidebar() {
  const { user } = useDynamicContext();
  const [isDesktop, setIsDesktop] = useState(false);
  const currentPath = usePathname();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const navLinks = useMemo(() => {
      return dashboardNavItems.map((item) => {
          const isActive = currentPath === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-8 py-3 transition-all duration-200 group",
                isActive
                  ? "text-white font-bold text-lg"
                  : "text-gray-500 hover:text-white font-medium text-base"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-gray-500 group-hover:text-white"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        });
  }, [currentPath]);

  return (
    <aside className='fixed left-0 top-0 h-full w-64 bg-[#080808] border-r border-white/10 flex flex-col z-50 hidden lg:flex shadow-2xl'>
      <div className='p-8 mb-4'>
        <Link
          href='/'
          className='text-2xl font-bold tracking-tight text-white flex items-center gap-2 group'
        >
          <span className='text-white font-mono tracking-wider'>KINICH</span>
          <div className='h-2 w-2 rounded-full bg-blue-600 group-hover:bg-orange-500 transition-colors duration-300' />
        </Link>
      </div>

      <nav className='flex-1 space-y-2 mt-8'>
        {navLinks}
      </nav>

      <div className='px-8 pt-8 pb-16 mt-auto space-y-4 border-t border-white/5 bg-[#080808]'>
        {isDesktop && (
          <DynamicWidget
            variant='modal'
            innerButtonComponent={<span>Login</span>}
          />
        )}
      </div>
    </aside>
  );
}

export const Sidebar = React.memo(DashboardSidebar);
export { DashboardSidebar };
