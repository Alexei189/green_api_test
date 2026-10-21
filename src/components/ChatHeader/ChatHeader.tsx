import styles from "./styles.module.css";
import type { ChatHeaderProps } from "./types";

export function ChatHeader({ name, status = "в сети", initials }: ChatHeaderProps) {
  return (
    <header className={styles.chatPanelHeader}>
      <span className={styles.chatAvatar} aria-hidden="true">
        {initials}
      </span>
      <div className={styles.chatPanelInfo}>
        <h2 className={styles.chatPanelName}>{name}</h2>
        <p className={styles.chatPanelStatus}>{status}</p>
      </div>
    </header>
  );
}
