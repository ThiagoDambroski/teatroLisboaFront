import { apiRequest } from "./http";

export type AdminUserSort = "RECENT" | "MOST_PURCHASES" | "LAST_PURCHASE";

export type AdminUserListItemResponse = {
  userId: number;
  email: string;
  age: number | null;
  userRole: "ROLE_USER" | "ROLE_ADMIN";
  newsletterEmailAccept: boolean;
  location: string | null;
  purchaseCount: number;
  lastPurchaseAt: string | null; // ISO
};

export type AdminUserListParams = {
  q?: string;
  role?: "ROLE_USER" | "ROLE_ADMIN";
  sort?: AdminUserSort;
  // newsletter later, keep ready:
  newsletter?: boolean;
};

function toQuery(params: AdminUserListParams): string {
  const q = new URLSearchParams();
  if (params.q) q.set("q", params.q);
  if (params.role) q.set("role", params.role);
  if (params.sort) q.set("sort", params.sort);
  if (typeof params.newsletter === "boolean") q.set("newsletter", String(params.newsletter));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function adminListUsers(params: AdminUserListParams = {}): Promise<AdminUserListItemResponse[]> {
  return apiRequest<AdminUserListItemResponse[]>(`/users/admin-list${toQuery(params)}`);
}
