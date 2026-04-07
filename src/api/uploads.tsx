import { getToken } from "../auth/tokenStorage";

export type UploadResponse = {
  url: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/+$/, "");

export async function uploadImage(file: File): Promise<UploadResponse> {
  const token = getToken();

  const formData = new FormData();
  formData.append("file", file);

  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}/uploads/images`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed with status ${res.status}`);
  }

  return (await res.json()) as UploadResponse;
}