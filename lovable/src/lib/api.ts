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

export type TierFeatureSet = {
  analytics: "basic" | "full";
  apiAccess: boolean;
  activeMonths?: number;
  bulkCreate: boolean;
  clientDashboard: boolean;
  customDomain: boolean;
  dynamicOg: boolean;
  exportCsv: boolean;
  flags: string[];
  maxGallery: number | null;
  prioritySupport: boolean;
  revenueShare: number;
  rsvpLimit: number;
  unlimitedGallery: boolean;
  watermark: boolean;
  whiteLabel: boolean;
};

export type MeFeaturesResponse = {
  userId: string;
  email: string;
  role: string;
  tier: AuthUser["tier"];
  effectiveTier: AuthUser["tier"];
  tierExpiresAt: string | null;
  isExpired: boolean;
  isInGracePeriod: boolean;
  isB2b: boolean;
  clientLimit: number;
  features: TierFeatureSet;
};

export type PublishInvitationPayload = {
  customDomain?: string;
  dynamicOg?: boolean;
  galleryCount: number;
  removeWatermark?: boolean;
};

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role: "user" | "admin" | "reseller" | "client";
  tier: "free" | "creator" | "pro" | "business";
  status: "active" | "suspended";
  tierExpiresAt: string | null;
  isB2b: boolean;
  clientLimit: number;
  invitationCount: number;
  rsvpCount: number;
  paymentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserPayload = {
  email: string;
  displayName: string;
  password?: string;
  role: AdminUser["role"];
  tier: AdminUser["tier"];
  status: AdminUser["status"];
  tierExpiresAt?: string;
  isB2b: boolean;
  clientLimit: number;
};

export type UploadResponse = {
  fileName: string;
  url: string;
  type: "images" | "audio";
};

