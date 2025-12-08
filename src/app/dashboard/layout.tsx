"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardMobileHeader } from "@/components/dashboard/mobile-header";
import { AnalysisProvider } from "@/context/analysis-context";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-[#050505] flex">
        <DashboardSidebar />
        <div className="flex-1 lg:ml-64 min-h-screen flex flex-col overflow-x-hidden pt-16 lg:pt-0">
          <DashboardMobileHeader />
          {children}
        </div>
      </div>
      <Toaster position="bottom-right" theme="dark" />
    </AnalysisProvider>
  );
}
