import { getDashboardStats } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function fetchStats() {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token");
  if (!token) redirect("/login");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/stats`, {
    headers: { Cookie: `access_token=${token.value}` },
    cache: "no-store",
  });
  if (res.status === 401) redirect("/login");
  return res.json();
}

export default async function DashboardPage() {
  const stats = await fetchStats();

  const cards = [
    { label: "Total applications", value: stats.total_applications, color: "var(--color-background-info)", text: "var(--color-text-info)" },
    { label: "Pending review", value: stats.pending_applications, color: "var(--color-background-warning)", text: "var(--color-text-warning)" },
    { label: "Accepted", value: stats.accepted_applications, color: "var(--color-background-success)", text: "var(--color-text-success)" },
    { label: "Rejected", value: stats.rejected_applications, color: "var(--color-background-danger)", text: "var(--color-text-danger)" },
    { label: "Total volunteers", value: stats.total_volunteers, color: "var(--color-background-secondary)", text: "var(--color-text-primary)" },
    { label: "Active volunteers", value: stats.active_volunteers, color: "var(--color-background-success)", text: "var(--color-text-success)" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 4px" }}>Overview</h1>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 24px" }}>Volunteer program at a glance.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: c.color, borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 13, color: c.text, margin: "0 0 6px", opacity: 0.8 }}>{c.label}</p>
            <p style={{ fontSize: 28, fontWeight: 500, color: c.text, margin: 0 }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <a href="/dashboard/applications?status=pending"
          style={{ flex: 1, padding: "14px 16px", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, color: "var(--color-text-primary)" }}>Review pending applications</span>
          <i className="ti ti-arrow-right" style={{ fontSize: 16, color: "var(--color-text-tertiary)" }} aria-hidden />
        </a>
        <a href="/dashboard/volunteers"
          style={{ flex: 1, padding: "14px 16px", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, color: "var(--color-text-primary)" }}>Manage volunteers</span>
          <i className="ti ti-arrow-right" style={{ fontSize: 16, color: "var(--color-text-tertiary)" }} aria-hidden />
        </a>
      </div>
    </div>
  );
}
