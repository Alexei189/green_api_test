type ChatHeaderProps = {
  name: string;
  status?: string;
  initials: string;
};

export function ChatHeader({ name, status = "в сети", initials }: ChatHeaderProps) {
  return (
    <header className="chat-panel__header">
      <span className="chat-avatar" aria-hidden="true">
        {initials}
      </span>
      <div className="chat-panel__info">
        <h2 className="chat-panel__name">{name}</h2>
        <p className="chat-panel__status">{status}</p>
      </div>
    </header>
  );
}
