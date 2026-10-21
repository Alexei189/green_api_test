import { useEffect, useRef } from "react";

import { MessageBubble } from "../MessageBubble/MessageBubble";
import styles from "./styles.module.css";
import type { MessageListProps } from "./types";

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={styles.chatMessages}>
      <div className={styles.chatMessagesList}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
