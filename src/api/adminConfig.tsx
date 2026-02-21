import { apiRequest } from "./http";

export type AdminConfigResponse = {
  id: number;
  destaqueVideoIds: number[];
  destaqueTrailerVideoIds: number[];
};

export type AdminConfigUpdateRequest = {
  destaqueVideoIds: number[];
  destaqueTrailerVideoIds: number[];
};

export async function getAdminConfig(): Promise<AdminConfigResponse> {
  return apiRequest<AdminConfigResponse>("/admin-config");
}

export async function updateAdminConfig(payload: AdminConfigUpdateRequest): Promise<AdminConfigResponse> {
  return apiRequest<AdminConfigResponse>("/admin-config", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}