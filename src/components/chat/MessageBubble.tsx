import clsx from "clsx";

import type { ChatMessage } from "./types";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={clsx("message", {
        "message--incoming": message.direction === "incoming",
        "message--outgoing": message.direction === "outgoing",
      })}
    >
      <div className="message__bubble">
        <p className="message__text">{message.text}</p>
        <span className="message__time">{message.time}</span>
      </div>
    </div>
  );
}
