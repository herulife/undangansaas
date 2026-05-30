const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8088" : "");
const TOKEN_KEY = "cintabuku.authToken";
const USER_KEY = "cintabuku.authUser";

export type ApiInvitation = {
  id: string;
  slug: string;
  title: string;
  couple: string;
  template: string;
  templateSlug: string;
  eventDate: string;
  status: "draft" | "published";
  config: Record<string, unknown>;
  rsvpCount: number;
  watermark: boolean;
  createdAt: string;
};

export type SaveInvitationPayload = {
  slug: string;
  title: string;
  couple: string;
  templateSlug: string;
  eventDate: string;
  status?: "draft" | "published";
  config: Record<string, unknown>;
};

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  tier: "free" | "creator" | "pro" | "business";
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type RSVPInput = {
  name: string;
  message: string;
  status: "attending" | "not_attending" | "maybe";
  guests: number;
};

export function getAuthToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) ?? "";
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthResponse) {
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearAuthSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string, displayName: string) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName }),
  });
}

export function getMe() {
  return request<AuthUser>("/api/auth/me");
}

export function listInvitations() {
  return request<ApiInvitation[]>("/api/invitations");
}

export function getInvitation(slug: string) {
  return request<ApiInvitation>(`/api/invitations/${slug}`);
}

export async function saveInvitation(payload: SaveInvitationPayload) {
  try {
    return await request<ApiInvitation>("/api/invitations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("slug")) {
      throw error;
    }
    return request<ApiInvitation>(`/api/invitations/${payload.slug}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: payload.title,
        couple: payload.couple,
        eventDate: payload.eventDate,
        status: payload.status ?? "draft",
        config: payload.config,
      }),
    });
  }
}

export function submitRSVP(slug: string, payload: RSVPInput) {
  return request(`/api/invitations/${slug}/rsvp`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
