import { buildInstanceUrl, greenApiRequest } from "./client";
import type { DeleteNotificationResponse } from "./notifications";
import type { GreenApiCredentials } from "./types";

type DeleteNotificationOptions = {
  signal?: AbortSignal;
};

/**
 * Подтверждение и удаление уведомления из очереди по receiptId.
 * @see https://green-api.com/v3/docs/api/receiving/technology-http-api/DeleteNotification/
 */
export async function deleteNotification(
  credentials: GreenApiCredentials,
  receiptId: number,
  options: DeleteNotificationOptions = {},
): Promise<DeleteNotificationResponse> {
  const url = `${buildInstanceUrl(credentials, "deleteNotification")}/${receiptId}`;

  const result = await greenApiRequest<DeleteNotificationResponse>(url, {
    method: "DELETE",
    signal: options.signal,
  });

  if (!result) {
    throw new Error("Empty response from deleteNotification");
  }

  return result;
}
