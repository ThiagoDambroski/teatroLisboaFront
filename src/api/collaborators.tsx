import { apiRequest } from "./http";

export type CollaboratorResponse = {
  collaboratorId: number;
  name: string;
  role: string;
  socialMedia: string | null;
  profileImage: string | null;
};

export type CollaboratorRequest = {
  name: string;
  role: string;
  socialMedia?: string | null;
  profileImage?: string | null;
};

export async function getCollaborators(): Promise<CollaboratorResponse[]> {
  return apiRequest<CollaboratorResponse[]>("/collaborators");
}

export async function createCollaborator(payload: CollaboratorRequest): Promise<CollaboratorResponse> {
  return apiRequest<CollaboratorResponse>("/collaborators", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCollaborator(id: number, payload: CollaboratorRequest): Promise<CollaboratorResponse> {
  return apiRequest<CollaboratorResponse>(`/collaborators/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCollaborator(id: number): Promise<void> {
  return apiRequest<void>(`/collaborators/${id}`, { method: "DELETE" });
}
