"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, LayoutDashboard, Activity, Microscope } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardMobileHeader() {
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

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Arena (Training)", href: "/dashboard/arena", icon: Activity },
    { name: "Analyze", href: "/dashboard/analyze", icon: Microscope },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 flex items-center justify-between px-6 py-4 transition-all duration-300 border-b border-transparent lg:hidden",
          scrolled
            ? "bg-[#050505]/80 backdrop-blur-xl border-white/5"
            : "bg-[#050505]/80 backdrop-blur-xl border-white/5"
        )}
      >
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-white flex items-center gap-2 group"
        >
          <span className="text-white">KINICH</span>
          <div className="h-1.5 w-1.5 rounded-full bg-blue-600 group-hover:bg-orange-500 transition-colors duration-300" />
        </Link>

        <div className="flex items-center gap-3">
          <DynamicWidget
            variant="dropdown"
            innerButtonComponent={<span className="text-xs">Connect</span>}
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 bg-[#050505] z-[999] pt-24 px-6 transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
                <div className="flex items-center gap-4">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
                  {item.name}
                </div>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
