import worldCountries from "world-countries";

export interface FormState {
  // Step 1 - Basic info
  photo: File | null;
  photoPreview: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;

  // Step 2 - Availability
  availabilityStart: string;
  availabilityDuration: string;

  // Step 3 - Skills
  skills: string[];
  talentsOther: string;

  // Step 4 - Motivation + resume
  motivation: string;
  resume: File | null;

  // Step 5 - Agreement
  agree: boolean;
}

export const INITIAL_FORM_STATE: FormState = {
  photo: null,
  photoPreview: null,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  availabilityStart: "",
  availabilityDuration: "",
  skills: [],
  talentsOther: "",
  motivation: "",
  resume: null,
  agree: false,
};

export const SKILL_OPTIONS = [
  "Web development",
  "Design",
  "Data analysis",
  "Teaching",
  "Translation",
  "Photography",
  "Marketing",
  "Project management",
  "Fundraising",
  "Social media",
  "Writing",
  "Video editing",
  "First aid",
  "Event coordination",
];

export const DURATION_OPTIONS = [
  "1 month",
  "3 months",
  "6 months",
  "1 year+",
];

export const COUNTRY_OPTIONS = [
  ...worldCountries
    .map(c => ({ name: c.name.common, code: c.cca2 }))
    .sort((a, b) => a.name.localeCompare(b.name)),
  { name: "Other", code: null as string | null },
];

// Real consumer email providers only — blocks throwaway/fake domains on the apply form.
// Must match backend ALLOWED_EMAIL_DOMAINS in app/api/routes/applications.py exactly.
export const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.co.in",
  "icloud.com", "me.com", "mac.com",
  "aol.com",
  "protonmail.com", "proton.me",
  "zoho.com",
  "gmx.com", "gmx.net",
  "mail.com",
  "yandex.com", "yandex.ru",
  "hey.com",
  "rediffmail.com",
];

export const STEPS = [
  "Basic info",
  "Availability",
  "Skills",
  "Motivation",
  "Review",
];

// Duration options for an accepted volunteer's assignment (admin-facing, set at accept time).
// Must match backend VOLUNTEER_DURATION_OPTIONS in app/schemas/volunteer.py exactly.
export const VOLUNTEER_DURATION_OPTIONS = [
  "1 week",
  "2 weeks",
  "3 weeks",
  "4 weeks",
  "1 month",
  "2 months",
  "3 months",
  "6 months",
];
