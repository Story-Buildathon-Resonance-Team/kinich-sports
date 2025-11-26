"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, LayoutDashboard, Activity, Microscope, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar Navigation Component
export function DashboardSidebar({ currentPath }: { currentPath: string }) {
    const { handleLogOut } = useDynamicContext();
    
    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Arena (Training)", href: "/dashboard/arena", icon: Activity },
        { name: "Analyze", href: "/dashboard/analyze", icon: Microscope },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-50 hidden lg:flex">
            <div className="p-8">
                <Link href="/" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 group">
                    <span className="text-gradient-logo">KINICH</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600 group-hover:bg-orange-500 transition-colors duration-300" />
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive 
                                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto space-y-2 border-t border-white/5">
                <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                    <Settings className="w-5 h-5 text-gray-500" />
                    Settings
                </Link>
                <button 
                    onClick={handleLogOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
                >
                    <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
