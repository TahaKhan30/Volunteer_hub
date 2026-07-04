import Link from "next/link";

export default function SuccessPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--color-background-primary)" }}>
      <div style={{ textAlign: "center", maxWidth: 340 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--color-background-success)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <i className="ti ti-check" style={{ fontSize: 28, color: "var(--color-text-success)" }} aria-hidden />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 8px" }}>Application submitted!</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 24px" }}>
          Thank you for applying. We will review your application and get back to you soon.
        </p>
        <Link href="/" style={{ fontSize: 14, color: "var(--color-text-secondary)", textDecoration: "underline" }}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
