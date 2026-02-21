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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function parseError(res: Response): Promise<ApiError> {
  const contentType = res.headers.get("content-type") ?? "";
  const status = res.status;

  if (contentType.includes("application/json")) {
    const body = (await res.json().catch(() => null)) as unknown;

    const message =
      (isRecord(body) && typeof body.message === "string" && body.message) ||
      (isRecord(body) && typeof body.error === "string" && body.error) ||
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

export async function apiRequest<TResponse>(path: string, options: RequestInit = {}): Promise<TResponse> {
  const baseUrl = getBaseUrl();
  const token = getToken();

  const headers = new Headers(options.headers);

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

  if (!isFormData) {
    const hasContentType = headers.has("Content-Type");
    const hasBody = options.body != null;
    if (hasBody && !hasContentType) headers.set("Content-Type", "application/json");
  } else {
    headers.delete("Content-Type");
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) return undefined as TResponse;

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await res.text()) as unknown as TResponse;
  }

  return (await res.json()) as TResponse;
}