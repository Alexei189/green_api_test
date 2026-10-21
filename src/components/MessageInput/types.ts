export type MessageInputProps = {
  onSend: (text: string) => void | Promise<void>;
  disabled?: boolean;
  sending?: boolean;
};
