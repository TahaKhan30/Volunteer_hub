const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  return res;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
  return res.json();
}

export async function register(email: string, password: string, full_name?: string) {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Registration failed");
  return res.json();
}

export async function logout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

export async function getMe() {
  const res = await apiFetch("/api/auth/me");
  if (!res.ok) return null;
  return res.json();
}

// ── Public form submission ────────────────────────────────────────────────────

export async function submitApplication(formData: FormData) {
  const res = await fetch(`${API}/api/applications`, {
    method: "POST",
    credentials: "include",
    body: formData, // multipart — no Content-Type header, browser sets it
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Submission failed");
  return res.json();
}

// ── Applications (admin) ──────────────────────────────────────────────────────

export async function getApplications(status?: string, search?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const res = await apiFetch(`/api/applications?${params}`);
  if (!res.ok) throw new Error("Failed to load applications");
  return res.json();
}

export async function getApplication(id: number) {
  const res = await apiFetch(`/api/applications/${id}`);
  if (!res.ok) throw new Error("Application not found");
  return res.json();
}

export async function reviewApplication(
  id: number,
  status: string,
  admin_note?: string,
  start_date?: string,
  duration?: string
) {
  const res = await apiFetch(`/api/applications/${id}/review`, {
    method: "PATCH",
    body: JSON.stringify({ status, admin_note, start_date, duration }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Review failed");
  return res.json();
}

export async function getDashboardStats() {
  const res = await apiFetch("/api/applications/stats");
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

// ── Volunteers (admin) ────────────────────────────────────────────────────────

export async function getVolunteers(status?: string, search?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const res = await apiFetch(`/api/volunteers?${params}`);
  if (!res.ok) throw new Error("Failed to load volunteers");
  return res.json();
}

export async function getVolunteer(id: number) {
  const res = await apiFetch(`/api/volunteers/${id}`);
  if (!res.ok) throw new Error("Volunteer not found");
  return res.json();
}

export async function updateVolunteer(id: number, data: Record<string, unknown>) {
  const res = await apiFetch(`/api/volunteers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Update failed");
  return res.json();
}

export function fileUrl(path: string | null) {
  if (!path) return null;
  return `${API}/uploads/${path.replace(/^uploads\//, "")}`;
}
