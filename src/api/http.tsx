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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers || {});

  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await res.json()) as T;
}