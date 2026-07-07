"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactCountryFlag from "react-country-flag";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { submitApplication } from "@/lib/api";
import { FormState, INITIAL_FORM_STATE, SKILL_OPTIONS, DURATION_OPTIONS, COUNTRY_OPTIONS, STEPS, ALLOWED_EMAIL_DOMAINS } from "@/lib/form-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function update(key: keyof FormState, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function toggleSkill(skill: string) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    update("photo", file);
    const reader = new FileReader();
    reader.onload = ev => update("photoPreview", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function goNext() {
    setError(null);
    if (step < STEPS.length - 1 && isStepValid(step)) {
      setStep(s => s + 1);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
    }
  }

  function emailError(value: string): string | null {
    if (!value) return null;
    const match = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(value.trim());
    if (!match) return "Enter a valid email address";
    if (!ALLOWED_EMAIL_DOMAINS.includes(match[1].toLowerCase())) {
      return "Please use a real email provider (Gmail, Outlook, Yahoo, etc.)";
    }
    return null;
  }

  function phoneError(value: string): string | null {
    if (!value) return null;
    return isValidPhoneNumber(value) ? null : "Enter a valid phone number";
  }

  function isValidEmail(value: string) {
    return value.trim() !== "" && emailError(value) === null;
  }

  function isValidPhone(value: string) {
    return !!value && phoneError(value) === null;
  }

  function isStepValid(s: number) {
    switch (s) {
      case 0:
        return (
          form.firstName.trim() !== "" &&
          form.lastName.trim() !== "" &&
          isValidEmail(form.email) &&
          isValidPhone(form.phone) &&
          form.country.trim() !== "" &&
          form.city.trim() !== ""
        );
      case 4:
        return form.agree;
      default:
        return true;
    }
  }

  function goBack() {
    setError(null);
    setStep(s => s - 1);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }

  async function handleSubmit() {
    if (!isStepValid(4)) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("email", form.email);
      fd.append("first_name", form.firstName);
      fd.append("last_name", form.lastName);
      fd.append("phone", form.phone);
      fd.append("country", form.country);
      fd.append("city", form.city);
      if (form.availabilityStart) fd.append("availability_start", form.availabilityStart);
      if (form.availabilityDuration) fd.append("availability_duration", form.availabilityDuration);
      fd.append("skills", JSON.stringify(form.skills));
      if (form.talentsOther) fd.append("talents_other", form.talentsOther);
      if (form.motivation) fd.append("motivation", form.motivation);
      if (form.photo) fd.append("photo", form.photo);
      if (form.resume) fd.append("resume", form.resume);
      await submitApplication(fd);
      toast.success("Application submitted successfully");
      router.push("/apply/success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-background-secondary)", display: "flex", justifyContent: "center" }}>
    <div style={{ width: "100%", maxWidth: 560, minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--color-background-primary)" }}>

      {/* Progress bar - sticky top */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--color-background-primary)", padding: "12px 20px 8px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/logo.png" alt="Volunteers Hub" width={32} height={29} style={{ width: 32, height: 29, objectFit: "contain", flexShrink: 0 }} />
          <div style={{ flex: 1, height: 3, background: "var(--color-border-tertiary)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--color-text-primary)", borderRadius: 99, transition: "width 0.35s ease" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{STEPS[step]}</span>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{step + 1} of {STEPS.length}</span>
        </div>
      </div>

      {/* Scrollable form area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "24px 20px 120px" }}>

        {/* Step 1 - Basic info */}
        {step === 0 && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>Basic information</h1>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 24px", lineHeight: 1.5 }}>Tell us a little about yourself.</p>

            {/* Photo upload */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div
                onClick={() => photoRef.current?.click()}
                style={{ width: 76, height: 76, borderRadius: "50%", border: "1.5px dashed var(--color-border-secondary)", background: "var(--color-background-secondary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, overflow: "hidden", position: "relative" }}
              >
                {form.photoPreview
                  ? <img src={form.photoPreview} alt="Preview" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  : <>
                    <i className="ti ti-camera" style={{ fontSize: 22, color: "var(--color-text-tertiary)" }} aria-hidden />
                    <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 2 }}>Photo</span>
                  </>
                }
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 3px" }}>Profile photo <span style={{ fontWeight: 400, fontSize: 12, color: "var(--color-text-tertiary)" }}>(optional)</span></p>
                <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>Tap to upload. JPG or PNG, max 2MB.</span>
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <Field label="First name" required><input type="text" inputMode="text" autoComplete="given-name" placeholder="Taha" value={form.firstName} onChange={e => update("firstName", e.target.value)} /></Field>
              <Field label="Last name" required><input type="text" inputMode="text" autoComplete="family-name" placeholder="Khan" value={form.lastName} onChange={e => update("lastName", e.target.value)} /></Field>
            </div>
            <Field label="Email" required>
              <input type="email" inputMode="email" autoComplete="email" placeholder="taha@example.com" value={form.email}
                onChange={e => update("email", e.target.value)}
                onBlur={() => setEmailTouched(true)} />
              {emailTouched && emailError(form.email) && (
                <p style={{ fontSize: 12, color: "var(--color-text-danger)", margin: "6px 0 0" }}>{emailError(form.email)}</p>
              )}
            </Field>
            <Field label="Phone" required>
              <PhoneInput
                international
                defaultCountry="TR"
                placeholder="+90 555 000 00 00"
                value={form.phone}
                onChange={v => update("phone", v || "")}
                onBlur={() => setPhoneTouched(true)}
              />
              {phoneTouched && phoneError(form.phone) && (
                <p style={{ fontSize: 12, color: "var(--color-text-danger)", margin: "6px 0 0" }}>{phoneError(form.phone)}</p>
              )}
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Country" required>
                <Select value={form.country} onValueChange={v => update("country", v)}>
                  <SelectTrigger
                    style={{ width: "100%", height: "auto", fontSize: 16, padding: "11px 14px", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
                  >
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map(c => (
                      <SelectItem key={c.name} value={c.name}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {c.code && (
                            <ReactCountryFlag countryCode={c.code} svg style={{ width: 18, height: 18, borderRadius: 3 }} />
                          )}
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="City" required><input type="text" inputMode="text" autoComplete="address-level2" placeholder="Istanbul" value={form.city} onChange={e => update("city", e.target.value)} /></Field>
            </div>
          </div>
        )}

        {/* Step 2 - Availability */}
        {step === 1 && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>Availability</h1>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 24px", lineHeight: 1.5 }}>When can you volunteer with us?</p>
            <Field label="Available from"><input type="date" value={form.availabilityStart} onChange={e => update("availabilityStart", e.target.value)} /></Field>
            <Field label="Duration">
              <select value={form.availabilityDuration} onChange={e => update("availabilityDuration", e.target.value)}>
                <option value="">Select duration…</option>
                {DURATION_OPTIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* Step 3 - Skills */}
        {step === 2 && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>Skills & talents</h1>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 24px", lineHeight: 1.5 }}>Tap everything that applies.</p>
            <Field label="Skills">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {SKILL_OPTIONS.map(skill => (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                    style={{ fontSize: 13, padding: "9px 16px", borderRadius: 99, border: "0.5px solid", minHeight: 44, cursor: "pointer", transition: "all 0.15s", borderColor: form.skills.includes(skill) ? "var(--color-text-primary)" : "var(--color-border-secondary)", background: form.skills.includes(skill) ? "var(--color-text-primary)" : "transparent", color: form.skills.includes(skill) ? "var(--color-background-primary)" : "var(--color-text-secondary)" }}>
                    {skill}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={<>Other talents or languages <span style={{ fontWeight: 400, fontSize: 12, color: "var(--color-text-tertiary)" }}>(optional)</span></>}>
              <input type="text" inputMode="text" placeholder="e.g. Arabic, video editing, first aid…" value={form.talentsOther} onChange={e => update("talentsOther", e.target.value)} />
            </Field>
          </div>
        )}

        {/* Step 4 - Motivation */}
        {step === 3 && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>Motivation & resume</h1>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 24px", lineHeight: 1.5 }}>Help us understand why you want to volunteer.</p>
            <Field label="Why do you want to volunteer?">
              <textarea rows={6} inputMode="text" placeholder="Share your motivation, past experience, or what you hope to contribute…" value={form.motivation} onChange={e => update("motivation", e.target.value)} style={{ resize: "none", lineHeight: 1.6 }} />
            </Field>
            <Field label={<>Resume / CV <span style={{ fontWeight: 400, fontSize: 12, color: "var(--color-text-tertiary)" }}>(optional)</span></>}>
              <div onClick={() => resumeRef.current?.click()}
                style={{ border: `0.5px ${form.resume ? "solid" : "dashed"} var(--color-border-secondary)`, borderRadius: 12, padding: "20px 16px", textAlign: "center", cursor: "pointer" }}>
                <i className={`ti ${form.resume ? "ti-file-check" : "ti-upload"}`} style={{ fontSize: 24, color: form.resume ? "var(--color-text-success)" : "var(--color-text-tertiary)", display: "block", marginBottom: 6 }} aria-hidden />
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 2px" }}>{form.resume ? form.resume.name : "Tap to upload"}</p>
                <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>PDF or Word, max 5MB</span>
              </div>
              <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={e => update("resume", e.target.files?.[0] ?? null)} />
            </Field>
          </div>
        )}

        {/* Step 5 - Review */}
        {step === 4 && (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>Review & submit</h1>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>Check your details before submitting.</p>

            <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "var(--color-background-secondary)" }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 500, color: "var(--color-text-secondary)", flexShrink: 0, overflow: "hidden" }}>
                  {form.photoPreview ? <img src={form.photoPreview} alt="You" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : `${form.firstName[0] || "?"}${form.lastName[0] || ""}`}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, margin: "0 0 2px" }}>{form.firstName} {form.lastName}</p>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{form.email}</span>
                </div>
              </div>
              <ReviewSection title="Contact">
                <ReviewRow label="Phone" value={form.phone} />
                <ReviewRow label="Location" value={`${form.city}${form.city && form.country ? ", " : ""}${form.country}`} />
              </ReviewSection>
              <ReviewSection title="Availability">
                <ReviewRow label="From" value={form.availabilityStart || "—"} />
                <ReviewRow label="Duration" value={form.availabilityDuration || "—"} />
              </ReviewSection>
              <ReviewSection title="Skills">
                <ReviewRow label="Selected" value={form.skills.length ? form.skills.join(", ") : "None selected"} />
                {form.talentsOther && <ReviewRow label="Other" value={form.talentsOther} />}
              </ReviewSection>
              <ReviewSection title="Documents">
                <ReviewRow label="Photo" value={form.photo ? "Uploaded" : "Not uploaded"} />
                <ReviewRow label="Resume" value={form.resume ? form.resume.name : "Not uploaded"} />
              </ReviewSection>
            </div>

            {error && <p style={{ fontSize: 13, color: "var(--color-text-danger)", background: "var(--color-background-danger)", borderRadius: 10, padding: "10px 14px", margin: "0 0 12px" }}>{error}</p>}

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 14, background: "var(--color-background-secondary)", borderRadius: 12 }}>
              <input type="checkbox" id="agree" checked={form.agree} onChange={e => update("agree", e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0, accentColor: "var(--color-text-primary)", cursor: "pointer" }} />
              <label htmlFor="agree" style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, cursor: "pointer" }}>
                I confirm that the information provided is accurate and I agree to be contacted regarding my volunteer application.
              </label>
            </div>
          </div>
        )}

      </div>

      {/* Sticky footer */}
      <div style={{ position: "sticky", bottom: 0, background: "var(--color-background-primary)", borderTop: "0.5px solid var(--color-border-tertiary)", padding: "12px 20px 20px", display: "flex", gap: 10 }}>
        <button onClick={goBack} disabled={step === 0} aria-label="Go back"
          style={{ width: 50, height: 50, borderRadius: 12, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-primary)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: step === 0 ? 0.3 : 1 }}>
          <i className="ti ti-arrow-left" aria-hidden />
        </button>
        <button
          onClick={isLast ? handleSubmit : goNext}
          disabled={!isStepValid(step) || loading}
          style={{ flex: 1, height: 50, borderRadius: 12, border: "none", background: "var(--color-text-primary)", color: "var(--color-background-primary)", fontSize: 15, fontWeight: 500, cursor: "pointer", opacity: (!isStepValid(step) || loading) ? 0.3 : 1, transition: "opacity 0.15s" }}>
          {loading ? "Submitting…" : isLast ? "Submit application" : "Next"}
        </button>
      </div>

    </div>
    </div>
  );
}

function Field({ label, children, required }: { label: React.ReactNode; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 7 }}>
        {label}
        {required && <span style={{ color: "var(--color-text-danger)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "10px 16px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
      <p style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-tertiary)", margin: "0 0 6px" }}>{title}</p>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0", fontSize: 13 }}>
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--color-text-primary)", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}
