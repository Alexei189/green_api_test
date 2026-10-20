import type { GreenApiCredentials } from "./types";
import { GreenApiError } from "./types";

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
  /** Пустой ответ (например таймаут ReceiveNotification) считать успехом. */
  allowEmpty?: boolean;
};

export function buildInstanceUrl(
  credentials: GreenApiCredentials,
  methodPath: string,
): string {
  const apiUrl = credentials.apiUrl.replace(/\/$/, "");
  return `${apiUrl}/waInstance${credentials.idInstance}/${methodPath}/${credentials.apiTokenInstance}`;
}

export async function greenApiRequest<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T | null> {
  const { method = "GET", body, query, signal, allowEmpty = false } = options;

  const target = new URL(url);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null) target.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(target.toString(), {
    method,
    headers: body != null ? { "Content-Type": "application/json" } : undefined,
    body: body != null ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await response.text();

  if (!response.ok) {
    throw new GreenApiError(response.status, text);
  }

  if (!text.trim()) {
    if (allowEmpty) return null;
    throw new GreenApiError(response.status, "Empty response");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new GreenApiError(response.status, text || "Invalid JSON response");
  }
}
