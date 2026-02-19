import { getToken } from "../auth/tokenStorage";

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

function getBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!url) throw new Error("Missing VITE_API_BASE_URL");
  return url.replace(/\/+$/, "");
}

async function parseError(res: Response): Promise<ApiError> {
  const contentType = res.headers.get("content-type") ?? "";
  const status = res.status;

  if (contentType.includes("application/json")) {
    const body = (await res.json().catch(() => null)) as any;
    const message =
      (typeof body?.message === "string" && body.message) ||
      (typeof body?.error === "string" && body.error) ||
      DEFAULT_ERROR_MESSAGE;

    return { status, message, details: body };
  }

  const text = await res.text().catch(() => "");
  return {
    status,
    message: text.trim() || DEFAULT_ERROR_MESSAGE,
    details: text || undefined,
  };
}

export async function apiRequest<TResponse>(
  path: string,
  options?: RequestInit
): Promise<TResponse> {
  const baseUrl = getBaseUrl();
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) return undefined as TResponse;
  return (await res.json()) as TResponse;
}
