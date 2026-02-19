import { apiRequest } from "./http";

export type VideoCategoryResponse = {
  id: number;
  name: string;
};

export type VideoCategoryRequest = {
  categoryName: string;
};

export async function getVideoCategories(): Promise<VideoCategoryResponse[]> {
  return apiRequest<VideoCategoryResponse[]>("/video-categories");
}

export async function createVideoCategory(payload: VideoCategoryRequest): Promise<VideoCategoryResponse> {
  return apiRequest<VideoCategoryResponse>("/video-categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateVideoCategory(id: number, payload: VideoCategoryRequest): Promise<VideoCategoryResponse> {
  return apiRequest<VideoCategoryResponse>(`/video-categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteVideoCategory(id: number): Promise<void> {
  return apiRequest<void>(`/video-categories/${id}`, { method: "DELETE" });
}
