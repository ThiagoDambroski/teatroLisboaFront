import { apiRequest } from "./http";

export type PurchaseResponse = {
  purchaseId: number;
  userId: number;
  streamingVideoId: number;

  // se o teu backend tiver outros campos, deixa opcionais:
  createdAt?: string; // ISO
  expiresAt?: string; // ISO
  pricePaid?: number;
  currency?: string;
};

export async function getAllPurchases(): Promise<PurchaseResponse[]> {
  return apiRequest<PurchaseResponse[]>("/purchases");
}

export async function getPurchasesByUser(userId: number): Promise<PurchaseResponse[]> {
  return apiRequest<PurchaseResponse[]>(`/purchases/by-user/${userId}`);
}

export async function getPurchasesByVideo(streamingVideoId: number): Promise<PurchaseResponse[]> {
  return apiRequest<PurchaseResponse[]>(`/purchases/by-video/${streamingVideoId}`);
}

export async function deletePurchase(purchaseId: number): Promise<void> {
  return apiRequest<void>(`/purchases/${purchaseId}`, { method: "DELETE" });
}
