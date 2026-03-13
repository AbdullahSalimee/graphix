/**
 * API client helpers
 * All calls go through backend — never direct to DB from frontend.
 */

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ── Auth ──────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as { token: string; user: any };
}

export async function apiSignup(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  return data as { token: string; user: any };
}

// ── Charts ────────────────────────────────────────────────────

export async function apiSaveChart(
  token: string,
  payload: { title: string; prompt: string; chartConfig: any }
) {
  const res = await fetch(`${API}/api/charts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save chart");
  return data;
}

export async function apiDeleteChart(token: string, id: string) {
  const res = await fetch(`${API}/api/charts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete chart");
  return data;
}

export async function apiUpdateChartTitle(token: string, id: string, title: string) {
  const res = await fetch(`${API}/api/charts/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update chart");
  return data;
}
