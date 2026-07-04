import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    icon: "ti-heart-handshake",
    title: "Make real impact",
    body: "Every hour you give supports programs that directly help people in your community.",
  },
  {
    icon: "ti-clock",
    title: "Flexible commitment",
    body: "Pick an availability and duration that fits your life — from a couple of weeks to several months.",
  },
  {
    icon: "ti-certificate",
    title: "Build new skills",
    body: "Get hands-on experience in teaching, design, event coordination, fundraising, and more.",
  },
  {
    icon: "ti-users",
    title: "Join a community",
    body: "Meet like-minded volunteers and collaborate with a team that cares about the same causes you do.",
  },
];

const STEPS = [
  {
    title: "Apply",
    body: "Fill out a short form with your details, skills, and availability. It takes less than 5 minutes.",
  },
  {
    title: "Get reviewed",
    body: "Our team reviews your application and reaches out with next steps.",
  },
  {
    title: "Start volunteering",
    body: "Once accepted, we'll set your start date and get you onboarded with the team.",
  },
];

export default function HomePage() {
  const cookieStore = cookies();
  const hasToken = cookieStore.has("access_token");
  if (hasToken) redirect("/dashboard");

  return (
    <main style={{ background: "var(--color-background-primary)" }}>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1040, margin: "0 auto", padding: "20px 24px" }}>
        <Image src="/logo.png" alt="Volunteers Hub" width={44} height={40} priority style={{ width: 44, height: 40, objectFit: "contain" }} />
        <Link href="/login" style={{ fontSize: 14, color: "var(--color-text-secondary)", textDecoration: "none" }}>
          Sign in
        </Link>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 56px", textAlign: "center" }}>
        <Image src="/logo.png" alt="Volunteers Hub" width={106} height={95} priority style={{ width: 106, height: 95, objectFit: "contain", margin: "0 auto 8px" }} />
        <h1 style={{ fontSize: 34, fontWeight: 500, margin: "0 0 14px", lineHeight: 1.2 }}>Volunteer with us</h1>
        <p style={{ fontSize: 17, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: "0 0 12px" }}>
          Volunteers Hub connects passionate people with meaningful opportunities to serve their communities.
          Whether you have a few hours a month or want a longer-term commitment, there&apos;s a place for you here.
        </p>
        <p style={{ fontSize: 15, color: "var(--color-text-tertiary)", lineHeight: 1.6, margin: "0 0 32px" }}>
          No experience required — just a willingness to help. Fill out the application form and our team
          will take it from there.
        </p>
        <Link href="/apply"
          style={{ display: "inline-block", padding: "14px 32px", background: "var(--color-text-primary)", color: "var(--color-background-primary)", borderRadius: 12, textDecoration: "none", fontSize: 15, fontWeight: 500 }}>
          Apply now
        </Link>
        <p style={{ marginTop: 20, fontSize: 13, color: "var(--color-text-tertiary)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-text-secondary)", textDecoration: "underline" }}>Sign in</Link>
        </p>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 56px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, textAlign: "center", margin: "0 0 32px" }}>Why volunteer with us</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, padding: 22 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <i className={`ti ${f.icon}`} style={{ fontSize: 20, color: "var(--color-text-primary)" }} aria-hidden />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 64px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, textAlign: "center", margin: "0 0 32px" }}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {STEPS.map((s, i) => (
            <div key={s.title} style={{ padding: 22 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-text-primary)", color: "var(--color-background-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 500, marginBottom: 14 }}>
                {i + 1}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ background: "var(--color-background-secondary)", borderRadius: 20, padding: "40px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 10px" }}>Ready to get started?</h2>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", margin: "0 0 24px" }}>
            Applying takes less than 5 minutes — we&apos;ll be in touch soon after.
          </p>
          <Link href="/apply"
            style={{ display: "inline-block", padding: "14px 32px", background: "var(--color-text-primary)", color: "var(--color-background-primary)", borderRadius: 12, textDecoration: "none", fontSize: 15, fontWeight: 500 }}>
            Apply now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", margin: 0 }}>
          Connect · Serve · Impact — © {new Date().getFullYear()} Volunteers Hub
        </p>
      </div>
    </main>
  );
}
