const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8088" : "");

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
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
