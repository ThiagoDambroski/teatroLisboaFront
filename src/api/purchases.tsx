import { apiRequest } from "./http";

export type PurchaseResponse = {
  purchaseId: number;
  purchasedAt: string;
  streamingVideo: {
    streamingVideoId: number;
    name: string;
    thumbImage?: string | null;
  };
};

export async function getMyPurchases(): Promise<PurchaseResponse[]> {
  return apiRequest<PurchaseResponse[]>("/purchases/me");
}

export async function getMyActivePurchases(): Promise<PurchaseResponse[]> {
  return apiRequest<PurchaseResponse[]>("/purchases/me/active");
}
