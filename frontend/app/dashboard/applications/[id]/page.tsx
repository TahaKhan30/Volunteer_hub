"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApplication, reviewApplication, fileUrl } from "@/lib/api";
import { VOLUNTEER_DURATION_OPTIONS } from "@/lib/form-types";
import Link from "next/link";
import { toast } from "sonner";

const REVIEW_MESSAGES: Record<string, string> = {
  accepted: "Application accepted as a volunteer",
  rejected: "Application rejected",
  reviewing: "Marked as reviewing",
};

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [acceptStartDate, setAcceptStartDate] = useState("");
  const [acceptDuration, setAcceptDuration] = useState("");

  useEffect(() => {
    getApplication(Number(params.id)).then(data => {
      setApp(data);
      setNote(data.admin_note || "");
    }).finally(() => setLoading(false));
  }, [params.id]);

  async function handleReview(status: string) {
    setReviewing(true);
    try {
      const updated = await reviewApplication(
        Number(params.id),
        status,
        note || undefined,
        status === "accepted" ? acceptStartDate : undefined,
        status === "accepted" ? acceptDuration : undefined
      );
      setApp(updated);
      setShowAcceptForm(false);
      toast.success(REVIEW_MESSAGES[status] || "Application updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update application");
    } finally {
      setReviewing(false);
    }
  }

  if (loading) return <p style={{ fontSize: 14, color: "var(--color-text-tertiary)" }}>Loading…</p>;
  if (!app) return <p style={{ fontSize: 14, color: "var(--color-text-danger)" }}>Application not found.</p>;

  const photo = fileUrl(app.photo_path);
  const resume = fileUrl(app.resume_path);

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Link href="/dashboard/applications" style={{ fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 15 }} aria-hidden /> Applications
        </Link>
      </div>

      {/* Header card */}
      <div style={{ background: "var(--color-background-secondary)", borderRadius: 16, padding: 20, display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 500, color: "var(--color-text-secondary)" }}>
          {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : `${app.first_name[0]}${app.last_name[0]}`}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 2px" }}>{app.first_name} {app.last_name}</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 6px" }}>{app.email}</p>
          <StatusBadge status={app.status} />
        </div>
      </div>

      {/* Details */}
      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
        <Section title="Contact">
          <Row label="Phone" value={app.phone} />
          <Row label="Location" value={`${app.city}, ${app.country}`} />
        </Section>
        <Section title="Availability">
          <Row label="From" value={app.availability_start || "—"} />
          <Row label="Duration" value={app.availability_duration || "—"} />
        </Section>
        <Section title="Skills">
          <Row label="Selected" value={(app.skills || []).join(", ") || "None"} />
          {app.talents_other && <Row label="Other" value={app.talents_other} />}
        </Section>
        {app.motivation && (
          <Section title="Motivation">
            <p style={{ fontSize: 13, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.6 }}>{app.motivation}</p>
          </Section>
        )}
        {resume && (
          <Section title="Resume">
            <a href={resume} target="_blank" rel="noreferrer"
              style={{ fontSize: 13, color: "var(--color-text-info)", display: "flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
              <i className="ti ti-file" style={{ fontSize: 15 }} aria-hidden /> Download resume
            </a>
          </Section>
        )}
      </div>

      {/* Review panel */}
      {app.status !== "accepted" && app.status !== "rejected" && (
        <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 10px" }}>Review this application</p>
          <textarea
            rows={3}
            placeholder="Add an internal note (optional)…"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ width: "100%", fontSize: 13, padding: "10px 12px", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", resize: "none", outline: "none", marginBottom: 12, boxSizing: "border-box" }}
          />
          {!showAcceptForm ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleReview("reviewing")} disabled={reviewing}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer" }}>
                Mark reviewing
              </button>
              <button onClick={() => handleReview("rejected")} disabled={reviewing}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "0.5px solid var(--color-border-danger)", background: "var(--color-background-danger)", color: "var(--color-text-danger)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Reject
              </button>
              <button onClick={() => setShowAcceptForm(true)} disabled={reviewing}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--color-text-primary)", color: "var(--color-background-primary)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Accept
              </button>
            </div>
          ) : (
            <div style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px" }}>Set the volunteer&apos;s assignment</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 5 }}>
                    Start date <span style={{ color: "var(--color-text-danger)" }}>*</span>
                  </label>
                  <input type="date" value={acceptStartDate} onChange={e => setAcceptStartDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 5 }}>
                    Duration <span style={{ color: "var(--color-text-danger)" }}>*</span>
                  </label>
                  <select value={acceptDuration} onChange={e => setAcceptDuration(e.target.value)}>
                    <option value="">Select…</option>
                    {VOLUNTEER_DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAcceptForm(false)} disabled={reviewing}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={() => handleReview("accepted")} disabled={reviewing || !acceptStartDate || !acceptDuration}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--color-text-primary)", color: "var(--color-background-primary)", fontSize: 13, fontWeight: 500, cursor: "pointer", opacity: (!acceptStartDate || !acceptDuration) ? 0.4 : 1 }}>
                  Confirm & accept
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {app.admin_note && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)", margin: "0 0 4px" }}>Admin note</p>
          <p style={{ fontSize: 13, color: "var(--color-text-primary)", margin: 0, lineHeight: 1.5 }}>{app.admin_note}</p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending:   { bg: "var(--color-background-warning)", text: "var(--color-text-warning)" },
    reviewing: { bg: "var(--color-background-info)",    text: "var(--color-text-info)" },
    accepted:  { bg: "var(--color-background-success)", text: "var(--color-text-success)" },
    rejected:  { bg: "var(--color-background-danger)",  text: "var(--color-text-danger)" },
  };
  const c = colors[status] || colors.pending;
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
