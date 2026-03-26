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
  price: number;
  year: number;

  provider: string | null;
  providerVideoId: string | null;
  playbackUrl: string | null;
  embedUrl: string | null;
  uploadStatus: "DRAFT" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED" | null;
  published: boolean | null;

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

export type AdminVideoInitUploadRequest = {
  name: string;
  videoTrailerUrl: string | null;
  thumbImage: string;
  synopsis: string | null;
  ageRating: string;
  price: number;
  year: number;
  categoryIds: number[];
  collaboratorIds: number[];

  originalFileName: string;
  contentType: string | null;
  fileSize: number | null;
};

export type AdminVideoInitUploadResponse = {
  streamingVideoId: number;
  providerVideoId: string;
  uploadStatus: string;
  tusEndpoint: string;
  authorizationSignature: string;
  authorizationExpire: number;
  libraryId: number;
};

export async function initUpload(
  payload: AdminVideoInitUploadRequest
): Promise<AdminVideoInitUploadResponse> {
  return apiRequest<AdminVideoInitUploadResponse>("/streaming-videos/init-upload", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}