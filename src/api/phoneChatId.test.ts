import { describe, expect, it } from "vitest";

import { normalizeChatId, phoneToChatId } from "./phoneChatId";

describe("phoneToChatId", () => {
  it("принимает номер РФ", () => {
    expect(phoneToChatId("79991234567")).toEqual({
      ok: true,
      phoneNumber: "79991234567",
      country: "RU",
      chatId: "79991234567@c.us",
    });
  });

  it("принимает номер РБ", () => {
    expect(phoneToChatId("375291234567")).toEqual({
      ok: true,
      phoneNumber: "375291234567",
      country: "BY",
      chatId: "375291234567@c.us",
    });
  });

  it("нормализует форматированный номер РФ", () => {
    expect(phoneToChatId("+7 (999) 123-45-67").ok).toBe(true);
    expect(normalizeChatId("+7 (999) 123-45-67")).toBe("79991234567@c.us");
  });

  it("заменяет ведущую 8 на 7 для РФ", () => {
    expect(normalizeChatId("89991234567")).toBe("79991234567@c.us");
  });

  it("добавляет код 7 к 10-значному мобильному РФ", () => {
    expect(normalizeChatId("9991234567")).toBe("79991234567@c.us");
  });

  it("принимает готовый chatId @c.us", () => {
    expect(normalizeChatId("375291234567@c.us")).toBe("375291234567@c.us");
  });

  it("отклоняет номер другой страны", () => {
    const result = phoneToChatId("380501234567");
    expect(result.ok).toBe(false);
  });
});
