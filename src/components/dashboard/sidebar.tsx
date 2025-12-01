"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, LayoutDashboard, Activity, Microscope, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditProfileModal } from "@/components/onboarding/edit-profile-modal";
import type { Athlete } from "@/lib/types/athlete";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface DashboardSidebarProps {
    currentPath: string;
}

// Fetch athlete data for sidebar
async function fetchAthleteData(userId: string): Promise<Athlete | null> {
    try {
        const response = await fetch(`/api/athletes/me?dynamic_user_id=${userId}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.athlete;
    } catch {
        return null;
    }
}

// Sidebar Navigation Component
export function DashboardSidebar({ currentPath }: DashboardSidebarProps) {
    const { user, primaryWallet } = useDynamicContext();
    const queryClient = useQueryClient();
    const [isDesktop, setIsDesktop] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);

    // Fetch athlete data for edit profile modal
    const { data: athlete } = useQuery({
        queryKey: ['athlete', user?.userId],
        queryFn: () => user?.userId ? fetchAthleteData(user.userId) : null,
        enabled: !!user?.userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Handle athlete update - invalidate both queries
    const handleAthleteUpdate = (updatedAthlete: Athlete) => {
        queryClient.invalidateQueries({ queryKey: ['athlete', user?.userId] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', user?.userId] });
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        setIsDesktop(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

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

            <div className="px-8 pt-8 pb-16 mt-auto space-y-4 border-t border-white/5 bg-[#080808]">
                {/* Edit Profile Button */}
                {athlete && (
                    <button
                        onClick={() => setShowEditProfile(true)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <UserCog className="w-4 h-4" />
                        <span>Edit Profile</span>
                    </button>
                )}
                {isDesktop && <DynamicWidget variant="modal" />}
            </div>

            {/* Edit Profile Modal */}
            {athlete && user?.userId && primaryWallet?.address && (
                <EditProfileModal
                    isOpen={showEditProfile}
                    onClose={() => setShowEditProfile(false)}
                    athlete={athlete}
                    dynamicUserId={user.userId}
                    walletAddress={primaryWallet.address}
                    onUpdate={handleAthleteUpdate}
                />
            )}
        </aside>
    );
}
