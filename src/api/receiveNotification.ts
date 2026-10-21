import { buildInstanceUrl, greenApiRequest } from "./client";
import type { ReceiveNotificationResponse } from "./notifications";
import type { GreenApiCredentials } from "./types";

type ReceiveNotificationOptions = {
  /** Таймаут ожидания уведомления, 5–60 сек (по умолчанию 5). */
  receiveTimeout?: number;
  signal?: AbortSignal;
};

/**
 * Получение одного уведомления из очереди (FIFO).
 * При таймауте возвращает null.
 * @see https://green-api.com/v3/docs/api/receiving/technology-http-api/ReceiveNotification/
 */
export async function receiveNotification(
  credentials: GreenApiCredentials,
  options: ReceiveNotificationOptions = {},
): Promise<ReceiveNotificationResponse | null> {
  const { receiveTimeout = 5, signal } = options;
  const url = buildInstanceUrl(credentials, "receiveNotification");

  return greenApiRequest<ReceiveNotificationResponse>(url, {
    method: "GET",
    query: { receiveTimeout },
    signal,
    allowEmpty: true,
  });
}
