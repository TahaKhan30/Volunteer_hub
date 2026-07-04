"use client";

import { useEffect, useState } from "react";
import { getVolunteer, updateVolunteer, fileUrl } from "@/lib/api";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_MESSAGES: Record<string, string> = {
  active: "Volunteer marked active",
  inactive: "Volunteer marked inactive",
  suspended: "Volunteer suspended",
};

export default function VolunteerDetailPage({ params }: { params: { id: string } }) {
  const [vol, setVol] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [endDateDraft, setEndDateDraft] = useState("");

  useEffect(() => {
    getVolunteer(Number(params.id)).then(data => {
      setVol(data);
      setEndDateDraft(data.end_date || "");
    }).finally(() => setLoading(false));
  }, [params.id]);

  async function changeStatus(status: string) {
    setSaving(true);
    try {
      const updated = await updateVolunteer(Number(params.id), { status });
      setVol(updated);
      toast.success(STATUS_MESSAGES[status] || "Volunteer updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update volunteer");
    } finally {
      setSaving(false);
    }
  }

  async function saveEndDate() {
    setSaving(true);
    try {
      const updated = await updateVolunteer(Number(params.id), { end_date: endDateDraft });
      setVol(updated);
      setEditingEndDate(false);
      toast.success("End date updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update end date");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ fontSize: 14, color: "var(--color-text-tertiary)" }}>Loading…</p>;
  if (!vol) return <p style={{ fontSize: 14, color: "var(--color-text-danger)" }}>Volunteer not found.</p>;

  const photo = fileUrl(vol.photo_path);
  const resume = fileUrl(vol.resume_path);

  const statusActions: Record<string, { label: string; next: string; danger?: boolean }[]> = {
    active:    [{ label: "Mark inactive", next: "inactive" }, { label: "Suspend", next: "suspended", danger: true }],
    inactive:  [{ label: "Reactivate", next: "active" }, { label: "Suspend", next: "suspended", danger: true }],
    suspended: [{ label: "Reactivate", next: "active" }],
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Link href="/dashboard/volunteers" style={{ fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 15 }} aria-hidden /> Volunteers
        </Link>
      </div>

      <div style={{ background: "var(--color-background-secondary)", borderRadius: 16, padding: 20, display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 500, color: "var(--color-text-secondary)" }}>
          {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : `${vol.first_name[0]}${vol.last_name[0]}`}
        </div>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 2px" }}>{vol.first_name} {vol.last_name}</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 6px" }}>{vol.email}</p>
          <StatusBadge status={vol.status} />
        </div>
      </div>

      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        <Section title="Contact">
          <Row label="Phone" value={vol.phone} />
          <Row label="Location" value={`${vol.city}, ${vol.country}`} />
        </Section>
        <Section title="Availability">
          <Row label="From" value={vol.availability_start || "—"} />
          <Row label="Duration" value={vol.availability_duration || "—"} />
        </Section>
        <Section title="Assignment">
          <Row label="Start date" value={vol.start_date} />
          {!editingEndDate ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 13 }}>
              <span style={{ color: "var(--color-text-secondary)" }}>End date</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{vol.end_date || "—"}</span>
                <button onClick={() => { setEndDateDraft(vol.end_date || ""); setEditingEndDate(true); }}
                  style={{ fontSize: 12, color: "var(--color-text-info)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  Edit
                </button>
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
              <input type="date" value={endDateDraft} onChange={e => setEndDateDraft(e.target.value)} style={{ flex: 1 }} />
              <button onClick={saveEndDate} disabled={saving || !endDateDraft}
                style={{ fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 8, border: "none", background: "var(--color-text-primary)", color: "var(--color-background-primary)", cursor: "pointer", opacity: (!endDateDraft || saving) ? 0.4 : 1 }}>
                Save
              </button>
              <button onClick={() => setEditingEndDate(false)} disabled={saving}
                style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          )}
        </Section>
        <Section title="Skills">
          <Row label="Selected" value={(vol.skills || []).join(", ") || "None"} />
          {vol.talents_other && <Row label="Other" value={vol.talents_other} />}
        </Section>
        <Section title="Since">
          <Row label="Joined" value={new Date(vol.accepted_at).toLocaleDateString()} />
        </Section>
        {resume && (
          <Section title="Resume">
            <a href={resume} target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: "var(--color-text-info)", display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
              <i className="ti ti-file" style={{ fontSize: 15 }} aria-hidden /> Download resume
            </a>
          </Section>
        )}
      </div>

      {/* Status management */}
      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, padding: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 12px" }}>Manage status</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(statusActions[vol.status] || []).map(action => (
            <button key={action.next} onClick={() => changeStatus(action.next)} disabled={saving}
              style={{ padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", border: action.danger ? "0.5px solid var(--color-border-danger)" : "0.5px solid var(--color-border-secondary)", background: action.danger ? "var(--color-background-danger)" : "transparent", color: action.danger ? "var(--color-text-danger)" : "var(--color-text-primary)" }}>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    active:    { bg: "var(--color-background-success)", text: "var(--color-text-success)" },
    inactive:  { bg: "var(--color-background-secondary)", text: "var(--color-text-secondary)" },
    suspended: { bg: "var(--color-background-danger)", text: "var(--color-text-danger)" },
  };
  const c = colors[status] || colors.active;
  return <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 10px", borderRadius: 99, background: c.bg, color: c.text }}>{status}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
      <p style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-tertiary)", margin: "0 0 8px" }}>{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
