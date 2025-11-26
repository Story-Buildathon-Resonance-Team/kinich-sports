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
        <aside className="fixed left-0 top-0 h-full w-64 bg-[#080808] border-r border-white/10 flex flex-col z-50 hidden lg:flex shadow-2xl">
            <div className="p-8 mb-4">
                <Link href="/" className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 group">
                    <span className="text-white font-mono tracking-wider">KINICH</span>
                    <div className="h-2 w-2 rounded-full bg-blue-600 group-hover:bg-orange-500 transition-colors duration-300" />
                </Link>
            </div>

            <nav className="flex-1 space-y-2 mt-8">
                {navItems.map((item) => {
                    const isActive = currentPath === item.href;
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
                            <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-8 mt-auto space-y-4 border-t border-white/5 bg-[#080808]">
                <Link href="#" className="flex items-center gap-4 text-gray-500 hover:text-white transition-colors font-medium">
                    <Settings className="w-5 h-5" />
                    Settings
                </Link>
                <button
                    onClick={handleLogOut}
                    className="w-full flex items-center gap-4 text-gray-500 hover:text-red-400 transition-colors font-medium text-left"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