export type ApiTemplate = {
  id: string;
  name: string;
  slug: string;
  category: string;
  configSchema: Record<string, unknown>;
  tierAccess: string[];
  assetsUrl: string;
  previewUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaymentCheckoutResponse = {
  amountIdr: number;
  checkoutUrl: string;
  demoSettleAllowed: boolean;
  mode: "demo" | "gateway";
  orderId: string;
  provider: "manual" | "midtrans" | "xendit";
  status: string;
  tier: AuthUser["tier"];
};

export type AdminOrder = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  provider: string;
  providerOrderId: string;
  tier: AuthUser["tier"];
  amountIdr: number;
  currency: string;
  status: "pending" | "settlement" | "paid" | "failed" | "expired" | "refunded" | "cancelled";
  checkoutUrl: string;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminReport = {
  users: number;
  revenueIdr: number;
  invitations: number;
  rsvp: number;
  events: number;
  templates: number;
  chart: Array<{ label: string; value: number }>;
  tiers: Array<{ label: string; value: number }>;
};

export type Voucher = {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  quota: number;
  usedCount: number;
  expiresAt: string | null;
  status: "active" | "paused" | "expired";
  createdAt: string;
  updatedAt: string;
};

export type Guest = {
  id: string;
  invitationId: string;
  invitationSlug: string;
  invitationTitle: string;
  name: string;
  phone: string;
  status: "draft" | "sent" | "opened" | "failed";
  personalUrl: string;
  sentAt: string | null;
  openedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  userId: string | null;
  fileName: string;
  url: string;
  mediaType: "images" | "audio" | string;
  provider: string;
  sizeBytes: number;
  createdAt: string;
};

export type GenerateImageResponse = {
  fileName: string;
  provider: string;
  url: string;
  prompt: string;
};

export type RSVPInput = {
  name: string;
  message: string;
  status: "attending" | "declined" | "pending";
  guests: number;
};

export type RSVPItem = {
  id: string;
  name: string;
  message: string;
  status: RSVPInput["status"];
  guests: number;
  createdAt: string;
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
  featuresCache = null;
  window.localStorage.setItem(TOKEN_KEY, session.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearAuthSession() {
  featuresCache = null;
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
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
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

let featuresCache: { value: MeFeaturesResponse; expiresAt: number } | null = null;

export async function getMeFeatures(options?: { force?: boolean }) {
  const now = Date.now();
  if (!options?.force && featuresCache && featuresCache.expiresAt > now) {
    return featuresCache.value;
  }

  const value = await request<MeFeaturesResponse>("/api/v1/me/features");
  featuresCache = { value, expiresAt: now + 5 * 60 * 1000 };
  return value;
}

export async function updateProfile(payload: { email: string; displayName: string }) {
  const user = await request<AuthUser>("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (typeof window !== "undefined") {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  return user;
}

export function changePassword(payload: { currentPassword: string; newPassword: string }) {
  return request<void>("/api/auth/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function listAdminUsers(params?: { q?: string; status?: string; role?: string; tier?: string }) {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.status) query.set("status", params.status);
  if (params?.role) query.set("role", params.role);
  if (params?.tier) query.set("tier", params.tier);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<AdminUser[]>(`/api/admin/users${suffix}`);
}

export function createAdminUser(payload: AdminUserPayload & { password: string }) {
  return request<AdminUser>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminUser(id: string, payload: AdminUserPayload) {
  return request<AdminUser>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function resetAdminUserPassword(id: string, password: string) {
  return request<void>(`/api/admin/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
}

export async function uploadMedia(file: File) {
  const token = getAuthToken();
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`${API_BASE}/api/uploads`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Upload failed: ${response.status}`);
  }
  return response.json() as Promise<UploadResponse>;
}

export function generateInvitationImage(payload: { prompt: string; style?: string; size?: string }) {
  return request<GenerateImageResponse>("/api/ai/images", {
    method: "POST",
    body: JSON.stringify(payload),
  });
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

export function listInvitationRSVPs(slug: string) {
  return request<RSVPItem[]>(`/api/invitations/${slug}/rsvps`);
}

export function listTemplates() {
  return request<ApiTemplate[]>("/api/templates");
}

export function publishInvitation(slug: string, payload: PublishInvitationPayload) {
  return request<ApiInvitation>(`/api/v1/invitations/${slug}/publish`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function createPaymentCheckout(payload: { tier: "creator" | "pro" | "business"; provider?: "manual" | "midtrans" | "xendit"; voucherCode?: string }) {
  return request<PaymentCheckoutResponse>("/api/v1/payments/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function demoSettlePayment(orderId: string) {
  return request<AdminOrder>(`/api/v1/payments/${orderId}/demo-settle`, {
    method: "POST",
  });
}

export function listAdminOrders() {
  return request<AdminOrder[]>("/api/admin/orders");
}

export function refundPayment(payload: { orderId: string; reason?: string }) {
  return request<AdminOrder>("/api/admin/refunds", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminReport() {
  return request<AdminReport>("/api/admin/reports");
}

export function listAdminVouchers() {
  return request<Voucher[]>("/api/admin/vouchers");
}

export function createAdminVoucher(payload: { code: string; discountType: "percent" | "fixed"; discountValue: number; quota: number; expiresAt?: string; status: Voucher["status"] }) {
  return request<Voucher>("/api/admin/vouchers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listAdminMedia() {
  return request<MediaAsset[]>("/api/admin/media");
}

export function registerAdminTemplate(payload: {
  name: string;
  slug: string;
  category: string;
  configSchema?: Record<string, unknown>;
  tierAccess: string[];
  assetsUrl: string;
  previewUrl: string;
  isActive: boolean;
}) {
  return request<ApiTemplate>("/api/admin/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listGuests(params?: { invitationSlug?: string }) {
  const query = new URLSearchParams();
  if (params?.invitationSlug) query.set("invitationSlug", params.invitationSlug);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<Guest[]>(`/api/v1/guests${suffix}`);
}

export function createGuest(payload: { invitationSlug: string; name: string; phone: string }) {
  return request<Guest>("/api/v1/guests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function importGuests(payload: { invitationSlug: string; csv: string }) {
  return request<Guest[]>("/api/v1/guests/import", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function sendGuestInvite(id: string) {
  return request<{ guest: Guest; url: string; mode: string }>(`/api/v1/guests/${id}/send`, {
    method: "POST",
  });
}

export async function exportInvitationsCsv() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/v1/exports/invitations.csv`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Export failed: ${response.status}`);
  }
  return response.blob();
}

export function trackEvent(payload: {
  eventName: "page_view" | "rsvp_submit" | "share_click" | "upgrade_click" | "publish" | "export_csv" | "guest_opened" | "payment_checkout" | "payment_success" | "whatsapp_send";
  invitationSlug?: string;
  properties?: Record<string, unknown>;
  visitorId?: string;
}) {
  return request<void>("/api/v1/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
