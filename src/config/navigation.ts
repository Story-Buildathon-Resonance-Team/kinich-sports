import { LayoutDashboard, Activity, Layers, LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const dashboardNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Arena", href: "/dashboard/arena", icon: Activity },
  { name: "Assets", href: "/dashboard/assets", icon: Layers },
];
