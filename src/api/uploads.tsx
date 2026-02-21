import { apiRequest } from "./http";

export type UploadResponse = {
  url: string;
};

export async function uploadImage(file: File): Promise<UploadResponse> {
  const fd = new FormData();
  fd.append("file", file);
  return apiRequest<UploadResponse>("/uploads/images", { method: "POST", body: fd });
}