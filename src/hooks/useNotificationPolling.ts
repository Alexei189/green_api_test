import { useEffect, useRef } from "react";

import { chatIdsEqual, isCredentialsReady } from "../api/config";
import { deleteNotification } from "../api/deleteNotification";
import {
  extractTextMessage,
  isIncomingMessage,
  type NotificationBody,
} from "../api/notifications";
import { receiveNotification } from "../api/receiveNotification";
import type { GreenApiCredentials } from "../api/types";

export type IncomingChatMessage = {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
};

type UseNotificationPollingOptions = {
  credentials: GreenApiCredentials;
  /** Фильтр по активному чату; пустая строка — принимать все входящие. */
  activeChatId: string;
  enabled?: boolean;
  receiveTimeout?: number;
  onIncomingMessage: (message: IncomingChatMessage) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: "idle" | "listening" | "error") => void;
};

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

function toIncoming(
  body: NotificationBody,
): IncomingChatMessage | null {
  if (!isIncomingMessage(body)) return null;

  const text = extractTextMessage(body);
  const chatId = body.senderData?.chatId;
  if (!text || !chatId || !body.idMessage) return null;

  return {
    id: body.idMessage,
    chatId,
    text,
    timestamp: body.timestamp,
  };
}

/**
 * Long-polling очередь GREEN-API: ReceiveNotification → обработка → DeleteNotification.
 */
export function useNotificationPolling({
  credentials,
  activeChatId,
  enabled = true,
  receiveTimeout = 20,
  onIncomingMessage,
  onError,
  onStatusChange,
}: UseNotificationPollingOptions) {
  const onIncomingRef = useRef(onIncomingMessage);
  const onErrorRef = useRef(onError);
  const onStatusRef = useRef(onStatusChange);
  const activeChatIdRef = useRef(activeChatId);

  onIncomingRef.current = onIncomingMessage;
  onErrorRef.current = onError;
  onStatusRef.current = onStatusChange;
  activeChatIdRef.current = activeChatId;

  useEffect(() => {
    if (!enabled || !isCredentialsReady(credentials)) {
      onStatusRef.current?.("idle");
      return;
    }

    const controller = new AbortController();
    let stopped = false;

    const run = async () => {
      onStatusRef.current?.("listening");

      while (!stopped && !controller.signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, {
            receiveTimeout,
            signal: controller.signal,
          });

          if (!notification) continue;

          const incoming = toIncoming(notification.body);
          const filterChatId = activeChatIdRef.current;

          if (
            incoming &&
            (!filterChatId || chatIdsEqual(incoming.chatId, filterChatId))
          ) {
            onIncomingRef.current(incoming);
          }

          await deleteNotification(credentials, notification.receiptId, {
            signal: controller.signal,
          });
        } catch (err) {
          if (controller.signal.aborted || stopped) break;

          const error =
            err instanceof Error ? err : new Error("Ошибка получения уведомлений");
          onStatusRef.current?.("error");
          onErrorRef.current?.(error);

          try {
            await sleep(3000, controller.signal);
          } catch {
            break;
          }

          if (!stopped) onStatusRef.current?.("listening");
        }
      }
    };

    void run();

    return () => {
      stopped = true;
      controller.abort();
      onStatusRef.current?.("idle");
    };
  }, [credentials, enabled, receiveTimeout]);
}
