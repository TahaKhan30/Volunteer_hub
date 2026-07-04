"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApplications, fileUrl } from "@/lib/api";
import Link from "next/link";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "var(--color-background-warning)", text: "var(--color-text-warning)" },
  reviewing: { bg: "var(--color-background-info)",    text: "var(--color-text-info)" },
  accepted:  { bg: "var(--color-background-success)", text: "var(--color-text-success)" },
  rejected:  { bg: "var(--color-background-danger)",  text: "var(--color-text-danger)" },
};

export default function ApplicationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  useEffect(() => {
    setLoading(true);
    getApplications(status || undefined, search || undefined)
      .then(setApps)
      .finally(() => setLoading(false));
  }, [status, search]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 2px" }}>Applications</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>{apps.length} result{apps.length !== 1 ? "s" : ""}</p>
        </div>
        <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/applications/export${status ? `?status=${status}` : ""}`}
          style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: 5, textDecoration: "none", padding: "7px 12px", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8 }}>
          <i className="ti ti-download" style={{ fontSize: 15 }} aria-hidden /> Export CSV
        </a>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input type="search" placeholder="Search name, email, country…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, fontSize: 14, padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", outline: "none" }} />
        {["", "pending", "reviewing", "accepted", "rejected"].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            style={{ fontSize: 12, padding: "7px 14px", borderRadius: 99, border: "0.5px solid", cursor: "pointer", borderColor: status === s ? "var(--color-text-primary)" : "var(--color-border-secondary)", background: status === s ? "var(--color-text-primary)" : "transparent", color: status === s ? "var(--color-background-primary)" : "var(--color-text-secondary)" }}>
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 14, color: "var(--color-text-tertiary)" }}>Loading…</p>
      ) : apps.length === 0 ? (
        <p style={{ fontSize: 14, color: "var(--color-text-tertiary)" }}>No applications found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {apps.map(app => {
            const sc = STATUS_COLORS[app.status] || STATUS_COLORS.pending;
            return (
              <Link key={app.id} href={`/dashboard/applications/${app.id}`}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, textDecoration: "none" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: "var(--color-text-secondary)" }}>
                  {app.photo_path
                    ? <img src={fileUrl(app.photo_path) || ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : `${app.first_name[0]}${app.last_name[0]}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 2px", color: "var(--color-text-primary)" }}>{app.first_name} {app.last_name}</p>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.email} · {app.city}, {app.country}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 99, background: sc.bg, color: sc.text }}>{app.status}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{new Date(app.submitted_at).toLocaleDateString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
