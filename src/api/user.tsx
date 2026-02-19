import { apiRequest } from "./http";

export type CreateUserRequest = {
  email: string;
  rawPassword: string;
  age: number;
  newsletterEmailAccept: boolean;
  location: string | null;
};

export type UserResponse = {
  userId: number;
  email: string;
  userRole: "ROLE_USER" | "ROLE_ADMIN";
  age: number | null;
  newsletterEmailAccept: boolean;
  location: string | null;
};

export type UpdateUserRequest = {
  email?: string;
  rawPassword?: string;
  age?: number | null;
  newsletterEmailAccept: boolean;
  location?: string | null;
};

export async function createUser(
  payload: CreateUserRequest
): Promise<UserResponse> {
  return apiRequest<UserResponse>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<UserResponse> {
  return apiRequest<UserResponse>("/users/me");
}

export async function updateMe(
  payload: UpdateUserRequest
): Promise<UserResponse> {
  return apiRequest<UserResponse>("/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
