export type PhoneCountry = "RU" | "BY";

export type PhoneChatIdSuccess = {
  ok: true;
  chatId: string;
  phoneNumber: string;
  country: PhoneCountry;
};

export type PhoneChatIdFailure = {
  ok: false;
  error: string;
};

export type PhoneChatIdResult = PhoneChatIdSuccess | PhoneChatIdFailure;

/**
 * Преобразует номер телефона РФ/РБ в chatId вида phoneNumber@c.us.
 * РФ: 79991234567@c.us (код 7), РБ: 375291234567@c.us (код 375).
 *
 * Допускается ввод с +, пробелами, скобками, дефисами,
 * а также уже готовый chatId `…@c.us`.
 */
export function phoneToChatId(value: string): PhoneChatIdResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, error: "Укажите номер телефона получателя" };
  }

  // Групповые/прочие id без телефона — не через этот путь
  if (trimmed.startsWith("-") && !trimmed.includes("@")) {
    return {
      ok: false,
      error: "Ожидается номер телефона РФ (7) или РБ (375)",
    };
  }

  const withoutSuffix = trimmed.replace(/@c\.us$/i, "");
  let digits = withoutSuffix.replace(/\D/g, "");

  if (!digits) {
    return { ok: false, error: "Номер должен содержать цифры" };
  }

  // Локальный формат РФ: 8XXXXXXXXXX → 7XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }

  // Номер без кода страны (10 цифр) — считаем РФ
  if (digits.length === 10 && /^9\d{9}$/.test(digits)) {
    digits = `7${digits}`;
  }

  if (/^7\d{10}$/.test(digits)) {
    return {
      ok: true,
      phoneNumber: digits,
      country: "RU",
      chatId: `${digits}@c.us`,
    };
  }

  if (/^375\d{9}$/.test(digits)) {
    return {
      ok: true,
      phoneNumber: digits,
      country: "BY",
      chatId: `${digits}@c.us`,
    };
  }

  return {
    ok: false,
    error:
      "Допустимы только номера РФ (7XXXXXXXXXX) и РБ (375XXXXXXXXX). Примеры: 79991234567, 375291234567",
  };
}

/** Возвращает chatId или пустую строку, если номер невалиден. */
export function normalizeChatId(value: string): string {
  const result = phoneToChatId(value);
  return result.ok ? result.chatId : "";
}
