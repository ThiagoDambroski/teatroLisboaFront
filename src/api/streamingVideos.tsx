import { apiRequest } from "./http";

/**
 * BACKEND enum:
 * L, M3, M6, M12, M14, M16, M18
 */
export type AgeRating = "L" | "M3" | "M6" | "M12" | "M14" | "M16" | "M18";

/* ============================================================
   RESPONSE TYPE (o que o backend devolve)
============================================================ */

export type StreamingVideoResponse = {
  streamingVideoId: number;
  name: string;
  videoUrl: string;
  videoTrailerUrl: string | null;
  thumbImage: string | null;
  likes: number;
  synopsis: string | null;
  ageRating: AgeRating;

  // ✅ NOVO
  price: number;   // BigDecimal do backend vira number no JSON
  year: number;

  collaboratorIds: number[];
  categoryIds: number[];
};

/* ============================================================
   CREATE REQUEST
============================================================ */

export type StreamingVideoCreateRequest = {
  name: string;
  videoUrl: string;

  videoTrailerUrl?: string | null;
  thumbImage: string;
  synopsis?: string | null;

  ageRating: AgeRating;

  // ✅ NOVO
  price: number;
  year: number;

  collaboratorIds?: number[];
  categoryIds?: number[];
};

/* ============================================================
   UPDATE REQUEST
   (todos opcionais — PATCH-like)
============================================================ */

export type StreamingVideoUpdateRequest = {
  name?: string;
  videoUrl?: string;
  videoTrailerUrl?: string | null;
  thumbImage?: string;
  synopsis?: string | null;
  ageRating?: AgeRating;

  // ✅ NOVO
  price?: number;
  year?: number;
};

/* ============================================================
   RELATIONS
============================================================ */

export type StreamingVideoRelationsRequest = {
  collaboratorIds: number[];
  categoryIds: number[];
};

/* ============================================================
   API CALLS
============================================================ */

export async function getAllVideos(): Promise<StreamingVideoResponse[]> {
  return apiRequest<StreamingVideoResponse[]>("/streaming-videos");
}

export async function getVideoById(id: number): Promise<StreamingVideoResponse> {
  return apiRequest<StreamingVideoResponse>(`/streaming-videos/${id}`);
}

export async function createVideo(
  payload: StreamingVideoCreateRequest
): Promise<StreamingVideoResponse> {
  return apiRequest<StreamingVideoResponse>("/streaming-videos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateVideo(
  id: number,
  payload: StreamingVideoUpdateRequest
): Promise<StreamingVideoResponse> {
  return apiRequest<StreamingVideoResponse>(`/streaming-videos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function setVideoRelations(
  id: number,
  payload: StreamingVideoRelationsRequest
): Promise<StreamingVideoResponse> {
  return apiRequest<StreamingVideoResponse>(`/streaming-videos/${id}/relations`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteVideo(id: number): Promise<void> {
  return apiRequest<void>(`/streaming-videos/${id}`, {
    method: "DELETE",
  });
}