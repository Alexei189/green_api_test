import type { FormEvent } from "react";
import { useState } from "react";

import { phoneToChatId } from "../../api/phoneChatId";
import type { GreenApiCredentials } from "../../api/types";

type InstanceSettingsProps = {
  credentials: GreenApiCredentials;
  chatId: string;
  onSave: (credentials: GreenApiCredentials, chatId: string) => void;
};

export function InstanceSettings({
  credentials,
  chatId,
  onSave,
}: InstanceSettingsProps) {
  const [form, setForm] = useState(credentials);
  const [phone, setPhone] = useState(chatId.replace(/@c\.us$/i, ""));
  const [saved, setSaved] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const preview = phoneToChatId(phone);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const parsed = phoneToChatId(phone);
    if (!parsed.ok) {
      setPhoneError(parsed.error);
      return;
    }

    setPhoneError(null);
    onSave(
      {
        apiUrl: form.apiUrl.trim(),
        idInstance: form.idInstance.trim(),
        apiTokenInstance: form.apiTokenInstance.trim(),
      },
      parsed.chatId,
    );
    setPhone(parsed.phoneNumber);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form className="instance-settings" onSubmit={handleSubmit}>
      <p className="instance-settings__hint">Параметры инстанса GREEN-API</p>

      <label className="instance-settings__field">
        <span>apiUrl</span>
        <input
          type="url"
          value={form.apiUrl}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, apiUrl: event.target.value }))
          }
          placeholder="https://api.green-api.com"
          required
        />
      </label>

      <label className="instance-settings__field">
        <span>idInstance</span>
        <input
          type="text"
          value={form.idInstance}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, idInstance: event.target.value }))
          }
          placeholder="1101..."
          required
          autoComplete="off"
        />
      </label>

      <label className="instance-settings__field">
        <span>apiTokenInstance</span>
        <input
          type="password"
          value={form.apiTokenInstance}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              apiTokenInstance: event.target.value,
            }))
          }
          placeholder="токен из кабинета"
          required
          autoComplete="off"
        />
      </label>

      <label className="instance-settings__field">
        <span>Номер телефона (РФ / РБ)</span>
        <input
          type="tel"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setPhoneError(null);
          }}
          placeholder="79991234567 или 375291234567"
          required
          autoComplete="tel"
        />
      </label>

      {preview.ok ? (
        <p className="instance-settings__preview">
          chatId: <code>{preview.chatId}</code>
        </p>
      ) : null}

      {phoneError ? (
        <p className="instance-settings__error" role="alert">
          {phoneError}
        </p>
      ) : null}

      <button type="submit" className="instance-settings__save">
        {saved ? "Сохранено" : "Сохранить"}
      </button>
    </form>
  );
}
