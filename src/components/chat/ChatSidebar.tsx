import type { ReactNode } from "react";
import clsx from "clsx";

import type { ChatPreview } from "./types";

type ChatSidebarProps = {
  chats: ChatPreview[];
  activeChatId: string;
  onSelect: (chatId: string) => void;
  settings?: ReactNode;
};

export function ChatSidebar({
  chats,
  activeChatId,
  onSelect,
  settings,
}: ChatSidebarProps) {
  return (
    <aside className="chat-sidebar">
      <header className="chat-sidebar__header">
        <h1 className="chat-sidebar__title">Чаты</h1>
      </header>

      {settings}

      <ul className="chat-list">
        {chats.length === 0 ? (
          <li className="chat-list__empty">Укажите номер телефона получателя</li>
        ) : (
          chats.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                className={clsx("chat-list__item", {
                  "chat-list__item--active": chat.id === activeChatId,
                })}
                onClick={() => onSelect(chat.id)}
              >
                <span className="chat-avatar" aria-hidden="true">
                  {chat.initials}
                </span>
                <span className="chat-list__meta">
                  <span className="chat-list__row">
                    <span className="chat-list__name">{chat.name}</span>
                    <span className="chat-list__time">{chat.time}</span>
                  </span>
                  <p className="chat-list__preview">{chat.preview}</p>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
