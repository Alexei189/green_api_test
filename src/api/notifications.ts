/** Базовые типы входящих уведомлений GREEN-API (HTTP API). */

export type WebhookType =
  | "incomingMessageReceived"
  | "outgoingMessageReceived"
  | "outgoingAPIMessageReceived"
  | "outgoingMessageStatus"
  | "stateInstanceChanged"
  | string;

export type NotificationBody = {
  typeWebhook: WebhookType;
  timestamp: number;
  idMessage?: string;
  senderData?: {
    chatId: string;
    chatName?: string;
    sender?: string;
    senderName?: string;
  };
  messageData?: {
    typeMessage: string;
    textMessageData?: {
      textMessage: string;
    };
    extendedTextMessageData?: {
      text: string;
    };
  };
  status?: string;
};

export type ReceiveNotificationResponse = {
  receiptId: number;
  body: NotificationBody;
};

export type DeleteNotificationResponse = {
  result: boolean;
  reason: string;
};

export function extractTextMessage(body: NotificationBody): string | null {
  const data = body.messageData;
  if (!data) return null;

  if (data.typeMessage === "textMessage") {
    return data.textMessageData?.textMessage ?? null;
  }

  if (data.typeMessage === "extendedTextMessage") {
    return data.extendedTextMessageData?.text ?? null;
  }

  return null;
}

export function isIncomingMessage(body: NotificationBody): boolean {
  return body.typeWebhook === "incomingMessageReceived";
}
