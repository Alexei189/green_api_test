import { buildInstanceUrl, greenApiRequest } from "./client";
import type { GreenApiCredentials, SendMessagePayload, SendMessageResponse } from "./types";

/**
 * Отправка текстового сообщения через GREEN-API SendMessage.
 * @see https://green-api.com/v3/docs/api/sending/SendMessage/
 */
export async function sendMessage(
  credentials: GreenApiCredentials,
  payload: SendMessagePayload,
): Promise<SendMessageResponse> {
  const url = buildInstanceUrl(credentials, "sendMessage");

  const result = await greenApiRequest<SendMessageResponse>(url, {
    method: "POST",
    body: {
      chatId: payload.chatId,
      message: payload.message,
      ...(payload.typingTime != null ? { typingTime: payload.typingTime } : {}),
      ...(payload.quotedMessageId
        ? { quotedMessageId: payload.quotedMessageId }
        : {}),
    },
  });

  if (!result) {
    throw new Error("Empty response from sendMessage");
  }

  return result;
}
