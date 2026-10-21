import clsx from "clsx";

import styles from "./styles.module.css";
import type { MessageBubbleProps } from "./types";

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={clsx(styles.message, {
        [styles.messageIncoming]: message.direction === "incoming",
        [styles.messageOutgoing]: message.direction === "outgoing",
      })}
    >
      <div className={styles.messageBubble}>
        <p className={styles.messageText}>{message.text}</p>
        <span className={styles.messageTime}>{message.time}</span>
      </div>
    </div>
  );
}
