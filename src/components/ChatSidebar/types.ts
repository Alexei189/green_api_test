import type { ReactNode } from "react";

export type ChatPreview = {
  id: string;
  name: string;
  preview: string;
  time: string;
  initials: string;
};

export type ChatSidebarProps = {
  chats: ChatPreview[];
  activeChatId: string;
  onSelect: (chatId: string) => void;
  settings?: ReactNode;
};
