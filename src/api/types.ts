export type GreenApiCredentials = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

export type SendMessagePayload = {
  chatId: string;
  message: string;
  typingTime?: number;
  quotedMessageId?: string;
};

export type SendMessageResponse = {
  idMessage: string;
};

export class GreenApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(body || `GREEN-API error ${status}`);
    this.name = "GreenApiError";
    this.status = status;
    this.body = body;
  }
}
