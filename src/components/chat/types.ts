export type MessageDirection = "incoming" | "outgoing";

export type ChatMessage = {
  id: string;
  text: string;
  direction: MessageDirection;
  time: string;
  status?: "pending" | "sent" | "failed";
};

export type ChatPreview = {
  id: string;
  name: string;
  preview: string;
  time: string;
  initials: string;
};
