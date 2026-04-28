import { getToken } from "../auth/tokenStorage";

const BASE_URL = "http://localhost:8080";

export type ApiError = {
  message: string;
};

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(BASE_URL + url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const errorText = await safeReadText(response);
      throw {
        message: errorText || "Unauthorized",
      } as ApiError;
    }

    if (!response.ok) {
      const errorText = await safeReadText(response);
      throw {
        message: errorText || "Request failed",
      } as ApiError;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("API ERROR:", error);

    if (typeof error === "object" && error !== null && "message" in error) {
      throw error;
    }

    throw {
      message: "Network error. Server may be down.",
    } as ApiError;
  }
}

async function safeReadText(response: Response): Promise<string | null> {
  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}