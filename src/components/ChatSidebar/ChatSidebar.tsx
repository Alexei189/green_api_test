import clsx from "clsx";

import styles from "./styles.module.css";
import type { ChatSidebarProps } from "./types";

export function ChatSidebar({
  chats,
  activeChatId,
  onSelect,
  settings,
}: ChatSidebarProps) {
  return (
    <aside className={styles.chatSidebar}>
      <header className={styles.chatSidebarHeader}>
        <h1 className={styles.chatSidebarTitle}>Чаты</h1>
      </header>

      {settings}

      <ul className={styles.chatList}>
        {chats.length === 0 ? (
          <li className={styles.chatListEmpty}>Укажите номер телефона получателя</li>
        ) : (
          chats.map((chat) => (
            <li key={chat.id}>
              <button
                type="button"
                className={clsx(styles.chatListItem, {
                  [styles.chatListItemActive]: chat.id === activeChatId,
                })}
                onClick={() => onSelect(chat.id)}
              >
                <span className={styles.chatAvatar} aria-hidden="true">
                  {chat.initials}
                </span>
                <span className={styles.chatListMeta}>
                  <span className={styles.chatListRow}>
                    <span className={styles.chatListName}>{chat.name}</span>
                    <span className={styles.chatListTime}>{chat.time}</span>
                  </span>
                  <p className={styles.chatListPreview}>{chat.preview}</p>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
