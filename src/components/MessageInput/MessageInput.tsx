import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import styles from "./styles.module.css";
import type { MessageInputProps } from "./types";

export function MessageInput({
  onSend,
  disabled = false,
  sending = false,
}: MessageInputProps) {
  const [text, setText] = useState("");

  const submit = async () => {
    const value = text.trim();
    if (!value || disabled || sending) return;
    try {
      await onSend(value);
      setText("");
    } catch {
      // текст остаётся в поле при ошибке отправки
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <form className={styles.chatComposer} onSubmit={handleSubmit}>
      <textarea
        className={styles.chatComposerField}
        placeholder={
          disabled && !sending
            ? "Сначала сохраните настройки инстанса"
            : "Введите сообщение"
        }
        rows={1}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label="Текст сообщения"
      />
      <button
        type="submit"
        className={styles.chatComposerSend}
        disabled={disabled || !text.trim()}
        aria-label="Отправить"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  );
}
