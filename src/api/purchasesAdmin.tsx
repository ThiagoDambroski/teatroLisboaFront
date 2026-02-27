import { apiRequest } from "./http";

export type PurchaseResponse = {
  purchaseId: number;

  userId: number;
  userEmail: string | null;

  streamingVideoId: number;
  videoName: string | null;

  purchasedAt: string;
};

export async function getAllPurchases(): Promise<PurchaseResponse[]> {
  return apiRequest<PurchaseResponse[]>("/admin/purchases");
}

export async function deletePurchase(id: number): Promise<void> {
  return apiRequest<void>(`/admin/purchases/${id}`, { method: "DELETE" });
}

export async function getPurchasesByVideo(streamingVideoId: number): Promise<PurchaseResponse[]> {
  return apiRequest<PurchaseResponse[]>(`/admin/purchases/by-video/${streamingVideoId}`);
}