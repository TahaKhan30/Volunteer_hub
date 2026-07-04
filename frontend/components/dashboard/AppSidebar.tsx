"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/api";
import { toast } from "sonner";

const NAV = [
  { label: "Overview", href: "/dashboard", icon: "ti-layout-dashboard" },
  { label: "Applications", href: "/dashboard/applications", icon: "ti-file-text" },
  { label: "Volunteers", href: "/dashboard/volunteers", icon: "ti-users" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
          <Image src="/logo.png" alt="Volunteers Hub" width={132} height={119} priority style={{ width: 132, height: 119, objectFit: "contain" }} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className={`ti ${item.icon}`} style={{ fontSize: 17 }} aria-hidden />
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <button onClick={handleLogout}
          style={{ width: "100%", textAlign: "left", padding: "10px 12px", fontSize: 13, color: "var(--color-text-secondary)", background: "transparent", border: "none", cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <i className="ti ti-logout" style={{ fontSize: 17 }} aria-hidden />
          Sign out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
