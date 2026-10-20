import type { GreenApiCredentials } from "./types";

const STORAGE_KEY = "green-api-credentials";
const CHAT_ID_KEY = "green-api-chat-id";

const DEFAULT_CREDENTIALS: GreenApiCredentials = {
  apiUrl: import.meta.env.VITE_GREEN_API_URL ?? "https://api.green-api.com",
  idInstance: import.meta.env.VITE_GREEN_API_ID_INSTANCE ?? "",
  apiTokenInstance: import.meta.env.VITE_GREEN_API_TOKEN_INSTANCE ?? "",
};

export function loadCredentials(): GreenApiCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CREDENTIALS };
    return { ...DEFAULT_CREDENTIALS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CREDENTIALS };
  }
}

export function saveCredentials(credentials: GreenApiCredentials): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

export function loadChatId(): string {
  return localStorage.getItem(CHAT_ID_KEY) ?? "";
}

export function saveChatId(chatId: string): void {
  localStorage.setItem(CHAT_ID_KEY, chatId);
}

export function isCredentialsReady(credentials: GreenApiCredentials): boolean {
  return Boolean(
    credentials.apiUrl.trim() &&
      credentials.idInstance.trim() &&
      credentials.apiTokenInstance.trim(),
  );
}

export { normalizeChatId, phoneToChatId } from "./phoneChatId";

/** Сравнивает chatId без учёта суффикса @c.us. */
export function chatIdsEqual(a: string, b: string): boolean {
  const key = (value: string) =>
    value.trim().replace(/@c\.us$/i, "").replace(/^\+/, "");
  return Boolean(key(a)) && key(a) === key(b);
}
