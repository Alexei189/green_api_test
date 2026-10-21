import cors from "cors";
import express from "express";

const PORT = Number(process.env.PORT) || 3001;

/**
 * @typedef {{ receiptId: number, body: Record<string, unknown> }} Notification
 * @typedef {{
 *   tryDeliver: (notification: Notification) => boolean,
 *   cancel: () => void,
 * }} Waiter
 * @typedef {{
 *   queue: Notification[],
 *   delivered: Map<number, Notification>,
 *   waiters: Waiter[],
 *   receiptSeq: number,
 * }} InstanceState
 */

/** @type {Map<string, InstanceState>} */
const instances = new Map();

const app = express();
app.use(cors());
app.use(express.json());

function createId() {
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
}

function clampTimeout(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return 5;
  return Math.min(60, Math.max(5, seconds));
}

/**
 * @param {string} idInstance
 * @param {string} apiTokenInstance
 * @returns {InstanceState}
 */
function getInstance(idInstance, apiTokenInstance) {
  const key = `${idInstance}:${apiTokenInstance}`;
  const existing = instances.get(key);
  if (existing) return existing;

  /** @type {InstanceState} */
  const created = {
    queue: [],
    delivered: new Map(),
    waiters: [],
    receiptSeq: 1,
  };
  instances.set(key, created);
  return created;
}

/**
 * @param {InstanceState} state
 * @param {Record<string, unknown>} body
 */
function enqueue(state, body) {
  const notification = { receiptId: state.receiptSeq++, body };

  while (state.waiters.length > 0) {
    const waiter = state.waiters.shift();
    if (waiter?.tryDeliver(notification)) return;
  }

  state.queue.push(notification);
}

/**
 * @param {InstanceState} state
 * @param {import("express").Response} res
 * @param {number} timeoutMs
 * @returns {Promise<Notification | null>}
 */
function waitForNotification(state, res, timeoutMs) {
  const queued = state.queue.shift();
  if (queued) return Promise.resolve(queued);

  return new Promise((resolve) => {
    let settled = false;

    /** @type {Waiter} */
    const entry = {
      tryDeliver(notification) {
        if (settled || res.writableEnded || res.socket?.destroyed) return false;
        settled = true;
        clearTimeout(timer);
        resolve(notification);
        return true;
      },
      cancel() {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const index = state.waiters.indexOf(entry);
        if (index >= 0) state.waiters.splice(index, 1);
        resolve(null);
      },
    };

    const timer = setTimeout(() => entry.cancel(), timeoutMs);
    state.waiters.push(entry);

    res.on("close", () => {
      if (!res.writableFinished) entry.cancel();
    });
  });
}

function parseInstancePath(pathname) {
  const match = pathname.match(
    /^\/waInstance([^/]+)\/(sendMessage|receiveNotification|deleteNotification)\/([^/]+)(?:\/(\d+))?\/?$/,
  );
  if (!match) return null;

  return {
    idInstance: match[1],
    method: match[2],
    apiTokenInstance: match[3],
    receiptId: match[4] ? Number(match[4]) : undefined,
  };
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    instances: [...instances.entries()].map(([key, state]) => ({
      key,
      queued: state.queue.length,
      delivered: state.delivered.size,
    })),
  });
});

app.use((req, res) => {
  const route = parseInstancePath(req.path);
  if (!route) {
    res.status(404).json({ error: "Unknown method", path: req.path });
    return;
  }

  if (!route.idInstance || !route.apiTokenInstance) {
    res.status(401).json({ error: "idInstance and apiTokenInstance are required" });
    return;
  }

  const state = getInstance(route.idInstance, route.apiTokenInstance);

  if (route.method === "sendMessage" && req.method === "POST") {
    const chatId = typeof req.body?.chatId === "string" ? req.body.chatId.trim() : "";
    const message = typeof req.body?.message === "string" ? req.body.message : "";

    if (!chatId || !message.trim()) {
      res.status(400).json({ error: "chatId and message are required" });
      return;
    }

    const idMessage = createId();
    const timestamp = Math.floor(Date.now() / 1000);

    enqueue(state, {
      typeWebhook: "outgoingAPIMessageReceived",
      timestamp,
      idMessage,
      senderData: { chatId },
      messageData: {
        typeMessage: "textMessage",
        textMessageData: { textMessage: message },
      },
    });

    setTimeout(() => {
      enqueue(state, {
        typeWebhook: "incomingMessageReceived",
        timestamp: Math.floor(Date.now() / 1000),
        idMessage: createId(),
        senderData: {
          chatId,
          chatName: "Mock",
          sender: chatId,
          senderName: "Mock",
        },
        messageData: {
          typeMessage: "textMessage",
          textMessageData: { textMessage: `Эхо: ${message}` },
        },
      });
    }, 800);

    res.json({ idMessage });
    return;
  }

  if (route.method === "receiveNotification" && req.method === "GET") {
    const timeoutMs = clampTimeout(req.query.receiveTimeout) * 1000;

    void waitForNotification(state, res, timeoutMs).then((notification) => {
      if (res.writableEnded || res.socket?.destroyed) {
        if (notification) state.queue.unshift(notification);
        return;
      }
      if (!notification) {
        res.status(200).end();
        return;
      }
      state.delivered.set(notification.receiptId, notification);
      res.json(notification);
    });
    return;
  }

  if (route.method === "deleteNotification" && req.method === "DELETE") {
    if (route.receiptId == null) {
      res.status(400).json({ result: false, reason: "receiptId is required" });
      return;
    }

    const existed = state.delivered.delete(route.receiptId);
    res.json({
      result: existed,
      reason: existed ? "" : "ReceiptId not found",
    });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});

const server = app.listen(PORT, () => {
  console.log(`GREEN-API mock: http://localhost:${PORT}`);
});

server.requestTimeout = 120_000;
