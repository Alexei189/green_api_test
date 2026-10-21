import { useCallback, useMemo, useState } from "react";

import {
  isCredentialsReady,
  loadChatId,
  loadCredentials,
  normalizeChatId,
  saveChatId,
  saveCredentials,
} from "../../api/config";
import { sendMessage } from "../../api/sendMessage";
import type { GreenApiCredentials } from "../../api/types";
import {
  useNotificationPolling,
  type IncomingChatMessage,
} from "../../hooks/useNotificationPolling";
import { ChatHeader } from "../ChatHeader/ChatHeader";
import { ChatSidebar } from "../ChatSidebar/ChatSidebar";
import type { ChatPreview } from "../ChatSidebar/types";
import { InstanceSettings } from "../InstanceSettings/InstanceSettings";
import { MessageInput } from "../MessageInput/MessageInput";
import type { ChatMessage } from "../MessageBubble/types";
import { MessageList } from "../MessageList/MessageList";
import styles from "./styles.module.css";
import type { ListenStatus } from "./types";

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimestamp(timestamp: number) {
  return formatTime(new Date(timestamp * 1000));
}

function chatPreviewFromId(chatId: string): ChatPreview {
  const display = chatId.replace(/@c\.us$/i, "") || "Получатель";
  return {
    id: chatId || "empty",
    name: display,
    preview: "Новый чат",
    time: formatTime(),
    initials: display.slice(0, 1).toUpperCase() || "?",
  };
}

export function ChatLayout() {
  const [credentials, setCredentials] =
    useState<GreenApiCredentials>(loadCredentials);
  const [chatId, setChatId] = useState(loadChatId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listenStatus, setListenStatus] = useState<ListenStatus>("idle");

  const normalizedChatId = normalizeChatId(chatId);

  const activeChat = useMemo(
    () => chatPreviewFromId(normalizedChatId || chatId),
    [chatId, normalizedChatId],
  );

  const ready =
    isCredentialsReady(credentials) && Boolean(normalizedChatId);

  const handleIncoming = useCallback((incoming: IncomingChatMessage) => {
    setMessages((prev) => {
      if (prev.some((message) => message.id === incoming.id)) return prev;

      return [
        ...prev,
        {
          id: incoming.id,
          text: incoming.text,
          direction: "incoming",
          time: formatTimestamp(incoming.timestamp),
          status: "sent",
        },
      ];
    });
    setError(null);
  }, []);

  useNotificationPolling({
    credentials,
    activeChatId: normalizedChatId,
    enabled: isCredentialsReady(credentials),
    onIncomingMessage: handleIncoming,
    onError: (err) => setError(err.message),
    onStatusChange: setListenStatus,
  });

  const handleSaveSettings = (
    nextCredentials: GreenApiCredentials,
    nextChatId: string,
  ) => {
    saveCredentials(nextCredentials);
    saveChatId(nextChatId);
    setCredentials(nextCredentials);
    setChatId(nextChatId);
    setError(null);
  };

  const handleSend = async (text: string) => {
    if (!isCredentialsReady(credentials) || !normalizedChatId) {
      setError("Укажите параметры инстанса и номер телефона РФ/РБ");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const { idMessage } = await sendMessage(credentials, {
        chatId: normalizedChatId,
        message: text,
      });

      const outgoing: ChatMessage = {
        id: idMessage,
        text,
        direction: "outgoing",
        time: formatTime(),
        status: "sent",
      };

      setMessages((prev) =>
        prev.some((message) => message.id === idMessage)
          ? prev
          : [...prev, outgoing],
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Не удалось отправить сообщение";
      setError(message);
      throw err;
    } finally {
      setSending(false);
    }
  };

  const statusLabel =
    listenStatus === "listening"
      ? "слушаем уведомления"
      : listenStatus === "error"
        ? "ошибка получения"
        : "ожидание настроек";

  return (
    <div className={styles.chatApp}>
      <ChatSidebar
        chats={chatId ? [activeChat] : []}
        activeChatId={activeChat.id}
        onSelect={() => undefined}
        settings={
          <InstanceSettings
            credentials={credentials}
            chatId={chatId}
            onSave={handleSaveSettings}
          />
        }
      />

      <section className={styles.chatPanel} aria-label="Окно чата">
        <ChatHeader
          name={activeChat.name}
          initials={activeChat.initials}
          status={statusLabel}
        />
        {error ? (
          <div className={styles.chatError} role="alert">
            {error}
          </div>
        ) : null}
        <MessageList messages={messages} />
        <MessageInput
          onSend={handleSend}
          disabled={!ready || sending}
          sending={sending}
        />
      </section>
    </div>
  );
}
