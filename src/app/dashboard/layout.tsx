"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AnalysisProvider } from "@/context/analysis-context";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnalysisProvider>
      {/* Sidebar is now provided at the layout level, but wait...
          DashboardSidebar has 'currentPath' prop.
          However, we can't easily get pathname in server component layout or client component layout without hook.
          Let's make a client wrapper for the sidebar if needed, or just use the usePathname inside DashboardSidebar.
          Actually DashboardSidebar takes currentPath as prop. I should refactor it to use usePathname internally.
       */}
       {/* Refactoring Sidebar to use usePathname internally is better. */}
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
      <Toaster position="bottom-right" theme="dark" />
    </AnalysisProvider>
  );
}

import { usePathname } from "next/navigation";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#050505] flex">
            <DashboardSidebar currentPath={pathname} />
            <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
                {children}
            </div>
        </div>
    );
}

