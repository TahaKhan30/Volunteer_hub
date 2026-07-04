"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { getMe } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    getMe().then(user => {
      if (!user) {
        router.replace("/login");
      } else {
        setChecked(true);
      }
    });
  }, [router]);

  if (!checked) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <SidebarTrigger />
        </div>
        <div style={{ padding: "24px 24px" }}>
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
